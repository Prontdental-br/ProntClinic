#!/bin/bash

echo "🚀 Aplicando Ajustes nos Serviços API - ProntClinic"
echo "===================================================="

# Verificar se estamos no diretório correto
if [ ! -d "k8s-manifests/development/api-chat-d" ]; then
    echo "❌ Erro: Execute este script a partir do diretório raiz do projeto"
    exit 1
fi

# Função para aplicar ajustes
apply_updates() {
    local service=$1
    echo ""
    echo "🔧 Aplicando ajustes no $service..."
    echo "=================================="
    
    # Aplicar todos os manifests do serviço
    kubectl apply -f k8s-manifests/development/$service/
    
    # Aguardar rollout
    echo "⏳ Aguardando rollout do $service..."
    kubectl rollout status deployment/$service -n ptcc-development --timeout=300s
    
    # Verificar status
    echo "✅ Status do $service:"
    kubectl get deployment $service -n ptcc-development
    kubectl get pods -n ptcc-development -l app=$service
}

# Aplicar ajustes nos dois serviços
echo "📋 Aplicando ajustes nos serviços API..."

apply_updates "api-chat-d"
apply_updates "api-fila-d"

echo ""
echo "🏥 Verificando saúde dos serviços..."
echo "===================================="

# Verificar se os serviços estão respondendo
echo "🔍 Verificando api-chat-d:"
kubectl get pods -n ptcc-development -l app=api-chat-d
echo "Health check api-chat-d:"
kubectl exec -n ptcc-development deployment/api-chat-d -- curl -s http://localhost:8080/manager/health 2>/dev/null || echo "❌ Health check falhou"

echo ""
echo "🔍 Verificando api-fila-d:"
kubectl get pods -n ptcc-development -l app=api-fila-d
echo "Health check api-fila-d:"
kubectl exec -n ptcc-development deployment/api-fila-d -- curl -s http://localhost:8080/manager/health 2>/dev/null || echo "❌ Health check falhou"

echo ""
echo "📊 Status final dos serviços:"
kubectl get deployments -n ptcc-development -l app=api-chat-d
kubectl get deployments -n ptcc-development -l app=api-fila-d

echo ""
echo "✅ Ajustes aplicados com sucesso!"
echo ""
echo "🌐 URLs dos serviços:"
echo "- API Chat: https://api-chat-d.prontclinic.com.br"
echo "- API Fila: https://api-fila-d.prontclinic.com.br"
