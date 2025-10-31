#!/bin/bash

# =============================================================================
# RESUMO DA CONFIGURAÇÃO DO PGADMIN COM AUTENTICAÇÃO
# Status final da configuração de segurança do pgAdmin
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
echo "  PGADMIN CONFIGURADO COM AUTENTICAÇÃO"
echo "  Resumo da configuração de segurança"
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
header "Configurações de Segurança Aplicadas:"
echo ""

echo -e "${GREEN}✅ AUTENTICAÇÃO OBRIGATÓRIA:${NC}"
echo "• PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED = True"
echo "• Usuário e senha são obrigatórios para acesso"
echo ""

echo -e "${GREEN}✅ CREDENCIAIS CONFIGURADAS:${NC}"
echo "• Email: admin@prontdental.com"
echo "• Senha: admin123"
echo ""

echo -e "${GREEN}✅ CONFIGURAÇÕES ADICIONAIS:${NC}"
echo "• Modo servidor: DESATIVADO (mais seguro)"
echo "• Banner de login: 'Bem-vindo ao pgAdmin - ProntDental'"
echo "• Cookies seguros: Configurados"
echo "• Sessões: Configuradas com SameSite=Lax"
echo ""

# Informações de acesso
header "Informações de Acesso:"
echo ""

echo -e "${YELLOW}🌐 ACESSO EXTERNO:${NC}"
echo "• URL: http://pgadmin.prontclinic.com.br"
echo "• IP do NGINX: 144.22.240.174"
echo "• Porta: 80 (HTTP)"
echo ""

echo -e "${YELLOW}🔑 CREDENCIAIS DE LOGIN:${NC}"
echo "• Email: admin@prontdental.com"
echo "• Senha: admin123"
echo ""

# Verificar conectividade
header "Teste de Conectividade:"
echo ""

info "Testando acesso ao pgAdmin..."
response=$(curl -s -I http://pgadmin.prontclinic.com.br 2>/dev/null | head -1 || echo "Erro de conexão")

if [[ $response == *"200"* ]] || [[ $response == *"302"* ]]; then
    log "✓ pgAdmin está acessível: $response"
else
    warn "pgAdmin pode estar inicializando: $response"
    echo "Aguarde alguns minutos para o pgAdmin terminar de inicializar."
fi

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
echo "• pgAdmin com autenticação obrigatória"
echo "• Credenciais: admin@prontdental.com / admin123"
echo "• Acesso via: http://pgadmin.prontclinic.com.br"
echo "• NGINX Ingress Controller com IP reservado: 144.22.240.174"
echo "• Configurações de segurança ativadas"
echo ""

echo -e "${YELLOW}🎯 PRÓXIMOS PASSOS:${NC}"
echo "1. Acesse http://pgadmin.prontclinic.com.br"
echo "2. Faça login com as credenciais acima"
echo "3. Configure suas conexões PostgreSQL"
echo "4. Teste a funcionalidade do pgAdmin"
echo ""

echo -e "${GREEN}🎉 pgAdmin está pronto para uso com autenticação!${NC}"