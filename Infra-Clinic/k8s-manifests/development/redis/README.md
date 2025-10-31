# 🔴 Redis DEV - ProntClinic

## 📋 Visão Geral

Redis para ambiente de desenvolvimento da ProntClinic, usado como cache para a Evolution API.

## 🏗️ Arquitetura

### **Recursos Kubernetes:**
- **Deployment:** `redis-dev`
- **Service:** `redis-dev-service`
- **Namespace:** `ptcc-development`

### **Configurações:**
- **Imagem:** `redis:7-alpine`
- **Porta:** `6379`
- **Senha:** `redis123`
- **Database:** `1`
- **Persistência:** AOF (Append Only File) habilitado

## 🚀 Deploy

### **Deploy Manual:**
```bash
# Deploy Redis
kubectl apply -f k8s-manifests/development/redis/redis-deployment.yaml
kubectl apply -f k8s-manifests/development/redis/redis-service.yaml

# Verificar status
kubectl get pods -l app=redis-dev -n ptcc-development
```

### **Deploy via Script:**
```bash
# Deploy completo
./scripts/deploy/deploy-redis.sh
```

## 🔗 Conectividade

### **URL Interna:**
- **Host:** `redis-dev-service.ptcc-development.svc.cluster.local`
- **Porta:** `6379`
- **Senha:** `redis123`
- **Database:** `1`

### **URL Completa:**
```
redis://:redis123@redis-dev-service.ptcc-development.svc.cluster.local:6379/1
```

## 🧪 Testes

### **Teste de Conectividade:**
```bash
# Conectar via kubectl
kubectl exec -it deployment/redis-dev -n ptcc-development -- redis-cli -a redis123 ping

# Teste de operações
kubectl exec -it deployment/redis-dev -n ptcc-development -- redis-cli -a redis123 set test "Hello Redis"
kubectl exec -it deployment/redis-dev -n ptcc-development -- redis-cli -a redis123 get test
```

### **Monitoramento:**
```bash
# Logs
kubectl logs deployment/redis-dev -n ptcc-development

# Status
kubectl describe deployment redis-dev -n ptcc-development

# Métricas
kubectl top pod -l app=redis-dev -n ptcc-development
```

## 📊 Recursos

### **Limites:**
- **CPU:** 200m (limite), 100m (request)
- **Memória:** 256Mi (limite), 128Mi (request)

### **Persistência:**
- **Tipo:** `emptyDir` (temporário)
- **AOF:** Habilitado para durabilidade

## 🔧 Configurações Avançadas

### **Variáveis de Ambiente:**
- `REDIS_PASSWORD`: Senha do Redis
- Configurações via command line arguments

### **Probes:**
- **Liveness:** TCP check na porta 6379
- **Readiness:** Redis PING command

## 🚨 Troubleshooting

### **Problemas Comuns:**

#### **Pod não inicia:**
```bash
kubectl describe pod -l app=redis-dev -n ptcc-development
kubectl logs -l app=redis-dev -n ptcc-development
```

#### **Problemas de conectividade:**
```bash
# Testar conectividade interna
kubectl exec -it deployment/redis-dev -n ptcc-development -- redis-cli -a redis123 ping

# Verificar service
kubectl get svc redis-dev-service -n ptcc-development
kubectl describe svc redis-dev-service -n ptcc-development
```

#### **Problemas de performance:**
```bash
# Verificar uso de recursos
kubectl top pod -l app=redis-dev -n ptcc-development

# Verificar logs
kubectl logs deployment/redis-dev -n ptcc-development --tail=100
```

## 📋 Comandos Úteis

```bash
# Status geral
kubectl get all -l app=redis-dev -n ptcc-development

# Logs em tempo real
kubectl logs -f deployment/redis-dev -n ptcc-development

# Conectar no Redis
kubectl exec -it deployment/redis-dev -n ptcc-development -- redis-cli -a redis123

# Reiniciar deployment
kubectl rollout restart deployment/redis-dev -n ptcc-development

# Escalar
kubectl scale deployment redis-dev --replicas=2 -n ptcc-development
```

## 🔐 Segurança

### **Credenciais:**
- **Senha:** `redis123` (desenvolvimento)
- **Acesso:** Apenas dentro do cluster

### **Recomendações:**
- Usar senhas mais seguras em produção
- Configurar TLS para comunicação
- Implementar backup automático

## 📚 Documentação Adicional

- [Redis Documentation](https://redis.io/documentation)
- [Kubernetes Redis](https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/)
- [Redis Configuration](https://redis.io/docs/management/config/)
