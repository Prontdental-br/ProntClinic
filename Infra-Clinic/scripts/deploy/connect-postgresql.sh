#!/bin/bash

# =============================================================================
# CONECTAR NO POSTGRESQL - ProntDental
# =============================================================================

set -e

echo "🐘 Conectando no PostgreSQL - ProntDental"
echo "=========================================="

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

# Verificar se o cluster PostgreSQL está rodando
echo "📊 Verificando status do cluster PostgreSQL..."
kubectl get cluster postgresql-dev -n ptcc-development

echo ""
echo "🔗 Configurando port-forward..."
echo "PostgreSQL estará disponível em: localhost:5432"
echo ""

# Matar port-forwards existentes
pkill -f "kubectl port-forward.*5432" 2>/dev/null || true

# Iniciar port-forward
echo "🚀 Iniciando port-forward..."
kubectl port-forward -n ptcc-development svc/postgresql-cluster-rw 5432:5432 &
PORT_FORWARD_PID=$!

# Aguardar port-forward estar pronto
sleep 3

echo "✅ Port-forward configurado!"
echo ""
echo "🔐 Credenciais de acesso:"
echo "========================="
echo "Host: localhost"
echo "Porta: 5432"
echo "Database: prontclinic"
echo "Usuário: prontclinic"
echo "Senha: prontclinic123"
echo ""
echo "📋 Comandos para conectar:"
echo "=========================="
echo "# Via psql (se instalado localmente):"
echo "psql -h localhost -p 5432 -U prontclinic -d prontclinic"
echo ""
echo "# Via kubectl exec (dentro do cluster):"
echo "kubectl exec -it -n ptcc-development postgresql-dev-1 -- psql -U postgres -d prontclinic"
echo ""
echo "# Via pgAdmin (já configurado):"
echo "http://pgadmin.prontclinic.com.br"
echo ""

# Testar conexão
echo "🧪 Testando conexão..."
if kubectl exec -n ptcc-development postgresql-dev-1 -- psql -U postgres -d prontdental -c "SELECT 'Conexão OK' as status;" &>/dev/null; then
    echo "✅ Conexão com PostgreSQL funcionando!"
else
    echo "❌ Erro na conexão com PostgreSQL"
fi

echo ""
echo "⏹️  Para parar o port-forward, execute:"
echo "kill $PORT_FORWARD_PID"
echo ""
echo "🔍 Para ver logs do PostgreSQL:"
echo "kubectl logs -n ptcc-development postgresql-dev-1"
