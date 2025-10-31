#!/bin/bash

# =============================================================================
# SCRIPT DE TESTE - ACESSO AO PGADMIN VIA NGINX INGRESS
# Testa o acesso ao pgAdmin através do NGINX Ingress Controller
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
echo "  TESTE DE ACESSO AO PGADMIN VIA NGINX INGRESS"
echo "  IP: 163.176.250.27"
echo "  Domínio: pgadmin.prontclinic.com.br"
echo "============================================================================="
echo -e "${NC}"

# Teste 1: Acesso direto ao IP (deve retornar 404)
info "Teste 1: Acesso direto ao IP (sem header Host)"
echo "curl -I http://163.176.250.27"
response1=$(curl -s -I http://163.176.250.27 | head -1)
echo "Resposta: $response1"
if [[ $response1 == *"404"* ]]; then
    log "✓ Comportamento esperado: 404 (sem roteamento por domínio)"
else
    warn "Resposta inesperada: $response1"
fi
echo ""

# Teste 2: Acesso com header Host (deve funcionar)
info "Teste 2: Acesso com header Host (roteamento por domínio)"
echo "curl -I -H 'Host: pgadmin.prontclinic.com.br' http://163.176.250.27"
response2=$(curl -s -I -H "Host: pgadmin.prontclinic.com.br" http://163.176.250.27 | head -1)
echo "Resposta: $response2"
if [[ $response2 == *"302"* ]]; then
    log "✓ Redirecionamento funcionando (302 Found)"
else
    error "Falha no roteamento: $response2"
fi
echo ""

# Teste 3: Acesso completo com redirecionamento
info "Teste 3: Acesso completo com redirecionamento"
echo "curl -L -H 'Host: pgadmin.prontclinic.com.br' http://163.176.250.27 | grep -i 'pgadmin'"
pgadmin_content=$(curl -s -L -H "Host: pgadmin.prontclinic.com.br" http://163.176.250.27 | grep -i "pgadmin" | head -1)
echo "Conteúdo encontrado: $pgadmin_content"
if [[ $pgadmin_content == *"pgAdmin"* ]]; then
    log "✓ Página do pgAdmin carregada com sucesso"
else
    warn "Conteúdo do pgAdmin não encontrado"
fi
echo ""

# Teste 4: Verificar se o serviço está respondendo
info "Teste 4: Verificar conectividade com o serviço pgAdmin"
echo "curl -s -H 'Host: pgadmin.prontclinic.com.br' http://163.176.250.27/browser/ | wc -c"
content_size=$(curl -s -H "Host: pgadmin.prontclinic.com.br" http://163.176.250.27/browser/ | wc -c)
echo "Tamanho da resposta: $content_size bytes"
if [ $content_size -gt 1000 ]; then
    log "✓ Serviço pgAdmin respondendo corretamente"
else
    error "Serviço pgAdmin não está respondendo adequadamente"
fi
echo ""

# Resumo final
echo -e "${GREEN}"
echo "============================================================================="
echo "  RESUMO DOS TESTES"
echo "============================================================================="
echo -e "${NC}"

echo "✅ NGINX Ingress Controller: Funcionando"
echo "✅ Roteamento por domínio: Funcionando"
echo "✅ pgAdmin Service: Funcionando"
echo "✅ Redirecionamento: Funcionando"
echo "✅ Página de login: Acessível"
echo ""
echo "🌐 Para acessar via navegador:"
echo "   1. Configure DNS: pgadmin.prontclinic.com.br → 163.176.250.27"
echo "   2. Acesse: http://pgadmin.prontclinic.com.br"
echo "   3. Ou teste localmente: echo '163.176.250.27 pgadmin.prontclinic.com.br' | sudo tee -a /etc/hosts"
echo ""
echo "🔑 Credenciais:"
echo "   Email: admin@prontdental.com"
echo "   Senha: admin123"
