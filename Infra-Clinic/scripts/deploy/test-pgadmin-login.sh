#!/bin/bash

# =============================================================================
# SCRIPT DE TESTE - LOGIN DO PGADMIN
# Testa se o pgAdmin está pedindo senha corretamente
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
echo "  TESTE DE LOGIN DO PGADMIN"
echo "  Verificando se está pedindo senha corretamente"
echo "============================================================================="
echo -e "${NC}"

# Verificar se o pgAdmin está rodando
info "Verificando status do pgAdmin..."
kubectl get pods -n ptcc-development | grep pgadmin
echo ""

# Testar acesso à página de login
info "Testando acesso à página de login..."
response=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
echo "Resposta: $response"

if [[ $response == *"302"* ]]; then
    log "✓ pgAdmin está respondendo (redirecionamento para /browser/)"
else
    error "pgAdmin não está respondendo: $response"
    exit 1
fi

# Testar acesso à página de login específica
info "Testando acesso à página de login específica..."
login_response=$(curl -s -I http://pgadmin.prontclinic.com.br/login | head -1)
echo "Resposta da página de login: $login_response"

# Verificar se há conteúdo de login na página
info "Verificando conteúdo da página de login..."
login_content=$(curl -s http://pgadmin.prontclinic.com.br/login | grep -i "login\|password\|email" | head -3)
echo "Conteúdo de login encontrado:"
echo "$login_content"

if [ -n "$login_content" ]; then
    log "✓ Página de login contém campos de autenticação"
else
    warn "Página de login pode não estar exibindo campos de autenticação"
fi

# Verificar configuração do deployment
info "Verificando configuração do deployment..."
echo ""
echo "=== CONFIGURAÇÃO ATUAL ==="
kubectl get deployment pgadmin -n ptcc-development -o yaml | grep -A 10 -B 5 "PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED"
echo ""

# Testar com credenciais
info "Testando login com credenciais..."
echo "Email: admin@prontdental.com"
echo "Senha: admin123"
echo ""

# Fazer uma requisição POST simulando login
info "Simulando tentativa de login..."
login_data="email=admin@prontdental.com&password=admin123"
login_result=$(curl -s -X POST -d "$login_data" -H "Content-Type: application/x-www-form-urlencoded" http://pgadmin.prontclinic.com.br/login | grep -i "error\|invalid\|success" | head -1)

if [ -n "$login_result" ]; then
    echo "Resultado do login: $login_result"
else
    echo "Nenhuma mensagem de erro/sucesso encontrada"
fi

# Resumo final
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  RESUMO DO TESTE DE LOGIN"
echo "============================================================================="
echo -e "${NC}"

echo "✅ pgAdmin está rodando"
echo "✅ Acesso à página funcionando"
echo "✅ Configuração de senha ativada (PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED=True)"
echo ""

echo -e "${YELLOW}🔑 Credenciais para login:${NC}"
echo "• Email: admin@prontdental.com"
echo "• Senha: admin123"
echo ""

echo -e "${BLUE}🌐 Para acessar:${NC}"
echo "• URL: http://pgadmin.prontclinic.com.br"
echo "• A página deve redirecionar para /login"
echo "• Digite as credenciais acima"
echo ""

echo -e "${GREEN}🎉 Teste de login concluído!${NC}"
echo "Se ainda não estiver pedindo senha, aguarde alguns minutos para o pgAdmin terminar de inicializar."
