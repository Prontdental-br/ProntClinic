#!/bin/bash

# 🔄 Teste de Sincronização do ArgoCD
# Este script testa a sincronização da aplicação prontclinic-api

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Testando sincronização do ArgoCD...${NC}"

# 1. Verificar se a aplicação existe
echo -e "${YELLOW}📋 1. Verificando aplicações...${NC}"
kubectl get applications -n argocd

# 2. Verificar status da aplicação prontclinic-api
echo -e "${YELLOW}📋 2. Status da aplicação prontclinic-api...${NC}"
kubectl get application prontclinic-api -n argocd -o wide 2>/dev/null || echo -e "${RED}❌ Aplicação prontclinic-api não encontrada${NC}"

# 3. Verificar detalhes da aplicação
echo -e "${YELLOW}📋 3. Detalhes da aplicação...${NC}"
kubectl describe application prontclinic-api -n argocd 2>/dev/null || echo -e "${RED}❌ Aplicação não encontrada${NC}"

# 4. Verificar repositórios configurados
echo -e "${YELLOW}📋 4. Repositórios configurados...${NC}"
kubectl get secrets -n argocd -l argocd.argoproj.io/secret-type=repository

# 5. Forçar sincronização se a aplicação existir
if kubectl get application prontclinic-api -n argocd >/dev/null 2>&1; then
    echo -e "${YELLOW}📋 5. Forçando sincronização...${NC}"
    kubectl patch application prontclinic-api -n argocd --type merge -p '{"operation":{"sync":{"syncStrategy":{"hook":{"force":true}}}}}'
    
    echo -e "${YELLOW}⏳ Aguardando sincronização...${NC}"
    sleep 15
    
    # 6. Verificar status após sincronização
    echo -e "${YELLOW}📋 6. Status após sincronização...${NC}"
    kubectl get application prontclinic-api -n argocd -o wide
    
    # 7. Verificar recursos criados
    echo -e "${YELLOW}📋 7. Recursos criados no namespace ptcc-development...${NC}"
    kubectl get all -n ptcc-development -l app=prontclinic-api 2>/dev/null || echo -e "${YELLOW}⚠️  Nenhum recurso encontrado ainda${NC}"
    
    # 8. Verificar pods
    echo -e "${YELLOW}📋 8. Pods da aplicação...${NC}"
    kubectl get pods -n ptcc-development -l app=prontclinic-api 2>/dev/null || echo -e "${YELLOW}⚠️  Nenhum pod encontrado ainda${NC}"
    
    # 9. Verificar logs se houver pods
    if kubectl get pods -n ptcc-development -l app=prontclinic-api >/dev/null 2>&1; then
        echo -e "${YELLOW}📋 9. Logs da aplicação...${NC}"
        kubectl logs -n ptcc-development -l app=prontclinic-api --tail=10 2>/dev/null || echo -e "${YELLOW}⚠️  Nenhum log disponível${NC}"
    fi
else
    echo -e "${RED}❌ Aplicação prontclinic-api não encontrada${NC}"
    echo -e "${BLUE}💡 Para criar a aplicação, execute:${NC}"
    echo -e "${GREEN}kubectl apply -f k8s-manifests/development/argocd/prontclinic-api-application.yaml${NC}"
fi

# 10. Informações de acesso
echo -e "${BLUE}🔍 Informações de Acesso:${NC}"
echo -e "${GREEN}ArgoCD UI: https://argocd-d.prontclinic.com.br${NC}"
echo -e "${GREEN}Usuário: admin${NC}"
echo -e "${GREEN}Senha: $(kubectl -n argocd get secret argocd-secret -o jsonpath="{.data.admin\.password}" | base64 -d)${NC}"

echo -e "${GREEN}✅ Teste de sincronização concluído!${NC}"

