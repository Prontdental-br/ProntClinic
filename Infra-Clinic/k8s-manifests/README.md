# 📦 Kubernetes Manifests

Este diretório contém todos os manifests Kubernetes organizados por ambiente e aplicação.

## 📁 Estrutura

```
k8s-manifests/
├── 📁 development/       # Ambiente de Desenvolvimento
│   ├── 📁 pgadmin/      # pgAdmin DEV
│   ├── 📁 minio/        # MinIO DEV
│   ├── 📁 prontclinic-api/
│   ├── 📁 prontclinic-app/
│   └── 📁 prontclinic-painel/
├── 📁 production/        # Ambiente de Produção
│   ├── 📁 pgadmin/      # pgAdmin PROD
│   └── 📁 minio/        # MinIO PROD
└── 📁 shared/           # Recursos Compartilhados
    └── 📁 ingress/      # Ingress Controllers
```

**Nota**: Recursos comuns (CNPG, Monitoramento, ArgoCD) foram movidos para `common/`. Veja [common/README.md](../common/README.md).

## 🚀 Deploy

### **Recursos Comuns** (aplicar primeiro)
```bash
# CNPG (PostgreSQL Operator)
kubectl apply -f common/cnpg/

# Monitoramento (Prometheus, Grafana)
kubectl apply -f common/monitoring/

# ArgoCD (GitOps)
kubectl apply -f common/argocd/applications/development/
```

### **Ambiente de Desenvolvimento**
```bash
# Deploy completo do ambiente DEV
kubectl apply -f k8s-manifests/development/pgadmin/
kubectl apply -f k8s-manifests/development/minio/

# Verificar status
./scripts/deploy/dev-status.sh
```

### **Ambiente de Produção**
```bash
# Deploy completo do ambiente PROD
kubectl apply -f k8s-manifests/production/pgadmin/
kubectl apply -f k8s-manifests/production/minio/

# Verificar status
kubectl get all -n ptcc-production
```

### **Ingress Controllers**
```bash
# Deploy via Helm (recomendado)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace

# Ou deploy manual
kubectl apply -f k8s-manifests/shared/ingress/nginx-ingress-controller.yaml
```

## 🔧 Configuração

### **pgAdmin**
- **Namespace:** ptcc-development
- **Imagem:** dpage/pgadmin4:latest
- **Recursos:** 256Mi-512Mi RAM, 250m-500m CPU
- **Credenciais:** admin@prontdental.com / admin123

### **NGINX Ingress**
- **Namespace:** ingress-nginx
- **Tipo:** LoadBalancer
- **Roteamento:** Por domínio (pgadmin.prontclinic.com.br)

## 📋 Comandos Úteis

```bash
# Verificar todos os recursos
kubectl get all --all-namespaces

# Logs do pgAdmin
kubectl logs -n ptcc-development deployment/pgadmin

# Logs do NGINX
kubectl logs -n ingress-nginx deployment/nginx-ingress-ingress-nginx-controller

# Descrever ingress
kubectl describe ingress pgadmin-ingress -n ptcc-development
```
