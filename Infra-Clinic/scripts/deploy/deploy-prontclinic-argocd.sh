#!/bin/bash

# Script para deploy das aplicações ProntClinic no ArgoCD
# Este script aplica as configurações do ArgoCD para api, app e painel

set -e

echo "🚀 Iniciando deploy das aplicações ProntClinic no ArgoCD..."

# Verificar se o kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Erro: kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

# Verificar se o namespace argocd existe
if ! kubectl get namespace argocd &> /dev/null; then
    echo "❌ Erro: Namespace 'argocd' não encontrado. Execute primeiro o deploy do ArgoCD."
    exit 1
fi

# Aplicar as aplicações do ArgoCD
echo "📦 Aplicando configurações do ArgoCD..."

# API Application
echo "  🔧 Aplicando prontclinic-api-application..."
kubectl apply -f k8s-manifests/development/argocd/prontclinic-api-application.yaml

# APP Application  
echo "  🔧 Aplicando prontclinic-app-application..."
kubectl apply -f k8s-manifests/development/argocd/prontclinic-app-application.yaml

# PAINEL Application
echo "  🔧 Aplicando prontclinic-painel-application..."
kubectl apply -f k8s-manifests/development/argocd/prontclinic-painel-application.yaml

echo "✅ Configurações do ArgoCD aplicadas com sucesso!"

# Verificar status das aplicações
echo "📊 Verificando status das aplicações..."
kubectl get applications -n argocd | grep prontclinic

echo ""
echo "🎯 Para verificar o status detalhado das aplicações:"
echo "   kubectl get applications -n argocd"
echo "   kubectl describe application prontclinic-api -n argocd"
echo "   kubectl describe application prontclinic-app -n argocd"
echo "   kubectl describe application prontclinic-painel -n argocd"
echo ""
echo "🌐 Para acessar a interface do ArgoCD:"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "   Acesse: https://localhost:8080"
