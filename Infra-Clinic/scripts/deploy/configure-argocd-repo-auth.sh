#!/bin/bash

# 🔐 Configurar Autenticação do Repositório no ArgoCD
# Este script configura as credenciais para acessar o repositório privado

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Configurando autenticação do repositório no ArgoCD...${NC}"

# Verificar se as variáveis estão definidas
if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Variáveis de ambiente não definidas.${NC}"
    echo -e "${BLUE}💡 Para configurar as credenciais, execute:${NC}"
    echo -e "${GREEN}export GITHUB_USERNAME=seu_usuario${NC}"
    echo -e "${GREEN}export GITHUB_TOKEN=seu_token_github${NC}"
    echo -e "${GREEN}./scripts/deploy/configure-argocd-repo-auth.sh${NC}"
    echo ""
    echo -e "${BLUE}📝 Como obter um token do GitHub:${NC}"
    echo -e "${GREEN}1. Acesse: https://github.com/settings/tokens${NC}"
    echo -e "${GREEN}2. Clique em 'Generate new token'${NC}"
    echo -e "${GREEN}3. Selecione os escopos: 'repo' (acesso completo ao repositório)${NC}"
    echo -e "${GREEN}4. Copie o token gerado${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Configurando credenciais para o repositório...${NC}"

# Criar secret com as credenciais
kubectl create secret generic prontclinic-repo-secret \
  --from-literal=type=git \
  --from-literal=url=https://github.com/Prontdental-br/prontclinic.git \
  --from-literal=name=prontclinic \
  --from-literal=username="$GITHUB_USERNAME" \
  --from-literal=password="$GITHUB_TOKEN" \
  -n argocd \
  --dry-run=client -o yaml | kubectl apply -f -

# Adicionar label para o ArgoCD reconhecer
kubectl label secret prontclinic-repo-secret argocd.argoproj.io/secret-type=repository -n argocd

echo -e "${GREEN}✅ Credenciais configuradas com sucesso!${NC}"

# Aguardar um pouco para o ArgoCD processar
echo -e "${YELLOW}⏳ Aguardando o ArgoCD processar as credenciais...${NC}"
sleep 10

# Verificar se o repositório foi reconhecido
echo -e "${YELLOW}📋 Verificando repositórios configurados...${NC}"
kubectl get secrets -n argocd -l argocd.argoproj.io/secret-type=repository

echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo -e "${BLUE}💡 Agora você pode criar a aplicação prontclinic-api${NC}"
echo -e "${BLUE}💡 Execute: ./scripts/deploy/deploy-prontclinic-api-argocd.sh${NC}"

