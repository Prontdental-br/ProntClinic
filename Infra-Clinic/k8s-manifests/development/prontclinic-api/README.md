# 🏥 ProntClinic API - Desenvolvimento

API principal do sistema ProntClinic no ambiente de desenvolvimento.

## 📁 Estrutura

```
prontclinic-api/
├── prontclinic-api-deployment.yaml    # Deployment da API
├── prontclinic-api-service.yaml       # Service para acesso interno
├── prontclinic-api-ingress.yaml      # Ingress para acesso externo
├── prontclinic-api-configmap.yaml    # Configurações da aplicação
├── prontclinic-api-secret.yaml       # Credenciais sensíveis
└── README.md                         # Esta documentação
```

## 🚀 Deploy Rápido

```bash
# Deploy completo da ProntClinic API
kubectl apply -f k8s-manifests/development/prontclinic-api/

# Verificar status
kubectl get pods -n ptcc-development -l app=prontclinic-api
```

## 🔧 Configuração

### **ProntClinic API**
- **Imagem:** prontdentalsoftware/clairis-api:branch-merge-20251016154715
- **Porta:** 5000
- **Recursos:** 512Mi-1Gi RAM, 250m-500m CPU
- **Health Check:** /health

### **URLs de Acesso**
- **API:** https://api.prontclinic.com.br
- **Health Check:** https://api.prontclinic.com.br/health

## 🔐 Configuração de Credenciais

### **1. Configurar Secrets**

Antes do deploy, configure os secrets com os valores reais:

```bash
# Exemplo de configuração de secret
kubectl create secret generic prontclinic-api-secret \
  --from-literal=db-host="postgresql-dev-rw.ptcc-development.svc.cluster.local" \
  --from-literal=db-username="prontclinic" \
  --from-literal=db-password="sua_senha_aqui" \
  --from-literal=db-database="prontclinic" \
  --from-literal=mail-api-key="md-LMqMpzh1lC0IhDXynfI4Hw" \
  --from-literal=mail-host="smtp.hostinger.com" \
  --from-literal=mail-user="seu_email" \
  --from-literal=mail-password="sua_senha_email" \
  --from-literal=jwt-secret="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqIEmlvpPy93lc5YtXBoUULYmaJqqjJZq32BVGfao" \
  --from-literal=jwt-refresh-secret="w7mEor7MwWkXf+hDLtxy3qjLumBEABu39Fljz+TspU3PP7wMXcfHiXfmw8GebnQmZoHyvrZLMdm+QIDAQAB" \
  --from-literal=aes-secret-key="yn7Zuj5oGz6XFVqyXxHfqQ==" \
  --from-literal=aes-iv="zxcvbnm1240982=" \
  --from-literal=asaas-api-key="sua_chave_asaas" \
  --from-literal=cache-redis-uri="redis://:redis123@redis-dev-service.ptcc-development.svc.cluster.local:6379/0" \
  -n ptcc-development
```

### **2. Configurar ConfigMap**

```bash
# Configurar schemas se necessário
kubectl patch configmap prontclinic-api-configmap \
  --patch '{"data":{"name-schema-client":"seu_schema","name-schema-ref":"seu_schema_ref","name-schema-general":"seu_schema_general"}}' \
  -n ptcc-development
```

## 📋 Comandos Úteis

### **Status da API**
```bash
# Ver pods
kubectl get pods -n ptcc-development -l app=prontclinic-api

# Ver logs
kubectl logs -n ptcc-development deployment/prontclinic-api

# Descrever deployment
kubectl describe deployment prontclinic-api -n ptcc-development
```

### **Teste de Conectividade**
```bash
# Health check
curl https://api.prontclinic.com.br/health

# Teste de API
curl -X GET https://api.prontclinic.com.br/api/status
```

### **Debugging**
```bash
# Ver logs em tempo real
kubectl logs -f -n ptcc-development deployment/prontclinic-api

# Entrar no pod
kubectl exec -it -n ptcc-development deployment/prontclinic-api -- /bin/bash

# Ver eventos
kubectl get events -n ptcc-development --sort-by='.lastTimestamp'
```

