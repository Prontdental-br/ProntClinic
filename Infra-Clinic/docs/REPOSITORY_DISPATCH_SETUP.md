# 🔄 Configuração de Repository Dispatch para Atualização Automática

## ⚠️ Problema Identificado

O `GITHUB_TOKEN` padrão **não pode fazer `repository_dispatch` em repositórios externos**. Ele só funciona para operações dentro do mesmo repositório.

## 📋 Soluções

### Opção 1: Usar Personal Access Token (PAT) ✅ Recomendado

1. Criar um Personal Access Token (PAT) no GitHub:
   - Vá em: Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Permissões necessárias:
     - `repo` (acesso completo aos repositórios)
     - `workflow` (acesso aos workflows)

2. Adicionar como secret no repositório **Back-Clinic**:
   - Vá em: Settings > Secrets and variables > Actions
   - Crie um secret chamado `GH_PAT` (ou similar)
   - Cole o valor do token

3. Atualizar o workflow `build-and-update.yml`:
   ```yaml
   - name: Trigger manifest update
     uses: peter-evans/repository-dispatch@v2
     with:
       token: ${{ secrets.GH_PAT }}  # Usar PAT ao invés de GITHUB_TOKEN
       repository: Prontdental-br/Infra-Clinic
       event-type: update-manifest-api
       client-payload: |
         {
           "image_tag": "${{ steps.image_tag.outputs.tag }}",
           "docker_image": "${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}"
         }
   ```

### Opção 2: Usar GitHub App

Criar uma GitHub App com permissões de `repository_dispatch` e usar como autenticação.

### Opção 3: Workflow Manual (Workaround)

Disparar o workflow `update-manifest-api` manualmente via `workflow_dispatch` após cada build:

```yaml
- name: Trigger manual update (fallback)
  run: |
    gh workflow run update-manifest-api.yml \
      --repo Prontdental-br/Infra-Clinic \
      -f image_tag="${{ steps.image_tag.outputs.tag }}" \
      -f docker_image="${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}"
```

Requer GitHub CLI (`gh`) e autenticação.

## 🔍 Verificação

Para verificar se o `repository_dispatch` foi recebido:

1. Vá em Actions no repositório **Infra-Clinic**
2. Procure pela execução do workflow `Update Kubernetes Manifest - API`
3. Verifique os logs para confirmar recebimento do evento

## 📝 Nota Importante

O workflow `update-manifest-api.yml` deve estar na branch correta (`ptcc-production` no repositório Infra-Clinic).

