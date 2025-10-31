#!/bin/bash

# 🚀 Deploy do ArgoCD - ProntDental
# Script para deploy completo do ArgoCD no ambiente de desenvolvimento

set -e

echo "🚀 Iniciando deploy do ArgoCD..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se kubectl está disponível
if ! command -v kubectl &> /dev/null; then
    error "kubectl não encontrado. Instale o kubectl primeiro."
    exit 1
fi

# Verificar conexão com o cluster
log "Verificando conexão com o cluster..."
if ! kubectl cluster-info &> /dev/null; then
    error "Não foi possível conectar ao cluster Kubernetes."
    exit 1
fi

success "Conexão com o cluster estabelecida."

# Aplicar os manifestos do ArgoCD
log "Aplicando manifestos do ArgoCD..."

# Namespace
log "Criando namespace..."
kubectl apply -f k8s-manifests/development/argocd/argocd-namespace.yaml

# RBAC
log "Aplicando RBAC..."
kubectl apply -f k8s-manifests/development/argocd/argocd-rbac.yaml

# ConfigMaps
log "Aplicando ConfigMaps..."
kubectl apply -f k8s-manifests/development/argocd/argocd-ssh-known-hosts-cm.yaml
kubectl apply -f k8s-manifests/development/argocd/argocd-tls-certs-cm.yaml
kubectl apply -f k8s-manifests/development/argocd/argocd-gpg-keys-cm.yaml

# Secrets
log "Aplicando Secrets..."
kubectl apply -f k8s-manifests/development/argocd/argocd-secret.yaml
kubectl apply -f k8s-manifests/development/argocd/argocd-server-tls.yaml
kubectl apply -f k8s-manifests/development/argocd/argocd-repo-server-tls.yaml

# Deployment
log "Aplicando Deployment..."
kubectl apply -f k8s-manifests/development/argocd/argocd-deployment.yaml

# Service
log "Aplicando Service..."
kubectl apply -f k8s-manifests/development/argocd/argocd-service.yaml

# Ingress
log "Aplicando Ingress..."
kubectl apply -f k8s-manifests/development/argocd/argocd-ingress.yaml

# Aguardar o deployment estar pronto
log "Aguardando o ArgoCD estar pronto..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# Verificar status
log "Verificando status do ArgoCD..."
kubectl get pods -n argocd
kubectl get svc -n argocd
kubectl get ingress -n argocd

# Obter a senha inicial do admin
log "Obtendo senha inicial do admin..."
ADMIN_PASSWORD=$(kubectl -n argocd get secret argocd-secret -o jsonpath="{.data.admin\.password}" | base64 -d)
echo ""
success "🎉 ArgoCD deployado com sucesso!"
echo ""
echo "📋 Informações de Acesso:"
echo "   URL: https://argocd.prontclinic.com.br"
echo "   Usuário: admin"
echo "   Senha: $ADMIN_PASSWORD"
echo ""
echo "🔧 Comandos úteis:"
echo "   kubectl get pods -n argocd"
echo "   kubectl logs -n argocd deployment/argocd-server"
echo "   kubectl port-forward -n argocd svc/argocd-server 8080:80"
echo ""
warning "Lembre-se de configurar o DNS para argocd.prontclinic.com.br apontar para o IP do ingress controller."
