#!/bin/bash

# =============================================================================
# DEPLOY POSTGRESQL COM ACESSO PÚBLICO - ProntDental
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
echo "  DEPLOY POSTGRESQL COM ACESSO PÚBLICO"
echo "  Configurando acesso externo ao banco de dados"
echo "============================================================================="
echo -e "${NC}"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    error "kubectl não está configurado ou cluster não está acessível"
fi

# Verificar se o cluster PostgreSQL está rodando
header "Verificando cluster PostgreSQL..."
if ! kubectl get cluster postgresql-dev -n ptcc-development &> /dev/null; then
    error "Cluster PostgreSQL não encontrado. Execute primeiro: kubectl apply -f common/cnpg/"
fi

log "Cluster PostgreSQL encontrado"

# Verificar se o Traefik está rodando
header "Verificando Traefik..."
if ! kubectl get pods -n traefik-system &> /dev/null; then
    warn "Traefik não encontrado. Aplicando configuração do Traefik..."
    kubectl apply -f k8s-manifests/shared/ingress/traefik-ingress-controller.yaml
    sleep 10
fi

log "Traefik verificado"

# Aplicar serviço LoadBalancer
header "Aplicando serviço LoadBalancer..."
kubectl apply -f common/cnpg/postgresql-external-service.yaml
log "Serviço LoadBalancer aplicado"

# Aguardar o LoadBalancer obter IP
info "Aguardando LoadBalancer obter IP externo..."
sleep 30

# Obter IP do LoadBalancer
POSTGRES_IP=$(kubectl get service postgresql-external -n ptcc-development -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$POSTGRES_IP" ]; then
    warn "LoadBalancer ainda não obteve IP. Aguardando mais tempo..."
    sleep 30
    POSTGRES_IP=$(kubectl get service postgresql-external -n ptcc-development -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
fi

if [ -z "$POSTGRES_IP" ]; then
    error "Não foi possível obter IP do LoadBalancer"
fi

log "IP do LoadBalancer: $POSTGRES_IP"

# Aplicar Ingress
header "Aplicando Ingress..."
kubectl apply -f common/cnpg/postgresql-external-ingress.yaml
log "Ingress aplicado"

# Verificar status
header "Status da Configuração:"
echo ""

echo "=== SERVIÇOS ==="
kubectl get services -n ptcc-development | grep postgresql
echo ""

echo "=== INGRESS ==="
kubectl get ingress -n ptcc-development | grep postgresql
echo ""

echo "=== PODS POSTGRESQL ==="
kubectl get pods -n ptcc-development -l cnpg.io/cluster=postgresql-dev
echo ""

# Informações de acesso
header "Informações de Acesso:"
echo ""

echo -e "${GREEN}✅ ACESSO DIRETO (LoadBalancer):${NC}"
echo "• Host: $POSTGRES_IP"
echo "• Porta: 5432"
echo "• Database: protclinic_dev_db"
echo "• Usuário: prontclinic"
echo "• Senha: gYYf769JWGxvKQQxoJ6cb7A6zhmIiMk6N+GGaRZbk2k="
echo ""

echo -e "${GREEN}✅ ACESSO VIA DOMÍNIO (HTTPS):${NC}"
echo "• Host: postgresql-d.prontclinic.com.br"
echo "• Porta: 5432"
echo "• Database: protclinic_dev_db"
echo "• Usuário: prontclinic"
echo "• Senha: gYYf769JWGxvKQQxoJ6cb7A6zhmIiMk6N+GGaRZbk2k="
echo ""

echo -e "${YELLOW}🔧 CONFIGURAÇÃO DNS NECESSÁRIA:${NC}"
echo "Configure o DNS para apontar postgresql-d.prontclinic.com.br para: $POSTGRES_IP"
echo ""

echo -e "${BLUE}📋 COMANDOS DE TESTE:${NC}"
echo "# Teste de conectividade direta:"
echo "psql -h $POSTGRES_IP -p 5432 -U prontclinic -d protclinic_dev_db"
echo ""
echo "# Teste via domínio (após configurar DNS):"
echo "psql -h postgresql-d.prontclinic.com.br -p 5432 -U prontclinic -d protclinic_dev_db"
echo ""

echo -e "${BLUE}📋 COMANDOS DE MONITORAMENTO:${NC}"
echo "# Ver status do serviço:"
echo "kubectl get service postgresql-external -n ptcc-development"
echo ""
echo "# Ver logs do PostgreSQL:"
echo "kubectl logs -n ptcc-development -l cnpg.io/cluster=postgresql-dev"
echo ""
echo "# Ver status do Ingress:"
echo "kubectl describe ingress postgresql-external-ingress -n ptcc-development"
echo ""

log "Deploy do PostgreSQL com acesso público concluído!"
echo ""
echo -e "${CYAN}🎉 PostgreSQL está disponível publicamente!${NC}"
echo -e "${CYAN}   Configure o DNS e teste a conectividade.${NC}"
