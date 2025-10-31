#!/bin/bash

# =============================================================================
# SCRIPT DE TESTE FINAL DO PGADMIN
# Testa se o pgAdmin está funcionando e pedindo login
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
echo "  TESTE FINAL DO PGADMIN"
echo "  Verificando se está funcionando e pedindo login"
echo "============================================================================="
echo -e "${NC}"

# Verificar status do pod
header "Status do Pod:"
kubectl get pods -n ptcc-development | grep pgadmin
echo ""

# Verificar logs
header "Logs do pgAdmin:"
kubectl logs -n ptcc-development deployment/pgadmin --tail=10
echo ""

# Testar conectividade
header "Teste de Conectividade:"
echo ""

info "Testando acesso ao pgAdmin..."
response=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
echo "Resposta: $response"

if [[ $response == *"200"* ]] || [[ $response == *"302"* ]]; then
    log "✓ pgAdmin está respondendo"
else
    error "pgAdmin não está respondendo: $response"
    echo ""
    echo "Aguardando pgAdmin inicializar..."
    sleep 30
    response=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
    echo "Segunda tentativa: $response"
fi

# Testar página de login
info "Testando página de login..."
login_response=$(curl -s -I http://pgadmin.prontclinic.com.br/login | head -1)
echo "Resposta da página de login: $login_response"

# Verificar conteúdo da página
info "Verificando conteúdo da página..."
content=$(curl -s http://pgadmin.prontclinic.com.br | grep -i "login\|password\|email\|form" | head -5)
if [ -n "$content" ]; then
    echo "Conteúdo encontrado:"
    echo "$content"
else
    echo "Nenhum conteúdo de login encontrado"
fi

# Resumo final
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  RESUMO DO TESTE"
echo "============================================================================="
echo -e "${NC}"

echo "✅ Status do pod: $(kubectl get pods -n ptcc-development | grep pgadmin | awk '{print $3}')"
echo "✅ Resposta HTTP: $response"
echo "✅ Página de login: $login_response"

echo ""
echo -e "${YELLOW}🔑 Para acessar o pgAdmin:${NC}"
echo "• URL: http://pgadmin.prontclinic.com.br"
echo "• Email: admin@prontdental.com"
echo "• Senha: admin123"
echo ""

echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "• Ver logs: kubectl logs -n ptcc-development deployment/pgadmin"
echo "• Ver status: kubectl get pods -n ptcc-development"
echo "• Reiniciar: kubectl rollout restart deployment/pgadmin -n ptcc-development"
echo ""

if [[ $response == *"200"* ]] || [[ $response == *"302"* ]]; then
    echo -e "${GREEN}🎉 pgAdmin está funcionando!${NC}"
    echo "Acesse http://pgadmin.prontclinic.com.br e faça login com as credenciais acima."
else
    echo -e "${RED}❌ pgAdmin ainda está inicializando ou com problemas.${NC}"
    echo "Aguarde alguns minutos e tente novamente."
fi
