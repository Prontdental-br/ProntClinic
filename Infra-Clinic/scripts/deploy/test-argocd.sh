#!/bin/bash

# 🧪 Script de Teste do ArgoCD
# Este script testa todas as funcionalidades do ArgoCD

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testando ArgoCD...${NC}"

# 1. Verificar se o ArgoCD está rodando
echo -e "${YELLOW}📋 1. Verificando pods do ArgoCD...${NC}"
kubectl get pods -n argocd

echo -e "${YELLOW}📋 2. Verificando services do ArgoCD...${NC}"
kubectl get svc -n argocd

echo -e "${YELLOW}📋 3. Verificando ingress do ArgoCD...${NC}"
kubectl get ingress -n argocd

# 2. Verificar aplicações
echo -e "${YELLOW}📋 4. Verificando aplicações...${NC}"
kubectl get applications -n argocd

# 3. Verificar status da aplicação prontclinic-api
echo -e "${YELLOW}📋 5. Status da aplicação prontclinic-api...${NC}"
kubectl describe application prontclinic-api -n argocd

# 4. Verificar se o namespace foi criado
echo -e "${YELLOW}📋 6. Verificando namespace ptcc-development...${NC}"
kubectl get namespace ptcc-development 2>/dev/null || echo -e "${RED}❌ Namespace ptcc-development não encontrado${NC}"

# 5. Verificar pods da aplicação (se existir)
echo -e "${YELLOW}📋 7. Verificando pods da aplicação...${NC}"
kubectl get pods -n ptcc-development -l app=prontclinic-api 2>/dev/null || echo -e "${YELLOW}⚠️  Nenhum pod encontrado ainda${NC}"

# 6. Informações de acesso
echo -e "${BLUE}🔍 Informações de Acesso:${NC}"
echo -e "${GREEN}ArgoCD UI: https://argocd-d.prontclinic.com.br${NC}"
echo -e "${GREEN}Usuário: admin${NC}"
echo -e "${GREEN}Senha: $(kubectl -n argocd get secret argocd-secret -o jsonpath="{.data.admin\.password}" | base64 -d)${NC}"

# 7. Teste de conectividade (se possível)
echo -e "${YELLOW}📋 8. Testando conectividade...${NC}"
if curl -s -k https://argocd-d.prontclinic.com.br/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ArgoCD UI está acessível${NC}"
else
    echo -e "${YELLOW}⚠️  ArgoCD UI pode não estar acessível externamente${NC}"
    echo -e "${BLUE}💡 Use port-forward: kubectl port-forward -n argocd svc/argocd-server 8080:80${NC}"
fi

# 8. Comandos úteis
echo -e "${BLUE}📚 Comandos Úteis:${NC}"
echo -e "${GREEN}# Port forward para acesso local:${NC}"
echo -e "${GREEN}kubectl port-forward -n argocd svc/argocd-server 8080:80${NC}"
echo -e "${GREEN}# Sincronizar aplicação manualmente:${NC}"
echo -e "${GREEN}kubectl patch application prontclinic-api -n argocd --type merge -p '{\"operation\":{\"sync\":{\"syncStrategy\":{\"hook\":{\"force\":true}}}}}'${NC}"
echo -e "${GREEN}# Ver logs do ArgoCD:${NC}"
echo -e "${GREEN}kubectl logs -n argocd deployment/argocd-server${NC}"

echo -e "${GREEN}✅ Teste do ArgoCD concluído!${NC}"

