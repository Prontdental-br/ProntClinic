# ArgoCD Notifications - Discord Integration

Este diretório contém as configurações para habilitar notificações do ArgoCD no Discord.

## 📋 Arquivos

- `argocd-notifications-secret.yaml` - Contém o webhook URL do Discord
- `argocd-notifications-cm.yaml` - Configurações de templates e triggers

## 🔔 Notificações Configuradas

### 1. 🔄 Sync Iniciado (Azul)
- **Quando**: ArgoCD inicia sincronização
- **Contém**: Nome da aplicação, ambiente, status, revisão

### 2. ✅ Deploy Completo (Verde)
- **Quando**: Aplicação sincronizada e healthy
- **Contém**: Nome, ambiente, health status, revisão, link ArgoCD

### 3. ❌ Sync Falhou (Vermelho)
- **Quando**: Erro durante sincronização
- **Contém**: Nome, ambiente, mensagem de erro, link ArgoCD

### 4. ⚠️ Aplicação Degradada (Amarelo)
- **Quando**: Health status = Degraded
- **Contém**: Nome, ambiente, health status, link ArgoCD

## 🚀 Como Aplicar

### Opção 1: Aplicar manualmente (Recomendado para primeira vez)

```bash
# 1. Aplicar o Secret (webhook URL)
kubectl apply -f argocd-notifications-secret.yaml

# 2. Aplicar o ConfigMap (templates e triggers)
kubectl apply -f argocd-notifications-cm.yaml

# 3. Verificar se foi aplicado
kubectl get secret argocd-notifications-secret -n argocd
kubectl get configmap argocd-notifications-cm -n argocd

# 4. Reiniciar ArgoCD Notifications Controller (se necessário)
kubectl rollout restart deployment argocd-notifications-controller -n argocd
```

### Opção 2: Via ArgoCD Application

Criar uma Application no ArgoCD apontando para este diretório:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: argocd-notifications-config
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Prontdental-br/Infra-Clinic.git
    targetRevision: ptcc-production
    path: common/argocd/notifications
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## 🔧 Personalização

### Adicionar notificações a uma Application específica

Se você quiser notificações apenas para aplicações específicas, remova o `subscriptions` global do ConfigMap e adicione annotations nas Applications:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: prontclinic-api
  namespace: argocd
  annotations:
    notifications.argoproj.io/subscribe.on-deployed.discord: ""
    notifications.argoproj.io/subscribe.on-sync-failed.discord: ""
    notifications.argoproj.io/subscribe.on-sync-running.discord: ""
    notifications.argoproj.io/subscribe.on-health-degraded.discord: ""
```

### Desabilitar notificações para uma Application

```yaml
metadata:
  annotations:
    notifications.argoproj.io/subscribe: ""
```

## 🧪 Testando

Para testar as notificações:

```bash
# Forçar sync de uma aplicação
kubectl patch app prontclinic-api -n argocd --type merge -p '{"metadata": {"annotations": {"argocd.argoproj.io/refresh": "hard"}}}'

# Ou via UI do ArgoCD: Sync > Hard Refresh
```

## 📊 Fluxo Completo de Notificações

Exemplo de um deploy completo do prontclinic-api:

1. 🔵 **Back-Clinic**: Deploy Iniciado (GitHub Actions)
2. 🟢 **Back-Clinic**: Deploy Concluído (GitHub Actions)
3. 🔵 **Infra-Clinic**: Manifest Update Iniciado (GitHub Actions)
4. 🟢 **Infra-Clinic**: Manifest Atualizado (GitHub Actions)
5. 🔄 **ArgoCD**: Sync Iniciado (ArgoCD Notifications)
6. ✅ **ArgoCD**: Deploy Completo no Cluster (ArgoCD Notifications)

Total: **6 notificações** por deploy completo! 🎉

## 🔗 Links Úteis

- [ArgoCD Notifications Docs](https://argocd-notifications.readthedocs.io/)
- [Discord Webhook Guide](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)
- [Template Variables](https://argocd-notifications.readthedocs.io/en/stable/templates/)

