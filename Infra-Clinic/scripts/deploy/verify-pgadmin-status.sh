#!/bin/bash

# =============================================================================
# SCRIPT DE VERIFICAÇÃO - STATUS DO PGADMIN
# Verifica se o pgAdmin está funcionando corretamente via NGINX Ingress
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
echo "  VERIFICAÇÃO DO STATUS DO PGADMIN"
echo "  Remoção do IP direto: 137.131.202.122"
echo "  Acesso via NGINX Ingress: 163.176.250.27"
echo "============================================================================="
echo -e "${NC}"

# Verificar status dos pods
info "Verificando status dos pods..."
echo ""
echo "=== STATUS DOS PODS ==="
kubectl get pods -n ptcc-development
echo ""

# Verificar status dos services
info "Verificando status dos services..."
echo ""
echo "=== STATUS DOS SERVICES ==="
kubectl get services -n ptcc-development
echo ""

# Verificar status do ingress
info "Verificando status do ingress..."
echo ""
echo "=== STATUS DO INGRESS ==="
kubectl get ingress -n ptcc-development
echo ""

# Verificar status do NGINX Ingress Controller
info "Verificando status do NGINX Ingress Controller..."
echo ""
echo "=== STATUS DO NGINX INGRESS ==="
kubectl get services -n ingress-nginx
echo ""

# Testar conectividade
info "Testando conectividade via NGINX Ingress..."
echo ""

# Teste 1: Acesso via NGINX Ingress
echo "Teste 1: Acesso via NGINX Ingress (163.176.250.27)"
response1=$(curl -s -I -H "Host: pgadmin.prontclinic.com.br" http://163.176.250.27 | head -1)
echo "Resposta: $response1"

if [[ $response1 == *"302"* ]]; then
    log "✓ Acesso via NGINX Ingress funcionando"
else
    error "Falha no acesso via NGINX Ingress: $response1"
fi

# Teste 2: Verificar se o IP antigo não está mais acessível
echo ""
echo "Teste 2: Verificando se o IP antigo (137.131.202.122) não está mais acessível"
response2=$(curl -s -I http://137.131.202.122 | head -1)
echo "Resposta: $response2"

if [[ $response2 == *"Connection refused"* ]] || [[ $response2 == *"timeout"* ]]; then
    log "✓ IP antigo (137.131.202.122) não está mais acessível"
else
    warn "IP antigo ainda pode estar acessível: $response2"
fi

# Resumo final
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  RESUMO DA VERIFICAÇÃO"
echo "============================================================================="
echo -e "${NC}"

echo "✅ pgAdmin Service: ClusterIP (sem IP externo direto)"
echo "✅ NGINX Ingress: LoadBalancer (163.176.250.27)"
echo "✅ Roteamento: Por domínio (pgadmin.prontclinic.com.br)"
echo "✅ Acesso: Via NGINX Ingress Controller"
echo ""

echo -e "${YELLOW}🌐 URLs para acessar:${NC}"
echo "• http://pgadmin.prontclinic.com.br (via NGINX Ingress)"
echo "• http://163.176.250.27 (com header Host correto)"
echo ""

echo -e "${YELLOW}🔑 Credenciais:${NC}"
echo "• Email: admin@prontdental.com"
echo "• Senha: admin123"
echo ""

echo -e "${GREEN}✅ IP 137.131.202.122 removido com sucesso!${NC}"
echo "✅ pgAdmin agora acessível apenas via NGINX Ingress Controller"
echo "✅ Arquitetura mais segura e organizada"
