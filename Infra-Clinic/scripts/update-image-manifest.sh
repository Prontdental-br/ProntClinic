#!/bin/bash

# =============================================================================
# ATUALIZAR IMAGEM NO MANIFEST - ProntClinic
# =============================================================================
# 
# Este script atualiza a tag da imagem Docker no manifest Kubernetes
# 
# Uso:
#   ./update-image-manifest.sh <aplicacao> <tag>
# 
# Exemplos:
#   ./update-image-manifest.sh prontclinic-api ptcc-development-20251030221633
#   ./update-image-manifest.sh prontclinic-app ptcc-development-20251030195523
#   ./update-image-manifest.sh prontclinic-painel ptcc-development-20251030192408
# 
# =============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de erro
error() {
    echo -e "${RED}[✗] $1${NC}" >&2
    exit 1
}

# Função de sucesso
success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

# Função de info
info() {
    echo -e "${BLUE}[ℹ] $1${NC}"
}

# Verificar argumentos
if [ $# -lt 2 ]; then
    error "Uso: $0 <aplicacao> <tag>
    
Aplicações disponíveis:
  - prontclinic-api    (Back-Clinic)
  - prontclinic-app    (Front-Clinic)
  - prontclinic-painel (Painel-Clinic)
  
Exemplo:
  $0 prontclinic-api ptcc-development-20251030221633"
fi

APPLICATION=$1
IMAGE_TAG=$2

# Mapear aplicação para imagem Docker
case $APPLICATION in
    prontclinic-api)
        IMAGE_NAME="prontdentalsoftware/prontclinic-api"
        MANIFEST_PATH="k8s-manifests/development/prontclinic-api/prontclinic-api-deployment.yaml"
        ;;
    prontclinic-app)
        IMAGE_NAME="prontdentalsoftware/prontclinic-app"
        MANIFEST_PATH="k8s-manifests/development/prontclinic-app/prontclinic-app-deployment.yaml"
        ;;
    prontclinic-painel)
        IMAGE_NAME="prontdentalsoftware/prontclinic-painel"
        MANIFEST_PATH="k8s-manifests/development/prontclinic-painel/prontclinic-painel-deployment.yaml"
        ;;
    *)
        error "Aplicação desconhecida: $APPLICATION
        
Aplicações disponíveis:
  - prontclinic-api
  - prontclinic-app
  - prontclinic-painel"
        ;;
esac

FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

# Verificar se o arquivo existe
if [ ! -f "$MANIFEST_PATH" ]; then
    error "Manifest não encontrado: $MANIFEST_PATH"
fi

info "Atualizando manifest: $MANIFEST_PATH"
info "Nova imagem: $FULL_IMAGE"

# Backup do arquivo original
cp "$MANIFEST_PATH" "${MANIFEST_PATH}.bak"
info "Backup criado: ${MANIFEST_PATH}.bak"

# Atualizar a imagem no manifest
sed -i "s|image: ${IMAGE_NAME}:.*|image: ${FULL_IMAGE}|g" "$MANIFEST_PATH"

# Verificar se a atualização foi bem-sucedida
if grep -q "image: ${FULL_IMAGE}" "$MANIFEST_PATH"; then
    success "Imagem atualizada com sucesso!"
    
    # Mostrar diferença
    echo ""
    info "Diferenças no manifest:"
    diff -u "${MANIFEST_PATH}.bak" "$MANIFEST_PATH" || true
    
    # Remover backup se tudo estiver ok
    read -p "Deseja remover o backup? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm "${MANIFEST_PATH}.bak"
        success "Backup removido"
    else
        info "Backup mantido em: ${MANIFEST_PATH}.bak"
    fi
else
    error "Falha ao atualizar a imagem no manifest"
fi

echo ""
success "✅ Manifest atualizado com sucesso!"
info "Para aplicar as mudanças:"
echo "  kubectl apply -f $MANIFEST_PATH"

