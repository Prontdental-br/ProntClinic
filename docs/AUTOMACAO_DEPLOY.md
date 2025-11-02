# 🚀 Automação de Deploy com GitHub Actions + ArgoCD

## 📝 Visão Geral

Este documento explica como funciona a automação completa de deploy dos projetos **ProntClinic**, desde o build da imagem Docker até o deploy automático no Kubernetes via ArgoCD.

## 🔄 Fluxo Completo de Deploy

```
┌─────────────────┐
│  Desenvolvedor  │
│   faz commit    │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────────────────────┐
│  1️⃣ GitHub Actions - Repositório do Projeto   │
│     (Back/Front/Painel-Clinic)                 │
│                                                 │
│  ✅ Build da imagem Docker                     │
│  ✅ Push para Docker Hub                       │
│  ✅ Dispara repository_dispatch                │
└────────┬───────────────────────────────────────┘
         │
         │ repository_dispatch
         │ (com image_tag)
         ▼
┌────────────────────────────────────────────────┐
│  2️⃣ GitHub Actions - Infra-Clinic             │
│                                                 │
│  ✅ Checkout branch ptcc-production            │
│  ✅ Atualiza manifest K8s com nova tag         │
│  ✅ Commit e push da mudança                   │
└────────┬───────────────────────────────────────┘
         │
         │ ArgoCD monitora o repo
         │
         ▼
┌────────────────────────────────────────────────┐
│  3️⃣ ArgoCD                                     │
│                                                 │
│  ✅ Detecta mudança no manifest                │
│  ✅ Aplica automaticamente no cluster          │
│  ✅ Deploy realizado!                          │
└────────────────────────────────────────────────┘
```

## 🏗️ Estrutura dos Workflows

### 1. Workflows de Build (nos repositórios dos projetos)

Cada projeto tem seu próprio workflow de build:

| Projeto | Workflow | Imagem Docker | Event Type |
|---------|----------|---------------|------------|
| **Back-Clinic** | `.github/workflows/deploy-api.yml` | `prontdentalsoftware/prontclinic-api` | `update-manifest-api` |
| **Front-Clinic** | `.github/workflows/deploy-app.yml` | `prontdentalsoftware/prontclinic-app` | `update-manifest-app` |
| **Painel-Clinic** | `.github/workflows/deploy-painel.yml` | `prontdentalsoftware/prontclinic-painel` | `update-manifest-painel` |

#### O que cada workflow faz:

1. **Checkout** do código
2. **Define variáveis**:
   - `TAG_ONLY`: `ptcc-development-20251031195224` (apenas a tag)
   - `IMAGE_TAG`: `prontdentalsoftware/prontclinic-api:ptcc-development-20251031195224` (imagem completa)
   - `STABLE_TAG`: `prontdentalsoftware/prontclinic-api:ptcc-development` (tag estável)
3. **Valida** secrets necessários (`DOCKER_USERNAME`, `DOCKER_ACCESS_TOKEN`)
4. **Faz login** no Docker Hub
5. **Build e Push** da imagem Docker (ARM64)
6. **Dispara `repository_dispatch`** para o repositório `Infra-Clinic` com:
   ```json
   {
     "image_tag": "ptcc-development-20251031195224",
     "docker_image": "prontdentalsoftware/prontclinic-api"
   }
   ```

### 2. Workflows de Atualização de Manifest (no Infra-Clinic)

O repositório **Infra-Clinic** tem 3 workflows que escutam eventos `repository_dispatch`:

| Workflow | Event Type | Manifest Path |
|----------|------------|---------------|
| `update-manifest-api.yml` | `update-manifest-api` | `k8s-manifests/development/prontclinic-api/prontclinic-api-deployment.yaml` |
| `update-manifest-app.yml` | `update-manifest-app` | `k8s-manifests/development/prontclinic-app/prontclinic-app-deployment.yaml` |
| `update-manifest-painel.yml` | `update-manifest-painel` | `k8s-manifests/development/prontclinic-painel/prontclinic-painel-deployment.yaml` |

#### O que cada workflow faz:

1. **Checkout** da branch `ptcc-production` do Infra-Clinic
2. **Extrai** `image_tag` e `docker_image` do payload do `repository_dispatch`
3. **Atualiza** o manifest usando `sed`:
   ```bash
   sed -i "s|image: prontdentalsoftware/prontclinic-api:.*|image: ${FULL_IMAGE}|g" \
     k8s-manifests/development/prontclinic-api/prontclinic-api-deployment.yaml
   ```
4. **Commit e Push** da mudança para a branch `ptcc-production`

### 3. ArgoCD (Monitoramento e Deploy)

O ArgoCD está configurado para monitorar o repositório **Infra-Clinic** (branch `ptcc-production`) e aplicar automaticamente qualquer mudança nos manifests.

#### Configuração ArgoCD:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: prontclinic-api
  namespace: argocd
spec:
  project: ptcc-development
  source:
    repoURL: https://github.com/Prontdental-br/Infra-Clinic.git
    targetRevision: ptcc-production
    path: k8s-manifests/development/prontclinic-api
  destination:
    server: https://kubernetes.default.svc
    namespace: ptcc-development
  syncPolicy:
    automated:
      prune: true          # Remove recursos deletados
      selfHeal: true       # Reverte mudanças manuais
      allowEmpty: false
