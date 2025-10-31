#!/bin/bash

# 🔐 Configuração Manual do GitHub para ArgoCD
# Este script ajuda a configurar manualmente as credenciais do GitHub

set -e

echo "🔐 Configurando credenciais do GitHub para ArgoCD..."

echo "📋 Para configurar o repositório privado, você precisa:"
echo "1. Gerar um token do GitHub em: https://github.com/settings/tokens"
echo "2. Configurar as variáveis de ambiente:"
echo "   export GITHUB_USERNAME=seu_usuario"
echo "   export GITHUB_TOKEN=seu_token"
echo "3. Executar este script novamente"

# Verificar se as variáveis estão definidas
if [ -z "$GITHUB_USERNAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    echo ""
    echo "⚠️  Variáveis não configuradas. Configurando repositório público temporário..."
    
    # Configurar repositório público temporário para teste
    echo "🔧 Configurando repositório público para teste..."
    
    # Remover configuração existente
    kubectl delete configmap argocd-repo-server-config -n argocd 2>/dev/null || true
    
    # Criar nova configuração com repositório público
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-repo-server-config
  namespace: argocd
  labels:
    app.kubernetes.io/name: argocd-repo-server
    app.kubernetes.io/part-of: argocd
data:
  repositories.yaml: |
    - type: git
      url: https://github.com/Prontdental-br/prontclinic.git
      name: prontclinic
      description: "Repositório principal do ProntClinic (público temporário)"
EOF

    echo "✅ Configuração pública aplicada!"
    echo "⚠️  NOTA: Para repositórios privados, configure as credenciais do GitHub"
    
else
    echo "✅ Usuário: $GITHUB_USERNAME"
    echo "✅ Token configurado (${#GITHUB_TOKEN} caracteres)"
    
    # Criar secret com credenciais
    kubectl delete secret prontclinic-repo-secret -n argocd 2>/dev/null || true
    
    kubectl create secret generic prontclinic-repo-secret \
      --from-literal=type=git \
      --from-literal=url=https://github.com/Prontdental-br/prontclinic.git \
      --from-literal=name=prontclinic \
      --from-literal=username="$GITHUB_USERNAME" \
      --from-literal=password="$GITHUB_TOKEN" \
      -n argocd
    
    # Adicionar label para o ArgoCD reconhecer
    kubectl label secret prontclinic-repo-secret argocd.argoproj.io/secret-type=repository -n argocd
    
    echo "✅ Secret criado com credenciais!"
fi

echo ""
echo "🔄 Reiniciando ArgoCD para aplicar configurações..."
kubectl rollout restart deployment/argocd-repo-server -n argocd
kubectl rollout restart deployment/argocd-server -n argocd

echo "⏳ Aguardando pods reiniciarem..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-repo-server -n argocd --timeout=60s
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=60s

echo "✅ ArgoCD reiniciado!"

echo ""
echo "📊 Verificando status das aplicações..."
kubectl get applications -n argocd | grep prontclinic

echo ""
echo "🔍 Para verificar logs do ArgoCD:"
echo "kubectl logs -n argocd deployment/argocd-repo-server --tail=20"
echo ""
echo "🌐 Para acessar a interface do ArgoCD:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
