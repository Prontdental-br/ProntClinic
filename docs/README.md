# 📚 Documentação ProntClinic

Bem-vindo à documentação central do projeto ProntClinic!

## 🚀 Deploy & CI/CD

### Guias Principais

1. **[Automação de Deploy](./AUTOMACAO_DEPLOY.md)** 📋
   - Guia completo de como funciona o CI/CD
   - Configuração de workflows
   - Troubleshooting
   - Checklist de configuração

2. **[Fluxo de Automação - Diagramas](./FLUXO_AUTOMACAO.md)** 🔄
   - Diagramas visuais do fluxo completo
   - Explicação detalhada de cada etapa
   - Timeline de deploy
   - Conceitos de GitOps e CD

3. **[Como Criar Token GitHub](./COMO_CRIAR_TOKEN_GITHUB.md)** 🔑
   - Passo a passo para criar PAT
   - Permissões necessárias
   - Como configurar nos repositórios

## 🎯 Quick Start

### Para automatizar deploy de um novo projeto:

1. **Copie o workflow de build**:
   ```bash
   cp Back-Clinic/.github/workflows/deploy-api.yml \
      Seu-Projeto/.github/workflows/deploy-seu-projeto.yml
   ```

2. **Configure os secrets** no GitHub (Settings → Secrets → Actions):
   - `DOCKER_USERNAME`
   - `DOCKER_ACCESS_TOKEN`
   - `GH_PAT` (veja [como criar](./COMO_CRIAR_TOKEN_GITHUB.md))

3. **Crie o workflow de atualização** no Infra-Clinic:
   ```bash
   cp Infra-Clinic/.github/workflows/update-manifest-api.yml \
      Infra-Clinic/.github/workflows/update-manifest-seu-projeto.yml
   ```

4. **Teste**:
   ```bash
   cd Seu-Projeto
   git add .
   git commit -m "test: verificar automação"
   git push origin ptcc-development
   ```

## 📁 Estrutura dos Projetos

```
ProntClinic/
├── Back-Clinic/          # API Backend
│   └── .github/
│       └── workflows/
│           └── deploy-api.yml
│
├── Front-Clinic/         # Frontend Web
│   └── .github/
│       └── workflows/
│           └── deploy-app.yml
│
├── Painel-Clinic/        # Painel Administrativo
│   └── .github/
│       └── workflows/
│           └── deploy-painel.yml
│
├── Infra-Clinic/         # Infraestrutura & Kubernetes
│   ├── .github/
│   │   └── workflows/
│   │       ├── update-manifest-api.yml
│   │       ├── update-manifest-app.yml
│   │       └── update-manifest-painel.yml
│   ├── k8s-manifests/
│   │   └── development/
│   │       ├── prontclinic-api/
│   │       ├── prontclinic-app/
│   │       └── prontclinic-painel/
│   └── common/
│       └── argocd/
│           └── applications/
│
└── docs/                 # Documentação (você está aqui!)
    ├── README.md
    ├── AUTOMACAO_DEPLOY.md
    ├── FLUXO_AUTOMACAO.md
    └── COMO_CRIAR_TOKEN_GITHUB.md
```

## 🔄 Fluxo Resumido

```
Commit → Build Docker → Push Hub → Update Manifest → ArgoCD Deploy
```

## 🆘 Problemas Comuns

### Workflow não dispara
- ✅ Verifique se `GH_PAT` está configurado
- ✅ Verifique permissões do PAT (`repo` + `workflow`)

### Manifest não atualiza
- ✅ Verifique logs do workflow no Infra-Clinic
- ✅ Verifique se a branch é `ptcc-production`

### ArgoCD não faz deploy
- ✅ Verifique autenticação do ArgoCD no repositório
- ✅ Force sync manual: `argocd app sync NOME-APP`

## 📊 Status dos Projetos

| Projeto | Build Workflow | Manifest Workflow | ArgoCD | Status |
|---------|---------------|-------------------|--------|--------|
| Back-Clinic | ✅ `deploy-api.yml` | ✅ `update-manifest-api.yml` | ✅ Configurado | 🟢 Funcionando |
| Front-Clinic | ✅ `deploy-app.yml` | ✅ `update-manifest-app.yml` | ⚠️ Pendente | 🟡 Configurar ArgoCD |
| Painel-Clinic | ✅ `deploy-painel.yml` | ✅ `update-manifest-painel.yml` | ⚠️ Pendente | 🟡 Configurar ArgoCD |

## 🔗 Links Úteis

- **GitHub Actions - Back-Clinic**: https://github.com/Prontdental-br/Back-Clinic/actions
- **GitHub Actions - Infra-Clinic**: https://github.com/Prontdental-br/Infra-Clinic/actions
- **Docker Hub - Imagens**: https://hub.docker.com/u/prontdentalsoftware
- **ArgoCD**: https://argocd.pronto.dev.br (ajuste conforme sua instalação)

## 💡 Dicas

- Use `workflow_dispatch` para testar workflows manualmente
- Adicione tags de teste para não afetar produção
- Mantenha sempre um histórico de rollback (mínimo 10 revisões)
- Monitore os logs do ArgoCD regularmente

---

**Última atualização**: Novembro 2025

