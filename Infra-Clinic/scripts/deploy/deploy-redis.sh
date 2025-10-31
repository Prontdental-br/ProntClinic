#!/bin/bash

# Deploy Redis para ambiente de desenvolvimento
# Autor: ProntClinic DevOps
# Data: $(date)

set -e

echo "🚀 Deploy Redis DEV - ProntClinic"
echo "=================================="
echo ""

# Verificar se o namespace existe
echo "📋 Verificando namespace..."
kubectl get namespace ptcc-development > /dev/null 2>&1 || {
    echo "❌ Namespace ptcc-development não encontrado!"
    echo "Execute primeiro: kubectl create namespace ptcc-development"
    exit 1
}

echo "✅ Namespace ptcc-development encontrado"
echo ""

# Deploy Redis
echo "🔧 Deploy Redis DEV..."
kubectl apply -f k8s-manifests/development/redis/redis-deployment.yaml
kubectl apply -f k8s-manifests/development/redis/redis-service.yaml

echo "✅ Redis DEV deployado com sucesso!"
echo ""

# Aguardar pods ficarem prontos
echo "⏳ Aguardando pods ficarem prontos..."
kubectl wait --for=condition=ready pod -l app=redis-dev -n ptcc-development --timeout=300s

echo "✅ Pods Redis DEV prontos!"
echo ""

# Status dos recursos
echo "📊 Status dos recursos Redis DEV:"
echo "================================="
kubectl get deployment redis-dev -n ptcc-development
kubectl get service redis-dev-service -n ptcc-development
kubectl get pods -l app=redis-dev -n ptcc-development

echo ""
echo "🔗 Informações de Conexão:"
echo "=========================="
echo "Host: redis-dev-service.ptcc-development.svc.cluster.local"
echo "Porta: 6379"
echo "Senha: redis123"
echo "Database: 1"
echo ""

echo "🧪 Teste de conectividade:"
echo "=========================="
echo "kubectl exec -it deployment/redis-dev -n ptcc-development -- redis-cli -a redis123 ping"
echo ""

echo "📋 Comandos úteis:"
echo "=================="
echo "kubectl logs deployment/redis-dev -n ptcc-development"
echo "kubectl describe deployment redis-dev -n ptcc-development"
echo ""

echo "🎉 Redis DEV deployado com sucesso!"
