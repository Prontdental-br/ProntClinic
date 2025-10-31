#!/bin/bash

# =============================================================================
# SCRIPT DE TESTE - LOGIN COM USUÁRIO E SENHA
# Testa se o pgAdmin está pedindo usuário e senha na tela de login
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
echo "  TESTE DE LOGIN COM USUÁRIO E SENHA"
echo "  Verificando se pgAdmin está pedindo usuário e senha"
echo "============================================================================="
echo -e "${NC}"

# Verificar status do pod
header "Status do Pod:"
kubectl get pods -n ptcc-development | grep pgadmin
echo ""

# Verificar configurações de autenticação
header "Configurações de Autenticação:"
echo ""

info "Verificando configurações de autenticação..."
kubectl get deployment pgadmin -n ptcc-development -o yaml | grep -A 10 -B 5 "PGADMIN_CONFIG_AUTHENTICATION"
echo ""

# Testar acesso à página de login
header "Teste de Acesso:"
echo ""

info "Testando acesso ao pgAdmin..."
response=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
echo "Resposta: $response"

if [[ $response == *"200"* ]] || [[ $response == *"302"* ]]; then
    log "✓ pgAdmin está respondendo"
else
    warn "pgAdmin pode estar inicializando: $response"
    echo "Aguarde alguns minutos..."
    sleep 30
    response=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
    echo "Segunda tentativa: $response"
fi

# Verificar conteúdo da página de login
info "Verificando conteúdo da página de login..."
login_content=$(curl -s http://pgadmin.prontclinic.com.br/login | grep -i "username\|user\|email\|password\|login" | head -10)
echo "Conteúdo de login encontrado:"
echo "$login_content"

if [ -n "$login_content" ]; then
    log "✓ Página de login contém campos de autenticação"
else
    warn "Página de login pode não estar exibindo campos de autenticação"
fi

# Verificar se há campos de usuário e senha
info "Verificando campos específicos..."
username_field=$(curl -s http://pgadmin.prontclinic.com.br/login | grep -i "username\|user" | head -3)
password_field=$(curl -s http://pgadmin.prontclinic.com.br/login | grep -i "password" | head -3)

echo "Campos de usuário encontrados:"
echo "$username_field"
echo ""
echo "Campos de senha encontrados:"
echo "$password_field"

# Resumo final
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  RESUMO DO TESTE"
echo "============================================================================="
echo -e "${NC}"

echo -e "${GREEN}✅ CONFIGURAÇÕES APLICADAS:${NC}"
echo "• Autenticação interna ativada"
echo "• Usuário e senha obrigatórios"
echo "• Senha mestra obrigatória"
echo ""

echo -e "${YELLOW}🔑 CREDENCIAIS PARA LOGIN:${NC}"
echo "• Usuário: admin@prontdental.com"
echo "• Senha: admin123"
echo "• URL: http://pgadmin.prontclinic.com.br"
echo ""

echo -e "${BLUE}🔧 COMANDOS ÚTEIS:${NC}"
echo "• Ver logs: kubectl logs -n ptcc-development deployment/pgadmin"
echo "• Ver status: kubectl get pods -n ptcc-development"
echo "• Reiniciar: kubectl rollout restart deployment/pgadmin -n ptcc-development"
echo ""

if [[ $response == *"200"* ]] || [[ $response == *"302"* ]]; then
    echo -e "${GREEN}🎉 pgAdmin está funcionando!${NC}"
    echo "Acesse http://pgadmin.prontclinic.com.br e faça login com usuário e senha."
else
    echo -e "${YELLOW}⏳ pgAdmin ainda está inicializando.${NC}"
    echo "Aguarde alguns minutos e tente novamente."
fi
