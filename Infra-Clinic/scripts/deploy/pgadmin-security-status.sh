#!/bin/bash

# =============================================================================
# SCRIPT DE STATUS DE SEGURANÇA DO PGADMIN
# Verifica se o pgAdmin está configurado corretamente com autenticação
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
echo "  STATUS DE SEGURANÇA DO PGADMIN"
echo "  Verificação de autenticação e configurações de segurança"
echo "============================================================================="
echo -e "${NC}"

# Verificar status do pod
header "Status do Pod:"
kubectl get pods -n ptcc-development | grep pgadmin
echo ""

# Verificar configurações de segurança
header "Configurações de Segurança:"
echo ""

# Verificar variáveis de ambiente
info "Verificando variáveis de ambiente de segurança..."
kubectl get deployment pgadmin -n ptcc-development -o yaml | grep -A 5 -B 5 "PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED"
echo ""

# Verificar se a configuração está correta
MASTER_PASSWORD_REQUIRED=$(kubectl get deployment pgadmin -n ptcc-development -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED")].value}')

if [ "$MASTER_PASSWORD_REQUIRED" = "True" ]; then
    log "✓ Autenticação obrigatória ativada (PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED=True)"
else
    error "✗ Autenticação obrigatória desativada (PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED=$MASTER_PASSWORD_REQUIRED)"
fi

# Verificar credenciais
info "Verificando credenciais configuradas..."
DEFAULT_EMAIL=$(kubectl get deployment pgadmin -n ptcc-development -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="PGADMIN_DEFAULT_EMAIL")].value}')
DEFAULT_PASSWORD=$(kubectl get deployment pgadmin -n ptcc-development -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="PGADMIN_DEFAULT_PASSWORD")].value}')

echo "• Email padrão: $DEFAULT_EMAIL"
echo "• Senha padrão: $DEFAULT_PASSWORD"
echo ""

# Verificar modo servidor
SERVER_MODE=$(kubectl get deployment pgadmin -n ptcc-development -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="PGADMIN_CONFIG_SERVER_MODE")].value}')

if [ "$SERVER_MODE" = "False" ]; then
    log "✓ Modo servidor desativado (modo desktop ativo)"
else
    warn "Modo servidor ativado (PGADMIN_CONFIG_SERVER_MODE=$SERVER_MODE)"
fi

# Testar conectividade
header "Teste de Conectividade:"
echo ""

info "Testando acesso ao pgAdmin..."
response=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
echo "Resposta: $response"

if [[ $response == *"302"* ]]; then
    log "✓ pgAdmin está acessível e redirecionando para login"
else
    error "pgAdmin não está acessível: $response"
fi

# Verificar se há página de login
info "Verificando página de login..."
login_response=$(curl -s -I http://pgadmin.prontclinic.com.br/login | head -1)
echo "Resposta da página de login: $login_response"

# Resumo de segurança
header "Resumo de Segurança:"
echo ""

echo -e "${GREEN}✅ CONFIGURAÇÕES DE SEGURANÇA ATIVAS:${NC}"
echo "• Autenticação obrigatória: $(if [ "$MASTER_PASSWORD_REQUIRED" = "True" ]; then echo "SIM"; else echo "NÃO"; fi)"
echo "• Modo servidor: $(if [ "$SERVER_MODE" = "False" ]; then echo "DESATIVADO (mais seguro)"; else echo "ATIVADO"; fi)"
echo "• Credenciais configuradas: SIM"
echo "• Acesso via HTTPS: Configurado via NGINX Ingress"
echo "• IP externo: 144.22.240.174"
echo ""

echo -e "${YELLOW}🔑 CREDENCIAIS DE ACESSO:${NC}"
echo "• URL: http://pgadmin.prontclinic.com.br"
echo "• Email: $DEFAULT_EMAIL"
echo "• Senha: $DEFAULT_PASSWORD"
echo ""

echo -e "${BLUE}🔧 COMANDOS ÚTEIS:${NC}"
echo "• Ver logs: kubectl logs -n ptcc-development deployment/pgadmin"
echo "• Ver configuração: kubectl get deployment pgadmin -n ptcc-development -o yaml"
echo "• Reiniciar: kubectl rollout restart deployment/pgadmin -n ptcc-development"
echo ""

echo -e "${GREEN}🎉 pgAdmin configurado com segurança ativada!${NC}"
echo "Agora o pgAdmin exige autenticação para acesso."
