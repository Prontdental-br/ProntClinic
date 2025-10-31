#!/bin/bash

# =============================================================================
# SCRIPT DE STATUS - IP RESERVADO PARA NGINX INGRESS CONTROLLER
# Mostra o status da reserva de IP e configuração atual
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

header() {
    echo -e "${PURPLE}[📋] $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "============================================================================="
echo "  STATUS DA RESERVA DE IP PARA NGINX INGRESS CONTROLLER"
echo "============================================================================="
echo -e "${NC}"

# Obter IP reservado via Terraform
info "Obtendo IP reservado via Terraform..."
RESERVED_IP=$(cd terraform && terraform output -raw nginx_ingress_reserved_ip 2>/dev/null || echo "")
RESERVED_IP_OCID=$(cd terraform && terraform output -raw nginx_ingress_reserved_ip_ocid 2>/dev/null || echo "")

if [ -n "$RESERVED_IP" ]; then
    log "IP reservado: $RESERVED_IP"
    log "OCID: $RESERVED_IP_OCID"
else
    warn "Não foi possível obter o IP reservado via Terraform"
fi

# Obter IP atual do NGINX Ingress Controller
info "Verificando IP atual do NGINX Ingress Controller..."
CURRENT_IP=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -n "$CURRENT_IP" ]; then
    log "IP atual do NGINX: $CURRENT_IP"
else
    warn "Não foi possível obter o IP atual do NGINX"
fi

# Comparar IPs
echo ""
header "Comparação de IPs:"
if [ "$RESERVED_IP" = "$CURRENT_IP" ]; then
    log "✓ NGINX Ingress Controller está usando o IP reservado"
else
    warn "NGINX Ingress Controller não está usando o IP reservado"
    echo "  • IP reservado: $RESERVED_IP"
    echo "  • IP atual: $CURRENT_IP"
fi

# Verificar status dos componentes
echo ""
header "Status dos Componentes:"
echo ""
echo "=== NGINX INGRESS CONTROLLER ==="
kubectl get pods -n ingress-nginx
echo ""
kubectl get services -n ingress-nginx
echo ""

echo "=== PGADMIN ==="
kubectl get pods -n ptcc-development
echo ""
kubectl get services -n ptcc-development
echo ""
kubectl get ingress -n ptcc-development
echo ""

# Testar conectividade
echo ""
header "Teste de Conectividade:"
echo ""

# Teste 1: IP atual do NGINX
if [ -n "$CURRENT_IP" ]; then
    echo "Teste 1: Acesso via IP atual ($CURRENT_IP)"
    response1=$(curl -s -I -H "Host: pgadmin.prontclinic.com.br" http://$CURRENT_IP | head -1)
    echo "Resposta: $response1"
    if [[ $response1 == *"302"* ]]; then
        log "✓ Acesso via IP atual funcionando"
    else
        warn "Falha no acesso via IP atual: $response1"
    fi
fi

# Teste 2: IP reservado (se diferente)
if [ -n "$RESERVED_IP" ] && [ "$RESERVED_IP" != "$CURRENT_IP" ]; then
    echo ""
    echo "Teste 2: Acesso via IP reservado ($RESERVED_IP)"
    response2=$(curl -s -I -H "Host: pgadmin.prontclinic.com.br" http://$RESERVED_IP | head -1)
    echo "Resposta: $response2"
    if [[ $response2 == *"302"* ]]; then
        log "✓ Acesso via IP reservado funcionando"
    else
        warn "Falha no acesso via IP reservado: $response2"
    fi
fi

# Resumo final
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  RESUMO DO STATUS"
echo "============================================================================="
echo -e "${NC}"

echo "✅ IP Reservado: $RESERVED_IP"
echo "✅ IP Atual NGINX: $CURRENT_IP"
echo "✅ Status: $(if [ "$RESERVED_IP" = "$CURRENT_IP" ]; then echo "Sincronizado"; else echo "Diferente"; fi)"
echo ""

echo -e "${YELLOW}🌐 URLs para acessar:${NC}"
if [ -n "$CURRENT_IP" ]; then
    echo "• http://pgadmin.prontclinic.com.br (via NGINX Ingress)"
    echo "• http://$CURRENT_IP (com header Host correto)"
fi

echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "• kubectl get services -n ingress-nginx"
echo "• kubectl get ingress -n ptcc-development"
echo "• cd terraform && terraform output nginx_ingress_reserved_ip"
echo "• curl -I -H 'Host: pgadmin.prontclinic.com.br' http://$CURRENT_IP"
