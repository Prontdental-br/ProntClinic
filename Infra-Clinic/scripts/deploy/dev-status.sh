#!/bin/bash

# =============================================================================
# STATUS AMBIENTE DEV - ProntDental
# =============================================================================

set -e

echo "📊 Status do Ambiente DEV - ProntDental"
echo "========================================"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

echo ""
echo "🐘 PostgreSQL DEV:"
echo "==================="
kubectl get cluster postgresql-dev -n ptcc-development -o wide

echo ""
echo "📦 Pods PostgreSQL DEV:"
echo "========================"
kubectl get pods -n ptcc-development -l cnpg.io/cluster=postgresql-dev -o wide

echo ""
echo "🔗 Serviços PostgreSQL DEV:"
echo "============================"
kubectl get svc -n ptcc-development -l cnpg.io/cluster=postgresql-dev

echo ""
echo "💾 Backup PostgreSQL DEV:"
echo "========================="
kubectl get scheduledbackup -n ptcc-development -o wide

echo ""
echo "🐘 pgAdmin DEV:"
echo "==============="
kubectl get pods -n ptcc-development -l app=pgadmin-dev -o wide

echo ""
echo "🔗 Serviço pgAdmin DEV:"
echo "======================="
kubectl get svc -n ptcc-development -l app=pgadmin-dev

echo ""
echo "📦 MinIO DEV:"
echo "============="
kubectl get pods -n ptcc-development -l app=minio-dev -o wide

echo ""
echo "🔗 Serviço MinIO DEV:"
echo "====================="
kubectl get svc -n ptcc-development -l app=minio-dev

echo ""
echo "🔴 Redis DEV:"
echo "============="
kubectl get pods -n ptcc-development -l app=redis-dev -o wide

echo ""
echo "🔗 Serviço Redis DEV:"
echo "====================="
kubectl get svc -n ptcc-development -l app=redis-dev

echo ""
echo "🤖 API Fila D:"
echo "=============="
kubectl get pods -n ptcc-development -l app=api-fila-d -o wide

echo ""
echo "🔗 Serviço API Fila D:"
echo "======================"
kubectl get svc -n ptcc-development -l app=api-fila-d

echo ""
echo "🌐 Ingress DEV:"
echo "==============="
kubectl get ingress -n ptcc-development

echo ""
echo "🔗 URLs de Acesso:"
echo "=================="
echo "pgAdmin DEV: http://pgadmin-dev.prontclinic.com.br"
echo "MinIO DEV: http://minio-dev.prontclinic.com.br"
echo "API Fila D: http://api-fila-d.prontclinic.com.br"
echo ""

echo "🔐 Credenciais:"
echo "==============="
echo "Evolution API Key: SviuLdm9HpC7utJjTgIjLDEdVrJHgrt95Z7vH8Vd8y6pzGEmmXP4FaqR63j3Fq87"
echo ""

echo "✅ Status do ambiente DEV verificado com sucesso!"
