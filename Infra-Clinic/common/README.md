# 📦 Recursos Comuns - Infra-Clinic

Este diretório contém todos os recursos de infraestrutura comuns compartilhados entre os ambientes de desenvolvimento, produção e outros. Esses recursos são fundamentais para o funcionamento do cluster e são independentes de aplicações específicas.

## 📁 Estrutura

```
common/
├── 📁 argocd/              # Configurações do ArgoCD (GitOps)
│   └── applications/        # Aplicações ArgoCD por ambiente
├── 📁 cnpg/                # CloudNativePG (PostgreSQL Operator)
│   ├── cnpg-operator.yaml  # Operador CNPG
│   ├── cnpg-webhook.yaml   # Webhooks de validação
│   ├── postgresql-*.yaml   # Clusters e configurações PostgreSQL
│   └── README.md           # Documentação CNPG
└── 📁 monitoring/          # Stack de Monitoramento
    ├── prometheus/         # Prometheus (coleta de métricas)
    ├── grafana/            # Grafana (dashboards)
    ├── alertmanager/       # AlertManager (alertas)
    └── README.md           # Documentação de monitoramento
```

## 🎯 Princípio de Organização

Os recursos estão organizados no diretório `common/` porque:

1. **Compartilhados entre ambientes**: Recursos como ArgoCD, CNPG e monitoramento são comuns a todos os ambientes
2. **Independência de aplicação**: Não pertencem a aplicações específicas (prontclinic-api, prontclinic-app, etc.)
3. **Gerenciamento centralizado**: Facilita a manutenção e atualização de infraestrutura base

## 🚀 Recursos Disponíveis

### **ArgoCD** (`argocd/`)
- **Função**: GitOps para gerenciamento de deployments
- **Localização**: `common/argocd/applications/`
- **Aplicar**: 
  ```bash
  kubectl apply -f common/argocd/applications/development/
  ```

### **CNPG (CloudNativePG)** (`cnpg/`)
- **Função**: Operador PostgreSQL para alta disponibilidade
- **Localização**: `common/cnpg/`
- **Aplicar**:
  ```bash
  kubectl apply -f common/cnpg/cnpg-operator.yaml
  kubectl apply -f common/cnpg/cnpg-webhook.yaml
  kubectl apply -f common/cnpg/postgresql-secret.yaml
  kubectl apply -f common/cnpg/postgresql-cluster.yaml
  ```
- **Script**: `./scripts/deploy/deploy-cnpg.sh`

### **Monitoramento** (`monitoring/`)
- **Função**: Stack completo de observabilidade (Prometheus, Grafana, AlertManager)
- **Localização**: `common/monitoring/`
- **Aplicar**:
  ```bash
  kubectl apply -f common/monitoring/prometheus/
  kubectl apply -f common/monitoring/grafana/
  kubectl apply -f common/monitoring/alertmanager/
  ```
- **Acesso**: 
  - Grafana: http://monitor-d.prontclinic.com.br
  - Prometheus: Port-forward na porta 9090

## 🔧 Manutenção

### **Adicionar Novo Recurso Comum**

1. Criar diretório em `common/`:
   ```bash
   mkdir -p common/novo-recurso
   ```

2. Adicionar manifests YAML

3. Criar `README.md` com documentação

4. Atualizar este `README.md`

### **Atualizar Recursos Existentes**

Todos os recursos em `common/` podem ser atualizados diretamente:
```bash
kubectl apply -f common/<recurso>/
```

## 📋 Convenções

- **Namespaces**: Recursos comuns geralmente usam namespaces específicos:
  - ArgoCD: `argocd`
  - CNPG: `cnpg-system` (operador), `ptcc-development` (clusters)
  - Monitoramento: `monitoring`

- **Scripts**: Scripts de deploy ficam em `scripts/deploy/` mas referenciam `common/`

- **Documentação**: Cada recurso tem seu próprio `README.md` com detalhes específicos

## 🔗 Links Relacionados

- [Estrutura de Manifests por Ambiente](../k8s-manifests/README.md)
- [Scripts de Deploy](../scripts/deploy/README.md)
- [Documentação do Projeto](../README.md)

