#!/bin/bash

# =============================================================================
# STATUS DO POSTGRESQL PÚBLICO - ProntDental
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
echo "  STATUS DO POSTGRESQL PÚBLICO"
echo "  Verificando configuração de acesso externo"
echo "============================================================================="
echo -e "${NC}"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    error "kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

# Status do cluster PostgreSQL
header "Status do Cluster PostgreSQL:"
echo ""
kubectl get cluster postgresql-dev -n ptcc-development
echo ""

# Status dos pods
header "Status dos Pods PostgreSQL:"
echo ""
kubectl get pods -n ptcc-development -l cnpg.io/cluster=postgresql-dev
echo ""

# Status do serviço LoadBalancer
header "Status do Serviço LoadBalancer:"
echo ""
kubectl get service postgresql-external -n ptcc-development
echo ""

# Obter IP do LoadBalancer
POSTGRES_IP=$(kubectl get service postgresql-external -n ptcc-development -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -n "$POSTGRES_IP" ]; then
    log "IP do LoadBalancer: $POSTGRES_IP"
else
    warn "LoadBalancer ainda não obteve IP externo"
fi

# Status do Ingress
header "Status do Ingress:"
echo ""
kubectl get ingress postgresql-external-ingress -n ptcc-development 2>/dev/null || warn "Ingress não encontrado"
echo ""

# Status do Traefik
header "Status do Traefik:"
echo ""
kubectl get pods -n traefik-system 2>/dev/null || warn "Traefik não encontrado"
echo ""

# Teste de conectividade
if [ -n "$POSTGRES_IP" ]; then
    header "Teste de Conectividade:"
    echo ""
    
    info "Testando conectividade com o PostgreSQL..."
    if timeout 10 bash -c "</dev/tcp/$POSTGRES_IP/5432" 2>/dev/null; then
        log "✓ PostgreSQL está acessível em $POSTGRES_IP:5432"
    else
        warn "✗ PostgreSQL não está acessível em $POSTGRES_IP:5432"
    fi
    echo ""
fi

# Informações de acesso
header "Informações de Acesso:"
echo ""

if [ -n "$POSTGRES_IP" ]; then
    echo -e "${GREEN}✅ ACESSO DIRETO (LoadBalancer):${NC}"
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
    
    echo -e "${YELLOW}🔧 CONFIGURAÇÃO DNS:${NC}"
    echo "Configure o DNS para apontar postgresql-d.prontclinic.com.br para: $POSTGRES_IP"
    echo ""
else
    warn "LoadBalancer não possui IP externo ainda"
fi

# Comandos úteis
header "Comandos Úteis:"
echo ""

echo -e "${BLUE}📋 MONITORAMENTO:${NC}"
echo "# Ver logs do PostgreSQL:"
echo "kubectl logs -n ptcc-development -l cnpg.io/cluster=postgresql-dev"
echo ""
echo "# Ver logs do Traefik:"
echo "kubectl logs -n traefik-system deployment/traefik"
echo ""
echo "# Ver eventos:"
echo "kubectl get events -n ptcc-development --sort-by='.lastTimestamp'"
echo ""

echo -e "${BLUE}📋 TESTE DE CONECTIVIDADE:${NC}"
if [ -n "$POSTGRES_IP" ]; then
    echo "# Teste direto:"
    echo "psql -h $POSTGRES_IP -p 5432 -U prontclinic -d protclinic_dev_db"
    echo ""
    echo "# Teste via domínio (após configurar DNS):"
    echo "psql -h postgresql-d.prontclinic.com.br -p 5432 -U prontclinic -d protclinic_dev_db"
    echo ""
fi

echo -e "${BLUE}📋 TROUBLESHOOTING:${NC}"
echo "# Verificar status do LoadBalancer:"
echo "kubectl describe service postgresql-external -n ptcc-development"
echo ""
echo "# Verificar status do Ingress:"
echo "kubectl describe ingress postgresql-external-ingress -n ptcc-development"
echo ""
echo "# Verificar certificados SSL:"
echo "kubectl get certificates -n ptcc-development"
echo ""

# Resumo final
header "Resumo:"
echo ""

if [ -n "$POSTGRES_IP" ]; then
    log "PostgreSQL está configurado para acesso público"
    log "IP do LoadBalancer: $POSTGRES_IP"
    warn "Configure o DNS para postgresql-d.prontclinic.com.br apontar para $POSTGRES_IP"
else
    warn "PostgreSQL não está configurado para acesso público"
    info "Execute: ./scripts/deploy/deploy-postgresql-public.sh"
fi
