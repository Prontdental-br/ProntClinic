# 🔐 Configuração do Personal Access Token (PAT) para Deploy Automático

Este documento descreve como configurar o Personal Access Token (PAT) no GitHub para habilitar a atualização automática de manifests quando imagens Docker são buildadas.

## 📋 Visão Geral

O workflow `build-and-update.yml` no repositório **Back-Clinic** precisa de um PAT para disparar o `repository_dispatch` no repositório **Infra-Clinic** e atualizar automaticamente o manifest Kubernetes.

## 🔑 Configurar Secret no GitHub

### Passo 1: Adicionar Secret no Repositório Back-Clinic

1. Acesse o repositório: https://github.com/Prontdental-br/Back-Clinic
2. Vá em: **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Configure:
   - **Name**: `GH_PAT`
   - **Secret**: Cole o token PAT fornecido
5. Clique em **Add secret**

### Token PAT Configurado

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Importante**: Use seu próprio token, não compartilhe tokens reais em documentação!

## ✅ Como Funciona

1. **Push no Back-Clinic** (branch `ptcc-development`)
   - Workflow `build-and-update.yml` é disparado
   - Faz build da imagem Docker
   - Faz push para Docker Hub
   - Dispara `repository_dispatch` para `Prontdental-br/Infra-Clinic`

2. **Recebimento no Infra-Clinic**
   - Workflow `update-manifest-api.yml` recebe o evento
   - Atualiza o manifest `prontclinic-api-deployment.yaml`
   - Faz commit e push automático na branch `ptcc-production`

## 📝 Verificar Funcionamento

Após configurar o secret, teste fazendo um push no Back-Clinic:

```bash
cd Back-Clinic
echo "test: deploy automático" >> TEST_COMMIT.txt
git add TEST_COMMIT.txt
git commit -m "test: trigger deploy automático"
git push origin ptcc-development
```

Verifique nos Actions:
- **Back-Clinic**: Workflow `Build and Update Manifest` deve executar
- **Infra-Clinic**: Workflow `Update Kubernetes Manifest - API` deve ser disparado automaticamente

## 🔒 Segurança

⚠️ **Importante**:
- O PAT tem acesso completo ao repositório
- Mantenha o token seguro
- Não commite o token no código
- Use apenas como secret no GitHub

## 🛠️ Troubleshooting

### Problema: repository_dispatch não dispara

**Verificar**:
1. Secret `GH_PAT` está configurado no Back-Clinic?
2. Token tem permissões corretas (repo, workflow)?
3. Workflow `update-manifest-api.yml` está na branch `ptcc-production` no Infra-Clinic?

### Problema: Workflow falha com erro de autenticação

**Verificar**:
- Token não expirou
- Token tem permissão `repo` e `workflow`
- Nome do secret está correto: `GH_PAT`

## 📚 Referências

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Repository Dispatch](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

