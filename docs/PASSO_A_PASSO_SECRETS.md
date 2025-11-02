# 🔐 Passo a Passo: Como Criar os Secrets

## 📋 Visão Geral

Você vai criar **3 secrets** em **2 repositórios** (Front-Clinic e Painel-Clinic):

```
┌─────────────────────────────────────────────┐
│ Secrets necessários (em cada repositório): │
│                                             │
│  1. DOCKER_USERNAME                         │
│  2. DOCKER_ACCESS_TOKEN                     │
│  3. GH_PAT                                  │
└─────────────────────────────────────────────┘
```

---

## 🚀 PARTE 1: Criar DOCKER_ACCESS_TOKEN

### Passo 1: Acesse o Docker Hub

1. Abra seu navegador
2. Vá para: **https://hub.docker.com**
3. Faça **login** com sua conta

### Passo 2: Navegue até Security

```
Clique no seu AVATAR (canto superior direito)
    ↓
Selecione "Account Settings"
    ↓
No menu lateral esquerdo, clique em "Security"
```

### Passo 3: Crie um novo Access Token

1. Na seção **"Access Tokens"**, clique em **"New Access Token"**

2. Preencha o formulário:
   ```
   Access Token Description:
   ┌────────────────────────────────────┐
   │ GitHub Actions - ProntClinic       │
   └────────────────────────────────────┘

   Access permissions:
   ○ Public Repos Only
   ● Read, Write, Delete  (ou Read & Write)
   ```

3. Clique em **"Generate"**

### Passo 4: COPIE O TOKEN AGORA! ⚠️

```
╔══════════════════════════════════════════════════════╗
║  Your new access token                               ║
║                                                       ║
║  dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx              ║
║                                                       ║
║  [Copy]                                              ║
╚══════════════════════════════════════════════════════╝
```

**IMPORTANTE**: 
- ⚠️ Este token **só aparece UMA VEZ**
- 📋 Clique em **"Copy"** e cole em um local seguro temporariamente
- 💾 Você vai precisar deste valor nos próximos passos

---

## 🔑 PARTE 2: Criar GitHub Personal Access Token (GH_PAT)

### Passo 1: Acesse as configurações do GitHub

1. Abra: **https://github.com**
2. Faça **login**
3. Clique na sua **foto de perfil** (canto superior direito)
4. Clique em **"Settings"**

### Passo 2: Navegue até Tokens

```
No menu lateral esquerdo, role até o final
    ↓
Clique em "Developer settings"
    ↓
Clique em "Personal access tokens"
    ↓
Clique em "Tokens (classic)"
```

Ou acesse diretamente: **https://github.com/settings/tokens**

### Passo 3: Gere um novo token

1. Clique no botão **"Generate new token"** (canto superior direito)
2. Selecione **"Generate new token (classic)"**

### Passo 4: Configure o token

```
Note (descrição do token):
┌──────────────────────────────────────────┐
│ ProntClinic CI/CD Automation             │
└──────────────────────────────────────────┘

Expiration:
┌──────────────────────────────────────────┐
│ No expiration                            │  ← Recomendado
└──────────────────────────────────────────┘
(ou escolha 90 days / Custom)
```

### Passo 5: Selecione as permissões

**MARQUE APENAS ESTAS OPÇÕES**:

```
Select scopes:

✅ repo
   └─ ✅ repo:status
   └─ ✅ repo_deployment
   └─ ✅ public_repo
   └─ ✅ repo:invite
   └─ ✅ security_events

✅ workflow
   └─ Update GitHub Action workflows

❌ admin:org (NÃO marque)
❌ admin:public_key (NÃO marque)
❌ (deixe o resto desmarcado)
```

### Passo 6: Gere e copie o token

1. Role até o final da página
2. Clique em **"Generate token"** (botão verde)

3. **COPIE O TOKEN AGORA!** ⚠️

```
╔══════════════════════════════════════════════════════╗
║  Personal access tokens (classic)                    ║
║                                                       ║
║  ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx            ║
║                                                       ║
║  Make sure to copy your personal access token now.   ║
║  You won't be able to see it again!                  ║
║                                                       ║
║  [Copy to clipboard]                                 ║
╚══════════════════════════════════════════════════════╝
```

