# =============================================================================
# PRONTCLINIC - AMBIENTE DE DESENVOLVIMENTO KUBERNETES
# Infraestrutura otimizada para desenvolvimento na Oracle Cloud Infrastructure
# =============================================================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 6.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# Data sources para obter informações da OCI
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}

# VCN (Virtual Cloud Network) para o OKE
resource "oci_core_vcn" "oke_vcn" {
  compartment_id = var.compartment_id
  cidr_block     = var.vcn_cidr
  display_name   = "${var.cluster_name}-vcn"
  dns_label      = "okevcn"

  freeform_tags = var.freeform_tags
}

# Internet Gateway
resource "oci_core_internet_gateway" "oke_igw" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.oke_vcn.id
  display_name   = "${var.cluster_name}-igw"

  freeform_tags = var.freeform_tags
}

# Service Gateway para acesso aos serviços OCI
resource "oci_core_service_gateway" "oke_sgw" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.oke_vcn.id
  display_name   = "${var.cluster_name}-sgw"

  services {
    service_id = data.oci_core_services.all_services.services[0]["id"]
  }

  freeform_tags = var.freeform_tags
}

# Data source para serviços OCI
data "oci_core_services" "all_services" {
  filter {
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = true
  }
}

# NAT Gateway para nós privados
resource "oci_core_nat_gateway" "oke_nat" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.oke_vcn.id
  display_name   = "${var.cluster_name}-nat"

  freeform_tags = var.freeform_tags
}

# Route Table para subnets privadas
resource "oci_core_route_table" "oke_private_rt" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.oke_vcn.id
  display_name   = "${var.cluster_name}-private-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.oke_nat.id
  }

  route_rules {
    destination       = data.oci_core_services.all_services.services[0]["cidr_block"]
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.oke_sgw.id
  }

  freeform_tags = var.freeform_tags
}

# Route Table para subnets públicas
resource "oci_core_route_table" "oke_public_rt" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.oke_vcn.id
  display_name   = "${var.cluster_name}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.oke_igw.id
  }
  
  freeform_tags = var.freeform_tags
}

# Security List para subnets privadas (worker nodes) - Configuração OKE padrão
resource "oci_core_security_list" "oke_private_sl" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.oke_vcn.id
  display_name   = "${var.cluster_name}-private-sl"

  # Permitir todo tráfego interno da VCN (recomendação Oracle para OKE)
  ingress_security_rules {
    protocol  = "all"
    source    = var.vcn_cidr
    stateless = false
  }

  # Permitir tráfego HTTPS (porta 443) para comunicação com o cluster
  ingress_security_rules {
    protocol  = "6"
    source    = var.vcn_cidr
    stateless = false
    tcp_options {
      min = 443
      max = 443
    }
  }

  # Permitir tráfego SSH (porta 22) para acesso aos nós
  ingress_security_rules {
    protocol  = "6"
    source    = var.vcn_cidr
    stateless = false
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Permitir tráfego ICMP para descoberta de caminho
  ingress_security_rules {
    protocol  = "1"
    source    = var.vcn_cidr
    stateless = false
  }

  # ICMP para descoberta de path MTU
  ingress_security_rules {
    protocol  = "1"
    source    = "0.0.0.0/0"
    stateless = false
    icmp_options {
      type = 3
      code = 4
    }
  }

  # ICMP para ping
  ingress_security_rules {
    protocol  = "1"
    source    = "0.0.0.0/0"
    stateless = false
    icmp_options {
      type = 8
    }
  }

  # Permitir tráfego de todos os protocolos para comunicação entre nós (OKE)
  ingress_security_rules {
    protocol  = "all"
    source    = "0.0.0.0/0"
    stateless = false
  }

  # Permitir todo tráfego de saída (essencial para OKE)
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    stateless   = false
  }

  freeform_tags = var.freeform_tags
}

# Security List para subnets públicas (load balancers e API server)
resource "oci_core_security_list" "oke_public_sl" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.oke_vcn.id
  display_name   = "${var.cluster_name}-public-sl"

  # Kubernetes API Server
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 6443
      max = 6443
    }
  }

  # HTTP
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 80
      max = 80
    }
  }

  # HTTPS
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 443
      max = 443
    }
  }

  # NodePort Services
  ingress_security_rules {
    protocol  = "6"
    source    = "0.0.0.0/0"
    stateless = false
    tcp_options {
      min = 30000
      max = 32767
    }
  }

  # Permitir tráfego entre subnets
  ingress_security_rules {
    protocol  = "all"
    source    = var.vcn_cidr
    stateless = false
  }

  # Permitir tráfego de saída
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    stateless   = false
  }

  freeform_tags = var.freeform_tags
}

