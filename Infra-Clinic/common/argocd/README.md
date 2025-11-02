# 🚀 ArgoCD - ProntClinic

Instalação e configuração do ArgoCD via Helm para GitOps no projeto ProntClinic.

## 📋 Informações

- **URL Externo**: https://argocd-d.prontclinic.com.br
- **Namespace**: `argocd`
- **Ingress Controller**: NGINX
- **Instalação**: Helm Chart

## 🚀 Instalação Rápida

### Pré-requisitos

1. **Instalar Helm** (se ainda não instalado):
   ```bash
   # Opção 1: Via snap (requer sudo)
   sudo snap install helm --classic
   
   # Opção 2: Binário sem sudo (instalado em ~/bin)
   export PATH="$HOME/bin:$PATH"
   helm version --short
   ```

### Instalação

```bash
# Navegar para o diretório
cd common/argocd/

# Executar script de instalação
./install.sh
```

### Instalação Manual

```bash
# 1. Criar namespace
kubectl create namespace argocd

# 2. Adicionar repositório Helm
export PATH="$HOME/bin:$PATH"
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# 3. Instalar ArgoCD
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --values values.yaml \
  --wait \
  --timeout 10m
```

## 🔐 Acesso Inicial

### Obter Senha do Admin

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo
```

**Senha atual**: `BwX5hhcGx1sSLEOI` (⚠️ alterar após primeiro login)

### Acessar ArgoCD

1. **Via URL Externa** (recomendado):
   - URL: https://argocd-d.prontclinic.com.br
   - Usuário: `admin`
   - Senha: (obter com comando acima ou usar a senha atual)

2. **Via Port-Forward** (desenvolvimento local):
   ```bash
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   # Acessar: https://localhost:8080
   ```

## 📁 Estrutura

```
common/argocd/
├── values.yaml          # Valores personalizados do Helm
├── install.sh           # Script de instalação automatizada
├── README.md           # Esta documentação
└── applications/       # Aplicações ArgoCD
    ├── deploy.sh       # Script para deploy das applications
    └── development/
        ├── project-ptcc-development.yaml  # AppProject
        └── prontclinic-api.yaml           # Application prontclinic-api
```

## 🔧 Configuração

### Ingress

O ArgoCD está configurado para usar:
- **Ingress Controller**: NGINX
- **Ingress Class**: `nginx`
- **Host**: `argocd-d.prontclinic.com.br`
- **TLS**: Automático via cert-manager (Let's Encrypt)

**Nota**: Se o ingress foi criado com host incorreto, corrigir com:
```bash
kubectl patch ingress argocd-server -n argocd --type=json \
  -p='[{"op": "replace", "path": "/spec/rules/0/host", "value": "argocd-d.prontclinic.com.br"}]'
```

### Componentes Instalados

- **ArgoCD Server**: Interface web e API (1/1 Running)
- **Application Controller**: Gerenciamento de aplicações (1/1 Running)
- **Repo Server**: Servidor de repositórios Git (1/1 Running)
- **Dex**: Autenticação OAuth (1/1 Running)
- **Redis**: Cache de sessões (1/1 Running)
- **Notifications**: Sistema de notificações (1/1 Running)
- **ApplicationSet Controller**: Gerenciamento de ApplicationSets (1/1 Running)

## 📊 Verificar Status

```bash
# Ver pods do ArgoCD
kubectl get pods -n argocd

# Ver serviços
kubectl get svc -n argocd

# Ver ingress
kubectl get ingress -n argocd

# Ver logs do servidor
kubectl logs -n argocd deployment/argocd-server

# Status completo
kubectl get all -n argocd
```

## 🔄 Atualização

```bash
export PATH="$HOME/bin:$PATH"

# Atualizar repositório Helm
helm repo update

# Atualizar instalação
helm upgrade argocd argo/argo-cd \
  --namespace argocd \
  --values values.yaml \
  --wait
```

## 🗑️ Desinstalação

```bash
export PATH="$HOME/bin:$PATH"

# Desinstalar ArgoCD
helm uninstall argocd -n argocd

# Remover namespace (opcional)
kubectl delete namespace argocd
```

## 🔐 Segurança

### Mudar Senha do Admin

**⚠️ IMPORTANTE**: Após o primeiro login, altere a senha padrão:

```bash
# Login via CLI (instalar argocd CLI primeiro)
argocd login argocd-d.prontclinic.com.br

# Atualizar senha
argocd account update-password

# Ou via UI: User > Update Password
```

### Remover Secret Inicial

Após alterar a senha, remover o secret inicial:
```bash
kubectl delete secret argocd-initial-admin-secret -n argocd
```

### Configurar RBAC

Edite o `values.yaml` na seção `configs.rbac` para personalizar permissões.

## 📚 Recursos

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Helm Chart](https://github.com/argoproj/argo-helm/tree/main/charts/argo-cd)
- [GitOps Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)

## 🆘 Troubleshooting

### Problema: Ingress não funciona

```bash
# Verificar ingress
kubectl describe ingress -n argocd

# Verificar certificado TLS
kubectl get certificate -n argocd

# Verificar DNS apontando para o LoadBalancer
kubectl get ingress -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### Problema: Pods não iniciam

```bash
# Verificar eventos
kubectl get events -n argocd --sort-by='.lastTimestamp'

# Ver logs de um pod específico
kubectl logs -n argocd <pod-name>

# Descrever pod
kubectl describe pod -n argocd <pod-name>
```

### Problema: Senha inicial não funciona

```bash
# Recriar senha inicial
kubectl delete secret argocd-initial-admin-secret -n argocd
# Reiniciar o pod do server
kubectl delete pod -n argocd -l app.kubernetes.io/name=argocd-server
```

### Problema: Host do Ingress incorreto

```bash
# Corrigir host manualmente
kubectl patch ingress argocd-server -n argocd --type=json \
  -p='[{"op": "replace", "path": "/spec/rules/0/host", "value": "argocd-d.prontclinic.com.br"}]'

kubectl patch ingress argocd-server -n argocd --type=json \
  -p='[{"op": "replace", "path": "/spec/tls/0/hosts/0", "value": "argocd-d.prontclinic.com.br"}]'
```

## 🎯 Applications Configuradas

### ProntClinic API

**Application**: `prontclinic-api`
- **Repositório**: https://github.com/Prontdental-br/Infra-Clinic.git
- **Branch**: `ptcc-production`
- **Path**: `k8s-manifests/development/prontclinic-api`
- **Namespace**: `ptcc-development`
- **Sincronização**: Automática (auto-sync, self-heal, prune)

**Deploy da Application**:
```bash
cd common/argocd/applications/
./deploy.sh
```

Ou manualmente:
```bash
kubectl apply -f common/argocd/applications/development/project-ptcc-development.yaml
kubectl apply -f common/argocd/applications/development/prontclinic-api.yaml
```

## ✅ Status Atual

- ✅ ArgoCD instalado via Helm
- ✅ 8 pods rodando em `argocd` namespace
- ✅ Ingress configurado para `argocd-d.prontclinic.com.br`
- ✅ TLS automático via cert-manager
- ✅ Application `prontclinic-api` configurada
- ⚠️ Alterar senha inicial após primeiro login
