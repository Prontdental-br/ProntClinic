# 🔑 Secrets Necessários para Automação

## 📋 Resumo Rápido

Você precisa criar **3 secrets** em cada repositório de projeto (Front-Clinic e Painel-Clinic):

| Secret | Descrição | Usado para |
|--------|-----------|------------|
| `DOCKER_USERNAME` | Usuário do Docker Hub | Login no Docker Hub |
| `DOCKER_ACCESS_TOKEN` | Token de acesso do Docker Hub | Autenticação no Docker Hub |
| `GH_PAT` | Personal Access Token do GitHub | Disparar workflows entre repositórios |

---

## 1️⃣ DOCKER_USERNAME

### O que é?
Seu nome de usuário do Docker Hub (ex: `prontdentalsoftware`)

### Como obter?
1. Acesse: https://hub.docker.com
2. Faça login
3. Seu username aparece no canto superior direito

### Exemplo:
```
DOCKER_USERNAME = prontdentalsoftware
```

---

## 2️⃣ DOCKER_ACCESS_TOKEN

### O que é?
Um token de acesso para autenticar no Docker Hub (substitui a senha)

### Como criar?

1. **Acesse Docker Hub**: https://hub.docker.com
2. **Faça login** com sua conta
3. Clique no seu **avatar** (canto superior direito)
4. Vá em **Account Settings**
5. No menu lateral, clique em **Security**
6. Clique em **New Access Token**
7. Preencha:
   - **Description**: `GitHub Actions - ProntClinic`
   - **Access permissions**: `Read, Write, Delete` (ou apenas `Read & Write`)
8. Clique em **Generate**
9. **COPIE O TOKEN AGORA** (ele só aparece uma vez!)

### Exemplo:
```
DOCKER_ACCESS_TOKEN = dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ⚠️ IMPORTANTE:
- **Salve o token em local seguro** (ele não pode ser visualizado novamente)
- Se perder, terá que gerar um novo token

---

## 3️⃣ GH_PAT (GitHub Personal Access Token)

### O que é?
Um token do GitHub com permissões para acessar repositórios e disparar workflows

### Como criar?

#### Passo 1: Acesse as configurações
1. Vá para: https://github.com/settings/tokens
2. Ou navegue: **GitHub → Foto de perfil → Settings → Developer settings → Personal access tokens → Tokens (classic)**

#### Passo 2: Gere novo token
1. Clique em **Generate new token**
2. Selecione **Generate new token (classic)**
3. Preencha:
   - **Note**: `ProntClinic CI/CD Automation`
   - **Expiration**: `No expiration` (ou escolha um período)

#### Passo 3: Selecione as permissões

Marque APENAS estas opções:

```
✅ repo (Full control of private repositories)
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events

✅ workflow (Update GitHub Action workflows)
```

#### Passo 4: Gere e copie
1. Clique em **Generate token** (no final da página)
2. **COPIE O TOKEN IMEDIATAMENTE** (formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. **Salve em local seguro** (não pode ser visto novamente)

### Exemplo:
```
GH_PAT = ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ⚠️ IMPORTANTE:
- Este token dá acesso aos seus repositórios
- **NUNCA compartilhe** ou commite no Git
- Se perder, gere um novo e atualize nos secrets

### 📖 Guia Detalhado:
Ver: [`docs/COMO_CRIAR_TOKEN_GITHUB.md`](./COMO_CRIAR_TOKEN_GITHUB.md)

---

## 📥 Como Adicionar os Secrets no GitHub

### Para Front-Clinic:

1. **Acesse o repositório**: https://github.com/Prontdental-br/Front-Clinic
2. Vá em **Settings** (aba no topo)
3. No menu lateral esquerdo: **Secrets and variables → Actions**
4. Clique em **New repository secret**
5. Adicione cada secret:

```
Nome: DOCKER_USERNAME
Secret: (seu username do Docker Hub)
[Add secret]

Nome: DOCKER_ACCESS_TOKEN
Secret: (seu token do Docker Hub)
[Add secret]

Nome: GH_PAT
Secret: (seu GitHub Personal Access Token)
[Add secret]
```

### Para Painel-Clinic:

Repita o mesmo processo acima, mas acessando:
https://github.com/Prontdental-br/Painel-Clinic

---

## ✅ Verificando se os Secrets Estão Configurados

