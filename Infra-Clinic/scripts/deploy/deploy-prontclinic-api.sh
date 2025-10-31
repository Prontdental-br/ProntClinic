#!/bin/bash

# 🏥 Deploy ProntClinic API - Desenvolvimento
# Script para deploy da API ProntClinic no ambiente de desenvolvimento

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se kubectl está disponível
if ! command -v kubectl &> /dev/null; then
    error "kubectl não encontrado. Instale o kubectl primeiro."
    exit 1
fi

# Verificar se está conectado ao cluster
if ! kubectl cluster-info &> /dev/null; then
    error "Não foi possível conectar ao cluster Kubernetes."
    exit 1
fi

log "Iniciando deploy da ProntClinic API..."

# Verificar se o namespace existe
if ! kubectl get namespace ptcc-development &> /dev/null; then
    log "Criando namespace ptcc-development..."
    kubectl create namespace ptcc-development
    success "Namespace ptcc-development criado"
else
    log "Namespace ptcc-development já existe"
fi

# Verificar se os secrets existem
if ! kubectl get secret prontclinic-api-secret -n ptcc-development &> /dev/null; then
    warning "Secret prontclinic-api-secret não encontrado!"
    warning "Configure os secrets antes de continuar:"
    echo ""
    echo "kubectl create secret generic prontclinic-api-secret \\"
    echo "  --from-literal=db-host=\"postgresql-dev-rw.ptcc-development.svc.cluster.local\" \\"
    echo "  --from-literal=db-username=\"prontclinic\" \\"
    echo "  --from-literal=db-password=\"sua_senha_aqui\" \\"
    echo "  --from-literal=db-database=\"prontclinic\" \\"
    echo "  --from-literal=mail-api-key=\"md-LMqMpzh1lC0IhDXynfI4Hw\" \\"
    echo "  --from-literal=mail-host=\"smtp.hostinger.com\" \\"
    echo "  --from-literal=mail-user=\"seu_email\" \\"
    echo "  --from-literal=mail-password=\"sua_senha_email\" \\"
    echo "  --from-literal=jwt-secret=\"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqIEmlvpPy93lc5YtXBoUULYmaJqqjJZq32BVGfao\" \\"
    echo "  --from-literal=jwt-refresh-secret=\"w7mEor7MwWkXf+hDLtxy3qjLumBEABu39Fljz+TspU3PP7wMXcfHiXfmw8GebnQmZoHyvrZLMdm+QIDAQAB\" \\"
    echo "  --from-literal=aes-secret-key=\"yn7Zuj5oGz6XFVqyXxHfqQ==\" \\"
    echo "  --from-literal=aes-iv=\"zxcvbnm1240982=\" \\"
    echo "  --from-literal=asaas-api-key=\"sua_chave_asaas\" \\"
    echo "  --from-literal=cache-redis-uri=\"redis://:redis123@redis-dev-service.ptcc-development.svc.cluster.local:6379/0\" \\"
    echo "  -n ptcc-development"
    echo ""
    read -p "Pressione Enter para continuar após configurar os secrets..."
fi

# Aplicar manifestos
log "Aplicando manifestos Kubernetes..."

# ConfigMap
log "Aplicando ConfigMap..."
kubectl apply -f k8s-manifests/development/prontclinic-api/prontclinic-api-configmap.yaml
success "ConfigMap aplicado"

# Secret (se não existir)
if ! kubectl get secret prontclinic-api-secret -n ptcc-development &> /dev/null; then
    log "Aplicando Secret..."
    kubectl apply -f k8s-manifests/development/prontclinic-api/prontclinic-api-secret.yaml
    success "Secret aplicado"
else
    log "Secret já existe, pulando..."
fi

# Deployment
log "Aplicando Deployment..."
kubectl apply -f k8s-manifests/development/prontclinic-api/prontclinic-api-deployment.yaml
success "Deployment aplicado"

# Service
log "Aplicando Service..."
kubectl apply -f k8s-manifests/development/prontclinic-api/prontclinic-api-service.yaml
success "Service aplicado"

# Ingress
log "Aplicando Ingress..."
kubectl apply -f k8s-manifests/development/prontclinic-api/prontclinic-api-ingress.yaml
success "Ingress aplicado"

# Aguardar deployment ficar pronto
log "Aguardando deployment ficar pronto..."
kubectl wait --for=condition=available --timeout=300s deployment/prontclinic-api -n ptcc-development

# Verificar status
log "Verificando status do deployment..."
kubectl get pods -n ptcc-development -l app=prontclinic-api

# Verificar ingress
log "Verificando ingress..."
kubectl get ingress -n ptcc-development prontclinic-api-ingress

# Verificar certificado TLS
log "Verificando certificado TLS..."
kubectl get certificate -n ptcc-development prontclinic-api-tls

success "Deploy da ProntClinic API concluído!"

# Mostrar informações de acesso
echo ""
log "📋 Informações de Acesso:"
echo "  🌐 URL da API: https://api.prontclinic.com.br"
echo "  🔍 Health Check: https://api.prontclinic.com.br/health"
echo "  📊 Namespace: ptcc-development"
echo "  🏷️  Labels: app=prontclinic-api"

echo ""
log "📋 Comandos Úteis:"
echo "  # Ver logs:"
echo "  kubectl logs -n ptcc-development deployment/prontclinic-api"
echo ""
echo "  # Ver status:"
echo "  kubectl get pods -n ptcc-development -l app=prontclinic-api"
echo ""
echo "  # Testar API:"
echo "  curl https://api.prontclinic.com.br/health"
echo ""
echo "  # Entrar no pod:"
echo "  kubectl exec -it -n ptcc-development deployment/prontclinic-api -- /bin/bash"

echo ""
success "🎉 ProntClinic API deployada com sucesso!"

