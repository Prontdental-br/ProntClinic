#!/bin/bash

# Script para build com retry automático em caso de falhas de rede
set -e

echo "🚀 Iniciando build do frontend com retry automático..."

# Configurações do yarn
export YARN_NETWORK_TIMEOUT=300000
export YARN_NETWORK_CONCURRENCY=1

# Função para tentar instalar dependências com retry
install_dependencies() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "📦 Tentativa $attempt de $max_attempts para instalar dependências..."
        
        if yarn install --frozen-lockfile --network-timeout 300000 --network-concurrency 1; then
            echo "✅ Dependências instaladas com sucesso!"
            return 0
        else
            echo "❌ Falha na tentativa $attempt"
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Aguardando 10 segundos antes da próxima tentativa..."
                sleep 10
            fi
            attempt=$((attempt + 1))
        fi
    done
    
    echo "💥 Todas as tentativas falharam!"
    exit 1
}

# Instalar dependências
install_dependencies

# Build da aplicação
echo "🔨 Compilando aplicação..."
yarn build

echo "✅ Build concluído com sucesso!"
