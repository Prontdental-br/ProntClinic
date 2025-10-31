#!/bin/bash

# =============================================================================
# STATUS CNPG (CloudNativePG) - ProntDental
# =============================================================================

set -e

echo "📊 Status do CNPG (CloudNativePG) - ProntDental"
echo "================================================"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

echo ""
echo "🔧 Operador CNPG:"
echo "=================="
kubectl get pods -n cnpg-system -o wide

echo ""
echo "🐘 Cluster PostgreSQL:"
echo "======================"
kubectl get cluster -n ptcc-development -o wide

echo ""
echo "📦 Pods do PostgreSQL:"
echo "======================="
kubectl get pods -n ptcc-development -l cnpg.io/cluster=postgresql-dev -o wide

echo ""
echo "💾 Backups:"
echo "==========="
kubectl get scheduledbackup -n ptcc-development -o wide

echo ""
echo "🔗 Serviços:"
echo "============"
kubectl get svc -n ptcc-development -l cnpg.io/cluster=postgresql-dev

echo ""
echo "📈 Recursos (CPU/Memória):"
echo "========================="
kubectl top pods -n ptcc-development -l cnpg.io/cluster=postgresql-dev

echo ""
echo "🔍 Logs do Operador (últimas 10 linhas):"
echo "========================================"
kubectl logs -n cnpg-system deployment/cnpg-controller-manager --tail=10

echo ""
echo "✅ Status verificado com sucesso!"
