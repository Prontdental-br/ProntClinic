#!/bin/bash

# =============================================================================
# DEPLOY LOGGING STACK - ProntClinic
# =============================================================================

set -e

echo "🚀 Deploy do Stack de Logging - ProntClinic"
echo "============================================="

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

echo "✅ kubectl configurado e cluster acessível"

# 1. Deploy do Elasticsearch
echo "🔍 Deployando Elasticsearch..."
kubectl apply -f k8s-manifests/development/logging/elasticsearch-deployment.yaml
kubectl apply -f k8s-manifests/development/logging/elasticsearch-service.yaml

# Aguardar Elasticsearch ficar pronto
echo "⏳ Aguardando Elasticsearch ficar pronto..."
kubectl wait --for=condition=ready pod -l app=elasticsearch-dev -n ptcc-development --timeout=300s

echo "✅ Elasticsearch pronto!"

# 2. Deploy do Kibana
echo "📊 Deployando Kibana..."
kubectl apply -f k8s-manifests/development/logging/kibana-deployment.yaml
kubectl apply -f k8s-manifests/development/logging/kibana-service.yaml
kubectl apply -f k8s-manifests/development/logging/kibana-ingress.yaml

# Aguardar Kibana ficar pronto
echo "⏳ Aguardando Kibana ficar pronto..."
kubectl wait --for=condition=ready pod -l app=kibana-dev -n ptcc-development --timeout=300s

echo "✅ Kibana pronto!"

# 3. Deploy do Filebeat
echo "📝 Deployando Filebeat..."
kubectl apply -f k8s-manifests/development/logging/filebeat-rbac.yaml
kubectl apply -f k8s-manifests/development/logging/filebeat-configmap.yaml
kubectl apply -f k8s-manifests/development/logging/filebeat-deployment.yaml

# Aguardar Filebeat ficar pronto
echo "⏳ Aguardando Filebeat ficar pronto..."
kubectl wait --for=condition=ready pod -l app=filebeat-dev -n ptcc-development --timeout=300s

echo "✅ Filebeat pronto!"

echo "✅ Deploy do Stack de Logging concluído!"

# Mostrar status
echo ""
echo "📊 Status dos recursos:"
echo "========================"
kubectl get pods -n ptcc-development -l app=elasticsearch-dev
kubectl get pods -n ptcc-development -l app=kibana-dev
kubectl get pods -n ptcc-development -l app=filebeat-dev

echo ""
echo "🔗 URLs de Acesso:"
echo "=================="
echo "Kibana: https://logs-d.prontclinic.com.br"
echo "Elasticsearch: http://elasticsearch-dev-service.ptcc-development.svc.cluster.local:9200"

echo ""
echo "📋 Comandos úteis:"
echo "=================="
echo "kubectl logs -n ptcc-development deployment/elasticsearch-dev"
echo "kubectl logs -n ptcc-development deployment/kibana-dev"
echo "kubectl logs -n ptcc-development deployment/filebeat-dev"
echo ""

echo "🧪 Teste de conectividade:"
echo "=========================="
echo "curl http://elasticsearch-dev-service.ptcc-development.svc.cluster.local:9200/_cluster/health"
echo ""

echo "🎉 Stack de Logging deployado com sucesso!"
