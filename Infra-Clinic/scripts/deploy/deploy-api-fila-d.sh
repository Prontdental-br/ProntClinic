#!/bin/bash

# =============================================================================
# DEPLOY API FILA D - ProntClinic
# =============================================================================

set -e

echo "🚀 Deploy da API Fila D - ProntClinic"
echo "====================================="

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

echo "✅ kubectl configurado e cluster acessível"

# Verificar se o PostgreSQL está rodando
echo "🔍 Verificando se o PostgreSQL está disponível..."
if ! kubectl get cluster postgresql-dev -n ptcc-development &> /dev/null; then
    echo "❌ Cluster PostgreSQL não encontrado. Execute primeiro:"
    echo "kubectl apply -f common/cnpg/"
    exit 1
fi

echo "✅ PostgreSQL disponível"

# Deploy Redis primeiro (dependência)
echo "🔧 Deploy Redis DEV (dependência)..."
kubectl apply -f k8s-manifests/development/redis/redis-deployment.yaml
kubectl apply -f k8s-manifests/development/redis/redis-service.yaml

# Aguardar Redis ficar pronto
echo "⏳ Aguardando Redis ficar pronto..."
kubectl wait --for=condition=ready pod -l app=redis-dev -n ptcc-development --timeout=300s

echo "✅ Redis disponível"

# 1. Criar o banco de dados evolution
echo "🗄️  Criando banco de dados 'evolution'..."
kubectl exec -n ptcc-development postgresql-dev-1 -- psql -U postgres -d postgres -c "CREATE DATABASE evolution;" 2>/dev/null || echo "Banco 'evolution' já existe ou erro na criação"

# 2. Deploy do ConfigMap
echo "📋 Deployando ConfigMap..."
kubectl apply -f k8s-manifests/development/api-fila-d/api-fila-d-configmap.yaml

# 3. Deploy do Secret
echo "🔐 Deployando Secret..."
kubectl apply -f k8s-manifests/development/api-fila-d/api-fila-d-secret.yaml

# 4. Deploy do Deployment
echo "🚀 Deployando API Fila D..."
kubectl apply -f k8s-manifests/development/api-fila-d/api-fila-d-deployment.yaml

# 5. Deploy do Service
echo "🔗 Deployando Service..."
kubectl apply -f k8s-manifests/development/api-fila-d/api-fila-d-service.yaml

# 6. Deploy do Ingress
echo "🌐 Deployando Ingress..."
kubectl apply -f k8s-manifests/development/api-fila-d/api-fila-d-ingress.yaml

# Aguardar deployment estar pronto
echo "⏳ Aguardando API Fila D estar pronta..."
kubectl wait --for=condition=available --timeout=300s deployment/api-fila-d -n ptcc-development

echo "✅ Deploy da API Fila D concluído!"

# Mostrar status
echo ""
echo "📊 Status dos recursos:"
echo "========================"
kubectl get pods -n ptcc-development -l app=api-fila-d
echo ""
kubectl get svc -n ptcc-development -l app=api-fila-d
echo ""
kubectl get ingress -n ptcc-development -l app=api-fila-d

echo ""
echo "🔗 URLs de Acesso:"
echo "=================="
echo "API Fila D: http://api-fila-d.prontclinic.com.br"
echo ""

echo "🔐 Credenciais:"
echo "==============="
echo "API Key: SviuLdm9HpC7utJjTgIjLDEdVrJHgrt95Z7vH8Vd8y6pzGEmmXP4FaqR63j3Fq87"
echo ""

echo "📋 Comandos úteis:"
echo "=================="
echo "kubectl get pods -n ptcc-development -l app=api-fila-d"
echo "kubectl logs -n ptcc-development deployment/api-fila-d"
echo "kubectl describe deployment api-fila-d -n ptcc-development"
echo ""

echo "🧪 Teste de conectividade:"
echo "=========================="
echo "curl -H 'apikey: SviuLdm9HpC7utJjTgIjLDEdVrJHgrt95Z7vH8Vd8y6pzGEmmXP4FaqR63j3Fq87' http://api-fila-d.prontclinic.com.br/manager/health"
