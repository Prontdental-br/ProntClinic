#!/bin/bash

# 🔐 Configurar Token do GitHub para ArgoCD
# Este script ajuda a configurar um token de acesso do GitHub no ArgoCD

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Configurando Token do GitHub para ArgoCD...${NC}"

echo -e "${YELLOW}📋 PASSO 1: Gerar Token do GitHub${NC}"
echo -e "${BLUE}1. Acesse: https://github.com/settings/tokens${NC}"
echo -e "${BLUE}2. Clique em 'Generate new token' > 'Generate new token (classic)'${NC}"
echo -e "${BLUE}3. Preencha os campos:${NC}"
echo -e "${GREEN}   - Note: ArgoCD-ProntClinic${NC}"
echo -e "${GREEN}   - Expiration: 90 days (ou conforme sua política)${NC}"
echo -e "${BLUE}4. Selecione os escopos necessários:${NC}"
echo -e "${GREEN}   ✅ repo (Full control of private repositories)${NC}"
echo -e "${GREEN}   ✅ read:org (Read org and team membership)${NC}"
echo -e "${BLUE}5. Clique em 'Generate token'${NC}"
echo -e "${BLUE}6. COPIE o token gerado (você só verá uma vez!)${NC}"

echo ""
echo -e "${YELLOW}📋 PASSO 2: Configurar no ArgoCD${NC}"

# Verificar se as variáveis estão definidas
if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Configure as variáveis de ambiente:${NC}"
    echo -e "${GREEN}export GITHUB_USERNAME=seu_usuario_github${NC}"
    echo -e "${GREEN}export GITHUB_TOKEN=seu_token_gerado${NC}"
    echo ""
    echo -e "${BLUE}💡 Exemplo:${NC}"
    echo -e "${GREEN}export GITHUB_USERNAME=herminio${NC}"
    echo -e "${GREEN}export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx${NC}"
    echo ""
    echo -e "${YELLOW}Depois execute novamente este script.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Usuário: $GITHUB_USERNAME${NC}"
echo -e "${GREEN}✅ Token configurado (${#GITHUB_TOKEN} caracteres)${NC}"

# Verificar se o token é válido (formato básico)
if [[ ! "$GITHUB_TOKEN" =~ ^ghp_ ]]; then
    echo -e "${RED}❌ Token inválido. Deve começar com 'ghp_'${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 PASSO 3: Criar Secret no Kubernetes${NC}"

# Remover secret existente se houver
kubectl delete secret prontclinic-repo-secret -n argocd 2>/dev/null || true

# Criar novo secret
kubectl create secret generic prontclinic-repo-secret \
  --from-literal=type=git \
  --from-literal=url=https://github.com/Prontdental-br/prontclinic.git \
  --from-literal=name=prontclinic \
  --from-literal=username="$GITHUB_USERNAME" \
  --from-literal=password="$GITHUB_TOKEN" \
  -n argocd

# Adicionar label para o ArgoCD reconhecer
kubectl label secret prontclinic-repo-secret argocd.argoproj.io/secret-type=repository -n argocd

echo -e "${GREEN}✅ Secret criado com sucesso!${NC}"

echo -e "${YELLOW}📋 PASSO 4: Verificar Configuração${NC}"

# Aguardar processamento
echo -e "${YELLOW}⏳ Aguardando o ArgoCD processar as credenciais...${NC}"
sleep 15

# Verificar secret
echo -e "${YELLOW}📋 Secret criado:${NC}"
kubectl get secret prontclinic-repo-secret -n argocd

# Verificar se o ArgoCD reconheceu
echo -e "${YELLOW}📋 Repositórios configurados no ArgoCD:${NC}"
kubectl get secrets -n argocd -l argocd.argoproj.io/secret-type=repository

echo -e "${GREEN}✅ Configuração concluída!${NC}"

echo -e "${YELLOW}📋 PASSO 5: Testar Aplicação${NC}"

# Verificar se a aplicação existe
if kubectl get application prontclinic-api -n argocd >/dev/null 2>&1; then
    echo -e "${YELLOW}📋 Aplicação existente encontrada. Verificando status...${NC}"
    kubectl get application prontclinic-api -n argocd
    
    # Aguardar sincronização
    echo -e "${YELLOW}⏳ Aguardando sincronização...${NC}"
    sleep 30
    
    # Verificar status final
    echo -e "${YELLOW}📋 Status após configuração:${NC}"
    kubectl get application prontclinic-api -n argocd
    
    # Verificar se há recursos criados
    echo -e "${YELLOW}📋 Recursos criados:${NC}"
    kubectl get all -n ptcc-development -l app=prontclinic-api 2>/dev/null || echo -e "${YELLOW}⚠️  Nenhum recurso encontrado ainda${NC}"
else
    echo -e "${YELLOW}📋 Criando aplicação...${NC}"
    kubectl apply -f k8s-manifests/development/argocd/prontclinic-api-application.yaml
    
    echo -e "${YELLOW}⏳ Aguardando criação da aplicação...${NC}"
    sleep 15
    
    kubectl get application prontclinic-api -n argocd
fi

echo -e "${GREEN}✅ Configuração do token GitHub concluída!${NC}"

echo -e "${BLUE}🔍 Informações de Acesso:${NC}"
echo -e "${GREEN}ArgoCD UI: https://argocd-d.prontclinic.com.br${NC}"
echo -e "${GREEN}Usuário: admin${NC}"
echo -e "${GREEN}Senha: $(kubectl -n argocd get secret argocd-secret -o jsonpath="{.data.admin\.password}" | base64 -d)${NC}"

echo -e "${BLUE}💡 Comandos úteis:${NC}"
echo -e "${GREEN}# Ver status da aplicação:${NC}"
echo -e "${GREEN}kubectl get applications -n argocd${NC}"
echo -e "${GREEN}# Forçar sincronização:${NC}"
echo -e "${GREEN}kubectl patch application prontclinic-api -n argocd --type merge -p '{\"operation\":{\"sync\":{\"syncStrategy\":{\"hook\":{\"force\":true}}}}}'${NC}"
echo -e "${GREEN}# Ver logs:${NC}"
echo -e "${GREEN}kubectl logs -n argocd deployment/argocd-server${NC}"