```

**Políticas de Sync**:
- ✅ **Automated**: Deploy automático quando há mudança
- ✅ **Self-Heal**: Reverte mudanças manuais no cluster
- ✅ **Prune**: Remove recursos deletados do Git

## 🔐 Secrets Necessários

### Em cada repositório de projeto (Back/Front/Painel-Clinic):

| Secret | Descrição | Onde configurar |
|--------|-----------|-----------------|
| `DOCKER_USERNAME` | Usuário do Docker Hub | Settings → Secrets → Actions |
| `DOCKER_ACCESS_TOKEN` | Token de acesso do Docker Hub | Settings → Secrets → Actions |
| `GH_PAT` | Personal Access Token do GitHub com permissões `repo` e `workflow` | Settings → Secrets → Actions |

### Como criar o GitHub PAT:

Veja o documento completo: [`docs/COMO_CRIAR_TOKEN_GITHUB.md`](./COMO_CRIAR_TOKEN_GITHUB.md)

**Permissões necessárias**:
- ✅ `repo` (acesso completo aos repositórios)
- ✅ `workflow` (atualizar workflows do GitHub Actions)

## 🧪 Testando o Fluxo Completo

### 1. Testar manualmente um build:

```bash
# No repositório do projeto (ex: Back-Clinic)
cd Back-Clinic

# Fazer uma mudança de teste
echo "test: $(date)" > TEST_DEPLOY.txt

# Commit e push
git add TEST_DEPLOY.txt
git commit -m "test: verificar automação de deploy"
git push origin ptcc-development
```

### 2. Acompanhar o progresso:

1. **GitHub Actions do projeto**: 
   - Acesse: `https://github.com/Prontdental-br/Back-Clinic/actions`
   - Veja o workflow `Build and Push Docker Image` executando

2. **GitHub Actions do Infra-Clinic**:
   - Acesse: `https://github.com/Prontdental-br/Infra-Clinic/actions`
   - Veja o workflow `Update Kubernetes Manifest - API` executando

3. **ArgoCD**:
   - Acesse: `https://argocd.pronto.dev.br` (ou seu domínio)
   - Veja a aplicação `prontclinic-api` sincronizando

### 3. Verificar o deploy:

```bash
# Ver o pod sendo atualizado
kubectl get pods -n ptcc-development -w

# Ver a imagem atual
kubectl get deployment prontclinic-api -n ptcc-development -o jsonpath='{.spec.template.spec.containers[0].image}'
```

## 🐛 Troubleshooting

### Workflow não dispara no Infra-Clinic

**Problema**: O `repository_dispatch` não aciona o workflow no Infra-Clinic.

**Soluções**:
1. Verificar se o `GH_PAT` está configurado corretamente:
   ```bash
   # No GitHub do projeto: Settings → Secrets → Actions
   # Deve existir: GH_PAT
   ```

2. Verificar se o PAT tem as permissões corretas:
   - ✅ `repo`
   - ✅ `workflow`

3. Verificar os logs do workflow no projeto:
   ```
   Step: "Trigger manifest update"
   ```

### Manifest não é atualizado

**Problema**: O workflow no Infra-Clinic executa mas o manifest não é atualizado.

**Soluções**:
1. Verificar se o `sed` está correto no workflow
2. Verificar se o path do manifest está correto
3. Verificar os logs do workflow `update-manifest-*`

### ArgoCD não faz deploy

**Problema**: O manifest é atualizado mas o ArgoCD não faz deploy.

**Soluções**:
1. Verificar se o ArgoCD tem acesso ao repositório:
   ```bash
   kubectl get secret -n argocd prontclinic-infra
   ```

2. Verificar o status da aplicação:
   ```bash
   kubectl get application prontclinic-api -n argocd -o yaml
   ```

3. Ver logs do ArgoCD:
   ```bash
   kubectl logs -n argocd deployment/argocd-repo-server
   ```

4. Forçar sync manualmente:
   ```bash
   # Via CLI
   argocd app sync prontclinic-api
   
   # Via UI
   # Clique em "Sync" na interface do ArgoCD
   ```

## 📚 Documentos Relacionados

- [`docs/COMO_CRIAR_TOKEN_GITHUB.md`](./COMO_CRIAR_TOKEN_GITHUB.md) - Como criar GitHub PAT
- [`Infra-Clinic/common/argocd/README.md`](../Infra-Clinic/common/argocd/README.md) - Configuração do ArgoCD
- [`Infra-Clinic/docs/GITHUB_PAT_SETUP.md`](../Infra-Clinic/docs/GITHUB_PAT_SETUP.md) - Setup do PAT no Infra-Clinic

## ✅ Checklist de Configuração

Para cada novo projeto que você quiser adicionar ao fluxo de automação:

- [ ] Criar workflow de build (`.github/workflows/deploy-*.yml`)
- [ ] Configurar secrets no GitHub:
  - [ ] `DOCKER_USERNAME`
  - [ ] `DOCKER_ACCESS_TOKEN`
  - [ ] `GH_PAT`
- [ ] Criar workflow de atualização no Infra-Clinic (`update-manifest-*.yml`)
- [ ] Criar manifest Kubernetes no Infra-Clinic (`k8s-manifests/development/*/`)
- [ ] Criar aplicação ArgoCD (`common/argocd/applications/development/*.yaml`)
- [ ] Testar o fluxo completo

## 🎯 Resumo

**Para adicionar automação em um novo projeto:**

1. **Copie o workflow** `deploy-api.yml` e adapte para seu projeto
2. **Configure os secrets** (`DOCKER_USERNAME`, `DOCKER_ACCESS_TOKEN`, `GH_PAT`)
3. **Crie o workflow** `update-manifest-*.yml` no Infra-Clinic
4. **Crie a aplicação** ArgoCD
5. **Teste!** Faça um commit e acompanhe o fluxo

---

**💡 Dica**: Use o comando `workflow_dispatch` para testar manualmente sem fazer push:

```
GitHub → Actions → [Seu workflow] → Run workflow
```

