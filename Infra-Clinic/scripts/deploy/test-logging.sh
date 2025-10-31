#!/bin/bash

echo "🔍 Testando Sistema de Logging - ProntClinic"
echo "=============================================="

# Verificar status dos pods
echo "📊 Status dos Pods:"
kubectl get pods -n ptcc-development -l app=elasticsearch-dev
kubectl get pods -n ptcc-development -l app=kibana-dev
kubectl get pods -n ptcc-development -l app=filebeat-dev

echo ""
echo "🔗 Verificando Conectividade:"
# Testar conectividade do Filebeat com Elasticsearch
kubectl exec -n ptcc-development deployment/filebeat-dev -- curl -s "elasticsearch-dev-service:9200/_cluster/health" | jq -r '.status'

echo ""
echo "📝 Gerando Logs de Teste:"
# Gerar logs de teste
for i in {1..5}; do
    kubectl exec -n ptcc-development deployment/api-chat-d -- echo "Test log message $i - $(date)" >> /tmp/test.log
    sleep 2
done

echo ""
echo "⏳ Aguardando coleta de logs (30 segundos)..."
sleep 30

echo ""
echo "📊 Verificando Índices no Elasticsearch:"
kubectl exec -n ptcc-development deployment/elasticsearch-dev -- curl -s "localhost:9200/_cat/indices?v"

echo ""
echo "📈 Status do Filebeat:"
kubectl logs -n ptcc-development deployment/filebeat-dev --tail=5

echo ""
echo "🌐 Acesso ao Kibana:"
echo "URL: https://logs-d.prontclinic.com.br"
echo "Usuário: admin"
echo "Senha: 134rC03Hpz6oKekw4OdG0"
echo ""
echo "Para visualizar logs no Kibana:"
echo "1. Acesse o Kibana"
echo "2. Vá para 'Stack Management' → 'Index Patterns'"
echo "3. Crie um index pattern: filebeat-*"
echo "4. Vá para 'Discover' para ver os logs"
