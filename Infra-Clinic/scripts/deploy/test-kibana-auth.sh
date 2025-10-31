#!/bin/bash

# Script para testar autenticação do Kibana
# ProntDental - Development Environment

echo "🔐 Testando autenticação do Kibana..."
echo "=================================="

# Configurações
KIBANA_URL="https://logs-d.prontclinic.com.br"
USERNAME="admin"
PASSWORD="134rC03Hpz6oKekw4OdG0"

echo "📋 Configurações:"
echo "   URL: $KIBANA_URL"
echo "   Usuário: $USERNAME"
echo "   Senha: $PASSWORD"
echo ""

# Testar acesso com autenticação básica
echo "🧪 Testando acesso com credenciais..."
echo ""

# Usar curl para testar autenticação
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -u "$USERNAME:$PASSWORD" "$KIBANA_URL/api/status")

if [ "$RESPONSE" = "200" ]; then
    echo "✅ SUCESSO: Kibana acessível com autenticação!"
    echo "   Status HTTP: $RESPONSE"
    echo ""
    echo "🌐 Acesse: $KIBANA_URL"
    echo "👤 Usuário: $USERNAME"
    echo "🔑 Senha: $PASSWORD"
else
    echo "❌ ERRO: Falha na autenticação!"
    echo "   Status HTTP: $RESPONSE"
    echo ""
    echo "🔍 Verificando status dos recursos..."
    kubectl get pods,secrets,ingress -n ptcc-development -l app=kibana-dev
fi

echo ""
echo "📊 Status dos recursos:"
kubectl get pods -n ptcc-development -l app=kibana-dev
echo ""
kubectl get ingress -n ptcc-development kibana-dev-ingress
