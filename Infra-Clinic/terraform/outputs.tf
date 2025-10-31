# =============================================================================
# OUTPUTS DO CLUSTER OKE
# =============================================================================

output "cluster_name" {
  description = "Nome do cluster OKE"
  value       = oci_containerengine_cluster.oke_cluster.name
}

output "cluster_id" {
  description = "ID do cluster OKE"
  value       = oci_containerengine_cluster.oke_cluster.id
}

output "cluster_kubernetes_version" {
  description = "Versão do Kubernetes do cluster"
  value       = oci_containerengine_cluster.oke_cluster.kubernetes_version
}

output "cluster_endpoints" {
  description = "Endpoints do cluster OKE"
  value       = oci_containerengine_cluster.oke_cluster.endpoints
}

# =============================================================================
# OUTPUTS DE REDE
# =============================================================================

output "vcn_id" {
  description = "ID da VCN criada"
  value       = oci_core_vcn.oke_vcn.id
}

output "vcn_cidr" {
  description = "CIDR da VCN"
  value       = oci_core_vcn.oke_vcn.cidr_block
}

output "private_subnet_id" {
  description = "ID da subnet privada"
  value       = oci_core_subnet.oke_private_subnet.id
}

output "private_subnet_cidr" {
  description = "CIDR da subnet privada"
  value       = oci_core_subnet.oke_private_subnet.cidr_block
}

output "public_subnet_id" {
  description = "ID da subnet pública"
  value       = oci_core_subnet.oke_public_subnet.id
}

output "public_subnet_cidr" {
  description = "CIDR da subnet pública"
  value       = oci_core_subnet.oke_public_subnet.cidr_block
}

# =============================================================================
# OUTPUTS DO NODE POOL
# =============================================================================

output "node_pool_id" {
  description = "ID do Node Pool"
  value       = oci_containerengine_node_pool.oke_node_pool.id
}

output "node_pool_name" {
  description = "Nome do Node Pool"
  value       = oci_containerengine_node_pool.oke_node_pool.name
}

output "node_pool_size" {
  description = "Tamanho do Node Pool"
  value       = oci_containerengine_node_pool.oke_node_pool.node_config_details[0].size
}

# =============================================================================
# OUTPUTS DE GATEWAYS
# =============================================================================

output "nat_gateway_id" {
  description = "ID do NAT Gateway"
  value       = oci_core_nat_gateway.oke_nat.id
}

output "internet_gateway_id" {
  description = "ID do Internet Gateway"
  value       = oci_core_internet_gateway.oke_igw.id
}

output "service_gateway_id" {
  description = "ID do Service Gateway"
  value       = oci_core_service_gateway.oke_sgw.id
}

# =============================================================================
# OUTPUTS DE CONEXÃO
# =============================================================================

output "connection_info" {
  description = "Informações para conectar ao cluster OKE"
  value = {
    cluster_endpoint = oci_containerengine_cluster.oke_cluster.endpoints[0].kubernetes
    kubectl_config   = "Use 'oci ce cluster create-kubeconfig' para configurar kubectl"
    oci_cli_command  = "oci ce cluster create-kubeconfig --cluster-id ${oci_containerengine_cluster.oke_cluster.id} --file ~/.kube/config --region ${var.region}"
  }
}

# =============================================================================
# OUTPUTS DE INFORMAÇÕES DOS NÓS
# =============================================================================

output "node_info" {
  description = "Informações dos nós do cluster"
  value = {
    node_count          = var.node_count
    node_shape          = var.node_shape
    node_ocpus          = var.node_ocpus
    node_memory         = "${var.node_memory_gb}GB"
    availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  }
}

# =============================================================================
# OUTPUTS DE INFORMAÇÕES DE REDE
# =============================================================================

output "network_info" {
  description = "Informações de rede do cluster"
  value = {
    vcn_cidr            = oci_core_vcn.oke_vcn.cidr_block
    private_subnet_cidr = oci_core_subnet.oke_private_subnet.cidr_block
    public_subnet_cidr = oci_core_subnet.oke_public_subnet.cidr_block
    pods_cidr          = var.pods_cidr
    services_cidr      = var.services_cidr
  }
}

# =============================================================================
# OUTPUTS DE COMANDOS ÚTEIS
# =============================================================================

output "useful_commands" {
  description = "Comandos úteis para gerenciar o cluster"
  value = {
    get_kubeconfig = "oci ce cluster create-kubeconfig --cluster-id ${oci_containerengine_cluster.oke_cluster.id} --file ~/.kube/config --region ${var.region}"
    get_nodes      = "kubectl get nodes"
    get_pods       = "kubectl get pods --all-namespaces"
    get_services   = "kubectl get services --all-namespaces"
  }
}

# =============================================================================
# OUTPUTS DE PRÓXIMOS PASSOS
# =============================================================================

output "next_steps" {
  description = "Próximos passos após a criação do cluster"
  value = [
    "1. Configure kubectl: oci ce cluster create-kubeconfig --cluster-id ${oci_containerengine_cluster.oke_cluster.id} --file ~/.kube/config --region ${var.region}",
    "2. Verifique os nós: kubectl get nodes",
    "3. Verifique os pods: kubectl get pods --all-namespaces",
    "4. Deploy suas aplicações usando LoadBalancer na subnet pública"
  ]
}