#!/bin/bash

# =============================================================================
# CONFIGURAR KIBANA PARA COLETA DE LOGS - ProntClinic
# =============================================================================

set -e

echo "🔧 Configurando Kibana para Coleta de Logs - ProntClinic"
echo "========================================================="

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

echo "✅ kubectl configurado e cluster acessível"

# Verificar se o stack de logging está rodando
echo "🔍 Verificando status do stack de logging..."
if ! kubectl get pods -n ptcc-development -l app=elasticsearch-dev | grep -q "Running"; then
    echo "❌ Elasticsearch não está rodando. Execute primeiro: ./scripts/deploy/deploy-logging-stack.sh"
    exit 1
fi

if ! kubectl get pods -n ptcc-development -l app=kibana-dev | grep -q "Running"; then
    echo "❌ Kibana não está rodando. Execute primeiro: ./scripts/deploy/deploy-logging-stack.sh"
    exit 1
fi

if ! kubectl get pods -n ptcc-development -l app=filebeat-dev | grep -q "Running"; then
    echo "❌ Filebeat não está rodando. Execute primeiro: ./scripts/deploy/deploy-logging-stack.sh"
    exit 1
fi

echo "✅ Stack de logging está rodando"

# 1. Aplicar configurações do Kibana
echo "📊 Aplicando configurações do Kibana..."

# Index Patterns
echo "  - Aplicando Index Patterns..."
kubectl apply -f k8s-manifests/development/logging/kibana-index-patterns.yaml

# Dashboards
echo "  - Aplicando Dashboards..."
kubectl apply -f k8s-manifests/development/logging/kibana-dashboards.yaml

# Visualizações
echo "  - Aplicando Visualizações..."
kubectl apply -f k8s-manifests/development/logging/kibana-visualizations.yaml

# Alertas
echo "  - Aplicando Alertas..."
kubectl apply -f k8s-manifests/development/logging/kibana-alerts.yaml

# 2. Configurar políticas de lifecycle do Elasticsearch
echo "🗄️ Configurando políticas de lifecycle do Elasticsearch..."

# Aplicar política de lifecycle
echo "  - Aplicando política de lifecycle..."
kubectl apply -f k8s-manifests/development/logging/elasticsearch-lifecycle-policy.yaml

# Aguardar um pouco para as configurações serem aplicadas
echo "⏳ Aguardando configurações serem aplicadas..."
sleep 30

# 3. Configurar index patterns via API do Kibana
echo "🔧 Configurando index patterns via API..."

# Aguardar Kibana estar totalmente pronto
echo "⏳ Aguardando Kibana estar pronto..."
kubectl wait --for=condition=ready pod -l app=kibana-dev -n ptcc-development --timeout=300s

# Obter URL do Kibana
KIBANA_URL="http://kibana-dev-service.ptcc-development.svc.cluster.local:5601"

# Configurar index pattern principal
echo "  - Configurando index pattern principal (filebeat-*)..."
curl -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/filebeat-*" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "filebeat-*",
      "timeFieldName": "@timestamp"
    }
  }' || echo "  ⚠️ Index pattern filebeat-* pode já existir"

# Configurar index pattern para aplicações
echo "  - Configurando index pattern para aplicações..."
curl -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/filebeat-app-*" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "attributes": {
      "title": "filebeat-app-*",
      "timeFieldName": "@timestamp"
    }
  }' || echo "  ⚠️ Index pattern filebeat-app-* pode já existir"

# 4. Configurar política de lifecycle via API do Elasticsearch
echo "🗄️ Configurando política de lifecycle via API do Elasticsearch..."

ES_URL="http://elasticsearch-dev-service.ptcc-development.svc.cluster.local:9200"

# Criar política de lifecycle
echo "  - Criando política de lifecycle..."
curl -X PUT "${ES_URL}/_ilm/policy/filebeat-policy" \
  -H "Content-Type: application/json" \
  -d '{
    "policy": {
      "phases": {
        "hot": {
          "actions": {
            "rollover": {
              "max_size": "5GB",
              "max_age": "1d"
            }
          }
        },
        "warm": {
          "min_age": "1d",
          "actions": {
            "allocate": {
              "number_of_replicas": 0
            },
            "forcemerge": {
              "max_num_segments": 1
            }
          }
        },
        "cold": {
          "min_age": "7d",
          "actions": {
            "allocate": {
              "number_of_replicas": 0
            }
          }
        },
        "delete": {
          "min_age": "30d"
        }
      }
    }
  }' || echo "  ⚠️ Política de lifecycle pode já existir"

# Aplicar template com política de lifecycle
echo "  - Aplicando template com política de lifecycle..."
curl -X PUT "${ES_URL}/_index_template/filebeat-template" \
  -H "Content-Type: application/json" \
  -d '{
    "index_patterns": ["filebeat-*"],
    "template": {
      "settings": {
        "index.lifecycle.name": "filebeat-policy",
        "index.number_of_shards": 1,
        "index.number_of_replicas": 0
      }
    }
  }' || echo "  ⚠️ Template pode já existir"

# 5. Verificar configurações
echo "🔍 Verificando configurações..."

# Verificar índices
echo "  - Verificando índices do Elasticsearch..."
curl -s "${ES_URL}/_cat/indices?v" | grep filebeat || echo "  ⚠️ Nenhum índice filebeat encontrado ainda"

# Verificar saúde do cluster
echo "  - Verificando saúde do cluster Elasticsearch..."
curl -s "${ES_URL}/_cluster/health?pretty"

# Verificar status do Kibana
echo "  - Verificando status do Kibana..."
curl -s "${KIBANA_URL}/api/status" | jq '.status.overall.state' || echo "  ⚠️ Não foi possível verificar status do Kibana"

echo ""
echo "✅ Configuração do Kibana para coleta de logs concluída!"
echo ""
echo "📊 URLs de Acesso:"
echo "=================="
echo "Kibana: https://logs-d.prontclinic.com.br"
echo "Elasticsearch: http://elasticsearch-dev-service.ptcc-development.svc.cluster.local:9200"
echo ""
echo "🔑 Credenciais:"
echo "==============="
echo "Usuário: admin"
echo "Senha: 134rC03Hpz6oKekw4OdG0"
echo ""
echo "📋 Próximos Passos:"
echo "==================="
echo "1. Acesse o Kibana via navegador"
echo "2. Configure os index patterns se necessário"
echo "3. Crie dashboards personalizados"
echo "4. Configure alertas específicos para suas aplicações"
echo "5. Monitore os logs em tempo real"
echo ""
echo "🧪 Comandos de Teste:"
echo "===================="
echo "# Verificar logs coletados"
echo "curl '${ES_URL}/filebeat-*/_search?size=5&pretty'"
echo ""
echo "# Verificar status do Filebeat"
echo "kubectl logs -n ptcc-development deployment/filebeat-dev"
echo ""
echo "🎉 Configuração concluída com sucesso!"



