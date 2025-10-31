#!/bin/bash

# 🏥 Deploy ProntClinic API no ArgoCD
# Este script configura o ArgoCD para gerenciar a aplicação ProntClinic API

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configurando ProntClinic API no ArgoCD...${NC}"

# Verificar se o ArgoCD está rodando
echo -e "${YELLOW}📋 Verificando se o ArgoCD está rodando...${NC}"
if ! kubectl get pods -n argocd | grep -q "argocd-server.*Running"; then
    echo -e "${RED}❌ ArgoCD não está rodando. Execute primeiro: ./scripts/deploy/deploy-argocd.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ArgoCD está rodando${NC}"

# Aplicar a Application do ArgoCD
echo -e "${YELLOW}📦 Aplicando Application do ProntClinic API...${NC}"
kubectl apply -f k8s-manifests/development/argocd/prontclinic-api-application.yaml

# Aguardar a aplicação ser criada
echo -e "${YELLOW}⏳ Aguardando a aplicação ser criada...${NC}"
sleep 10

# Verificar status da aplicação
echo -e "${YELLOW}📊 Verificando status da aplicação...${NC}"
kubectl get applications -n argocd prontclinic-api

# Obter informações de acesso
echo -e "${BLUE}🔍 Informações de Acesso:${NC}"
echo -e "${GREEN}ArgoCD UI: https://argocd.prontclinic.com.br${NC}"
echo -e "${GREEN}Usuário: admin${NC}"
echo -e "${GREEN}Senha: $(kubectl -n argocd get secret argocd-secret -o jsonpath="{.data.admin\.password}" | base64 -d)${NC}"

# Verificar se a aplicação está sincronizada
echo -e "${YELLOW}🔄 Verificando sincronização...${NC}"
sleep 30

# Status da aplicação
echo -e "${BLUE}📈 Status da Aplicação:${NC}"
kubectl describe application prontclinic-api -n argocd

# Verificar pods da aplicação
echo -e "${BLUE}🐳 Pods da ProntClinic API:${NC}"
kubectl get pods -n ptcc-development -l app=prontclinic-api

echo -e "${GREEN}✅ ProntClinic API configurada no ArgoCD com sucesso!${NC}"
echo -e "${BLUE}💡 Para monitorar a aplicação, acesse: https://argocd.prontclinic.com.br${NC}"
echo -e "${BLUE}💡 Para ver logs: kubectl logs -n ptcc-development deployment/prontclinic-api${NC}"
echo -e "${BLUE}💡 Repositório: https://github.com/Prontdental-br/prontclinic.git${NC}"
