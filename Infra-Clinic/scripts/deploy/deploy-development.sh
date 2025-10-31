#!/bin/bash

# =============================================================================
# DEPLOY AMBIENTE DE DESENVOLVIMENTO - ProntDental
# =============================================================================

set -e

echo "🚀 Deploy do Ambiente de Desenvolvimento - ProntDental"
echo "======================================================"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

echo "✅ kubectl configurado e cluster acessível"

# 1. Deploy do CNPG (PostgreSQL)
echo "🐘 Deployando PostgreSQL com CNPG..."
kubectl apply -f common/cnpg/

# Aguardar cluster PostgreSQL estar pronto
echo "⏳ Aguardando cluster PostgreSQL estar pronto..."
kubectl wait --for=condition=ready --timeout=600s cluster/postgresql-dev -n ptcc-development

# 2. Deploy do pgAdmin DEV
echo "🐘 Deployando pgAdmin DEV..."
kubectl apply -f k8s-manifests/development/pgadmin/

# 3. Deploy do MinIO DEV
echo "📦 Deployando MinIO DEV..."
kubectl apply -f k8s-manifests/development/minio/

# 4. Deploy da Evolution API DEV
echo "🤖 Deployando Evolution API DEV..."
kubectl apply -f k8s-manifests/development/evolution-api/

# Aguardar Evolution API estar pronta
echo "⏳ Aguardando Evolution API estar pronta..."
kubectl wait --for=condition=available --timeout=300s deployment/evolution-api-dev -n ptcc-development

echo "✅ Deploy do ambiente de desenvolvimento concluído!"

# Mostrar status
echo ""
echo "📊 Status dos recursos:"
echo "========================"
kubectl get pods -n ptcc-development
echo ""
kubectl get svc -n ptcc-development
echo ""
kubectl get ingress -n ptcc-development

echo ""
echo "🔗 URLs de Acesso:"
echo "=================="
echo "pgAdmin DEV: http://pgadmin-dev.prontclinic.com.br"
echo "MinIO DEV: http://minio-dev.prontclinic.com.br"
echo "Evolution API DEV: http://evolution-dev.prontclinic.com.br"
echo ""

echo "🔐 Credenciais:"
echo "==============="
echo "pgAdmin: admin@prontdental.com / admin123"
echo "MinIO: minioadmin / minioadmin123"
echo "PostgreSQL: prontclinic / prontclinic123"
echo "Evolution API Key: SviuLdm9HpC7utJjTgIjLDEdVrJHgrt95Z7vH8Vd8y6pzGEmmXP4FaqR63j3Fq87"
echo ""

echo "📋 Comandos úteis:"
echo "=================="
echo "kubectl get all -n ptcc-development"
echo "./scripts/deploy/dev-status.sh"
echo "kubectl exec -it -n ptcc-development postgresql-dev-1 -- psql -U postgres -d prontclinic"
echo "kubectl logs -n ptcc-development deployment/evolution-api-dev"
