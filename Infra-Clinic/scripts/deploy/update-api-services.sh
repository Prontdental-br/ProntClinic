#!/bin/bash

echo "🔧 Aplicando Novos Ajustes nos Serviços API - ProntClinic"
echo "========================================================="

# Função para aplicar ajustes em um serviço
apply_service_updates() {
    local service_name=$1
    local namespace="ptcc-development"
    
    echo ""
    echo "📋 Aplicando ajustes no serviço: $service_name"
    echo "----------------------------------------"
    
    # Verificar status atual
    echo "📊 Status atual do $service_name:"
    kubectl get deployment $service_name -n $namespace
    
    # Aplicar os manifests
    echo ""
    echo "🔄 Aplicando manifests do $service_name..."
    kubectl apply -f k8s-manifests/development/$service_name/
    
    # Aguardar rollout
    echo ""
    echo "⏳ Aguardando rollout do $service_name..."
    kubectl rollout status deployment/$service_name -n $namespace --timeout=300s
    
    # Verificar status final
    echo ""
    echo "✅ Status final do $service_name:"
    kubectl get deployment $service_name -n $namespace
    
    # Verificar pods
    echo ""
    echo "📦 Pods do $service_name:"
    kubectl get pods -n $namespace -l app=$service_name
    
    # Verificar logs (últimas 5 linhas)
    echo ""
    echo "📝 Últimos logs do $service_name:"
    kubectl logs -n $namespace deployment/$service_name --tail=5
}

# Função para verificar saúde dos serviços
check_services_health() {
    echo ""
    echo "🏥 Verificando saúde dos serviços..."
    echo "===================================="
    
    # Verificar api-chat-d
    echo ""
    echo "🔍 Verificando api-chat-d:"
    kubectl get pods -n ptcc-development -l app=api-chat-d
    echo "Health check:"
    kubectl exec -n ptcc-development deployment/api-chat-d -- curl -s http://localhost:8080/manager/health || echo "Health check falhou"
    
    # Verificar api-fila-d
    echo ""
    echo "🔍 Verificando api-fila-d:"
    kubectl get pods -n ptcc-development -l app=api-fila-d
    echo "Health check:"
    kubectl exec -n ptcc-development deployment/api-fila-d -- curl -s http://localhost:8080/manager/health || echo "Health check falhou"
}

# Função para reiniciar serviços
restart_services() {
    echo ""
    echo "🔄 Reiniciando serviços..."
    echo "========================="
    
    echo "🔄 Reiniciando api-chat-d..."
    kubectl rollout restart deployment/api-chat-d -n ptcc-development
    
    echo "🔄 Reiniciando api-fila-d..."
    kubectl rollout restart deployment/api-fila-d -n ptcc-development
    
    echo "⏳ Aguardando rollouts..."
    kubectl rollout status deployment/api-chat-d -n ptcc-development --timeout=300s
    kubectl rollout status deployment/api-fila-d -n ptcc-development --timeout=300s
}

# Menu de opções
echo ""
echo "Escolha uma opção:"
echo "1) Aplicar ajustes no api-chat-d"
echo "2) Aplicar ajustes no api-fila-d"
echo "3) Aplicar ajustes em ambos os serviços"
echo "4) Reiniciar ambos os serviços"
echo "5) Verificar saúde dos serviços"
echo "6) Sair"
echo ""

read -p "Digite sua opção (1-6): " option

case $option in
    1)
        apply_service_updates "api-chat-d"
        ;;
    2)
        apply_service_updates "api-fila-d"
        ;;
    3)
        apply_service_updates "api-chat-d"
        apply_service_updates "api-fila-d"
        ;;
    4)
        restart_services
        ;;
    5)
        check_services_health
        ;;
    6)
        echo "Saindo..."
        exit 0
        ;;
    *)
        echo "Opção inválida!"
        exit 1
        ;;
esac

echo ""
echo "✅ Operação concluída!"
echo ""
echo "📊 Status final dos serviços:"
kubectl get deployments -n ptcc-development -l app=api-chat-d
kubectl get deployments -n ptcc-development -l app=api-fila-d
