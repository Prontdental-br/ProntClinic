#!/bin/bash

# =============================================================================
# SCRIPT DE ACESSO AO PGADMIN
# Configura e testa o acesso ao pgAdmin via NGINX Ingress
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
echo "  CONFIGURAÇÃO DE ACESSO AO PGADMIN"
echo "  IP: 163.176.250.27"
echo "  Domínio: pgadmin.prontclinic.com.br"
echo "============================================================================="
echo -e "${NC}"

# Verificar se o domínio já está configurado
if grep -q "pgadmin.prontclinic.com.br" /etc/hosts; then
    log "Domínio já configurado no /etc/hosts"
else
    info "Configurando domínio no /etc/hosts..."
    echo "163.176.250.27 pgadmin.prontclinic.com.br" | sudo tee -a /etc/hosts
    log "Domínio configurado com sucesso"
fi

# Testar conectividade
info "Testando conectividade..."
response=$(curl -s -I http://pgadmin.prontclinic.com.br | head -1)
echo "Resposta: $response"

if [[ $response == *"302"* ]]; then
    log "✓ Conectividade funcionando (redirecionamento para /browser/)"
else
    error "Falha na conectividade: $response"
    exit 1
fi

# Informações de acesso
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  ACESSO CONFIGURADO COM SUCESSO!"
echo "============================================================================="
echo -e "${NC}"

echo "🌐 URLs para acessar:"
echo "   • http://pgadmin.prontclinic.com.br"
echo "   • http://pgadmin.prontclinic.com.br/browser/"
echo ""
echo "🔑 Credenciais:"
echo "   • Email: admin@prontdental.com"
echo "   • Senha: admin123"
echo ""
echo "📋 Próximos passos:"
echo "   1. Abra seu navegador"
echo "   2. Acesse: http://pgadmin.prontclinic.com.br"
echo "   3. Faça login com as credenciais acima"
echo "   4. Configure suas conexões PostgreSQL"
echo ""

# Abrir no navegador (se disponível)
if command -v xdg-open &> /dev/null; then
    info "Abrindo no navegador..."
    xdg-open http://pgadmin.prontclinic.com.br
elif command -v open &> /dev/null; then
    info "Abrindo no navegador..."
    open http://pgadmin.prontclinic.com.br
else
    warn "Não foi possível abrir automaticamente no navegador"
    echo "Acesse manualmente: http://pgadmin.prontclinic.com.br"
fi
