# =============================================================================
# VARIÁVEIS DE AUTENTICAÇÃO OCI
# =============================================================================

variable "tenancy_ocid" {
  description = "OCID do tenancy OCI"
  type        = string
}

variable "user_ocid" {
  description = "OCID do usuário OCI"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint da chave API"
  type        = string
}

variable "private_key_path" {
  description = "Caminho para a chave privada"
  type        = string
  default     = "./api_key/oci_api_key.pem"
}

variable "region" {
  description = "Região OCI"
  type        = string
  default     = "sa-saopaulo-1"
}

variable "compartment_id" {
  description = "OCID do compartment"
  type        = string
}

# =============================================================================
# VARIÁVEIS DO CLUSTER OKE
# =============================================================================

variable "cluster_name" {
  description = "Nome do cluster OKE"
  type        = string
  default     = "kt-cluster-prontclinic-prod"
}

variable "kubernetes_version" {
  description = "Versão do Kubernetes"
  type        = string
  default     = "v1.31.1"
}

variable "enable_kubernetes_dashboard" {
  description = "Habilitar Kubernetes Dashboard"
  type        = bool
  default     = true
}

# =============================================================================
# VARIÁVEIS DE REDE
# =============================================================================

variable "vcn_cidr" {
  description = "CIDR block para a VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidr" {
  description = "CIDR block para a subnet privada (worker nodes)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_cidr" {
  description = "CIDR block para a subnet pública (load balancers)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "pods_cidr" {
  description = "CIDR block para pods do Kubernetes"
  type        = string
  default     = "10.244.0.0/16"
}

variable "services_cidr" {
  description = "CIDR block para serviços do Kubernetes"
  type        = string
  default     = "10.96.0.0/16"
}

# =============================================================================
# VARIÁVEIS DO NODE POOL
# =============================================================================

variable "node_count" {
  description = "Número de nós no cluster"
  type        = number
  default     = 3
}

variable "node_shape" {
  description = "Shape dos nós (ARM64 para menor custo)"
  type        = string
  default     = "VM.Standard.A2.Flex"
}

variable "node_ocpus" {
  description = "Número de OCPUs por nó"
  type        = number
  default     = 2
}

variable "node_memory_gb" {
  description = "Memória em GB por nó"
  type        = number
  default     = 6
}

variable "node_image_id" {
  description = "OCID da imagem para os nós (Oracle Linux 8 x86_64)"
  type        = string
  default     = "ocid1.image.oc1.sa-saopaulo-1.aaaaaaaa656dtemabqn7tmdf4ud52kucvbpmwcgv6sljruftuqqp62gfr5dq"
}

# =============================================================================
# VARIÁVEIS DE TAGS
# =============================================================================

variable "freeform_tags" {
  description = "Tags livres para os recursos"
  type        = map(string)
  default = {
    "Environment" = "Production"
    "Project"     = "ProntClinic"
    "ManagedBy"   = "Terraform"
    "Owner"       = "ProntClinic"
    "CostCenter"  = "IT"
  }
}