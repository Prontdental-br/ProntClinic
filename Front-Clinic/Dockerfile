# Build stage
FROM node:22-alpine AS build

LABEL maintainer="frontend"

# Definindo o diretório de trabalho
WORKDIR /app

# Argumentos de build para variáveis de ambiente
ARG ENV_PRONTCLINIC_FRONT_DEV
ARG ENV_PRONTCLINIC_FRONT_PRD
ARG BRANCH_NAME
ARG NODE_ENV=development

# Configurando yarn para lidar com problemas de rede
RUN yarn config set network-timeout 300000 && \
    yarn config set network-concurrency 1 && \
    yarn config set registry https://registry.npmjs.org/

# Copiando arquivos de manifesto de dependências
COPY package.json yarn.lock .yarnrc ./
COPY next.config.js ./next.config.js

# Instalando as dependências do projeto com configurações otimizadas
RUN yarn install --frozen-lockfile --network-timeout 300000 --network-concurrency 1

# Copiando todo o código-fonte
COPY . .

# Script para gerar arquivo .env baseado na branch
RUN echo "#!/bin/sh" > /tmp/generate-env.sh && \
    echo "if echo \"\$BRANCH_NAME\" | grep -q -E '(development|dev|ptcc-development)'; then" >> /tmp/generate-env.sh && \
    echo "  echo \"Using development environment\"" >> /tmp/generate-env.sh && \
    echo "  echo \"\$ENV_PRONTCLINIC_FRONT_DEV\" | base64 -d > .env" >> /tmp/generate-env.sh && \
    echo "else" >> /tmp/generate-env.sh && \
    echo "  echo \"Using production environment\"" >> /tmp/generate-env.sh && \
    echo "  echo \"\$ENV_PRONTCLINIC_FRONT_PRD\" | base64 -d > .env" >> /tmp/generate-env.sh && \
    echo "fi" >> /tmp/generate-env.sh && \
    chmod +x /tmp/generate-env.sh

# Gerando arquivo .env baseado na branch
RUN /tmp/generate-env.sh

# Compilando a aplicação
RUN yarn build

# Production stage
FROM node:22-alpine

# Definindo o diretório de trabalho
WORKDIR /app

# Adicionando o usuário nodeapp e instalando bash
RUN adduser -h /var/nodeapp -s /bin/bash -D nodeapp && \
    apk --no-cache add bash

# Configurando o fuso horário para America/Sao_Paulo
RUN apk --no-cache add tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone && \
    apk del tzdata

# Configurando yarn para produção
RUN yarn config set network-timeout 300000 && \
    yarn config set network-concurrency 1 && \
    yarn config set registry https://registry.npmjs.org/

# Copiando os arquivos necessários do estágio de construção com permissões
COPY --chown=nodeapp:nodeapp --from=build /app/package.json ./package.json
COPY --chown=nodeapp:nodeapp --from=build /app/node_modules ./node_modules
COPY --chown=nodeapp:nodeapp --from=build /app/.next ./.next
COPY --chown=nodeapp:nodeapp --from=build /app/public ./public
COPY --chown=nodeapp:nodeapp --from=build /app/.env ./.env
COPY --chown=nodeapp:nodeapp --from=build /app/.env.local ./.env.local

# Expondo a porta da aplicação
EXPOSE 3000

# Alternando para o usuário não privilegiado
USER nodeapp

# Comando para iniciar a aplicação
CMD ["yarn", "start"]