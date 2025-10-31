#!/bin/bash

# =============================================================================
# CONECTAR NO POSTGRESQL EXTERNO - ProntDental
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
    exit 1
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
echo "  CONECTAR NO POSTGRESQL EXTERNO"
echo "  Acesso público ao banco de dados"
echo "============================================================================="
echo -e "${NC}"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    error "kubectl não está configurado ou cluster não está acessível"
fi

# Obter IP do LoadBalancer
POSTGRES_IP=$(kubectl get service postgresql-external -n ptcc-development -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -z "$POSTGRES_IP" ]; then
    error "LoadBalancer não possui IP externo. Execute primeiro: ./scripts/deploy/deploy-postgresql-public.sh"
fi

log "IP do LoadBalancer: $POSTGRES_IP"

# Verificar se psql está disponível
if ! command -v psql &> /dev/null; then
    warn "psql não está instalado. Instalando..."
    echo "Execute: sudo apt update && sudo apt install -y postgresql-client"
    echo ""
    echo "Ou use a conexão via kubectl:"
    echo "kubectl exec -it -n ptcc-development postgresql-dev-1 -- psql -U prontclinic -d protclinic_dev_db"
    exit 1
fi

# Informações de acesso
header "Informações de Acesso:"
echo ""
echo -e "${GREEN}✅ ACESSO DIRETO:${NC}"
echo "• Host: $POSTGRES_IP"
echo "• Porta: 5432"
echo "• Database: protclinic_dev_db"
echo "• Usuário: prontclinic"
echo "• Senha: gYYf769JWGxvKQQxoJ6cb7A6zhmIiMk6N+GGaRZbk2k="
echo ""

echo -e "${GREEN}✅ ACESSO VIA DOMÍNIO:${NC}"
echo "• Host: postgresql-d.prontclinic.com.br"
echo "• Porta: 5432"
echo "• Database: protclinic_dev_db"
echo "• Usuário: prontclinic"
echo "• Senha: gYYf769JWGxvKQQxoJ6cb7A6zhmIiMk6N+GGaRZbk2k="
echo ""

# Tentar conectar
header "Tentando conectar..."
echo ""

echo -e "${BLUE}🔧 COMANDOS DE CONEXÃO:${NC}"
echo ""
echo "# Via IP direto:"
echo "psql -h $POSTGRES_IP -p 5432 -U prontclinic -d protclinic_dev_db"
echo ""
echo "# Via domínio (após configurar DNS):"
echo "psql -h postgresql-d.prontclinic.com.br -p 5432 -U prontclinic -d protclinic_dev_db"
echo ""
echo "# Via kubectl (dentro do cluster):"
echo "kubectl exec -it -n ptcc-development postgresql-dev-1 -- psql -U prontclinic -d protclinic_dev_db"
echo ""

# Testar conectividade
info "Testando conectividade..."
if timeout 10 bash -c "</dev/tcp/$POSTGRES_IP/5432" 2>/dev/null; then
    log "✓ PostgreSQL está acessível em $POSTGRES_IP:5432"
    
    echo ""
    echo -e "${YELLOW}🔧 TENTANDO CONEXÃO AUTOMÁTICA:${NC}"
    echo "Executando: psql -h $POSTGRES_IP -p 5432 -U prontclinic -d protclinic_dev_db"
    echo ""
    
    # Tentar conectar automaticamente
    PGPASSWORD='gYYf769JWGxvKQQxoJ6cb7A6zhmIiMk6N+GGaRZbk2k=' psql -h $POSTGRES_IP -p 5432 -U prontclinic -d protclinic_dev_db
else
    warn "✗ PostgreSQL não está acessível em $POSTGRES_IP:5432"
    echo ""
    echo -e "${YELLOW}🔧 ALTERNATIVAS:${NC}"
    echo "1. Use kubectl para conectar dentro do cluster:"
    echo "   kubectl exec -it -n ptcc-development postgresql-dev-1 -- psql -U postgres -d protclinic_dev_db"
    echo ""
    echo "2. Instale o cliente PostgreSQL:"
    echo "   sudo apt update && sudo apt install -y postgresql-client"
    echo ""
    echo "3. Configure o DNS para postgresql-d.prontclinic.com.br apontar para $POSTGRES_IP"
fi
