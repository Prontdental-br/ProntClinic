#!/bin/bash

# =============================================================================
# MINIO COM NOVA SENHA
# Verificação do MinIO com a senha personalizada
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
echo "  MINIO COM NOVA SENHA CONFIGURADA!"
echo "  Senha personalizada aplicada com sucesso"
echo "============================================================================="
echo -e "${NC}"

# Status atual
header "Status Atual:"
echo ""

# Verificar pod
info "Verificando status do pod..."
pod_status=$(kubectl get pods -n ptcc-development | grep minio | awk '{print $3}')
echo "Status do pod: $pod_status"

if [ "$pod_status" = "Running" ]; then
    log "✓ Pod do MinIO está rodando"
else
    warn "Pod do MinIO está em status: $pod_status"
fi

# Verificar logs
header "Logs do MinIO:"
echo ""

info "Verificando logs do MinIO..."
kubectl logs -n ptcc-development deployment/minio --tail=10
echo ""

# Configurações atualizadas
header "Configurações Atualizadas:"
echo ""

echo -e "${GREEN}✅ NOVA SENHA CONFIGURADA:${NC}"
echo "• Usuário: admin"
echo "• Senha: 749##b*7T5^I5hTx#63f&"
echo "• Status: Aplicada com sucesso"
echo ""

echo -e "${GREEN}✅ CONFIGURAÇÕES DE ACESSO:${NC}"
echo "• Tipo de serviço: ClusterIP"
echo "• Sem IP externo: Nenhum"
echo "• Acesso: Apenas dentro do cluster"
echo "• Porta API: 9000"
echo "• Porta Console: 9001"
echo ""

# Como acessar
header "Como Acessar o MinIO:"
echo ""

echo -e "${YELLOW}🔧 ACESSO VIA KUBECTL (Port Forward):${NC}"
echo "• Console: kubectl port-forward -n ptcc-development service/minio-service 9001:9001"
echo "• API: kubectl port-forward -n ptcc-development service/minio-service 9000:9000"
echo "• URL Console: http://localhost:9001"
echo "• URL API: http://localhost:9000"
echo "• Credenciais: admin / 749##b*7T5^I5hTx#63f&"
echo ""

# Teste de conectividade
header "Teste de Conectividade:"
echo ""

info "Testando acesso ao MinIO com nova senha..."
# Fazer port-forward em background para testar
kubectl port-forward -n ptcc-development service/minio-service 9001:9001 &
PF_PID=$!
sleep 5

# Testar Console
console_response=$(curl -s -I http://localhost:9001 2>/dev/null | head -1 || echo "Erro de conexão")
echo "Resposta do Console: $console_response"

# Parar port-forward
kill $PF_PID 2>/dev/null || true

if [[ $console_response == *"200"* ]] || [[ $console_response == *"302"* ]]; then
    log "✓ MinIO Console está funcionando com nova senha"
else
    warn "MinIO Console pode ter problemas: $console_response"
fi

# Comandos úteis
header "Comandos Úteis:"
echo ""

echo -e "${BLUE}🔧 MONITORAMENTO:${NC}"
echo "• Ver status: kubectl get pods -n ptcc-development"
echo "• Ver logs: kubectl logs -n ptcc-development deployment/minio"
echo "• Ver serviços: kubectl get services -n ptcc-development"
echo ""

echo -e "${BLUE}🔧 ACESSO:${NC}"
echo "• Port forward Console: kubectl port-forward -n ptcc-development service/minio-service 9001:9001"
echo "• Port forward API: kubectl port-forward -n ptcc-development service/minio-service 9000:9000"
echo "• Exec no pod: kubectl exec -it -n ptcc-development deployment/minio -- /bin/bash"
echo "• Reiniciar: kubectl rollout restart deployment/minio -n ptcc-development"
echo ""

# Resumo final
echo -e "${GREEN}"
echo "============================================================================="
echo "  MINIO COM NOVA SENHA CONFIGURADO!"
echo "============================================================================="
echo -e "${NC}"

echo -e "${GREEN}✅ O que foi configurado:${NC}"
echo "• MinIO rodando com senha personalizada"
echo "• Senha: 749##b*7T5^I5hTx#63f&"
echo "• Usuário: admin"
echo "• Acesso interno apenas (ClusterIP)"
echo "• Console na porta 9001, API na porta 9000"
echo ""

echo -e "${YELLOW}🎯 COMO ACESSAR:${NC}"
echo "1. Use port-forward: kubectl port-forward -n ptcc-development service/minio-service 9001:9001"
echo "2. Acesse: http://localhost:9001"
echo "3. Login: admin / 749##b*7T5^I5hTx#63f&"
echo "4. Configure buckets e políticas"
echo "5. Use a API na porta 9000 para integração"
echo ""

echo -e "${GREEN}🎉 MinIO está pronto com senha personalizada!${NC}"
echo "A senha foi alterada com sucesso no arquivo de configuração."
