#!/bin/bash

# =============================================================================
# CONFIGURAR REPOSITÓRIO GIT NO ARGOCD - ProntClinic
# =============================================================================

set -e

echo "🔧 Configurando repositório Git no ArgoCD..."
echo "============================"

# Verificar se kubectl está configurado
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Erro: kubectl não está configurado ou cluster não está acessível"
    exit 1
fi

REPO_URL="https://github.com/Prontdental-br/Infra-Clinic.git"
REPO_NAME="prontclinic-infra"

echo "📦 Repositório: $REPO_URL"
echo ""

# Verificar se o repositório já está configurado
if kubectl get secret -n argocd | grep -q "$REPO_NAME"; then
    echo "⚠️  Repositório já existe. Atualizando..."
    kubectl delete secret -n argocd "$REPO_NAME" 2>/dev/null || true
fi

echo "🔑 Para repositório privado, você precisará de:"
echo "   - Personal Access Token do GitHub"
echo "   - Ou username/password"
echo ""

read -p "O repositório é privado? (s/n): " IS_PRIVATE

if [[ "$IS_PRIVATE" == "s" || "$IS_PRIVATE" == "S" ]]; then
    echo ""
    echo "📝 Configurando repositório privado..."
    read -p "GitHub Username: " GIT_USER
    read -sp "GitHub Token ou Password: " GIT_PASS
    echo ""
    
    kubectl create secret generic "$REPO_NAME" -n argocd \
        --from-literal=url="$REPO_URL" \
        --from-literal=username="$GIT_USER" \
        --from-literal=password="$GIT_PASS" \
        --dry-run=client -o yaml | \
    kubectl apply -f -
    
    # Anotar como repositório ArgoCD
    kubectl label secret "$REPO_NAME" -n argocd \
        argocd.argoproj.io/secret-type=repository \
        --overwrite
    
    echo "✅ Repositório privado configurado"
else
    echo ""
    echo "📝 Configurando repositório público..."
    
    kubectl create secret generic "$REPO_NAME" -n argocd \
        --from-literal=url="$REPO_URL" \
        --dry-run=client -o yaml | \
    kubectl apply -f -
    
    # Anotar como repositório ArgoCD
    kubectl label secret "$REPO_NAME" -n argocd \
        argocd.argoproj.io/secret-type=repository \
        --overwrite
    
    echo "✅ Repositório público configurado"
fi

echo ""
echo "📊 Verificando repositórios configurados..."
kubectl get secrets -n argocd -l argocd.argoproj.io/secret-type=repository

echo ""
echo "✅ Repositório configurado!"
echo ""
echo "🔄 Reiniciar repo-server para aplicar mudanças:"
echo "   kubectl delete pods -n argocd -l app.kubernetes.io/name=argocd-repo-server"
echo ""
echo "📋 Verificar se a Application agora sincroniza:"
echo "   kubectl get application prontclinic-api -n argocd"

