# 🐘 CNPG (CloudNativePG) - ProntDental

Configuração do cluster PostgreSQL usando CloudNativePG para alta disponibilidade e backup automático.

## 📁 Estrutura

```
common/cnpg/
├── cnpg-operator.yaml          # Operador CNPG
├── cnpg-webhook.yaml          # Webhooks de validação
├── postgresql-cluster.yaml    # Cluster PostgreSQL
├── postgresql-secret.yaml     # Credenciais
├── postgresql-backup.yaml     # Backup automático
└── README.md                  # Esta documentação
```

## 🚀 Deploy Rápido

```bash
# Deploy completo do CNPG
./scripts/deploy/deploy-cnpg.sh

# Verificar status
./scripts/deploy/cnpg-status.sh
```

## 🔧 Configuração

### **Cluster PostgreSQL**
- **Nome:** postgresql-cluster
- **Namespace:** ptcc-development
- **Instâncias:** 3 (alta disponibilidade)
- **Storage:** 20Gi (OCI Block Volume)
- **Recursos:** 1-2Gi RAM, 500m-1000m CPU

### **Credenciais**
- **Usuário:** prontclinic
- **Senha:** prontclinic123
- **Database:** prontclinic

### **Backup Automático**
- **Frequência:** Diariamente às 2h
- **Retenção:** 30 dias
- **Compressão:** gzip
- **Criptografia:** AES256

## 📋 Comandos Úteis

### **Status do Cluster**
```bash
# Ver cluster
kubectl get cluster -n ptcc-development

# Descrever cluster
kubectl describe cluster postgresql-cluster -n ptcc-development

# Pods do PostgreSQL
kubectl get pods -n ptcc-development -l cnpg.io/cluster=postgresql-cluster
```

### **Backup**
```bash
# Ver backups agendados
kubectl get scheduledbackup -n ptcc-development

# Backup manual
kubectl create -f - <<EOF
apiVersion: postgresql.cnpg.io/v1
kind: Backup
metadata:
  name: backup-manual-$(date +%Y%m%d-%H%M%S)
  namespace: ptcc-development
spec:
  cluster:
    name: postgresql-cluster
EOF
```

### **Conexão com o Banco**

#### **Acesso Interno (Port Forward)**
```bash
# Port forward para acesso local
kubectl port-forward -n ptcc-development svc/postgresql-cluster-rw 5432:5432

# Conectar com psql
psql -h localhost -U prontclinic -d prontclinic
```

#### **Acesso Público (Externo)**
```bash
# Deploy com acesso público
./scripts/deploy/deploy-postgresql-public.sh

# Acesso direto via LoadBalancer
psql -h <IP_DO_LOADBALANCER> -p 5432 -U prontclinic -d prontclinic

# Acesso via domínio (após configurar DNS)
psql -h postgresql-d.prontclinic.com.br -p 5432 -U prontclinic -d prontclinic
```

### **Configuração de Acesso Público**

Para expor o PostgreSQL publicamente:

1. **Deploy do Acesso Público:**
   ```bash
   ./scripts/deploy/deploy-postgresql-public.sh
   ```

2. **Configuração DNS:**
   - Configure o DNS para apontar `postgresql-d.prontclinic.com.br` para o IP do LoadBalancer
   - Obtenha o IP com: `kubectl get service postgresql-external -n ptcc-development`

3. **Credenciais de Acesso:**
   - **Host:** postgresql-d.prontclinic.com.br (ou IP do LoadBalancer)
   - **Porta:** 5432
   - **Database:** protclinic_dev_db
   - **Usuário:** prontclinic
   - **Senha:** gYYf769JWGxvKQQxoJ6cb7A6zhmIiMk6N+GGaRZbk2k=

4. **Segurança:**
   - O acesso público inclui autenticação básica
   - SSL/TLS configurado via Traefik
   - Recomendado usar VPN ou IP whitelist para maior segurança

### **Logs**
```bash
# Logs do operador
kubectl logs -n cnpg-system deployment/cnpg-controller-manager

# Logs do PostgreSQL
kubectl logs -n ptcc-development -l cnpg.io/cluster=postgresql-cluster
```

## 🔍 Monitoramento

### **Métricas**
- **CPU/Memória:** `kubectl top pods -n ptcc-development`
- **Recursos:** `kubectl describe cluster postgresql-cluster -n ptcc-development`

### **Health Checks**
- **Cluster Status:** `kubectl get cluster postgresql-cluster -n ptcc-development -o jsonpath='{.status.phase}'`
- **Pods Ready:** `kubectl get pods -n ptcc-development -l cnpg.io/cluster=postgresql-cluster`

## 🛠️ Troubleshooting

### **Problemas Comuns**

1. **Cluster não inicia:**
   ```bash
   kubectl describe cluster postgresql-cluster -n ptcc-development
   kubectl logs -n cnpg-system deployment/cnpg-controller-manager
   ```

2. **Backup falha:**
   ```bash
   kubectl describe scheduledbackup postgresql-scheduled-backup -n ptcc-development
   ```

3. **Storage Issues:**
   ```bash
   kubectl get pvc -n ptcc-development
   kubectl describe pvc -n ptcc-development
   ```

## 🔐 Segurança

- Credenciais armazenadas em Kubernetes Secret
- Backup com criptografia AES256
- Rede isolada no namespace ptcc-development
- RBAC configurado para o operador

## 📚 Referências

- [CloudNativePG Documentation](https://cloudnative-pg.io/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/)
- [Kubernetes Storage](https://kubernetes.io/docs/concepts/storage/)
