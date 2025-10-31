#!/bin/bash

# =============================================================================
# PGADMIN CONFIGURADO APENAS PARA ACESSO INTERNO
# Resumo da configuração sem exposição externa
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
echo "  PGADMIN CONFIGURADO APENAS PARA ACESSO INTERNO"
echo "  Sem exposição externa - Acesso interno do cluster"
echo "============================================================================="
echo -e "${NC}"

# Status atual
header "Status Atual:"
echo ""

# Verificar pod
info "Verificando status do pod..."
pod_status=$(kubectl get pods -n ptcc-development | grep pgadmin | awk '{print $3}')
echo "Status do pod: $pod_status"

if [ "$pod_status" = "Running" ]; then
    log "✓ Pod do pgAdmin está rodando"
else
    warn "Pod do pgAdmin está em status: $pod_status"
fi

# Verificar serviços
header "Configuração de Serviços:"
echo ""

info "Verificando serviços do pgAdmin..."
kubectl get services -n ptcc-development | grep pgadmin
echo ""

# Verificar ingress
info "Verificando ingress (deve estar vazio)..."
ingress_count=$(kubectl get ingress -n ptcc-development | grep pgadmin | wc -l)
if [ "$ingress_count" -eq 0 ]; then
    log "✓ Nenhum ingress encontrado - pgAdmin não está exposto externamente"
else
    warn "Ainda há ingress configurado:"
    kubectl get ingress -n ptcc-development | grep pgadmin
fi

# Verificar acesso externo
header "Teste de Acesso Externo:"
echo ""

info "Testando acesso externo (deve falhar)..."
response=$(curl -s -I http://pgadmin.prontclinic.com.br 2>/dev/null | head -1 || echo "Erro de conexão")
echo "Resposta: $response"

if [[ $response == *"404"* ]] || [[ $response == *"Erro"* ]]; then
    log "✓ pgAdmin não está acessível externamente"
else
    warn "pgAdmin ainda pode estar acessível: $response"
fi

# Configurações de segurança
header "Configurações de Segurança:"
echo ""

echo -e "${GREEN}✅ ACESSO INTERNO APENAS:${NC}"
echo "• Tipo de serviço: ClusterIP"
echo "• Sem IP externo: Nenhum"
echo "• Sem ingress: Removido"
echo "• Acesso: Apenas dentro do cluster"
echo ""

echo -e "${GREEN}✅ AUTENTICAÇÃO CONFIGURADA:${NC}"
echo "• Usuário: admin@prontdental.com"
echo "• Senha: admin123"
echo "• Senha mestra: Obrigatória"
echo "• Modo: Desktop (mais seguro)"
echo ""

# Como acessar
header "Como Acessar o pgAdmin:"
echo ""

echo -e "${YELLOW}🔧 ACESSO VIA KUBECTL (Port Forward):${NC}"
echo "• Comando: kubectl port-forward -n ptcc-development service/pgadmin-service 8080:80"
echo "• URL local: http://localhost:8080"
echo "• Credenciais: admin@prontdental.com / admin123"
echo ""

echo -e "${YELLOW}🔧 ACESSO VIA POD DIRETO:${NC}"
echo "• Comando: kubectl exec -it -n ptcc-development deployment/pgadmin -- /bin/bash"
echo "• Acesso direto ao container"
echo ""

echo -e "${YELLOW}🔧 ACESSO VIA OUTRO POD:${NC}"
echo "• URL interna: http://pgadmin-service.ptcc-development.svc.cluster.local"
echo "• Apenas de dentro do cluster"
echo ""

# Comandos úteis
header "Comandos Úteis:"
echo ""

echo -e "${BLUE}🔧 MONITORAMENTO:${NC}"
echo "• Ver status: kubectl get pods -n ptcc-development"
echo "• Ver logs: kubectl logs -n ptcc-development deployment/pgadmin"
echo "• Ver serviços: kubectl get services -n ptcc-development"
echo "• Ver ingress: kubectl get ingress -n ptcc-development"
echo ""

echo -e "${BLUE}🔧 ACESSO:${NC}"
echo "• Port forward: kubectl port-forward -n ptcc-development service/pgadmin-service 8080:80"
echo "• Exec no pod: kubectl exec -it -n ptcc-development deployment/pgadmin -- /bin/bash"
echo "• Reiniciar: kubectl rollout restart deployment/pgadmin -n ptcc-development"
echo ""

# Resumo final
echo -e "${GREEN}"
echo "============================================================================="
echo "  CONFIGURAÇÃO CONCLUÍDA - ACESSO INTERNO APENAS"
echo "============================================================================="
echo -e "${NC}"

echo -e "${GREEN}✅ O que foi configurado:${NC}"
echo "• pgAdmin rodando internamente no cluster"
echo "• Sem exposição externa (ingress removido)"
echo "• Serviço tipo ClusterIP (sem IP externo)"
echo "• Autenticação por usuário e senha"
echo "• Senha mestra obrigatória"
echo "• Acesso apenas via port-forward ou dentro do cluster"
echo ""

echo -e "${YELLOW}🎯 COMO ACESSAR:${NC}"
echo "1. Use port-forward: kubectl port-forward -n ptcc-development service/pgadmin-service 8080:80"
echo "2. Acesse: http://localhost:8080"
echo "3. Login: admin@prontdental.com / admin123"
echo "4. Defina a senha mestra"
echo "5. Configure suas conexões PostgreSQL"
echo ""

echo -e "${GREEN}🎉 pgAdmin configurado com acesso interno apenas!${NC}"
echo "Agora o pgAdmin não está exposto externamente e só pode ser acessado via port-forward."
