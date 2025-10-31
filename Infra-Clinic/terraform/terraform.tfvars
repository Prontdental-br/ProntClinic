# =============================================================================
# CONFIGURAÇÃO DO CLUSTER OKE - PRONTCLINIC
# Compartimento: 01-kubernetes
# =============================================================================

# =============================================================================
# AUTENTICAÇÃO OCI
# =============================================================================

tenancy_ocid = "ocid1.tenancy.oc1..aaaaaaaavy552uq26dqwka7lj6ri5m6hs6s5aknim22uyukfvlwgblffbmja"
user_ocid = "ocid1.user.oc1..aaaaaaaameqgjjitxorm6cdsnjwaqkrnzi5l3fjz5cn4mglmzj2c6n5jtu2a"
fingerprint = "92:61:03:c2:e5:61:81:01:30:a7:09:e7:9a:60:41:2f"
private_key_path = "./api_key/oci_api_key.pem"
region = "sa-saopaulo-1"

# Compartment OCID (01-kubernetes)
compartment_id = "ocid1.compartment.oc1..aaaaaaaag5axnqchrn2oi5csox5squb76cdi2zhx5sp2qta3cckd4ub2ijza"

# =============================================================================
# CONFIGURAÇÕES DO CLUSTER
# =============================================================================

# Nome do cluster (produção)
cluster_name = "kt-cluster-prontclinic-prod"

# Configurações do cluster (produção com 3 nós)
node_count = 3
node_ocpus = 2
node_memory_gb = 16

# =============================================================================
# TAGS PERSONALIZADAS
# =============================================================================

freeform_tags = {
  "Environment" = "Production"
  "Project"     = "ProntClinic"
  "ManagedBy"   = "Terraform"
  "Owner"       = "ProntClinic"
  "CostCenter"  = "IT"
}