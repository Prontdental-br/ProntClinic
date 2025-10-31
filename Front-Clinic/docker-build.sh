#!/bin/bash

# Script para build do Docker com diferentes estratégias
set -e

echo "🐳 Iniciando build do Docker para frontend..."

# Verificar se existe yarn.lock
if [ -f "yarn.lock" ]; then
    echo "📦 Usando Yarn para build..."
    docker build -t prontclinic-frontend:latest .
else
    echo "📦 Usando NPM para build..."
    docker build -f Dockerfile.npm -t prontclinic-frontend:latest .
fi

echo "✅ Build do Docker concluído com sucesso!"
echo "🚀 Para executar o container:"
echo "   docker run -p 3000:3000 prontclinic-frontend:latest"
