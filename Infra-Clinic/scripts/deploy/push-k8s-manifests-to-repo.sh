#!/bin/bash

# Script para fazer push dos manifests do Kubernetes para o repositório GitHub
# Este script adiciona os manifests ao repositório e faz commit/push

set -e

echo "🚀 Fazendo push dos manifests do Kubernetes para o repositório..."

# Verificar se estamos no diretório correto
if [ ! -d "k8s-manifests" ]; then
    echo "❌ Erro: Diretório k8s-manifests não encontrado"
    echo "Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Verificar se o git está configurado
if ! git status &> /dev/null; then
    echo "❌ Erro: Não é um repositório git"
    echo "Execute: git init"
    exit 1
fi

# Verificar se há mudanças para commit
if git diff --quiet && git diff --cached --quiet; then
    echo "⚠️  Nenhuma mudança detectada"
    echo "Os manifests já podem estar no repositório"
else
    echo "📦 Adicionando manifests ao git..."
    git add k8s-manifests/
    
    echo "💾 Fazendo commit..."
    git commit -m "feat: adicionar manifests do Kubernetes para ArgoCD
    
    - Adicionar estrutura k8s-manifests/development/
    - Incluir manifests para prontclinic-api, prontclinic-app e prontclinic-painel
    - Configurar ArgoCD para gerenciar deployments"
    
    echo "🚀 Fazendo push para o repositório..."
    git push origin ptcc-development
    
    echo "✅ Manifests enviados com sucesso!"
fi

echo ""
echo "📊 Verificando status das aplicações do ArgoCD..."
kubectl get applications -n argocd | grep prontclinic

echo ""
echo "🔍 Para verificar logs do ArgoCD:"
echo "kubectl logs -n argocd deployment/argocd-repo-server --tail=20"

echo ""
echo "⏳ Aguarde alguns minutos para a sincronização automática..."
