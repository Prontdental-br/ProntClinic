#!/bin/bash

# =============================================================================
# DEPLOY CNPG (CloudNativePG) - ProntDental
# =============================================================================

set -e

echo "🚀 Iniciando deploy do CNPG (CloudNativePG)..."

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

echo "✅ kubectl configurado e cluster acessível"

# 1. Instalar o operador CNPG
echo "📦 Instalando operador CNPG..."
kubectl apply -f common/cnpg/cnpg-operator.yaml

# Aguardar o operador estar pronto
echo "⏳ Aguardando operador CNPG estar pronto..."
kubectl wait --for=condition=available --timeout=300s deployment/cnpg-controller-manager -n cnpg-system

# 2. Instalar webhooks
echo "🔗 Instalando webhooks CNPG..."
kubectl apply -f common/cnpg/cnpg-webhook.yaml

# 3. Criar secret com credenciais
echo "🔐 Criando secret com credenciais PostgreSQL..."
kubectl apply -f common/cnpg/postgresql-secret.yaml

# 4. Deploy do cluster PostgreSQL
echo "🐘 Deployando cluster PostgreSQL..."
kubectl apply -f common/cnpg/postgresql-cluster.yaml

# 5. Configurar backup automático
echo "💾 Configurando backup automático..."
kubectl apply -f common/cnpg/postgresql-backup.yaml

# Aguardar cluster estar pronto
echo "⏳ Aguardando cluster PostgreSQL estar pronto..."
kubectl wait --for=condition=ready --timeout=600s cluster/postgresql-cluster -n ptcc-development

echo "✅ Deploy do CNPG concluído com sucesso!"

# Mostrar status
echo ""
echo "📊 Status dos recursos:"
echo "========================"
kubectl get pods -n cnpg-system
echo ""
kubectl get cluster -n ptcc-development
echo ""
kubectl get scheduledbackup -n ptcc-development

echo ""
echo "🔗 Comandos úteis:"
echo "=================="
echo "kubectl get cluster -n ptcc-development"
echo "kubectl describe cluster postgresql-cluster -n ptcc-development"
echo "kubectl logs -n cnpg-system deployment/cnpg-controller-manager"
