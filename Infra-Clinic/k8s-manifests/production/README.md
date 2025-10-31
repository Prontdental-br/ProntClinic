# 🏭 Manifests de Produção - ProntDental

Manifests Kubernetes para o ambiente de **produção** do projeto ProntDental.

## 📁 Estrutura

```
production/
├── 📁 pgadmin/                 # pgAdmin Produção
│   ├── pgadmin-deployment.yaml
│   ├── pgadmin-service.yaml
│   └── pgadmin-ingress.yaml
└── 📁 minio/                   # MinIO Produção
    ├── minio-deployment.yaml
    ├── minio-service.yaml
    └── minio-ingress.yaml
```

## 🚀 Deploy Rápido

```bash
# Deploy completo do ambiente PROD
kubectl apply -f k8s-manifests/production/pgadmin/
kubectl apply -f k8s-manifests/production/minio/

# Verificar status
kubectl get all -n ptcc-production
```

## 🔧 Configuração

### **pgAdmin Produção**
- **URL:** http://pgadmin.prontclinic.com.br
- **Credenciais:** admin@prontdental.com / admin123
- **Banner:** "Bem-vindo ao pgAdmin - ProntDental"

### **MinIO Produção**
- **URL:** http://s3-d.prontclinic.com.br
- **Credenciais:** minioadmin / minioadmin123
- **Portas:** 9000 (API), 9001 (Console)

## 📋 Comandos Úteis

```bash
# Status do ambiente PROD
kubectl get all -n ptcc-production

# Logs do pgAdmin PROD
kubectl logs -n ptcc-production deployment/pgadmin

# Logs do MinIO PROD
kubectl logs -n ptcc-production deployment/minio
```

## 🔍 Monitoramento

- **Recursos:** Configurados para produção
- **Alta Disponibilidade:** Configurada
- **Backup:** Configurado
- **SSL:** Configurado via Traefik
