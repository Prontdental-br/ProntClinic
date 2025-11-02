#!/bin/bash

# =============================================================================
# DEPLOY ARGOCD APPLICATIONS - ProntClinic
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Deployando Applications do ArgoCD..."
echo "============================"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Erro: kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

# Verificar se o namespace argocd existe
if ! kubectl get namespace argocd &> /dev/null; then
    echo "❌ Erro: Namespace 'argocd' não encontrado."
    echo "   Execute primeiro: cd ../ && ./install.sh"
    exit 1
fi

echo "✅ Cluster e namespace argocd verificados"

# Deploy do AppProject primeiro
echo ""
echo "📦 Deployando AppProject..."
kubectl apply -f "${SCRIPT_DIR}/development/project-ptcc-development.yaml"
echo "✅ AppProject ptcc-development aplicado"

# Deploy das Applications
echo ""
echo "📦 Deployando Applications..."
for app in "${SCRIPT_DIR}"/development/*-*.yaml; do
    if [ -f "$app" ] && [ "$(basename "$app")" != "project-ptcc-development.yaml" ]; then
        APP_NAME=$(basename "$app" .yaml)
        echo "  🔧 Aplicando $APP_NAME..."
        kubectl apply -f "$app"
    fi
done

echo ""
echo "✅ Applications aplicadas com sucesso!"
echo ""
echo "📊 Verificando status..."
kubectl get applications -n argocd

echo ""
echo "📋 Para verificar o status detalhado:"
echo "   kubectl get applications -n argocd"
echo "   kubectl describe application prontclinic-api -n argocd"
echo ""
echo "🌐 Acessar ArgoCD UI:"
echo "   https://argocd-d.prontclinic.com.br"
echo ""
echo "🔄 Para sincronizar manualmente (se necessário):"
echo "   argocd app sync prontclinic-api"
echo "   ou via UI: Applications > prontclinic-api > Sync"

