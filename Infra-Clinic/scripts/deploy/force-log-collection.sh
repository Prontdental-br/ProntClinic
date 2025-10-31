#!/bin/bash

echo "🔍 Forçando Coleta de Logs - ProntClinic"
echo "========================================"

# Gerar logs de teste em todos os serviços
echo "📝 Gerando logs de teste..."

# API Chat D
kubectl exec -n ptcc-development deployment/api-chat-d -- echo "$(date): Test log from api-chat-d" >> /tmp/test.log

# API Fila D  
kubectl exec -n ptcc-development deployment/api-fila-d -- echo "$(date): Test log from api-fila-d" >> /tmp/test.log

# PostgreSQL
kubectl exec -n ptcc-development deployment/postgresql-dev-1 -- echo "$(date): Test log from postgresql" >> /tmp/test.log

# Redis
kubectl exec -n ptcc-development deployment/redis-dev -- echo "$(date): Test log from redis" >> /tmp/test.log

# MinIO
kubectl exec -n ptcc-development deployment/minio-dev -- echo "$(date): Test log from minio" >> /tmp/test.log

echo ""
echo "⏳ Aguardando coleta de logs (60 segundos)..."
sleep 60

echo ""
echo "📊 Verificando Índices no Elasticsearch:"
kubectl exec -n ptcc-development deployment/elasticsearch-dev -- curl -s "localhost:9200/_cat/indices?v"

echo ""
echo "📈 Status do Filebeat:"
kubectl logs -n ptcc-development deployment/filebeat-dev --tail=3

echo ""
echo "🔍 Verificando se há logs sendo coletados:"
kubectl exec -n ptcc-development deployment/elasticsearch-dev -- curl -s "localhost:9200/filebeat-*/_search?size=5&pretty" | jq -r '.hits.hits[]._source.message // "Nenhum log encontrado"'

echo ""
echo "✅ Teste concluído!"
