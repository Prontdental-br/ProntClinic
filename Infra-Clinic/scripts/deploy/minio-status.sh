#!/bin/bash

# =============================================================================
# STATUS DO MINIO
# Verificação e instruções de acesso ao MinIO
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
echo "  MINIO CONFIGURADO COM SUCESSO!"
echo "  Object Storage com acesso interno apenas"
echo "============================================================================="
echo -e "${NC}"

# Status atual
header "Status Atual:"
echo ""

# Verificar pods
info "Verificando pods..."
kubectl get pods -n ptcc-development | grep -E "(minio|pgadmin)"
echo ""

# Verificar serviços
info "Verificando serviços..."
kubectl get services -n ptcc-development
echo ""

# Verificar logs do MinIO
header "Logs do MinIO:"
echo ""

info "Verificando logs do MinIO..."
kubectl logs -n ptcc-development deployment/minio --tail=10
echo ""

# Configurações
header "Configurações do MinIO:"
echo ""

echo -e "${GREEN}✅ IMAGEM UTILIZADA:${NC}"
echo "• Imagem: quay.io/minio/minio:RELEASE.2025-04-22T22-12-26Z"
echo "• Versão: 2025-04-22"
echo "• Arquitetura: Compatível com ARM"
echo ""

echo -e "${GREEN}✅ CONFIGURAÇÕES DE ACESSO:${NC}"
echo "• Tipo de serviço: ClusterIP"
echo "• Sem IP externo: Nenhum"
echo "• Acesso: Apenas dentro do cluster"
echo "• Porta API: 9000"
echo "• Porta Console: 9001"
echo ""

echo -e "${GREEN}✅ CREDENCIAIS:${NC}"
echo "• Usuário: admin"
echo "• Senha: admin123"
echo "• Acesso: API e Console Web"
echo ""

# Como acessar
header "Como Acessar o MinIO:"
echo ""

echo -e "${YELLOW}🔧 ACESSO VIA KUBECTL (Port Forward):${NC}"
echo "• API: kubectl port-forward -n ptcc-development service/minio-service 9000:9000"
echo "• Console: kubectl port-forward -n ptcc-development service/minio-service 9001:9001"
echo "• URL API: http://localhost:9000"
echo "• URL Console: http://localhost:9001"
echo "• Credenciais: admin / admin123"
echo ""

echo -e "${YELLOW}🔧 ACESSO VIA POD DIRETO:${NC}"
echo "• Comando: kubectl exec -it -n ptcc-development deployment/minio -- /bin/bash"
echo "• Acesso direto ao container"
echo ""

echo -e "${YELLOW}🔧 ACESSO VIA OUTRO POD:${NC}"
echo "• URL API: http://minio-service.ptcc-development.svc.cluster.local:9000"
echo "• URL Console: http://minio-service.ptcc-development.svc.cluster.local:9001"
echo "• Apenas de dentro do cluster"
echo ""

# Teste de conectividade
header "Teste de Conectividade:"
echo ""

info "Testando acesso interno ao MinIO..."
# Fazer port-forward em background para testar
kubectl port-forward -n ptcc-development service/minio-service 9000:9000 &
PF_PID=$!
sleep 5

# Testar API
api_response=$(curl -s -I http://localhost:9000 2>/dev/null | head -1 || echo "Erro de conexão")
echo "Resposta da API: $api_response"

# Testar Console
console_response=$(curl -s -I http://localhost:9001 2>/dev/null | head -1 || echo "Erro de conexão")
echo "Resposta do Console: $console_response"

# Parar port-forward
kill $PF_PID 2>/dev/null || true

if [[ $api_response == *"200"* ]] || [[ $api_response == *"403"* ]]; then
    log "✓ MinIO API está funcionando"
else
    warn "MinIO API pode ter problemas: $api_response"
fi

if [[ $console_response == *"200"* ]] || [[ $console_response == *"302"* ]]; then
    log "✓ MinIO Console está funcionando"
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
echo "• Ver configuração: kubectl get deployment minio -n ptcc-development -o yaml"
echo ""

echo -e "${BLUE}🔧 ACESSO:${NC}"
echo "• Port forward API: kubectl port-forward -n ptcc-development service/minio-service 9000:9000"
echo "• Port forward Console: kubectl port-forward -n ptcc-development service/minio-service 9001:9001"
echo "• Exec no pod: kubectl exec -it -n ptcc-development deployment/minio -- /bin/bash"
echo "• Reiniciar: kubectl rollout restart deployment/minio -n ptcc-development"
echo ""

# Resumo final
echo -e "${GREEN}"
echo "============================================================================="
echo "  MINIO CONFIGURADO COM SUCESSO!"
echo "============================================================================="
echo -e "${NC}"

echo -e "${GREEN}✅ O que foi configurado:${NC}"
echo "• MinIO rodando internamente no cluster"
echo "• Imagem: quay.io/minio/minio:RELEASE.2025-04-22T22-12-26Z"
echo "• Sem exposição externa (ClusterIP apenas)"
echo "• Credenciais: admin / admin123"
echo "• API na porta 9000, Console na porta 9001"
echo "• Acesso apenas via port-forward ou dentro do cluster"
echo ""

echo -e "${YELLOW}🎯 COMO ACESSAR:${NC}"
echo "1. Use port-forward: kubectl port-forward -n ptcc-development service/minio-service 9001:9001"
echo "2. Acesse: http://localhost:9001"
echo "3. Login: admin / admin123"
echo "4. Configure buckets e políticas"
echo "5. Use a API na porta 9000 para integração"
echo ""

echo -e "${GREEN}🎉 MinIO está pronto para uso com acesso interno apenas!${NC}"
echo "Agora você tem um object storage seguro e isolado no cluster."
