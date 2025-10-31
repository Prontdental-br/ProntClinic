# ProntClinic API - Redis Configuration Fix

## Problemas Identificados e Corrigidos

### ❌ **Problemas Anteriores:**
1. **Redis duplicado**: Havia um container Redis no deployment principal E um deployment separado do Redis
2. **Configuração inconsistente**: O initContainer tentava conectar no Redis externo, mas o Redis estava rodando no mesmo pod
3. **Complexidade desnecessária**: A configuração era muito complexa para um ambiente de desenvolvimento
4. **Falta de persistência**: O Redis estava usando `emptyDir` que não persiste dados

### ✅ **Soluções Implementadas:**

#### 1. **Pod Único com Aplicação + Redis**
- Agora temos **um único pod** contendo:
  - Container da aplicação ProntClinic API
  - Container Redis local
  - Volume persistente para dados do Redis

#### 2. **Configuração Simplificada**
- Redis roda como `localhost` dentro do mesmo pod
- Configuração de conexão simplificada
- InitContainer verifica se Redis está pronto antes de iniciar a aplicação

#### 3. **Persistência de Dados**
- Criado PVC (Persistent Volume Claim) para dados do Redis
- Configuração de snapshots automáticos do Redis
- Dados persistem entre reinicializações do pod

#### 4. **Arquivos Removidos**
- `prontclinic-api-redis-deployment.yaml` (não mais necessário)
- `prontclinic-api-redis-service.yaml` (não mais necessário)

## Arquivos Modificados

### `prontclinic-api-deployment.yaml`
- ✅ Redis agora roda como `localhost` no mesmo pod
- ✅ InitContainer corrigido para verificar Redis local
- ✅ Configurações de conexão atualizadas
- ✅ Volume persistente configurado
- ✅ Probes do Redis corrigidos com autenticação

### `prontclinic-api-redis-pvc.yaml` (NOVO)
- ✅ PVC para persistência dos dados do Redis
- ✅ 1GB de armazenamento
- ✅ Acesso ReadWriteOnce

## Configuração do Redis

```yaml
# Redis roda localmente no mesmo pod
REDIS_HOST: "localhost"
REDIS_PORT: "6379"
REDIS_PASSWORD: "redis123"
CACHE_REDIS_URI: "redis://redis123@localhost:6379/0"
```

## Benefícios da Nova Configuração

1. **🚀 Performance**: Comunicação local entre aplicação e Redis
2. **🔧 Simplicidade**: Uma única configuração para gerenciar
3. **💾 Persistência**: Dados do Redis são mantidos entre reinicializações
4. **🛡️ Confiabilidade**: InitContainer garante que Redis esteja pronto
5. **📊 Monitoramento**: Probes de saúde configurados corretamente

## Como Aplicar

```bash
# Aplicar o PVC primeiro
kubectl apply -f prontclinic-api-redis-pvc.yaml

# Aplicar o deployment atualizado
kubectl apply -f prontclinic-api-deployment.yaml

# Verificar o status
kubectl get pods -n ptcc-development -l app=prontclinic-api
kubectl logs -n ptcc-development -l app=prontclinic-api -c prontclinic-api-redis
```

## Verificação

```bash
# Verificar se Redis está funcionando
kubectl exec -n ptcc-development -l app=prontclinic-api -c prontclinic-api-redis -- redis-cli -a redis123 ping

# Verificar logs da aplicação
kubectl logs -n ptcc-development -l app=prontclinic-api -c prontclinic-api
```
