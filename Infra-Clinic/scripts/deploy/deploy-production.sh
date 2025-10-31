#!/bin/bash

# =============================================================================
# DEPLOY AMBIENTE DE PRODUÇÃO - ProntDental
# =============================================================================

set -e

echo "🏭 Deploy do Ambiente de Produção - ProntDental"
echo "==============================================="

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

echo "✅ kubectl configurado e cluster acessível"

# 1. Deploy do pgAdmin PROD
echo "🐘 Deployando pgAdmin PROD..."
kubectl apply -f k8s-manifests/production/pgadmin/

# 2. Deploy do MinIO PROD
echo "📦 Deployando MinIO PROD..."
kubectl apply -f k8s-manifests/production/minio/

echo "✅ Deploy do ambiente de produção concluído!"

# Mostrar status
echo ""
echo "📊 Status dos recursos:"
echo "========================"
kubectl get pods -n ptcc-production
echo ""
kubectl get svc -n ptcc-production
echo ""
kubectl get ingress -n ptcc-production

echo ""
echo "🔗 URLs de Acesso:"
echo "=================="
echo "pgAdmin PROD: http://pgadmin.prontclinic.com.br"
echo "MinIO PROD: http://s3-d.prontclinic.com.br"
echo ""

echo "🔐 Credenciais:"
echo "==============="
echo "pgAdmin: admin@prontdental.com / admin123"
echo "MinIO: minioadmin / minioadmin123"
echo ""

echo "📋 Comandos úteis:"
echo "=================="
echo "kubectl get all -n ptcc-production"
echo "kubectl logs -n ptcc-production deployment/pgadmin"
echo "kubectl logs -n ptcc-production deployment/minio"
