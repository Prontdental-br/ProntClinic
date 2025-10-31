# 🔄 Configuração de Atualização Automática de Manifests

Este documento descreve como os workflows GitHub Actions foram configurados para atualizar automaticamente os manifests Kubernetes no repositório `Infra-Clinic` quando novas imagens Docker são buildadas e publicadas.

## 📋 Visão Geral

Quando uma imagem Docker é buildada e publicada para o Docker Hub, os workflows GitHub Actions atualizam automaticamente os manifests Kubernetes correspondentes no repositório `Infra-Clinic` e fazem commit das mudanças.

### Mapeamento de Aplicações

| Projeto | Manifest Kubernetes | Imagem Docker |
|---------|---------------------|---------------|
| `Back-Clinic` | `prontclinic-api` | `prontdentalsoftware/prontclinic-api` |
| `Front-Clinic` | `prontclinic-app` | `prontdentalsoftware/prontclinic-app` |
| `Painel-Clinic` | `prontclinic-painel` | `prontdentalsoftware/prontclinic-painel` |

## 🚀 Workflows Configurados

Cada projeto tem seu próprio workflow em `.github/workflows/update-manifest.yml`:

### Estrutura dos Workflows

```
Back-Clinic/.github/workflows/update-manifest.yml
Front-Clinic/.github/workflows/update-manifest.yml
Painel-Clinic/.github/workflows/update-manifest.yml
```

### Trigger dos Workflows

Os workflows podem ser disparados de duas formas:

1. **Manual (workflow_dispatch)**:
   - Vá para Actions no GitHub
   - Selecione "Update Kubernetes Manifest"
   - Clique em "Run workflow"
   - Informe a tag da imagem

2. **Automático (push de tags)**:
   - Ao criar uma tag Git: `prontclinic-api-*`, `prontclinic-app-*`, ou `prontclinic-painel-*`
   - Push para branches: `main` ou `ptcc-development`

## 📝 Fluxo de Execução

1. **Workflow é disparado** (manual ou automático)
2. **Checkout do repositório Infra-Clinic** na branch `ptcc-development`
3. **Determinação da tag da imagem** (do input manual ou do git tag)
4. **Atualização do manifest** usando `sed` para substituir a imagem
5. **Commit e Push** automático das mudanças

### Exemplo de Commit Gerado

```
chore: atualizar prontclinic-api para ptcc-development-20251030221633

- Atualizada imagem para prontdentalsoftware/prontclinic-api:ptcc-development-20251030221633
- Auto-atualizado via GitHub Actions workflow
```

## 🔧 Script Auxiliar

Existe também um script local para atualização manual:

```bash
# Uso
./Infra-Clinic/scripts/update-image-manifest.sh <aplicacao> <tag>

# Exemplos
./Infra-Clinic/scripts/update-image-manifest.sh prontclinic-api ptcc-development-20251030221633
./Infra-Clinic/scripts/update-image-manifest.sh prontclinic-app ptcc-development-20251030195523
./Infra-Clinic/scripts/update-image-manifest.sh prontclinic-painel ptcc-development-20251030192408
```

## ⚙️ Configuração Necessária

### 1. Permissões do GitHub Token

O workflow precisa de permissões para:
- `contents: write` - Para fazer commit e push
- `pull-requests: write` - Para criar PRs (opcional)

Essas permissões são configuradas no workflow com:

```yaml
permissions:
  contents: write
  pull-requests: write
```

### 2. Secret GITHUB_TOKEN

O GitHub Actions fornece automaticamente o `GITHUB_TOKEN`, mas se precisar de mais permissões, você pode criar um Personal Access Token (PAT) com escopo `repo` e adicioná-lo como secret.

## 📊 Integração com CI/CD

### Exemplo de Pipeline Completo

1. **Build da Imagem** (no projeto de aplicação):
   ```yaml
   - name: Build and Push Docker Image
     run: |
       docker build -t prontdentalsoftware/prontclinic-api:$TAG .
       docker push prontdentalsoftware/prontclinic-api:$TAG
   ```

2. **Disparar Atualização do Manifest**:
   ```yaml
   - name: Update Kubernetes Manifest
     uses: ./.github/workflows/update-manifest.yml
     with:
       image_tag: ${{ env.TAG }}
   ```

   Ou criar uma tag Git que dispara automaticamente:
   ```bash
   git tag prontclinic-api-ptcc-development-20251030221633
   git push origin prontclinic-api-ptcc-development-20251030221633
   ```

## 🔍 Verificação

Após o workflow executar, você pode verificar:

1. **Commit no repositório Infra-Clinic**:
   ```bash
   git log --oneline -5
   ```

2. **Arquivo atualizado**:
   ```bash
   git diff HEAD~1 Infra-Clinic/k8s-manifests/development/prontclinic-api/prontclinic-api-deployment.yaml
   ```

3. **Status do workflow**:
   - Vá para Actions no GitHub
   - Veja o histórico de execuções

## 🆘 Troubleshooting

### Problema: Workflow não faz commit

**Solução**: Verifique as permissões do token. O `GITHUB_TOKEN` precisa ter permissão de escrita.

### Problema: Erro "Repository not found"

**Solução**: Verifique se o repositório `Prontdental-br/ProntClinic` está acessível e se o token tem permissões.

### Problema: Tag não atualiza corretamente

**Solução**: 
- Verifique o formato da tag no manifest
- Verifique se o `sed` está funcionando corretamente
- Use o script manual para testar

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Actions/Checkout](https://github.com/actions/checkout)

## ✅ Checklist de Configuração

- [ ] Workflows criados em cada projeto
- [ ] Permissões configuradas no workflow
- [ ] Teste manual executado com sucesso
- [ ] Tag Git criada para testar trigger automático
- [ ] Verificado commit no repositório Infra-Clinic
- [ ] Manifest atualizado corretamente

