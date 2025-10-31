# Configuração real para o cluster OKE
# Compartimento: 01-kubernetes

# Informações de autenticação OCI
tenancy_ocid = "ocid1.tenancy.oc1..aaaaaaaa26curi2kvszaxbhwxqecnrcnnqrc7uwwz2do5lqaaj4bnunewy4q"
user_ocid = "ocid1.user.oc1..aaaaaaaaeextqz47sbfpbdwndbsfaur5edjgruoxaxrkvgk5qeuhvkbuta7q"
fingerprint = "b2:af:40:11:1d:28:09:86:1c:76:b9:5b:ce:1e:bd:c6"
private_key_path = "/home/frodo/.oci/k8s-provisioner-user.pem"
region = "sa-saopaulo-1"

# Compartment OCID (01-kubernetes)
compartment_id = "ocid1.compartment.oc1..aaaaaaaaakb25lyqo7uju62mzvhxreoxwzdjyuemswxhgqz5iivb353z2dcq"

# Nome do cluster (produção)
cluster_name = "kt-cluster-prontclinic-prod"

# Configurações do cluster (teste inicial)
node_count = 1
node_ocpus = 2
node_memory_gb = 4

# Tags personalizadas
freeform_tags = {
  "Environment" = "Production"
  "Project"     = "ProntClinic"
  "ManagedBy"   = "Terraform"
  "Owner"       = "ProntClinic"
  "CostCenter"  = "IT"
}
