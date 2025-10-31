#!/bin/bash

# =============================================================================
# SCRIPT DE RESERVA DE IP PARA NGINX INGRESS CONTROLLER
# Reserva o IP 163.176.250.27 sempre para o NGINX Ingress Controller
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[✓] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[⚠] $1${NC}"
}

error() {
    echo -e "${RED}[✗] $1${NC}"
}

info() {
    echo -e "${BLUE}[ℹ] $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "============================================================================="
echo "  RESERVA DE IP PARA NGINX INGRESS CONTROLLER"
echo "  IP: 163.176.250.27"
echo "============================================================================="
echo -e "${NC}"

# Verificar se o IP está sendo usado pelo NGINX
info "Verificando se o IP está sendo usado pelo NGINX Ingress Controller..."
NGINX_IP=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ "$NGINX_IP" = "163.176.250.27" ]; then
    log "✓ IP 163.176.250.27 já está sendo usado pelo NGINX Ingress Controller"
else
    warn "IP não está sendo usado pelo NGINX: $NGINX_IP"
fi

# Verificar se o OCI CLI está configurado
info "Verificando configuração do OCI CLI..."
if ! command -v oci &> /dev/null; then
    error "OCI CLI não está instalado"
    exit 1
fi

# Obter informações do LoadBalancer atual
info "Obtendo informações do LoadBalancer atual..."
LB_OCID=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.metadata.annotations}' | grep -o '"oci\.oraclecloud\.com/load-balancer-id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$LB_OCID" ]; then
    warn "Não foi possível obter o OCID do LoadBalancer"
    echo "Isso pode ser normal se o LoadBalancer foi criado via Helm"
else
    log "LoadBalancer OCID: $LB_OCID"
fi

# Criar configuração para reservar o IP
info "Criando configuração para reservar o IP..."

# Criar um arquivo de configuração para o NGINX Ingress Controller
cat > /tmp/nginx-ip-reservation.yaml << EOF
# Configuração para reservar IP específico para NGINX Ingress Controller
# Este arquivo deve ser aplicado após a instalação do NGINX via Helm

apiVersion: v1
kind: Service
metadata:
  name: nginx-ingress-ingress-nginx-controller
  namespace: ingress-nginx
  annotations:
    service.beta.kubernetes.io/oci-load-balancer-shape: "flexible"
    service.beta.kubernetes.io/oci-load-balancer-shape-flex-min: "10"
    service.beta.kubernetes.io/oci-load-balancer-shape-flex-max: "100"
    service.beta.kubernetes.io/oci-load-balancer-id: "reserved-ip-163-176-250-27"
    # Reservar IP específico (se suportado pela OCI)
    service.beta.kubernetes.io/oci-load-balancer-reserved-ip: "163.176.250.27"
spec:
  type: LoadBalancer
  loadBalancerIP: 163.176.250.27
  ports:
  - name: http
    port: 80
    targetPort: http
  - name: https
    port: 443
    targetPort: https
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/instance: nginx-ingress
EOF

log "Arquivo de configuração criado: /tmp/nginx-ip-reservation.yaml"

# Mostrar instruções para reservar o IP
echo ""
echo -e "${YELLOW}"
echo "============================================================================="
echo "  INSTRUÇÕES PARA RESERVAR O IP"
echo "============================================================================="
echo -e "${NC}"

echo "Para reservar o IP 163.176.250.27 sempre para o NGINX Ingress Controller:"
echo ""
echo "1. 📋 MÉTODO 1 - Via OCI Console:"
echo "   • Acesse o OCI Console"
echo "   • Vá para Networking > Load Balancers"
echo "   • Encontre o LoadBalancer do NGINX"
echo "   • Configure para usar IP reservado"
echo ""
echo "2. 📋 MÉTODO 2 - Via Terraform (Recomendado):"
echo "   • Adicione ao terraform/main.tf:"
echo ""
cat << 'EOF'
# Reservar IP para NGINX Ingress Controller
resource "oci_core_public_ip" "nginx_ingress_ip" {
  compartment_id = var.compartment_id
  display_name    = "nginx-ingress-reserved-ip"
  lifetime        = "RESERVED"
  
  # Opcional: especificar IP específico se disponível
  # ip_address = "163.176.250.27"
}

# Usar o IP reservado no LoadBalancer
resource "oci_core_load_balancer" "nginx_ingress_lb" {
  compartment_id = var.compartment_id
  display_name   = "nginx-ingress-lb"
  shape          = "flexible"
  shape_details {
    minimum_bandwidth_in_mbps = 10
    maximum_bandwidth_in_mbps = 100
  }
  
  reserved_ips {
    id = oci_core_public_ip.nginx_ingress_ip.id
  }
  
  subnet_ids = [var.public_subnet_id]
}
EOF

echo ""
echo "3. 📋 MÉTODO 3 - Via OCI CLI:"
echo "   • Criar IP reservado:"
echo "   oci network public-ip create --compartment-id <compartment-id> --lifetime RESERVED --display-name nginx-ingress-ip"
echo "   • Associar ao LoadBalancer existente"
echo ""

# Verificar status atual
info "Status atual do NGINX Ingress Controller:"
echo ""
kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx
echo ""

# Mostrar IPs em uso
info "IPs atualmente em uso:"
echo ""
kubectl get services --all-namespaces -o wide | grep LoadBalancer
echo ""

log "Script de reserva de IP concluído!"
echo ""
echo -e "${GREEN}✅ Próximos passos:${NC}"
echo "1. Escolha um dos métodos acima para reservar o IP"
echo "2. Aplique a configuração"
echo "3. Verifique se o IP foi reservado corretamente"
echo "4. Teste o acesso ao pgAdmin via http://pgadmin.prontclinic.com.br"