**IMPORTANTE**:
- ⚠️ Este token **só aparece UMA VEZ**
- 📋 Copie e salve em um local seguro
- 💾 Você vai precisar deste valor nos próximos passos

---

## 📦 PARTE 3: Adicionar Secrets no Front-Clinic

### Passo 1: Acesse o repositório Front-Clinic

1. Abra: **https://github.com/Prontdental-br/Front-Clinic**
2. Clique na aba **"Settings"** (no topo da página)

### Passo 2: Navegue até Secrets

```
No menu lateral esquerdo:
    ↓
Clique em "Secrets and variables"
    ↓
Clique em "Actions"
```

Ou acesse diretamente: **https://github.com/Prontdental-br/Front-Clinic/settings/secrets/actions**

### Passo 3: Adicione o primeiro secret (DOCKER_USERNAME)

1. Clique no botão **"New repository secret"** (canto superior direito)

2. Preencha:
   ```
   Name:
   ┌────────────────────────────────────┐
   │ DOCKER_USERNAME                    │
   └────────────────────────────────────┘

   Secret:
   ┌────────────────────────────────────┐
   │ prontdentalsoftware                │  ← Seu username do Docker Hub
   └────────────────────────────────────┘
   ```

3. Clique em **"Add secret"** (botão verde)

### Passo 4: Adicione o segundo secret (DOCKER_ACCESS_TOKEN)

1. Clique em **"New repository secret"** novamente

2. Preencha:
   ```
   Name:
   ┌────────────────────────────────────┐
   │ DOCKER_ACCESS_TOKEN                │
   └────────────────────────────────────┘

   Secret:
   ┌────────────────────────────────────┐
   │ dckr_pat_xxxxxxxxxxxxxxxxxxxxx     │  ← Cole o token do Docker Hub
   └────────────────────────────────────┘
   ```

3. Clique em **"Add secret"**

### Passo 5: Adicione o terceiro secret (GH_PAT)

1. Clique em **"New repository secret"** novamente

2. Preencha:
   ```
   Name:
   ┌────────────────────────────────────┐
   │ GH_PAT                             │
   └────────────────────────────────────┘

   Secret:
   ┌────────────────────────────────────┐
   │ ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx   │  ← Cole o GitHub PAT
   └────────────────────────────────────┘
   ```

3. Clique em **"Add secret"**

### ✅ Verificar se foi criado

Na página de Secrets, você deve ver:

```
Repository secrets

DOCKER_USERNAME         Updated 1 minute ago    [Update] [Remove]
DOCKER_ACCESS_TOKEN     Updated 1 minute ago    [Update] [Remove]
GH_PAT                  Updated 1 minute ago    [Update] [Remove]
```

---

## 📦 PARTE 4: Adicionar Secrets no Painel-Clinic

**Repita EXATAMENTE os mesmos passos da PARTE 3**, mas agora em:

**https://github.com/Prontdental-br/Painel-Clinic**

### Resumo rápido:

1. Acesse: https://github.com/Prontdental-br/Painel-Clinic
2. Vá em: **Settings → Secrets and variables → Actions**
3. Adicione os 3 secrets:
   - `DOCKER_USERNAME` → (seu username)
   - `DOCKER_ACCESS_TOKEN` → (token do Docker Hub)
   - `GH_PAT` → (GitHub Personal Access Token)

**💡 Dica**: Você pode usar o **mesmo GH_PAT** em ambos os repositórios!

---

## ✅ CHECKLIST FINAL

### Front-Clinic ✓
- [ ] Acessei: https://github.com/Prontdental-br/Front-Clinic/settings/secrets/actions
- [ ] Criei `DOCKER_USERNAME`
- [ ] Criei `DOCKER_ACCESS_TOKEN`
- [ ] Criei `GH_PAT`
- [ ] Vejo os 3 secrets listados

### Painel-Clinic ✓
- [ ] Acessei: https://github.com/Prontdental-br/Painel-Clinic/settings/secrets/actions
- [ ] Criei `DOCKER_USERNAME`
- [ ] Criei `DOCKER_ACCESS_TOKEN`
- [ ] Criei `GH_PAT`
- [ ] Vejo os 3 secrets listados

---

## 🧪 TESTAR SE FUNCIONOU

