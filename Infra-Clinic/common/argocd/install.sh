#!/bin/bash

# =============================================================================
# INSTALAÇÃO ARGOCD VIA HELM - ProntClinic
# =============================================================================

set -e

echo "🚀 Instalando ArgoCD via Helm..."
echo "============================"

# Verificar se Helm está instalado
if ! command -v helm &> /dev/null; then
    echo "❌ Helm não está instalado. Instale com: snap install helm --classic"
    exit 1
fi

echo "✅ Helm instalado: $(helm version --short)"

# Criar namespace se não existir
echo "📦 Criando namespace argocd..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# Adicionar repositório ArgoCD se não existir
if ! helm repo list | grep -q argo; then
    echo "📥 Adicionando repositório ArgoCD..."
    helm repo add argo https://argoproj.github.io/argo-helm
    helm repo update
fi

echo "✅ Repositório ArgoCD configurado"

# Instalar ArgoCD via Helm
echo "🔧 Instalando ArgoCD com valores personalizados..."
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --values values.yaml \
  --wait \
  --timeout 10m

echo ""
echo "✅ ArgoCD instalado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "=================="
echo ""
echo "1. Obter senha inicial do admin:"
echo "   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath=\"{.data.password}\" | base64 -d && echo"
echo ""
echo "2. Port-forward para acesso local (opcional):"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo ""
echo "3. Acessar via URL externa:"
echo "   https://argocd-d.prontclinic.com.br"
echo ""
echo "4. Login inicial:"
echo "   Usuário: admin"
echo "   Senha: (obter com comando acima)"
echo ""