## 🔄 Variáveis de Ambiente

### **Configurações do Servidor**
- `TZ`: America/Sao_Paulo
- `LC_ALL`: pt_BR.UTF-8
- `LANG`: pt_BR.UTF-8
- `PORT`: 5000

### **Configurações do Banco de Dados**
- `DB_PRONT_CONNECTION`: postgres
- `DB_PRONT_HOST`: [Configurado via Secret]
- `DB_PRONT_USERNAME`: [Configurado via Secret]
- `DB_PRONT_PASSWORD`: [Configurado via Secret]
- `DB_PRONT_DATABASE`: [Configurado via Secret]
- `DB_PRONT_PORT`: 5432
- `DB_PRONT_SCHEMA`: public

### **Configurações de Email**
- `MAIL_API_KEYi`: [Configurado via Secret]
- `MAIL_HOST`: [Configurado via Secret]
- `MAIL_PORT`: 465
- `MAIL_USER`: [Configurado via Secret]
- `MAIL_PSW`: [Configurado via Secret]

### **Configurações JWT**
- `JWT_SECRET`: [Configurado via Secret]
- `JWT_SECRET_EXPIRES_IN`: 12h
- `JWT_REFRESH_SECRET`: [Configurado via Secret]
- `JWT_REFRESH_SECRET_EXPIRES_IN`: 12h
- `OWN_URL`: https://api.prontclinic.com.br
- `URL_FRONT`: https://app.prontclinic.com.br

### **Configurações S3/MinIO**
- `BUCKET_ENDPOINT`: [Configurado via Secret]
- `BUCKET_ACCESS_KEY_ID`: [Configurado via Secret]
- `BUCKET_NAME`: [Configurado via Secret]
- `BUCKET_SECRET_KEY`: [Configurado via Secret]

### **Configurações de Certificado Digital**
- `AES_SECRET_KEY`: [Configurado via Secret]
- `AES_IV`: [Configurado via Secret]

### **Configurações Evolution API**
- `EVOLUTION_API_URL`: [Configurado via Secret]
- `EVOLUTION_API_TOKEN`: [Configurado via Secret]
- `APP_URL`: [Configurado via Secret]
- `EVOLUTION_API_URL_CHAT`: [Configurado via Secret]
- `EVOLUTION_API_TOKEN_CHAT`: [Configurado via Secret]
- `APP_URL_CHAT`: [Configurado via Secret]

### **Configurações Asaas**
- `ASAAS_SANDBOX_URL`: https://sandbox.asaas.com/api/v3
- `ASAAS_API_KEY`: [Configurado via Secret]

### **Configurações Redis**
- `CACHE_REDIS_URI`: [Configurado via Secret]

## 🛠️ Troubleshooting

### **Problemas Comuns**

1. **Pod não inicia:**
   ```bash
   kubectl describe pod -n ptcc-development -l app=prontclinic-api
   ```

2. **Erro de conexão com banco:**
   - Verificar se o PostgreSQL está rodando
   - Verificar credenciais no secret

3. **Erro de SSL:**
   - Verificar se o cert-manager está funcionando
   - Verificar se o ClusterIssuer está configurado

4. **Erro de CORS:**
   - Verificar configurações do ingress
   - Verificar se o frontend está configurado corretamente

### **Logs Importantes**
```bash
# Logs de aplicação
kubectl logs -n ptcc-development deployment/prontclinic-api

# Logs do ingress
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Logs do cert-manager
kubectl logs -n cert-manager deployment/cert-manager
```

## 📚 Documentação Adicional

- [Documentação da API ProntClinic](https://docs.prontclinic.com.br)
- [Configuração do Banco de Dados](https://docs.prontclinic.com.br/database)
- [Configuração de Email](https://docs.prontclinic.com.br/email)
- [Configuração de SSL](https://docs.prontclinic.com.br/ssl)
