#!/bin/bash

# =============================================================================
# SCRIPT PARA APLICAR RESERVA DE IP DO NGINX INGRESS CONTROLLER
# Aplica a reserva do IP 163.176.250.27 via Terraform
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
echo "  APLICAR RESERVA DE IP DO NGINX INGRESS CONTROLLER"
echo "  IP: 163.176.250.27"
echo "============================================================================="
echo -e "${NC}"

# Verificar se estamos no diretório correto
if [ ! -f "terraform/main.tf" ]; then
    error "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Navegar para o diretório terraform
cd terraform

# Verificar se o Terraform está configurado
info "Verificando configuração do Terraform..."
if [ ! -f "terraform.tfvars" ]; then
    error "Arquivo terraform.tfvars não encontrado"
    exit 1
fi

# Inicializar Terraform
info "Inicializando Terraform..."
terraform init

# Verificar se o arquivo de reserva de IP existe
if [ ! -f "nginx-ip-reservation.tf" ]; then
    error "Arquivo nginx-ip-reservation.tf não encontrado"
    exit 1
fi

# Planejar a aplicação
info "Planejando aplicação da reserva de IP..."
terraform plan -out=nginx-ip-reservation.tfplan

# Mostrar o plano
echo ""
echo "📋 Plano de execução:"
echo "• Criar IP público reservado para NGINX Ingress Controller"
echo "• Configurar tags e metadados"
echo "• Gerar outputs com IP e OCID"
echo ""

# Perguntar se deve continuar
read -p "Deseja aplicar esta configuração? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    warn "Operação cancelada pelo usuário"
    exit 0
fi

# Aplicar a configuração
info "Aplicando reserva de IP..."
terraform apply nginx-ip-reservation.tfplan

# Obter o IP reservado
RESERVED_IP=$(terraform output -raw nginx_ingress_reserved_ip)
RESERVED_IP_OCID=$(terraform output -raw nginx_ingress_reserved_ip_ocid)

log "IP reservado criado: $RESERVED_IP"
log "OCID do IP reservado: $RESERVED_IP_OCID"

# Voltar ao diretório raiz
cd ..

# Verificar se o NGINX Ingress Controller está usando o IP correto
info "Verificando se o NGINX Ingress Controller está usando o IP reservado..."
CURRENT_IP=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ "$CURRENT_IP" = "$RESERVED_IP" ]; then
    log "✓ NGINX Ingress Controller já está usando o IP reservado: $RESERVED_IP"
else
    warn "NGINX Ingress Controller está usando IP diferente: $CURRENT_IP"
    warn "IP reservado: $RESERVED_IP"
    echo ""
    echo "Para usar o IP reservado, você pode:"
    echo "1. Recriar o NGINX Ingress Controller"
    echo "2. Ou aguardar que ele use o IP reservado automaticamente"
fi

# Mostrar status final
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  RESERVA DE IP CONCLUÍDA"
echo "============================================================================="
echo -e "${NC}"

echo "✅ IP reservado: $RESERVED_IP"
echo "✅ OCID: $RESERVED_IP_OCID"
echo "✅ Configuração aplicada via Terraform"
echo ""

echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "1. Verificar se o NGINX Ingress Controller está usando o IP reservado"
echo "2. Testar acesso ao pgAdmin via http://pgadmin.prontclinic.com.br"
echo "3. Configurar DNS para apontar para o IP reservado"
echo ""

echo -e "${BLUE}🔍 Comandos úteis:${NC}"
echo "• kubectl get services -n ingress-nginx"
echo "• terraform output nginx_ingress_reserved_ip"
echo "• curl -I -H 'Host: pgadmin.prontclinic.com.br' http://$RESERVED_IP"
