# 🚀 Manifests de Desenvolvimento - ProntDental

Manifests Kubernetes para o ambiente de **desenvolvimento** do projeto ProntDental.

## 📁 Estrutura

```
development/
├── 📁 pgadmin/                 # pgAdmin DEV
│   ├── pgadmin-dev-deployment.yaml
│   ├── pgadmin-dev-service.yaml
│   └── pgadmin-dev-ingress.yaml
├── 📁 minio/                   # MinIO DEV
│   ├── minio-dev-deployment.yaml
│   ├── minio-dev-service.yaml
│   └── minio-dev-ingress.yaml
├── 📁 prontclinic-api/         # API Backend
├── 📁 prontclinic-app/         # Frontend
└── 📁 prontclinic-painel/      # Painel Admin
```

**Nota**: Recursos comuns (CNPG, Monitoramento) foram movidos para `common/`. Veja [../../common/README.md](../../common/README.md).

## 🚀 Deploy Rápido

```bash
# 1. Primeiro, deploy dos recursos comuns (se ainda não aplicados)
kubectl apply -f ../../common/cnpg/
kubectl apply -f ../../common/monitoring/

# 2. Deploy dos recursos específicos do ambiente DEV
kubectl apply -f k8s-manifests/development/pgadmin/
kubectl apply -f k8s-manifests/development/minio/

# Verificar status
./scripts/deploy/dev-status.sh
```

## 🔧 Configuração

### **PostgreSQL DEV**
- **Cluster:** postgresql-dev
- **Instâncias:** 3 (alta disponibilidade)
- **Database:** prontclinic
- **Credenciais:** prontclinic/prontclinic123

### **pgAdmin DEV**
- **URL:** http://pgadmin-dev.prontclinic.com.br
- **Credenciais:** admin@prontclinic.com / admin123
- **Banner:** "Bem-vindo ao pgAdmin DEV - ProntClinic"

### **MinIO DEV**
- **URL:** http://minio-dev.prontclinic.com.br
- **Credenciais:** minioadmin / minioadmin123
- **Portas:** 9000 (API), 9001 (Console)

## 📋 Comandos Úteis

```bash
# Status do ambiente DEV
./scripts/deploy/dev-status.sh

# Conectar no PostgreSQL DEV
kubectl exec -it -n ptcc-development postgresql-dev-1 -- psql -U postgres -d prontclinic

# Logs do pgAdmin DEV
kubectl logs -n ptcc-development deployment/pgadmin-dev

# Logs do MinIO DEV
kubectl logs -n ptcc-development deployment/minio-dev
```

## 🔍 Monitoramento

- **PostgreSQL:** 3 instâncias com replicação
- **Backup:** Automático diário às 2h
- **Recursos:** 1-2Gi RAM, 500m-1000m CPU
- **Storage:** 20Gi (OCI Block Volume)
