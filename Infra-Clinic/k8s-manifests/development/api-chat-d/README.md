# 🤖 API Fila D - ProntClinic

API de integração WhatsApp para o projeto ProntClinic no ambiente de desenvolvimento.

## 📁 Estrutura

```
evolution-api/
├── evolution-api-deployment.yaml    # Deployment da Evolution API
├── evolution-api-service.yaml       # Service para acesso interno
├── evolution-api-ingress.yaml      # Ingress para acesso externo
├── evolution-api-configmap.yaml    # Configurações da aplicação
├── evolution-api-secret.yaml       # Credenciais sensíveis
└── README.md                       # Esta documentação
```

## 🚀 Deploy Rápido

```bash
# Deploy completo da Evolution API
./scripts/deploy/deploy-evolution-api.sh

# Ou deploy manual
kubectl apply -f k8s-manifests/development/evolution-api/
```

## 🔧 Configuração

### **Evolution API**
- **Imagem:** atendai/evolution-api:v2.2.0
- **Porta:** 8080
- **Recursos:** 512Mi-1Gi RAM, 250m-500m CPU
- **Health Check:** /manager/health

### **Banco de Dados**
- **Provider:** PostgreSQL
- **Host:** postgresql-dev-rw.ptcc-development.svc.cluster.local
- **Database:** evolution
- **Usuário:** prontclinic
- **Senha:** prontclinic123

### **URLs de Acesso**
- **API:** http://api-fila-d.prontclinic.com.br
- **Health Check:** http://api-fila-d.prontclinic.com.br/manager/health

## 🔐 Credenciais

- **API Key:** SviuLdm9HpC7utJjTgIjLDEdVrJHgrt95Z7vH8Vd8y6pzGEmmXP4FaqR63j3Fq87
- **Database:** prontclinic/prontclinic123

## 📋 Comandos Úteis

### **Status da API**
```bash
# Ver pods
kubectl get pods -n ptcc-development -l app=evolution-api-dev

# Ver logs
kubectl logs -n ptcc-development deployment/evolution-api-dev

# Descrever deployment
kubectl describe deployment evolution-api-dev -n ptcc-development
```

### **Teste de Conectividade**
```bash
# Health check
curl -H 'apikey: SviuLdm9HpC7utJjTgIjLDEdVrJHgrt95Z7vH8Vd8y6pzGEmmXP4FaqR63j3Fq87' \
     http://api-fila-d.prontclinic.com.br/manager/health

# Teste de instâncias
curl -H 'apikey: SviuLdm9HpC7utJjTgIjLDEdVrJHgrt95Z7vH8Vd8y6pzGEmmXP4FaqR63j3Fq87' \
     http://api-fila-d.prontclinic.com.br/manager/fetchInstances
```

### **Banco de Dados**
```bash
# Conectar no banco evolution
kubectl exec -it -n ptcc-development postgresql-dev-1 -- psql -U prontclinic -d evolution

# Ver tabelas criadas
kubectl exec -n ptcc-development postgresql-dev-1 -- psql -U prontclinic -d evolution -c "\dt"
```

## 🔍 Monitoramento

### **Health Checks**
- **Liveness:** HTTP GET /manager/health (30s delay)
- **Readiness:** HTTP GET /manager/health (10s delay)

### **Recursos**
- **CPU:** 250m-500m
- **Memória:** 512Mi-1Gi
- **Timeout:** 300s para startup

## 🛠️ Troubleshooting

### **Problemas Comuns**

1. **API não inicia:**
   ```bash
   kubectl logs -n ptcc-development deployment/evolution-api-dev
   kubectl describe pod -n ptcc-development -l app=evolution-api-dev
   ```

2. **Erro de conexão com banco:**
   ```bash
   kubectl exec -n ptcc-development postgresql-dev-1 -- psql -U prontclinic -d evolution -c "SELECT 1;"
   ```

3. **Ingress não funciona:**
   ```bash
   kubectl get ingress -n ptcc-development
   kubectl describe ingress evolution-api-dev-ingress -n ptcc-development
   ```

## 📚 Funcionalidades

- **WhatsApp Business API**
- **Webhook Events**
- **AI Integration (OpenAI, Dify, Typebot)**
- **Database Persistence**
- **QR Code Management**
- **Instance Management**
- **Message Handling**

## 🔗 Integrações

- **PostgreSQL:** Persistência de dados
- **Redis:** Cache (opcional)
- **MinIO:** Armazenamento de arquivos (opcional)
- **Webhooks:** Eventos em tempo real
- **AI Services:** OpenAI, Dify, Typebot
