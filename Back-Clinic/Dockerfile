FROM node:22-alpine AS build

LABEL maintainer="backend"

# Definindo o diretório de trabalho como /appp 
WORKDIR /app

# Copiando arquivos de manifesto de dependências
COPY package*.json ./

# Instalando as dependências do projeto
#RUN npm install
RUN npm install --legacy-peer-deps

# Copiando todo código-fonte para o diretório de trabalho no contêiner
COPY . .

# Executando build
RUN npm run build

# Production Stage
FROM node:22-alpine

# Definindo o diretório de trabalho como /app
WORKDIR /app

# Adicionando usuario e instalando bash e tzdata
RUN adduser -h /var/nodeapp -s /bin/bash -D nodeapp && \
    apk --no-cache add bash tzdata postgresql-client busybox-extras openssl

# Configurando timezone
RUN cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone

# Definindo as variáveis de ambiente de locale
ENV LANG=pt_BR.UTF-8 \
    LC_ALL=pt_BR.UTF-8 \
    LANGUAGE=pt_BR.UTF-8

# Copiando arquivos do estágio de construção com permissões
COPY --chown=nodeapp:nodeapp --from=build /app /app

# Expondo a porta 5000
EXPOSE 5000

# Alternando para o usuário não privilegiado
USER nodeapp

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
