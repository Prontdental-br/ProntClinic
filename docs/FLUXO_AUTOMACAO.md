# 🔄 Fluxo de Automação - Diagrama Visual

## 📊 Visão Geral do Sistema

```
╔══════════════════════════════════════════════════════════════════════════╗
║                     SISTEMA DE DEPLOY AUTOMÁTICO                         ║
║                          ProntClinic CI/CD                               ║
╚══════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│                        FASE 1: BUILD & PUSH                             │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
    │ Back-Clinic  │      │ Front-Clinic │      │Painel-Clinic │
    │              │      │              │      │              │
    │ deploy-api   │      │ deploy-app   │      │deploy-painel │
    └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
           │                     │                     │
           │ Build Docker        │ Build Docker        │ Build Docker
           │ + Push              │ + Push              │ + Push
           │                     │                     │
           ▼                     ▼                     ▼
    ┌──────────────────────────────────────────────────────────┐
    │                     Docker Hub                           │
    │                                                           │
    │  • prontdentalsoftware/prontclinic-api:TAG              │
    │  • prontdentalsoftware/prontclinic-app:TAG              │
    │  • prontdentalsoftware/prontclinic-painel:TAG           │
    └──────────────────────────────────────────────────────────┘
           │                     │                     │
           │ Trigger             │ Trigger             │ Trigger
           │ repository_dispatch │ repository_dispatch │ repository_dispatch
           │                     │                     │
           └──────────┬──────────┴──────────┬──────────┘
                      │                     │
                      ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FASE 2: UPDATE MANIFESTS                             │
└─────────────────────────────────────────────────────────────────────────┘

              ┌─────────────────────────────────────┐
              │        Infra-Clinic (GitHub)        │
              │     Branch: ptcc-production         │
              │                                     │
              │  ┌─────────────────────────────┐   │
              │  │  update-manifest-api.yml    │   │
              │  │  • Recebe event-type        │   │
              │  │  • Atualiza manifest        │   │
              │  │  • Commit + Push            │   │
              │  └─────────────────────────────┘   │
              │                                     │
              │  ┌─────────────────────────────┐   │
              │  │  update-manifest-app.yml    │   │
              │  │  • Recebe event-type        │   │
              │  │  • Atualiza manifest        │   │
              │  │  • Commit + Push            │   │
              │  └─────────────────────────────┘   │
              │                                     │
              │  ┌─────────────────────────────┐   │
              │  │ update-manifest-painel.yml  │   │
              │  │  • Recebe event-type        │   │
              │  │  • Atualiza manifest        │   │
              │  │  • Commit + Push            │   │
              │  └─────────────────────────────┘   │
              │                                     │
              └──────────────┬──────────────────────┘
                             │
                             │ Commit atualiza
                             │ manifest em
                             │ k8s-manifests/
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FASE 3: ARGOCD SYNC                                │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────┐
                    │      ArgoCD        │
                    │  (Kubernetes)      │
                    │                    │
                    │ • Monitora repo    │
                    │ • Detecta mudança  │
                    │ • Aplica manifest  │
                    └─────────┬──────────┘
                              │
                              │ kubectl apply
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Kubernetes Cluster          │
              │   Namespace: ptcc-development │
              │                               │
              │  ┌─────────────────────┐     │
              │  │  prontclinic-api    │     │
              │  │  Deployment         │     │
              │  │  ✅ Nova imagem     │     │
              │  └─────────────────────┘     │
              │                               │
              │  ┌─────────────────────┐     │
              │  │  prontclinic-app    │     │
              │  │  Deployment         │     │
              │  │  ✅ Nova imagem     │     │
              │  └─────────────────────┘     │
              │                               │
              │  ┌─────────────────────┐     │
              │  │  prontclinic-painel │     │
              │  │  Deployment         │     │
              │  │  ✅ Nova imagem     │     │
              │  └─────────────────────┘     │
              │                               │
              └───────────────────────────────┘
                              │
                              ▼
                      ✅ DEPLOY COMPLETO!
```

## 🔑 Componentes-Chave

### 1. Repository Dispatch

**O que é**: Evento do GitHub Actions que permite um repositório acionar workflows em outro repositório.

**Como funciona**:
```yaml
# No repositório Back-Clinic
- name: Trigger manifest update
  uses: peter-evans/repository-dispatch@v2
  with:
    token: ${{ secrets.GH_PAT }}           # Token com permissão
    repository: Prontdental-br/Infra-Clinic  # Repo alvo
    event-type: update-manifest-api        # Nome do evento
    client-payload: |                      # Dados enviados
      {
        "image_tag": "ptcc-development-20251031195224",
        "docker_image": "prontdentalsoftware/prontclinic-api"
      }
```

**Recebendo no Infra-Clinic**:
```yaml
on:
  repository_dispatch:
    types: [update-manifest-api]  # Escuta esse evento

# Acessa os dados com:
# ${{ github.event.client_payload.image_tag }}
# ${{ github.event.client_payload.docker_image }}
```

### 2. Atualização de Manifest

**Antes**:
```yaml
containers:
- name: prontclinic-api
  image: prontdentalsoftware/prontclinic-api:ptcc-development-20251031120000
```

**Comando sed**:
```bash
sed -i "s|image: prontdentalsoftware/prontclinic-api:.*|image: prontdentalsoftware/prontclinic-api:ptcc-development-20251031195224|g" \
  k8s-manifests/development/prontclinic-api/prontclinic-api-deployment.yaml
```

**Depois**:
```yaml
containers:
- name: prontclinic-api
  image: prontdentalsoftware/prontclinic-api:ptcc-development-20251031195224
```

### 3. ArgoCD Auto-Sync

