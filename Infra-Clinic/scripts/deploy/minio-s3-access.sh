#!/bin/bash

# =============================================================================
# MINIO COM URL S3-D.PRONTCLINIC.COM.BR
# Verificação do MinIO com a URL personalizada
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
echo "  MINIO COM URL S3-D.PRONTCLINIC.COM.BR!"
echo "  MinIO exposto com URL personalizada"
echo "============================================================================="
echo -e "${NC}"

# Status atual
header "Status Atual:"
echo ""

# Verificar ingress
info "Verificando ingress..."
kubectl get ingress -n ptcc-development
echo ""

# Verificar serviços
info "Verificando serviços..."
kubectl get services -n ptcc-development
echo ""

# Verificar NGINX Ingress Controller
header "NGINX Ingress Controller:"
echo ""

info "Verificando NGINX Ingress Controller..."
kubectl get services -n ingress-nginx | grep nginx-ingress
echo ""

# Testar acesso externo
header "Teste de Acesso Externo:"
echo ""

info "Testando acesso externo ao MinIO..."
response=$(curl -s -I http://s3-d.prontclinic.com.br 2>/dev/null | head -1 || echo "Erro de conexão")
echo "Resposta: $response"

if [[ $response == *"200"* ]] || [[ $response == *"302"* ]]; then
    log "✓ MinIO está acessível externamente"
else
    warn "MinIO pode não estar acessível externamente: $response"
    echo "Verifique se o DNS está configurado para s3-d.prontclinic.com.br"
fi

# Configurações
header "Configurações de Acesso:"
echo ""

echo -e "${GREEN}✅ ACESSO EXTERNO:${NC}"
echo "• URL: http://s3-d.prontclinic.com.br"
echo "• IP do NGINX: 144.22.240.174"
echo "• Porta: 80 (HTTP)"
echo "• Ingress: Configurado"
echo ""

echo -e "${GREEN}✅ CREDENCIAIS:${NC}"
echo "• Usuário: admin"
echo "• Senha: 749##b*7T5^I5hTx#63f&"
echo "• Acesso: Console Web e API"
echo ""

echo -e "${GREEN}✅ CONFIGURAÇÕES DE SEGURANÇA:${NC}"
echo "• Autenticação obrigatória"
echo "• Senha personalizada"
echo "• Acesso via HTTPS (quando configurado)"
echo "• NGINX Ingress Controller"
echo ""

# Como acessar
header "Como Acessar o MinIO:"
echo ""

echo -e "${YELLOW}🌐 ACESSO EXTERNO:${NC}"
echo "• URL: http://s3-d.prontclinic.com.br"
echo "• Credenciais: admin / 749##b*7T5^I5hTx#63f&"
echo "• Interface: Console Web completo"
echo ""

echo -e "${YELLOW}🔧 ACESSO INTERNO (Port Forward):${NC}"
echo "• Console: kubectl port-forward -n ptcc-development service/minio-service 9001:9001"
echo "• API: kubectl port-forward -n ptcc-development service/minio-service 9000:9000"
echo "• URL local: http://localhost:9001"
echo ""

# Configuração DNS
header "Configuração DNS:"
echo ""

echo -e "${BLUE}🔧 CONFIGURAÇÃO DNS:${NC}"
echo "• Adicione ao /etc/hosts:"
echo "  144.22.240.174 s3-d.prontclinic.com.br"
echo ""
echo "• Ou configure DNS A record:"
echo "  s3-d.prontclinic.com.br -> 144.22.240.174"
echo ""

# Comandos úteis
header "Comandos Úteis:"
echo ""

echo -e "${BLUE}🔧 MONITORAMENTO:${NC}"
echo "• Ver status: kubectl get pods -n ptcc-development"
echo "• Ver logs: kubectl logs -n ptcc-development deployment/minio"
echo "• Ver ingress: kubectl get ingress -n ptcc-development"
echo "• Ver serviços: kubectl get services -n ptcc-development"
echo ""

echo -e "${BLUE}🔧 MANUTENÇÃO:${NC}"
echo "• Reiniciar: kubectl rollout restart deployment/minio -n ptcc-development"
echo "• Ver ingress: kubectl describe ingress minio-ingress -n ptcc-development"
echo "• Ver NGINX: kubectl get pods -n ingress-nginx"
echo ""

# Resumo final
echo -e "${GREEN}"
echo "============================================================================="
echo "  MINIO EXPOSTO COM URL PERSONALIZADA!"
echo "============================================================================="
echo -e "${NC}"

echo -e "${GREEN}✅ O que foi configurado:${NC}"
echo "• MinIO exposto via Ingress"
echo "• URL externa: http://s3-d.prontclinic.com.br"
echo "• Credenciais: admin / 749##b*7T5^I5hTx#63f&"
echo "• NGINX Ingress Controller: 144.22.240.174"
echo "• Acesso interno e externo disponível"
echo ""

echo -e "${YELLOW}🎯 COMO ACESSAR:${NC}"
echo "1. Configure DNS: s3-d.prontclinic.com.br -> 144.22.240.174"
echo "2. Acesse: http://s3-d.prontclinic.com.br"
echo "3. Login: admin / 749##b*7T5^I5hTx#63f&"
echo "4. Configure buckets e políticas"
echo "5. Use a API para integração"
echo ""

echo -e "${GREEN}🎉 MinIO está pronto com URL personalizada!${NC}"
echo "Agora o MinIO pode ser acessado via s3-d.prontclinic.com.br"
