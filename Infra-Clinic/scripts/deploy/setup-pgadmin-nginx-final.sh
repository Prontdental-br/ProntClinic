#!/bin/bash

# =============================================================================
# SCRIPT DE CONFIGURAÇÃO - PGADMIN COM NGINX INGRESS (ARM COMPATIBLE)
# Configura acesso externo ao pgAdmin via pgadmin.prontclinic.com.br
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
    exit 1
}

info() {
    echo -e "${BLUE}[ℹ] $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "============================================================================="
echo "  CONFIGURAÇÃO DO PGADMIN COM NGINX INGRESS (ARM COMPATIBLE)"
echo "  URL: http://pgadmin.prontclinic.com.br"
echo "============================================================================="
echo -e "${NC}"

# Obter IP do LoadBalancer do NGINX
info "Obtendo IP do LoadBalancer do NGINX Ingress..."
NGINX_IP=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$NGINX_IP" ]; then
    error "Não foi possível obter o IP do LoadBalancer do NGINX"
fi

log "IP do LoadBalancer do NGINX: $NGINX_IP"

# Verificar status dos componentes
info "Verificando status dos componentes..."

echo ""
echo "=== STATUS DO NGINX INGRESS CONTROLLER ==="
kubectl get pods -n ingress-nginx
echo ""

echo "=== STATUS DO NGINX SERVICE ==="
kubectl get services -n ingress-nginx
echo ""

echo "=== STATUS DO PGADMIN ==="
kubectl get pods -n ptcc-development
echo ""

echo "=== STATUS DO INGRESS ==="
kubectl get ingress -n ptcc-development
echo ""

# Instruções para DNS
echo -e "${YELLOW}"
echo "============================================================================="
echo "  CONFIGURAÇÃO DNS NECESSÁRIA"
echo "============================================================================="
echo -e "${NC}"

echo "Para acessar o pgAdmin externamente, configure o DNS:"
echo ""
echo "1. Acesse o painel de controle do seu provedor de DNS"
echo "2. Crie um registro A para: pgadmin.prontclinic.com.br"
echo "3. Aponte para o IP: $NGINX_IP"
echo ""
echo "Ou execute o comando para testar localmente:"
echo "echo '$NGINX_IP pgadmin.prontclinic.com.br' | sudo tee -a /etc/hosts"
echo ""

# Informações de acesso
echo -e "${GREEN}"
echo "============================================================================="
echo "  INFORMAÇÕES DE ACESSO"
echo "============================================================================="
echo -e "${NC}"

echo "URL: http://pgadmin.prontclinic.com.br"
echo "URL Direta: http://$NGINX_IP"
echo "Email: admin@prontdental.com"
echo "Senha: admin123"
echo ""

# Verificar conectividade
info "Testando conectividade..."

if command -v curl &> /dev/null; then
    echo "Testando acesso via NGINX Ingress..."
    curl -I -H "Host: pgadmin.prontclinic.com.br" http://$NGINX_IP/ || warn "Ainda não acessível (normal se DNS não estiver configurado)"
else
    warn "curl não disponível para teste"
fi

echo ""
log "Configuração concluída!"
echo ""
echo "Após configurar o DNS, acesse: http://pgadmin.prontclinic.com.br"
echo "Ou acesse diretamente: http://$NGINX_IP"