**Configuração**:
```yaml
syncPolicy:
  automated:
    prune: true       # Remove recursos deletados
    selfHeal: true    # Reverte mudanças manuais
    allowEmpty: false
```

**Comportamento**:
1. ArgoCD faz polling do repo Git a cada 3 minutos (configurável)
2. Detecta que o SHA do commit mudou
3. Compara o manifest Git com o estado atual do cluster
4. Identifica diferenças (nova tag da imagem)
5. Aplica automaticamente a mudança no cluster

## 🎯 Mapeamento Completo

| Projeto | Workflow Build | Docker Image | Event Type | Workflow Update | Manifest Path | ArgoCD App |
|---------|---------------|--------------|------------|-----------------|---------------|------------|
| **Back-Clinic** | `deploy-api.yml` | `prontdentalsoftware/prontclinic-api` | `update-manifest-api` | `update-manifest-api.yml` | `k8s-manifests/development/prontclinic-api/` | `prontclinic-api` |
| **Front-Clinic** | `deploy-app.yml` | `prontdentalsoftware/prontclinic-app` | `update-manifest-app` | `update-manifest-app.yml` | `k8s-manifests/development/prontclinic-app/` | `prontclinic-app` |
| **Painel-Clinic** | `deploy-painel.yml` | `prontdentalsoftware/prontclinic-painel` | `update-manifest-painel` | `update-manifest-painel.yml` | `k8s-manifests/development/prontclinic-painel/` | `prontclinic-painel` |

## 📝 Exemplo Passo a Passo

### Cenário: Deploy do Back-Clinic

```bash
# 1. Desenvolvedor faz commit
cd Back-Clinic
git add .
git commit -m "feat: nova funcionalidade"
git push origin ptcc-development
```

**GitHub Actions (Back-Clinic)**:
```
✅ Checkout código
✅ Build imagem: prontdentalsoftware/prontclinic-api:ptcc-development-20251031195224
✅ Push para Docker Hub
✅ Dispara repository_dispatch para Infra-Clinic
   - event-type: update-manifest-api
   - image_tag: ptcc-development-20251031195224
```

**GitHub Actions (Infra-Clinic)**:
```
✅ Recebe repository_dispatch
✅ Checkout branch ptcc-production
✅ Executa sed para atualizar manifest
✅ Commit: "chore: atualizar prontclinic-api para ptcc-development-20251031195224"
✅ Push para ptcc-production
```

**ArgoCD**:
```
✅ Detecta novo commit em Infra-Clinic/ptcc-production
✅ Compara manifest com estado do cluster
✅ Identifica nova tag de imagem
✅ Aplica mudança no Kubernetes
✅ Deployment atualizado!
```

**Kubernetes**:
```bash
# O Deployment é atualizado
kubectl rollout status deployment/prontclinic-api -n ptcc-development

# Pods são recriados com a nova imagem
kubectl get pods -n ptcc-development
```

## ⏱️ Timeline Típico

```
00:00 → Commit + Push
00:01 → GitHub Actions inicia build
00:05 → Build Docker completo
00:07 → Push para Docker Hub completo
00:08 → repository_dispatch enviado
00:09 → Workflow Infra-Clinic inicia
00:10 → Manifest atualizado e commitado
00:11 → ArgoCD detecta mudança (polling)
00:12 → ArgoCD inicia sync
00:13 → Deployment atualizado
00:14 → Pods antigos sendo terminados
00:15 → Pods novos iniciando
00:17 → Pods novos prontos
00:18 ✅ DEPLOY COMPLETO
```

**Total: ~18 minutos** (pode variar com tamanho da imagem e recursos do cluster)

## 🔍 Como Verificar Cada Etapa

### 1. Build da Imagem
```bash
# Ver workflow no GitHub
https://github.com/Prontdental-br/Back-Clinic/actions

# Ver imagem no Docker Hub
https://hub.docker.com/r/prontdentalsoftware/prontclinic-api/tags
```

### 2. Atualização do Manifest
```bash
# Ver workflow no GitHub
https://github.com/Prontdental-br/Infra-Clinic/actions

# Ver commit no Infra-Clinic
cd Infra-Clinic
git log -1
git show HEAD
```

### 3. Deploy no Kubernetes
```bash
# Ver aplicação no ArgoCD
https://argocd.pronto.dev.br

# Ver status via CLI
kubectl get application prontclinic-api -n argocd

# Ver pods
kubectl get pods -n ptcc-development

# Ver imagem atual
kubectl get deployment prontclinic-api -n ptcc-development \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

## 🎓 Conceitos Importantes

### GitOps
**Definição**: O estado desejado da infraestrutura é declarado em Git, e ferramentas como ArgoCD garantem que o cluster esteja sempre sincronizado com o Git.

**Benefícios**:
- ✅ Histórico completo de mudanças
- ✅ Rollback simples (revert do commit)
- ✅ Auditoria automática
- ✅ Recuperação de desastres (repo = source of truth)

### Continuous Deployment
**Definição**: Cada mudança que passa nos testes é automaticamente implantada em produção.

**Nosso fluxo**:
```
Commit → Build → Test → Push Image → Update Manifest → Deploy
```

### Imutabilidade de Imagens
**Definição**: Cada build gera uma imagem com tag única (timestamp).

**Benefícios**:
- ✅ Rollback preciso
- ✅ Sem cache issues
- ✅ Rastreabilidade completa

---

**📚 Documentos Relacionados**:
- [Automação de Deploy - Guia Completo](./AUTOMACAO_DEPLOY.md)
- [Como Criar Token GitHub](./COMO_CRIAR_TOKEN_GITHUB.md)

