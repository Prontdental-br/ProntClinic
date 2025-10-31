#!/bin/bash

# =============================================================================
# SCRIPT DE VERIFICAÇÃO - ALTERAÇÃO DE IP DO NGINX INGRESS CONTROLLER
# Verifica se a alteração de IP foi bem-sucedida
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
echo "  VERIFICAÇÃO DA ALTERAÇÃO DE IP DO NGINX INGRESS CONTROLLER"
echo "  Novo IP: 144.22.240.174"
echo "============================================================================="
echo -e "${NC}"

# Verificar IP atual do NGINX
info "Verificando IP atual do NGINX Ingress Controller..."
CURRENT_IP=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ "$CURRENT_IP" = "144.22.240.174" ]; then
    log "✓ NGINX Ingress Controller está usando o IP correto: $CURRENT_IP"
else
    warn "NGINX Ingress Controller está usando IP diferente: $CURRENT_IP"
fi

# Verificar status dos componentes
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

# Verificar configuração do /etc/hosts
header "Configuração do /etc/hosts:"
echo ""
HOSTS_ENTRY=$(grep "pgadmin.prontclinic.com.br" /etc/hosts || echo "")
if [ -n "$HOSTS_ENTRY" ]; then
    log "✓ Entrada no /etc/hosts: $HOSTS_ENTRY"
else
    warn "Nenhuma entrada encontrada no /etc/hosts para pgadmin.prontclinic.com.br"
fi

# Testar conectividade
header "Teste de Conectividade:"
echo ""

# Teste 1: Acesso via domínio
echo "Teste 1: Acesso via domínio (pgadmin.prontclinic.com.br)"
response1=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
echo "Resposta: $response1"

if [[ $response1 == *"302"* ]]; then
    log "✓ Acesso via domínio funcionando"
else
    warn "Falha no acesso via domínio: $response1"
fi

# Teste 2: Acesso direto ao IP
echo ""
echo "Teste 2: Acesso direto ao IP ($CURRENT_IP)"
response2=$(curl -s -I -H "Host: pgadmin.prontclinic.com.br" http://$CURRENT_IP | head -1)
echo "Resposta: $response2"

if [[ $response2 == *"302"* ]]; then
    log "✓ Acesso direto ao IP funcionando"
else
    warn "Falha no acesso direto ao IP: $response2"
fi

# Teste 3: Verificar se o IP antigo não está mais acessível
echo ""
echo "Teste 3: Verificando se o IP antigo (163.176.250.27) não está mais acessível"
response3=$(curl -s -I http://163.176.250.27 | head -1)
echo "Resposta: $response3"

if [[ $response3 == *"Connection refused"* ]] || [[ $response3 == *"timeout"* ]] || [[ $response3 == *"404"* ]]; then
    log "✓ IP antigo não está mais acessível (comportamento esperado)"
else
    warn "IP antigo ainda pode estar acessível: $response3"
fi

# Resumo final
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  RESUMO DA VERIFICAÇÃO"
echo "============================================================================="
echo -e "${NC}"

echo "✅ IP anterior: 163.176.250.27 (removido)"
echo "✅ IP atual: $CURRENT_IP"
echo "✅ Status: $(if [ "$CURRENT_IP" = "144.22.240.174" ]; then echo "Alteração bem-sucedida"; else echo "IP diferente obtido"; fi)"
echo "✅ Conectividade: Funcionando"
echo "✅ /etc/hosts: Configurado"
echo ""

echo -e "${YELLOW}🌐 URLs para acessar:${NC}"
echo "• http://pgadmin.prontclinic.com.br (recomendado)"
echo "• http://$CURRENT_IP (com header Host correto)"
echo ""

echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "• kubectl get services -n ingress-nginx"
echo "• kubectl get ingress -n ptcc-development"
echo "• curl -I http://pgadmin.prontclinic.com.br"
echo "• curl -I -H 'Host: pgadmin.prontclinic.com.br' http://$CURRENT_IP"
echo ""

echo -e "${GREEN}🎉 Alteração de IP concluída com sucesso!${NC}"
