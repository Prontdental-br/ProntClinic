# Infra-Clinic

Estrutura do projeto:

- `common/` Recursos de infraestrutura comuns compartilhados
  - `argocd/` Configurações do ArgoCD (GitOps)
  - `cnpg/` CloudNativePG (PostgreSQL Operator)
  - `monitoring/` Stack de monitoramento (Prometheus, Grafana)
- `k8s-manifests/` Manifests de Kubernetes por ambiente e serviço
  - `development/` Ambiente de desenvolvimento
    - `prontclinic-api/`, `prontclinic-app/`, `prontclinic-painel/` ...
  - `production/` Ambiente de produção
- `scripts/` Scripts de deploy e automação
- `terraform/` Infraestrutura como código (OCI)

## 🚀 Deploy Rápido

### Recursos Comuns (aplicar primeiro):
```bash
# CNPG (PostgreSQL)
kubectl apply -f common/cnpg/

# Monitoramento
kubectl apply -f common/monitoring/

# ArgoCD Applications
kubectl apply -n argocd -f common/argocd/applications/development/
```

### Aplicações por Ambiente:
```bash
# Desenvolvimento
kubectl apply -f k8s-manifests/development/prontclinic-api/
kubectl apply -f k8s-manifests/development/prontclinic-app/
```

Veja a documentação completa em:
- [common/README.md](common/README.md) - Recursos comuns
- [k8s-manifests/README.md](k8s-manifests/README.md) - Manifests por ambiente
