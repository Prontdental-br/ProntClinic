#!/bin/bash

# =============================================================================
# INICIALIZAR BANCO DE DADOS EVOLUTION - ProntClinic
# =============================================================================

set -e

echo "🗄️  Inicializando banco de dados Evolution - ProntClinic"
echo "========================================================"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

# Verificar se o PostgreSQL está rodando
echo "🔍 Verificando se o PostgreSQL está disponível..."
if ! kubectl get cluster postgresql-dev -n ptcc-development &> /dev/null; then
    echo "❌ Cluster PostgreSQL não encontrado. Execute primeiro:"
    echo "kubectl apply -f common/cnpg/"
    exit 1
fi

echo "✅ PostgreSQL disponível"

# Criar usuário prontclinic se não existir
echo "👤 Criando usuário prontclinic..."
kubectl exec -n ptcc-development postgresql-dev-1 -- psql -U postgres -d postgres -c "CREATE USER prontclinic WITH PASSWORD 'prontclinic123';" 2>/dev/null || echo "Usuário prontclinic já existe"

# Dar permissões ao usuário
echo "🔐 Configurando permissões..."
kubectl exec -n ptcc-development postgresql-dev-1 -- psql -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE evolution TO prontclinic;"

# Testar conexão
echo "🧪 Testando conexão com o banco evolution..."
kubectl exec -n ptcc-development postgresql-dev-1 -- env PGPASSWORD=prontclinic123 psql -h localhost -U prontclinic -d evolution -c "SELECT 'Conexão com Evolution API funcionando!' as status, current_database(), current_user;"

echo ""
echo "✅ Banco de dados Evolution configurado com sucesso!"
echo ""
echo "🔗 String de conexão:"
echo "postgresql://prontclinic:prontclinic123@postgresql-dev-rw.ptcc-development.svc.cluster.local:5432/evolution?schema=public"
echo ""
echo "📋 Comandos úteis:"
echo "=================="
echo "# Conectar no banco evolution"
echo "kubectl exec -n ptcc-development postgresql-dev-1 -- env PGPASSWORD=prontclinic123 psql -h localhost -U prontclinic -d evolution"
echo ""
echo "# Ver tabelas criadas pelo Evolution API"
echo "kubectl exec -n ptcc-development postgresql-dev-1 -- env PGPASSWORD=prontclinic123 psql -h localhost -U prontclinic -d evolution -c '\dt'"