### Via Interface do GitHub:

1. Acesse: **Repositório → Settings → Secrets and variables → Actions**
2. Você deve ver os 3 secrets listados (sem poder ver os valores):
   ```
   DOCKER_USERNAME
   DOCKER_ACCESS_TOKEN
   GH_PAT
   ```

### Via Workflow (teste):

Depois de configurar os secrets, faça um commit de teste:

```bash
cd Front-Clinic  # ou Painel-Clinic
echo "test: $(date)" > TEST_SECRET.txt
git add TEST_SECRET.txt
git commit -m "test: verificar secrets configurados"
git push origin ptcc-development
```

Acompanhe em: **Repositório → Actions**

Se os secrets estiverem corretos, o workflow deve:
1. ✅ Autenticar no Docker Hub
2. ✅ Fazer build da imagem
3. ✅ Fazer push da imagem
4. ✅ Disparar o workflow no Infra-Clinic

---

## 🔐 Secrets no Kubernetes (já configurados ✅)

Estes secrets já estão configurados no cluster, mas para referência:

### dockerhub-secret
**Localização**: namespace `ptcc-development`  
**Tipo**: `kubernetes.io/dockerconfigjson`  
**Usado para**: Pull de imagens privadas do Docker Hub

**Verificar**:
```bash
kubectl get secret dockerhub-secret -n ptcc-development
```

### prontclinic-infra (ArgoCD)
**Localização**: namespace `argocd`  
**Tipo**: Secret com credenciais Git  
**Usado para**: ArgoCD acessar o repositório Infra-Clinic

**Verificar**:
```bash
kubectl get secret -n argocd | grep prontclinic-infra
```

---

## 🚨 Troubleshooting

### Erro: "DOCKER_USERNAME não configurado"

**Causa**: Secret não foi adicionado ou nome está errado  
**Solução**: Verifique se o nome é exatamente `DOCKER_USERNAME` (case-sensitive)

### Erro: "Error response from daemon: unauthorized"

**Causa**: `DOCKER_ACCESS_TOKEN` inválido ou expirado  
**Solução**: Gere um novo token no Docker Hub e atualize o secret

### Erro: "repository_dispatch não dispara workflow no Infra-Clinic"

**Causa**: `GH_PAT` sem permissões ou inválido  
**Solução**: 
1. Verifique se o PAT tem permissões `repo` + `workflow`
2. Gere um novo se necessário
3. Atualize o secret `GH_PAT`

### Erro: "fatal: Authentication failed"

**Causa**: PAT expirado ou sem permissões  
**Solução**: Gere novo PAT com permissões corretas

---

## 📊 Checklist Final

### Para Front-Clinic:
- [ ] `DOCKER_USERNAME` adicionado
- [ ] `DOCKER_ACCESS_TOKEN` adicionado
- [ ] `GH_PAT` adicionado
- [ ] Teste de commit realizado
- [ ] Workflow executou com sucesso

### Para Painel-Clinic:
- [ ] `DOCKER_USERNAME` adicionado
- [ ] `DOCKER_ACCESS_TOKEN` adicionado
- [ ] `GH_PAT` adicionado
- [ ] Teste de commit realizado
- [ ] Workflow executou com sucesso

---

## 🔗 Links Úteis

- **Docker Hub**: https://hub.docker.com
- **GitHub PAT Settings**: https://github.com/settings/tokens
- **Front-Clinic Secrets**: https://github.com/Prontdental-br/Front-Clinic/settings/secrets/actions
- **Painel-Clinic Secrets**: https://github.com/Prontdental-br/Painel-Clinic/settings/secrets/actions

---

## 💡 Dicas de Segurança

1. ✅ **NUNCA** commite secrets no código
2. ✅ Use secrets do GitHub Actions para valores sensíveis
3. ✅ Configure expiration nos tokens quando possível
4. ✅ Revogue tokens antigos quando gerar novos
5. ✅ Use tokens com menor privilégio necessário
6. ✅ Mantenha um registro seguro dos tokens ativos

---

**Precisa de ajuda?** Veja a documentação completa:
- [Guia Completo de Automação](./AUTOMACAO_DEPLOY.md)
- [Como Criar Token GitHub](./COMO_CRIAR_TOKEN_GITHUB.md)
- [Teste do Fluxo Completo](./TESTE_FLUXO_COMPLETO.md)