# Subnet privada para worker nodes
resource "oci_core_subnet" "oke_private_subnet" {
  compartment_id             = var.compartment_id
  vcn_id                     = oci_core_vcn.oke_vcn.id
  cidr_block                 = var.private_subnet_cidr
  display_name               = "${var.cluster_name}-private-subnet"
  dns_label                  = "okeprivate"
  route_table_id             = oci_core_route_table.oke_private_rt.id
  security_list_ids          = [oci_core_security_list.oke_private_sl.id]
  prohibit_public_ip_on_vnic = true

  freeform_tags = var.freeform_tags
}

# Subnet pública para load balancers
resource "oci_core_subnet" "oke_public_subnet" {
  compartment_id             = var.compartment_id
  vcn_id                     = oci_core_vcn.oke_vcn.id
  cidr_block                 = var.public_subnet_cidr
  display_name               = "${var.cluster_name}-public-subnet"
  dns_label                  = "okepublic"
  route_table_id             = oci_core_route_table.oke_public_rt.id
  security_list_ids          = [oci_core_security_list.oke_public_sl.id]
  prohibit_public_ip_on_vnic = false

  freeform_tags = var.freeform_tags
}

# Cluster OKE
resource "oci_containerengine_cluster" "oke_cluster" {
  compartment_id     = var.compartment_id
  kubernetes_version = var.kubernetes_version
  name               = var.cluster_name
  vcn_id             = oci_core_vcn.oke_vcn.id

  endpoint_config {
    is_public_ip_enabled = true
    subnet_id            = oci_core_subnet.oke_public_subnet.id
  }

  options {
    service_lb_subnet_ids = [oci_core_subnet.oke_public_subnet.id]

    add_ons {
      is_kubernetes_dashboard_enabled = var.enable_kubernetes_dashboard
      is_tiller_enabled               = false
    }

    kubernetes_network_config {
      pods_cidr     = var.pods_cidr
      services_cidr = var.services_cidr
    }
  }

  freeform_tags = var.freeform_tags
}

# Node Pool para worker nodes
resource "oci_containerengine_node_pool" "oke_node_pool" {
  cluster_id         = oci_containerengine_cluster.oke_cluster.id
  compartment_id     = var.compartment_id
  kubernetes_version = var.kubernetes_version
  name               = "${var.cluster_name}-np"
  
  node_config_details {
    # Distribuir nós em múltiplos fault domains para melhor registro
    placement_configs {
      availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
      subnet_id           = oci_core_subnet.oke_private_subnet.id
      # Remover fault_domains para usar distribuição automática
    }

    size = var.node_count
    
    # Configurações simplificadas para resolver problemas de conectividade
    is_pv_encryption_in_transit_enabled = false
  }

  node_shape = var.node_shape
  node_shape_config {
    memory_in_gbs = var.node_memory_gb
    ocpus         = var.node_ocpus
  }

  # Usar imagem Oracle Linux 8.10 mais recente (recomendada para OKE)
  node_source_details {
    source_type             = "IMAGE"
    image_id                = "ocid1.image.oc1.sa-saopaulo-1.aaaaaaaaxg4qwtaw4ya45zmko3jwxj7ld5br7qvqahi6spk25qs5clblxw5a"
    boot_volume_size_in_gbs = 50
  }

  initial_node_labels {
    key   = "name"
    value = var.cluster_name
  }

  # Configurações simplificadas para maior compatibilidade

  freeform_tags = var.freeform_tags
  
  # Aguardar o cluster estar completamente pronto
  depends_on = [oci_containerengine_cluster.oke_cluster]
}

# Data source para opções do node pool - removido devido a problemas de permissão
# data "oci_containerengine_node_pool_option" "oke_node_pool_options" {
#   node_pool_option_id = "all"
# }

# Data source para versões disponíveis do Kubernetes
data "oci_containerengine_cluster_option" "oke_cluster_options" {
  cluster_option_id = "all"
}
