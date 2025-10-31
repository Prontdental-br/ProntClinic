#!/bin/bash

# =============================================================================
# SCRIPT DE VISUALIZAÇÃO DA ESTRUTURA DO PROJETO
# Mostra a organização dos diretórios e arquivos
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

info() {
    echo -e "${BLUE}[ℹ] $1${NC}"
}

header() {
    echo -e "${PURPLE}[📁] $1${NC}"
}

# Banner
echo -e "${CYAN}"
echo "============================================================================="
echo "  📁 ESTRUTURA DO PROJETO PRONTDENTAL KUBERNETES"
echo "============================================================================="
echo -e "${NC}"

# Mostrar estrutura do projeto
echo -e "${YELLOW}📁 Estrutura de Diretórios:${NC}"
echo ""

header "📁 k8s-manifests/ (Manifests Kubernetes)"
echo "├── 📁 pgadmin/ (Manifests do pgAdmin)"
ls -la k8s-manifests/pgadmin/ 2>/dev/null | grep -v "^total" | sed 's/^/│   ├── /'
echo "├── 📁 ingress/ (Ingress Controllers)"
ls -la k8s-manifests/ingress/ 2>/dev/null | grep -v "^total" | sed 's/^/│   ├── /'
echo "└── 📁 monitoring/ (Monitoramento - futuro)"
ls -la k8s-manifests/monitoring/ 2>/dev/null | grep -v "^total" | sed 's/^/│   └── /' || echo "│   └── (vazio)"
echo ""

header "📁 scripts/ (Scripts de Automação)"
echo "├── 📁 deploy/ (Scripts de Deploy)"
ls -la scripts/deploy/ 2>/dev/null | grep -v "^total" | sed 's/^/│   ├── /'
echo "├── 📁 monitoring/ (Scripts de Monitoramento)"
ls -la scripts/monitoring/ 2>/dev/null | grep -v "^total" | sed 's/^/│   ├── /' || echo "│   ├── (vazio)"
echo "└── 📁 utils/ (Utilitários)"
ls -la scripts/utils/ 2>/dev/null | grep -v "^total" | sed 's/^/│   └── /'
echo ""

header "📁 terraform/ (Infraestrutura como Código)"
ls -la terraform/ 2>/dev/null | grep -v "^total" | sed 's/^/├── /'
echo ""

header "📁 docs/ (Documentação)"
ls -la docs/ 2>/dev/null | grep -v "^total" | sed 's/^/├── /'
echo ""

header "📁 api_key/ (Chaves de API)"
ls -la api_key/ 2>/dev/null | grep -v "^total" | sed 's/^/├── /'
echo ""

# Mostrar arquivos principais na raiz
header "📄 Arquivos Principais (Raiz)"
ls -la *.md *.sh 2>/dev/null | grep -v "^total" | sed 's/^/├── /' || echo "├── (nenhum arquivo .md ou .sh na raiz)"
echo ""

# Mostrar status do cluster
echo -e "${YELLOW}🚀 Status do Cluster:${NC}"
echo ""

info "Verificando status dos componentes..."

# Verificar se kubectl está configurado
if command -v kubectl &> /dev/null; then
    echo ""
    echo "📊 Status dos Pods:"
    kubectl get pods --all-namespaces | head -10
    echo ""
    echo "🌐 Status dos Services:"
    kubectl get services --all-namespaces | head -10
    echo ""
    echo "🔗 Status dos Ingress:"
    kubectl get ingress --all-namespaces 2>/dev/null || echo "Nenhum Ingress encontrado"
else
    echo "⚠️ kubectl não configurado ou não disponível"
fi

echo ""
echo -e "${GREEN}✅ Estrutura do projeto organizada com sucesso!${NC}"
echo ""
echo -e "${CYAN}📚 Para mais informações:${NC}"
echo "• README.md - Documentação principal"
echo "• k8s-manifests/README.md - Manifests Kubernetes"
echo "• scripts/README.md - Scripts de automação"
echo ""
echo -e "${YELLOW}🚀 Comandos úteis:${NC}"
echo "• ./scripts/deploy/access-pgadmin.sh - Acessar pgAdmin"
echo "• ./scripts/utils/validate-config.sh - Validar configuração"
echo "• kubectl get pods --all-namespaces - Status do cluster"
