# Build stage
FROM node:22-alpine

# Defina o diretório de trabalho como /app
WORKDIR /app

# Adicione o usuário nodeapp e instale bash
RUN adduser -h /var/nodeapp -s /bin/bash -D nodeapp && \
    apk --no-cache add bash

# Configurando o fuso horário para America/Sao_Paulo
RUN apk --no-cache add tzdata && \
    cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone && \
    apk del tzdata

# Copie o arquivo package.json e o package-lock.json (se existir)
#COPY package*.json ./
COPY . ./

# Instale as dependências do projeto e limpe o cache do npm
#RUN yarn && npm cache clean --force
RUN npm install

# Copie todo o código-fonte para o diretório de trabalho no contêiner
COPY . .

# Mude a permissão do diretório de trabalho para o usuário nodeapp
RUN chown -R nodeapp:nodeapp /app

# Execute o processo de build, se necessário (substitua este comando pelo que você realmente usa para compilar seu código)
RUN npm run build


# Criar o arquivo .env a partir das variáveis de ambiente passadas no build
ARG PORT
ARG NEXT_PUBLIC_OWN_URL
ARG DB_PRONT_CONNECTION
ARG DB_HOST
ARG DB_PRONT_USERNAME
ARG DB_PRONT_PASSWORD
ARG DB_PRONT_DATABASE
ARG DB_PRONT_SCHEMA
ARG DB_PORT
ARG DB_PRONT_SSL
ARG ASAAS_API_URL
ARG ASAAS_API_TOKEN
ARG WEBHOOK_URL
ARG ASAAS_ACCESS_WEBHOOK_TOKEN
ARG PRONTDENTAL_JWT_SECRET
ARG NAME_SCHEMA_CLIENT
ARG NAME_FUNCTION_SCHEMA
ARG NAME_SCHEMA_REF
ARG NAME_SCHEMA_GENERAL

RUN echo "PORT=${PORT}" > .env \
    && echo "NEXT_PUBLIC_OWN_URL=${NEXT_PUBLIC_OWN_URL}" >> .env \
    && echo "DB_PRONT_CONNECTION=${DB_PRONT_CONNECTION}" >> .env \
    && echo "DB_HOST=${DB_HOST}" >> .env \
    && echo "DB_PRONT_USERNAME=${DB_PRONT_USERNAME}" >> .env \
    && echo "DB_PRONT_PASSWORD=${DB_PRONT_PASSWORD}" >> .env \
    && echo "DB_PRONT_DATABASE=${DB_PRONT_DATABASE}" >> .env \
    && echo "DB_PRONT_SCHEMA=${DB_PRONT_SCHEMA}" >> .env \
    && echo "DB_PORT=${DB_PORT}" >> .env \
    && echo "DB_PRONT_SSL=${DB_PRONT_SSL}" >> .env \
    && echo "ASAAS_API_URL=${ASAAS_API_URL}" >> .env \
    && echo "ASAAS_API_TOKEN=${ASAAS_API_TOKEN}" >> .env \
    && echo "WEBHOOK_URL=${WEBHOOK_URL}" >> .env \
    && echo "ASAAS_ACCESS_WEBHOOK_TOKEN=${ASAAS_ACCESS_WEBHOOK_TOKEN}" >> .env \
    && echo "PRONTDENTAL_JWT_SECRET=${PRONTDENTAL_JWT_SECRET}" >> .env \
    && echo "NAME_SCHEMA_CLIENT=${NAME_SCHEMA_CLIENT}" >> .env \
    && echo "NAME_FUNCTION_SCHEMA=${NAME_FUNCTION_SCHEMA}" >> .env \
    && echo "NAME_SCHEMA_REF=${NAME_SCHEMA_REF}" >> .env \
    && echo "NAME_SCHEMA_GENERAL=${NAME_SCHEMA_GENERAL}" >> .env

# Exponha a porta 3030
EXPOSE 3030

# Mude para o usuário nodeapp
USER nodeapp

# Comando para iniciar a aplicação
CMD ["yarn", "start"]