### Teste do Front-Clinic:

```bash
cd Front-Clinic
echo "test: validar secrets - $(date)" > TEST_SECRETS.txt
git add TEST_SECRETS.txt
git commit -m "test: verificar se secrets estão funcionando"
git push origin ptcc-development
```

**Acompanhar**:
1. Vá para: https://github.com/Prontdental-br/Front-Clinic/actions
2. Clique no workflow que está executando
3. Veja se todas as etapas passam sem erro

**Sinais de sucesso** ✅:
- ✅ "Autenticar no Docker Hub" → passou
- ✅ "Build e Push da Imagem" → passou
- ✅ "Trigger manifest update" → passou

### Teste do Painel-Clinic:

```bash
cd Painel-Clinic
echo "test: validar secrets - $(date)" > TEST_SECRETS.txt
git add TEST_SECRETS.txt
git commit -m "test: verificar se secrets estão funcionando"
git push origin ptcc-development
```

**Acompanhar em**: https://github.com/Prontdental-br/Painel-Clinic/actions

---

## 🚨 Erros Comuns

### Erro: "DOCKER_USERNAME não configurado"
**Causa**: Secret não foi criado ou nome está errado  
**Solução**: Verifique se o nome é exatamente `DOCKER_USERNAME` (maiúsculas)

### Erro: "Error response from daemon: unauthorized"
**Causa**: `DOCKER_ACCESS_TOKEN` inválido  
**Solução**: 
1. Gere um novo token no Docker Hub
2. Atualize o secret no GitHub

### Erro: "repository_dispatch não funciona"
**Causa**: `GH_PAT` sem permissões ou inválido  
**Solução**: 
1. Gere novo token com permissões `repo` + `workflow`
2. Atualize o secret `GH_PAT`

---

## 📸 Resumo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO                           │
└─────────────────────────────────────────────────────────────┘

1. Docker Hub → Security → New Access Token
   └→ Copie: dckr_pat_xxxxxxxxxxxxx

2. GitHub → Settings → Developer settings → Tokens
   └→ Generate token com 'repo' + 'workflow'
   └→ Copie: ghp_xxxxxxxxxxxxx

3. Front-Clinic → Settings → Secrets → Actions
   └→ Add: DOCKER_USERNAME
   └→ Add: DOCKER_ACCESS_TOKEN
   └→ Add: GH_PAT

4. Painel-Clinic → Settings → Secrets → Actions
   └→ Add: DOCKER_USERNAME
   └→ Add: DOCKER_ACCESS_TOKEN
   └→ Add: GH_PAT

5. Teste com um commit em cada repositório
   └→ Verifique em: /actions
```

---

## 🔗 Links Rápidos

| Item | Link Direto |
|------|-------------|
| **Docker Hub** | https://hub.docker.com/settings/security |
| **GitHub Tokens** | https://github.com/settings/tokens |
| **Front-Clinic Secrets** | https://github.com/Prontdental-br/Front-Clinic/settings/secrets/actions |
| **Painel-Clinic Secrets** | https://github.com/Prontdental-br/Painel-Clinic/settings/secrets/actions |
| **Front-Clinic Actions** | https://github.com/Prontdental-br/Front-Clinic/actions |
| **Painel-Clinic Actions** | https://github.com/Prontdental-br/Painel-Clinic/actions |

---

## 💡 Dicas Importantes

1. **Os tokens só aparecem uma vez** - copie imediatamente
2. **Use o mesmo GH_PAT** em ambos os repositórios (Front e Painel)
3. **Nomes são case-sensitive** - use exatamente como mostrado
4. **Guarde os tokens em segurança** - se perder, terá que gerar novos
5. **Teste após configurar** - faça um commit de teste em cada repo

---

**Precisa de ajuda?** 

- 📚 Guia completo: [`docs/SECRETS_NECESSARIOS.md`](./SECRETS_NECESSARIOS.md)
- 🔑 Detalhes do GitHub PAT: [`docs/COMO_CRIAR_TOKEN_GITHUB.md`](./COMO_CRIAR_TOKEN_GITHUB.md)
- 🧪 Como testar: [`docs/TESTE_FLUXO_COMPLETO.md`](./TESTE_FLUXO_COMPLETO.md)

