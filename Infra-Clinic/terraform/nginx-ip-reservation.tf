# =============================================================================
# RESERVA DE IP PARA NGINX INGRESS CONTROLLER
# Reserva o IP 163.176.250.27 sempre para o NGINX Ingress Controller
# =============================================================================

# Reservar IP público para NGINX Ingress Controller
resource "oci_core_public_ip" "nginx_ingress_reserved_ip" {
  compartment_id = var.compartment_id
  display_name    = "nginx-ingress-reserved-ip-${var.cluster_name}"
  lifetime        = "RESERVED"
  
  # Tags para identificação
  freeform_tags = {
    "Environment" = "Production"
    "Project"     = "ProntDental"
    "Component"   = "NGINX-Ingress"
    "ManagedBy"   = "Terraform"
    "Owner"       = "ProntClinic"
  }
}

# Output do IP reservado
output "nginx_ingress_reserved_ip" {
  description = "IP reservado para NGINX Ingress Controller"
  value       = oci_core_public_ip.nginx_ingress_reserved_ip.ip_address
}

# Output do OCID do IP reservado
output "nginx_ingress_reserved_ip_ocid" {
  description = "OCID do IP reservado para NGINX Ingress Controller"
  value       = oci_core_public_ip.nginx_ingress_reserved_ip.id
}

# Configuração para usar o IP reservado no NGINX Ingress Controller
# Nota: Este IP será usado pelo LoadBalancer criado pelo NGINX Ingress Controller
# O LoadBalancer será criado automaticamente pelo Helm, mas usará este IP reservado
