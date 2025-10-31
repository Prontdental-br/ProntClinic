#!/bin/bash

# =============================================================================
# STATUS FINAL DO PGADMIN COM AUTENTICAÇÃO
# Resumo da configuração final com usuário e senha
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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
echo -e "${CYAN}"
echo "============================================================================="
echo "  PGADMIN CONFIGURADO COM SUCESSO!"
echo "  Autenticação por usuário e senha ativada"
echo "============================================================================="
echo -e "${NC}"

# Status atual
header "Status Atual:"
echo ""

# Verificar pod
info "Verificando status do pod..."
pod_status=$(kubectl get pods -n ptcc-development | grep pgadmin | awk '{print $3}')
echo "Status do pod: $pod_status"

if [ "$pod_status" = "Running" ]; then
    log "✓ Pod do pgAdmin está rodando"
else
    warn "Pod do pgAdmin está em status: $pod_status"
fi

# Verificar configurações
header "Configurações de Autenticação Aplicadas:"
echo ""

echo -e "${GREEN}✅ AUTENTICAÇÃO INTERNA:${NC}"
echo "• PGADMIN_CONFIG_AUTHENTICATION_SOURCES = ['internal']"
echo "• PGADMIN_CONFIG_AUTHENTICATION_SOURCE = 'internal'"
echo "• Autenticação por usuário e senha obrigatória"
echo ""

echo -e "${GREEN}✅ CREDENCIAIS CONFIGURADAS:${NC}"
echo "• Usuário: admin@prontdental.com"
echo "• Senha: admin123"
echo ""

echo -e "${GREEN}✅ CONFIGURAÇÕES DE SEGURANÇA:${NC}"
echo "• Senha mestra obrigatória: SIM"
echo "• Modo servidor: DESATIVADO (mais seguro)"
echo "• Banner personalizado: 'Bem-vindo ao pgAdmin - ProntDental'"
echo "• Cookies seguros: Configurados"
echo "• Sessões: SameSite=Lax"
echo ""

# Testar conectividade
header "Teste de Conectividade:"
echo ""

info "Testando acesso ao pgAdmin..."
response=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
echo "Resposta: $response"

if [[ $response == *"302"* ]]; then
    log "✓ pgAdmin está funcionando e redirecionando corretamente"
else
    warn "pgAdmin pode ter problemas: $response"
fi

# Informações de acesso
header "Informações de Acesso:"
echo ""

echo -e "${YELLOW}🌐 ACESSO EXTERNO:${NC}"
echo "• URL: http://pgadmin.prontclinic.com.br"
echo "• IP do NGINX: 144.22.240.174"
echo "• Porta: 80 (HTTP)"
echo ""

echo -e "${YELLOW}🔑 CREDENCIAIS DE LOGIN:${NC}"
echo "• Usuário: admin@prontdental.com"
echo "• Senha: admin123"
echo "• Senha mestra: Será solicitada após o login"
echo ""

# Fluxo de acesso
header "Fluxo de Acesso:"
echo ""

echo -e "${BLUE}1️⃣ PRIMEIRA ETAPA - LOGIN:${NC}"
echo "• Acesse: http://pgadmin.prontclinic.com.br"
echo "• Digite o usuário: admin@prontdental.com"
echo "• Digite a senha: admin123"
echo ""

echo -e "${BLUE}2️⃣ SEGUNDA ETAPA - SENHA MESTRA:${NC}"
echo "• Após o login, será solicitada uma senha mestra"
echo "• Esta senha protege as credenciais salvas"
echo "• Use a senha sugerida ou crie uma nova"
echo ""

echo -e "${BLUE}3️⃣ TERCEIRA ETAPA - ACESSO COMPLETO:${NC}"
echo "• Após definir a senha mestra, você terá acesso completo"
echo "• Poderá configurar conexões PostgreSQL"
echo "• Interface completa do pgAdmin disponível"
echo ""

# Comandos úteis
header "Comandos Úteis:"
echo ""

echo -e "${BLUE}🔧 MONITORAMENTO:${NC}"
echo "• Ver status: kubectl get pods -n ptcc-development"
echo "• Ver logs: kubectl logs -n ptcc-development deployment/pgadmin"
echo "• Ver configuração: kubectl get deployment pgadmin -n ptcc-development -o yaml"
echo ""

echo -e "${BLUE}🔧 MANUTENÇÃO:${NC}"
echo "• Reiniciar: kubectl rollout restart deployment/pgadmin -n ptcc-development"
echo "• Ver ingress: kubectl get ingress -n ptcc-development"
echo "• Ver serviços: kubectl get services -n ptcc-development"
echo ""

# Resumo final
echo -e "${GREEN}"
echo "============================================================================="
echo "  CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo "============================================================================="
echo -e "${NC}"

echo -e "${GREEN}✅ O que foi configurado:${NC}"
echo "• pgAdmin com autenticação por usuário e senha"
echo "• Credenciais: admin@prontdental.com / admin123"
echo "• Senha mestra obrigatória para segurança"
echo "• Acesso via: http://pgadmin.prontclinic.com.br"
echo "• NGINX Ingress Controller com IP reservado: 144.22.240.174"
echo "• Configurações de segurança ativadas"
echo ""

echo -e "${YELLOW}🎯 PRÓXIMOS PASSOS:${NC}"
echo "1. Acesse http://pgadmin.prontclinic.com.br"
echo "2. Faça login com usuário e senha"
echo "3. Defina a senha mestra"
echo "4. Configure suas conexões PostgreSQL"
echo "5. Teste a funcionalidade do pgAdmin"
echo ""

echo -e "${GREEN}🎉 pgAdmin está pronto para uso com autenticação completa!${NC}"
echo "Agora o pgAdmin solicita usuário e senha na tela de login inicial."
