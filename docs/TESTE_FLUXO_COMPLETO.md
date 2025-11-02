# 🧪 Teste do Fluxo Completo de Deploy

## ✅ Status Atual

Todos os 3 projetos estão com automação completa configurada e funcionando:

| Projeto | Build Workflow | Manifest Workflow | ArgoCD App | Status |
|---------|---------------|-------------------|------------|--------|
| **Back-Clinic** | ✅ `deploy-api.yml` | ✅ `update-manifest-api.yml` | ✅ `prontclinic-api` | 🟢 **Synced/Healthy** |
| **Front-Clinic** | ✅ `deploy-app.yml` | ✅ `update-manifest-app.yml` | ✅ `prontclinic-app` | 🟢 **Synced/Healthy** |
| **Painel-Clinic** | ✅ `deploy-painel.yml` | ✅ `update-manifest-painel.yml` | ✅ `prontclinic-painel` | 🟢 **Synced/Healthy** |

## 🎯 Como Testar o Fluxo Completo

### 1️⃣ Teste do Back-Clinic

```bash
# Acessar o repositório
cd Back-Clinic

# Fazer uma mudança de teste
echo "test: $(date +%Y%m%d%H%M%S)" > TEST_DEPLOY_$(date +%Y%m%d%H%M%S).txt

# Commit e push
git add .
git commit -m "test: validar fluxo automático de deploy"
git push origin ptcc-development
```

**Acompanhar**:
1. GitHub Actions: https://github.com/Prontdental-br/Back-Clinic/actions
2. Infra-Clinic Actions: https://github.com/Prontdental-br/Infra-Clinic/actions
3. ArgoCD: Veja `prontclinic-api` sincronizando

**Verificar no cluster**:
```bash
# Ver pods sendo recriados
kubectl get pods -n ptcc-development -w

# Ver a nova imagem
kubectl get deployment prontclinic-api -n ptcc-development \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### 2️⃣ Teste do Front-Clinic

**⚠️ Pré-requisito**: Configurar secrets no repositório Front-Clinic

```bash
# GitHub → Front-Clinic → Settings → Secrets → Actions
# Adicionar:
# - DOCKER_USERNAME
# - DOCKER_ACCESS_TOKEN
# - GH_PAT
```

**Depois**:
```bash
cd Front-Clinic

echo "test: $(date +%Y%m%d%H%M%S)" > TEST_DEPLOY_$(date +%Y%m%d%H%M%S).txt

git add .
git commit -m "test: validar fluxo automático de deploy do app"
git push origin ptcc-development
```

**Acompanhar**:
1. GitHub Actions: https://github.com/Prontdental-br/Front-Clinic/actions
2. Infra-Clinic Actions: https://github.com/Prontdental-br/Infra-Clinic/actions
3. ArgoCD: Veja `prontclinic-app` sincronizando

**Verificar no cluster**:
```bash
kubectl get deployment prontclinic-app -n ptcc-development \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### 3️⃣ Teste do Painel-Clinic

**⚠️ Pré-requisito**: Configurar secrets no repositório Painel-Clinic

```bash
# GitHub → Painel-Clinic → Settings → Secrets → Actions
# Adicionar:
# - DOCKER_USERNAME
# - DOCKER_ACCESS_TOKEN
# - GH_PAT
```

**Depois**:
```bash
cd Painel-Clinic

echo "test: $(date +%Y%m%d%H%M%S)" > TEST_DEPLOY_$(date +%Y%m%d%H%M%S).txt

git add .
git commit -m "test: validar fluxo automático de deploy do painel"
git push origin ptcc-development
```

**Acompanhar**:
1. GitHub Actions: https://github.com/Prontdental-br/Painel-Clinic/actions
2. Infra-Clinic Actions: https://github.com/Prontdental-br/Infra-Clinic/actions
3. ArgoCD: Veja `prontclinic-painel` sincronizando

**Verificar no cluster**:
```bash
kubectl get deployment prontclinic-painel -n ptcc-development \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

## 📊 Monitoramento do Fluxo

### Ver todos os workflows em execução

```bash
# GitHub CLI (se instalado)
gh run list --repo Prontdental-br/Back-Clinic
gh run list --repo Prontdental-br/Infra-Clinic
```

### Ver status das aplicações ArgoCD

```bash
# Listar todas
kubectl get applications -n argocd

# Ver detalhes de uma aplicação
kubectl describe application prontclinic-api -n argocd

