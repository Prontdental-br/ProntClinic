#!/bin/bash

# =============================================================================
# SCRIPT DE LISTAGEM DE SERVIÇOS KUBERNETES
# Lista todos os serviços do cluster com informações detalhadas
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

header() {
    echo -e "${PURPLE}[📋] $1${NC}"
}

# Banner
echo -e "${CYAN}"
echo "============================================================================="
echo "  LISTAGEM DE SERVIÇOS KUBERNETES - CLUSTER PRONTDENTAL"
echo "============================================================================="
echo -e "${NC}"

# Listar todos os serviços
header "📊 TODOS OS SERVIÇOS DO CLUSTER:"
echo ""
kubectl get services --all-namespaces -o wide
echo ""

# Serviços por namespace
header "📁 SERVIÇOS POR NAMESPACE:"
echo ""

# Namespace: default
echo -e "${YELLOW}=== NAMESPACE: default ===${NC}"
kubectl get services -n default -o wide
echo ""

# Namespace: kube-system
echo -e "${YELLOW}=== NAMESPACE: kube-system ===${NC}"
kubectl get services -n kube-system -o wide
echo ""

# Namespace: ingress-nginx
echo -e "${YELLOW}=== NAMESPACE: ingress-nginx ===${NC}"
kubectl get services -n ingress-nginx -o wide
echo ""

# Namespace: ptcc-development
echo -e "${YELLOW}=== NAMESPACE: ptcc-development ===${NC}"
kubectl get services -n ptcc-development -o wide
echo ""

# Análise dos tipos de serviço
header "📈 ANÁLISE DOS TIPOS DE SERVIÇO:"
echo ""

# Contar tipos de serviço
CLUSTERIP_COUNT=$(kubectl get services --all-namespaces --field-selector spec.type=ClusterIP --no-headers | wc -l)
LOADBALANCER_COUNT=$(kubectl get services --all-namespaces --field-selector spec.type=LoadBalancer --no-headers | wc -l)

echo "• ClusterIP: $CLUSTERIP_COUNT serviços"
echo "• LoadBalancer: $LOADBALANCER_COUNT serviços"
echo ""

# Serviços com IPs externos
header "🌐 SERVIÇOS COM IPs EXTERNOS:"
echo ""
kubectl get services --all-namespaces --field-selector spec.type=LoadBalancer -o custom-columns="NAMESPACE:.metadata.namespace,NAME:.metadata.name,EXTERNAL-IP:.status.loadBalancer.ingress[0].ip,PORTS:.spec.ports[*].port"
echo ""

# Serviços por porta
header "🔌 SERVIÇOS POR PORTA:"
echo ""

# Porta 80
echo -e "${YELLOW}Porta 80 (HTTP):${NC}"
kubectl get services --all-namespaces -o wide | grep ":80" || echo "Nenhum serviço na porta 80"
echo ""

# Porta 443
echo -e "${YELLOW}Porta 443 (HTTPS):${NC}"
kubectl get services --all-namespaces -o wide | grep ":443" || echo "Nenhum serviço na porta 443"
echo ""

# Porta 53
echo -e "${YELLOW}Porta 53 (DNS):${NC}"
kubectl get services --all-namespaces -o wide | grep ":53" || echo "Nenhum serviço na porta 53"
echo ""

# Resumo dos serviços importantes
header "🎯 SERVIÇOS IMPORTANTES:"
echo ""

echo -e "${GREEN}✅ NGINX Ingress Controller:${NC}"
NGINX_IP=$(kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "N/A")
echo "  • Namespace: ingress-nginx"
echo "  • IP Externo: $NGINX_IP"
echo "  • Portas: 80, 443"
echo "  • Função: Roteamento de tráfego externo"
echo ""

echo -e "${GREEN}✅ pgAdmin:${NC}"
echo "  • Namespace: ptcc-development"
echo "  • Tipo: ClusterIP (acessível via Ingress)"
echo "  • Porta: 80"
echo "  • Função: Interface web para PostgreSQL"
echo ""

echo -e "${GREEN}✅ Kubernetes DNS:${NC}"
echo "  • Namespace: kube-system"
echo "  • Tipo: ClusterIP"
echo "  • Portas: 53 (UDP/TCP)"
echo "  • Função: Resolução DNS interna do cluster"
echo ""

echo -e "${GREEN}✅ Kubernetes Dashboard:${NC}"
echo "  • Namespace: kube-system"
echo "  • Tipo: ClusterIP"
echo "  • Porta: 443"
echo "  • Função: Interface web do Kubernetes"
echo ""

# Comandos úteis
header "🔧 COMANDOS ÚTEIS:"
echo ""
echo "• Ver todos os serviços: kubectl get services --all-namespaces"
echo "• Ver serviços de um namespace: kubectl get services -n <namespace>"
echo "• Descrever um serviço: kubectl describe service <nome> -n <namespace>"
echo "• Ver endpoints: kubectl get endpoints --all-namespaces"
echo "• Ver ingress: kubectl get ingress --all-namespaces"
echo ""

# Status de conectividade
header "🌐 STATUS DE CONECTIVIDADE:"
echo ""

# Testar NGINX Ingress
if [ -n "$NGINX_IP" ] && [ "$NGINX_IP" != "N/A" ]; then
    echo "Testando conectividade com NGINX Ingress ($NGINX_IP)..."
    response=$(curl -s -I -H "Host: pgadmin.prontclinic.com.br" http://$NGINX_IP | head -1)
    if [[ $response == *"302"* ]]; then
        log "✓ NGINX Ingress funcionando"
    else
        warn "NGINX Ingress pode ter problemas: $response"
    fi
else
    warn "NGINX Ingress não tem IP externo"
fi

echo ""
echo -e "${GREEN}🎉 Listagem de serviços concluída!${NC}"
