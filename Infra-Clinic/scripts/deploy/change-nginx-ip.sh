#!/bin/bash

# =============================================================================
# SCRIPT PARA ALTERAR IP DO NGINX INGRESS CONTROLLER
# Altera de 163.176.250.27 para 144.22.240.174
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[✓] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[⚠] $1${NC}"
}

error() {
    echo -e "${RED}[✗] $1${NC}"
}

info() {
    echo -e "${BLUE}[ℹ] $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "============================================================================="
echo "  ALTERAÇÃO DE IP DO NGINX INGRESS CONTROLLER"
echo "  De: 163.176.250.27"
echo "  Para: 144.22.240.174"
echo "============================================================================="
echo -e "${NC}"

# Verificar IP atual
info "Verificando IP atual do NGINX Ingress Controller..."
CURRENT_IP=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
echo "IP atual: $CURRENT_IP"

if [ "$CURRENT_IP" = "144.22.240.174" ]; then
    log "✓ NGINX já está usando o IP desejado: 144.22.240.174"
    exit 0
fi

# Verificar se o IP reservado existe
info "Verificando se o IP reservado existe..."
RESERVED_IP=$(cd terraform && terraform output -raw nginx_ingress_reserved_ip 2>/dev/null || echo "")

if [ "$RESERVED_IP" != "144.22.240.174" ]; then
    warn "IP reservado via Terraform: $RESERVED_IP"
    warn "IP desejado: 144.22.240.174"
    echo ""
    echo "Continuando mesmo assim..."
fi

# Método 1: Recriar o NGINX Ingress Controller via Helm
info "Método 1: Recriar NGINX Ingress Controller via Helm com IP específico..."

# Fazer backup da configuração atual
info "Fazendo backup da configuração atual..."
helm get values nginx-ingress -n ingress-nginx > /tmp/nginx-ingress-values-backup.yaml 2>/dev/null || echo "Não foi possível fazer backup dos valores do Helm"

# Desinstalar o NGINX atual
info "Desinstalando NGINX Ingress Controller atual..."
helm uninstall nginx-ingress -n ingress-nginx

# Aguardar remoção completa
info "Aguardando remoção completa..."
sleep 10

# Reinstalar com configuração para usar IP específico
info "Reinstalando NGINX Ingress Controller com IP específico..."

# Criar arquivo de valores personalizado
cat > /tmp/nginx-ingress-values.yaml << EOF
controller:
  service:
    type: LoadBalancer
    loadBalancerIP: "144.22.240.174"
    annotations:
      service.beta.kubernetes.io/oci-load-balancer-shape: "flexible"
      service.beta.kubernetes.io/oci-load-balancer-shape-flex-min: "10"
      service.beta.kubernetes.io/oci-load-balancer-shape-flex-max: "100"
EOF

# Instalar com valores personalizados
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --values /tmp/nginx-ingress-values.yaml

# Aguardar o LoadBalancer obter IP
info "Aguardando LoadBalancer obter o novo IP..."
sleep 30

# Verificar novo IP
info "Verificando novo IP..."
NEW_IP=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -n "$NEW_IP" ]; then
    log "✓ Novo IP obtido: $NEW_IP"
    
    if [ "$NEW_IP" = "144.22.240.174" ]; then
        log "✓ IP alterado com sucesso para: $NEW_IP"
    else
        warn "IP obtido ($NEW_IP) não é o desejado (144.22.240.174)"
        warn "Isso pode ser normal - o OCI pode ter atribuído um IP diferente"
    fi
else
    warn "Não foi possível obter o novo IP"
fi

# Testar conectividade
info "Testando conectividade com o novo IP..."
if [ -n "$NEW_IP" ]; then
    response=$(curl -s -I -H "Host: pgadmin.prontclinic.com.br" http://$NEW_IP | head -1)
    echo "Resposta: $response"
    
    if [[ $response == *"302"* ]]; then
        log "✓ Conectividade funcionando com o novo IP"
    else
        warn "Falha na conectividade: $response"
    fi
fi

# Mostrar status final
echo ""
echo -e "${GREEN}"
echo "============================================================================="
echo "  ALTERAÇÃO CONCLUÍDA"
echo "============================================================================="
echo -e "${NC}"

echo "✅ IP anterior: $CURRENT_IP"
echo "✅ IP atual: $NEW_IP"
echo "✅ Status: $(if [ "$NEW_IP" = "144.22.240.174" ]; then echo "Alteração bem-sucedida"; else echo "IP diferente obtido"; fi)"
echo ""

echo -e "${YELLOW}🌐 URLs para acessar:${NC}"
if [ -n "$NEW_IP" ]; then
    echo "• http://pgadmin.prontclinic.com.br"
    echo "• http://$NEW_IP (com header Host correto)"
fi

echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo "• kubectl get services -n ingress-nginx"
echo "• kubectl get ingress -n ptcc-development"
echo "• curl -I -H 'Host: pgadmin.prontclinic.com.br' http://$NEW_IP"
