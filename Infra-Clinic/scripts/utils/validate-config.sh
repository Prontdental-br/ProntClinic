#!/bin/bash

# =============================================================================
# SCRIPT DE VALIDAÇÃO - AMBIENTE DE DESENVOLVIMENTO
# Valida configurações antes do deploy
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
    exit 1
}

info() {
    echo -e "${BLUE}[ℹ] $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "============================================================================="
echo "  VALIDAÇÃO DO AMBIENTE DE DESENVOLVIMENTO"
echo "============================================================================="
echo -e "${NC}"

# Contador de verificações
checks_passed=0
total_checks=0

check() {
    local description="$1"
    local command="$2"
    
    total_checks=$((total_checks + 1))
    info "Verificando: $description"
    
    if eval "$command" &> /dev/null; then
        log "$description"
        checks_passed=$((checks_passed + 1))
    else
        warn "FALHOU: $description"
    fi
}

# Verificações de pré-requisitos
echo -e "${YELLOW}=== VERIFICANDO PRÉ-REQUISITOS ===${NC}"

check "Terraform instalado" "command -v terraform"
check "kubectl instalado" "command -v kubectl"
check "OCI CLI instalado" "command -v oci"
check "jq instalado" "command -v jq"

# Verificações de arquivos
echo -e "${YELLOW}=== VERIFICANDO ARQUIVOS DE CONFIGURAÇÃO ===${NC}"

check "terraform.tfvars existe" "test -f terraform.tfvars"
check "Chave privada OCI existe" "test -f ~/.oci/*.pem || test -f ./api_key/*.pem"
check "main.tf existe" "test -f main.tf"
check "variables.tf existe" "test -f variables.tf"
check "outputs.tf existe" "test -f outputs.tf"

# Verificações de manifests Kubernetes
echo -e "${YELLOW}=== VERIFICANDO MANIFESTS KUBERNETES ===${NC}"

check "development.yaml existe" "test -f k8s-manifests/development.yaml"
check "Manifest development.yaml válido" "kubectl apply --dry-run=client -f k8s-manifests/development.yaml"

# Verificações de scripts
echo -e "${YELLOW}=== VERIFICANDO SCRIPTS ===${NC}"

check "deploy-development.sh existe" "test -f deploy-development.sh"
check "destroy-development.sh existe" "test -f destroy-development.sh"
check "deploy-development.sh executável" "test -x deploy-development.sh"
check "destroy-development.sh executável" "test -x destroy-development.sh"

# Verificações do Terraform
echo -e "${YELLOW}=== VERIFICANDO CONFIGURAÇÃO TERRAFORM ===${NC}"

if [ -f terraform.tfvars ]; then
    check "Terraform init" "terraform init"
    check "Terraform validate" "terraform validate"
    check "Terraform plan" "terraform plan -out=/tmp/tfplan"
    rm -f /tmp/tfplan
fi

# Verificações de conectividade OCI
echo -e "${YELLOW}=== VERIFICANDO CONECTIVIDADE OCI ===${NC}"

if command -v oci &> /dev/null; then
    check "OCI CLI configurado" "oci iam user get --user-id \$(grep user_ocid terraform.tfvars | cut -d'\"' -f2) 2>/dev/null"
    check "Compartment acessível" "oci iam compartment get --compartment-id \$(grep compartment_id terraform.tfvars | cut -d'\"' -f2) 2>/dev/null"
fi

# Resumo final
echo -e "${BLUE}"
echo "============================================================================="
echo "  RESUMO DA VALIDAÇÃO"
echo "============================================================================="
echo -e "${NC}"

echo "Verificações passaram: $checks_passed/$total_checks"

if [ $checks_passed -eq $total_checks ]; then
    log "TODAS AS VERIFICAÇÕES PASSARAM! ✨"
    echo -e "${GREEN}"
    echo "Seu ambiente está pronto para deploy!"
    echo "Execute: ./deploy-development.sh"
    echo -e "${NC}"
    exit 0
else
    failed=$((total_checks - checks_passed))
    warn "$failed verificação(ões) falharam"
    echo -e "${YELLOW}"
    echo "Corrija os problemas identificados antes do deploy."
    echo "Consulte README-DEVELOPMENT.md para mais informações."
    echo -e "${NC}"
    exit 1
fi