# Ver logs do ArgoCD
kubectl logs -n argocd deployment/argocd-application-controller -f
```

### Ver pods no cluster

```bash
# Listar todos os pods
kubectl get pods -n ptcc-development

# Ver logs de um pod
kubectl logs -n ptcc-development <pod-name>

# Descrever um pod
kubectl describe pod -n ptcc-development <pod-name>
```

## 🎬 Timeline Esperado

```
00:00 → Commit + Push
00:01 → GitHub Actions inicia build (projeto)
00:05 → Build Docker completo
00:07 → Push para Docker Hub completo
00:08 → repository_dispatch enviado para Infra-Clinic
00:09 → Workflow Infra-Clinic inicia
00:10 → Manifest atualizado e commitado em ptcc-production
00:11 → ArgoCD detecta mudança (polling a cada 3 min)
00:12 → ArgoCD inicia sync
00:13 → Deployment atualizado no cluster
00:14 → Pods antigos sendo terminados
00:15 → Pods novos iniciando
00:17 → Pods novos prontos (ReadinessProbe OK)
00:18 ✅ DEPLOY COMPLETO!
```

**Total**: ~18 minutos (pode variar)

## 🔍 Checklist de Verificação

### Antes do teste:

- [ ] Secrets configurados no repositório do projeto
  - [ ] `DOCKER_USERNAME`
  - [ ] `DOCKER_ACCESS_TOKEN`
  - [ ] `GH_PAT` (com permissões `repo` + `workflow`)
- [ ] Workflow de build existe (`.github/workflows/deploy-*.yml`)
- [ ] Workflow de update existe no Infra-Clinic
- [ ] Aplicação ArgoCD criada e Synced

### Durante o teste:

- [ ] GitHub Actions do projeto executou sem erros
- [ ] Imagem foi construída e enviada ao Docker Hub
- [ ] `repository_dispatch` foi disparado
- [ ] GitHub Actions do Infra-Clinic executou
- [ ] Manifest foi atualizado com nova tag
- [ ] Commit foi feito na branch `ptcc-production`
- [ ] ArgoCD detectou a mudança
- [ ] ArgoCD fez sync da aplicação

### Após o deploy:

- [ ] Pods foram recriados com a nova imagem
- [ ] Pods estão no status `Running`
- [ ] Pods passaram nos health checks
- [ ] Aplicação está respondendo corretamente

## 🐛 Troubleshooting Rápido

### Build falhou no GitHub Actions

**Verificar**:
- Logs do workflow
- Secrets estão configurados?
- Dockerfile está correto?
- Dependências estão acessíveis?

### Manifest não foi atualizado

**Verificar**:
- Workflow no Infra-Clinic executou?
- `GH_PAT` tem permissões corretas?
- Branch `ptcc-production` está correta?
- `sed` command está correto?

### ArgoCD não fez deploy

**Verificar**:
```bash
# Status da aplicação
kubectl get application <nome> -n argocd -o yaml

# Logs do ArgoCD
kubectl logs -n argocd deployment/argocd-application-controller

# Forçar sync
kubectl patch application <nome> -n argocd \
  --type merge -p '{"operation": {"sync": {"revision": "HEAD"}}}'
```

### Pods não iniciam

**Verificar**:
```bash
# Ver eventos
kubectl get events -n ptcc-development --sort-by='.lastTimestamp'

# Descrever pod
kubectl describe pod <pod-name> -n ptcc-development

# Ver logs
kubectl logs <pod-name> -n ptcc-development

# Verificar secrets
kubectl get secret dockerhub-secret -n ptcc-development
```

## 📚 Referências

- [Automação de Deploy - Guia Completo](./AUTOMACAO_DEPLOY.md)
- [Fluxo de Automação - Diagramas](./FLUXO_AUTOMACAO.md)
- [Como Criar Token GitHub](./COMO_CRIAR_TOKEN_GITHUB.md)

## ✅ Teste Bem-Sucedido

Um teste completo bem-sucedido deve resultar em:

1. ✅ Build executado sem erros
2. ✅ Imagem no Docker Hub com nova tag
3. ✅ Manifest atualizado no Infra-Clinic
4. ✅ Aplicação ArgoCD sincronizada
5. ✅ Pods recriados com nova imagem
6. ✅ Aplicação funcionando corretamente

---

**💡 Dica**: Faça testes em horários de baixo tráfego e sempre monitore os logs durante o processo!

