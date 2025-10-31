# 🔐 Como Criar Token GitHub para Deploy Automático

## 📋 Tipo de Token Necessário

**Personal Access Token (Classic)** - Token clássico do GitHub

## 🎯 Permissões Necessárias

### ✅ Obrigatórias:
1. **`repo`** - Full control of private repositories
   - Permite acessar repositórios privados
   - Necessário para disparar `repository_dispatch` no repositório `Infra-Clinic`
   - Permite ler/escrever em repositórios

2. **`workflow`** - Update GitHub Action workflows
   - Permite disparar workflows em outros repositórios
   - Necessário para que o `repository_dispatch` funcione corretamente

## 📝 Passo a Passo para Criar o Token

### 1️⃣ Acessar Configurações de Tokens

1. Faça login no GitHub
2. Acesse: **https://github.com/settings/tokens**
   - Ou: GitHub → Seu Perfil → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**

### 2️⃣ Criar Novo Token

1. Clique em **"Generate new token"**
2. Selecione **"Generate new token (classic)"** (NÃO use Fine-grained)
3. Preencha os campos:
   - **Note**: `Back-Clinic Deploy Automation` (ou qualquer nome descritivo)
   - **Expiration**: Escolha a duração:
     - ✅ **90 days** (recomendado para testes)
     - ✅ **No expiration** (para produção - mais seguro usar rotação)

### 3️⃣ Selecionar Permissões (Scopes)

Marque APENAS as permissões necessárias:

#### ✅ Obrigatórias:
- ✅ **repo** (Full control of private repositories)
  - Marque todas as sub-opções se aparecer:
    - repo:status
    - repo_deployment
    - public_repo
    - repo:invite
    - security_events

- ✅ **workflow** (Update GitHub Action workflows)

#### ⚠️ Opcionais (mas recomendadas para depuração):
- ✅ **read:org** (Read org and team membership)
  - Útil se os repositórios estão em uma organização

### 4️⃣ Gerar e Copiar o Token

1. Role até o final da página
2. Clique em **"Generate token"**
3. ⚠️ **COPIE O TOKEN IMEDIATAMENTE** - você só verá ele uma vez!
4. O token terá o formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 5️⃣ Configurar no Repositório Back-Clinic

1. Acesse: **https://github.com/Prontdental-br/Back-Clinic/settings/secrets/actions**
2. Clique em **"New repository secret"**
3. Configure:
   - **Name**: `GH_PAT`
   - **Secret**: Cole o token que você copiou (formato `ghp_...`)
4. Clique em **"Add secret"**

## ✅ Verificar Configuração

Após configurar, teste fazendo um commit:

```bash
cd Back-Clinic
echo "test: verificar token" >> TEST_TOKEN.txt
git add TEST_TOKEN.txt
git commit -m "test: verificar GH_PAT"
git push origin ptcc-development
```

Verifique nos Actions do Back-Clinic se o step "Trigger manifest update" agora executa com sucesso.

## 🔒 Segurança

⚠️ **Importante**:
- O token tem acesso completo aos seus repositórios
- **NÃO** commite o token no código
- Use apenas como **secret** no GitHub
- Se o token for exposto, revogue imediatamente e crie um novo
- Considere rotação periódica de tokens (especialmente em produção)

## 🛠️ Troubleshooting

### Erro: "Resource not accessible by personal access token"
- Verifique se o token tem permissão `repo`
- Verifique se o token não expirou
- Verifique se o nome do secret está correto: `GH_PAT`

### Erro: "Workflow dispatch failed"
- Verifique se o token tem permissão `workflow`
- Verifique se o repositório destino (`Infra-Clinic`) existe e é acessível

### Token não funciona após renovação
- O token antigo continua funcionando até expirar
- Se você criou um novo token, certifique-se de atualizar o secret `GH_PAT` no GitHub

## 📚 Referências

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Repository Dispatch API](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

