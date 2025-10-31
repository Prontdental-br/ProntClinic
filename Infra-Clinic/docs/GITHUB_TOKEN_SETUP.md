# 🔐 Configuração de Token do GitHub para ArgoCD

Este guia te ajudará a configurar um token de acesso do GitHub para que o ArgoCD possa acessar o repositório privado `Prontdental-br/prontclinic`.

## 📋 Passo a Passo

### 1️⃣ **Gerar Token do GitHub**

1. **Acesse as configurações do GitHub:**
   - Vá para: https://github.com/settings/tokens
   - Ou: GitHub → Settings → Developer settings → Personal access tokens

2. **Criar novo token:**
   - Clique em **"Generate new token"**
   - Selecione **"Generate new token (classic)"**

3. **Configurar o token:**
   ```
   Note: ArgoCD-ProntClinic
   Expiration: 90 days (ou conforme sua política)
   ```

4. **Selecionar escopos necessários:**
   - ✅ **repo** (Full control of private repositories)
   - ✅ **read:org** (Read org and team membership)

5. **Gerar e copiar:**
   - Clique em **"Generate token"**
   - **COPIE o token imediatamente** (você só verá uma vez!)

### 2️⃣ **Configurar no ArgoCD**

#### Opção A: Usando o Script Automático (Recomendado)

```bash
# 1. Configure suas credenciais
export GITHUB_USERNAME=seu_usuario_github
export GITHUB_TOKEN=ghp_seu_token_aqui

# 2. Execute o script
./scripts/deploy/setup-github-token-argocd.sh
```

#### Opção B: Configuração Manual

```bash
# 1. Criar secret no Kubernetes
kubectl create secret generic prontclinic-repo-secret \
  --from-literal=type=git \
  --from-literal=url=https://github.com/Prontdental-br/prontclinic.git \
  --from-literal=name=prontclinic \
  --from-literal=username="SEU_USUARIO" \
  --from-literal=password="SEU_TOKEN" \
  -n argocd

# 2. Adicionar label para o ArgoCD reconhecer
kubectl label secret prontclinic-repo-secret argocd.argoproj.io/secret-type=repository -n argocd
```

### 3️⃣ **Verificar Configuração**

```bash
# Verificar secret criado
kubectl get secret prontclinic-repo-secret -n argocd

# Verificar repositórios configurados
kubectl get secrets -n argocd -l argocd.argoproj.io/secret-type=repository

# Verificar aplicação
kubectl get applications -n argocd
```

### 4️⃣ **Testar Sincronização**

```bash
# Ver status da aplicação
kubectl get application prontclinic-api -n argocd

# Forçar sincronização
kubectl patch application prontclinic-api -n argocd --type merge -p '{"operation":{"sync":{"syncStrategy":{"hook":{"force":true}}}}}'

# Ver recursos criados
kubectl get all -n ptcc-development -l app=prontclinic-api
```

## 🔍 Troubleshooting

### ❌ **Problema: "authentication required"**

**Causa:** Token inválido ou expirado
**Solução:**
1. Verificar se o token está correto
2. Verificar se o token não expirou
3. Verificar se o usuário tem acesso ao repositório

### ❌ **Problema: "repository not found"**

**Causa:** Repositório privado sem acesso
**Solução:**
1. Verificar se o usuário tem acesso ao repositório
2. Verificar se o token tem escopo `repo`
3. Verificar se o repositório existe

### ❌ **Problema: "permission denied"**

**Causa:** Token sem permissões suficientes
**Solução:**
1. Regenerar token com escopo `repo`
2. Verificar se o usuário é membro da organização

## 📚 Comandos Úteis

```bash
# Ver logs do ArgoCD
kubectl logs -n argocd deployment/argocd-server

# Ver detalhes da aplicação
kubectl describe application prontclinic-api -n argocd

# Ver eventos
kubectl get events -n argocd --sort-by='.lastTimestamp'

# Port forward para acesso local
kubectl port-forward -n argocd svc/argocd-server 8080:80
```

## 🌐 Acesso ao ArgoCD

- **URL:** https://argocd-d.prontclinic.com.br
- **Usuário:** admin
- **Senha:** `kubectl -n argocd get secret argocd-secret -o jsonpath="{.data.admin\.password}" | base64 -d`

## ✅ Verificação Final

Após configurar o token, você deve ver:

1. **Status da aplicação:** `Synced` ou `OutOfSync`
2. **Health:** `Healthy`
3. **Recursos criados:** Pods, Services, Ingress no namespace `ptcc-development`

Se tudo estiver funcionando, o ArgoCD irá sincronizar automaticamente qualquer mudança no repositório GitHub!

