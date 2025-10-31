# 🔧 Solução de Problemas de Build - Frontend

## Problemas Identificados e Soluções

### 1. Problemas de Rede durante `yarn install`

**Sintomas:**
- Timeout durante instalação de dependências
- Erro: "There appears to be trouble with your network connection"

**Soluções Implementadas:**

#### Opção 1: Dockerfile Otimizado (Recomendado)
```bash
# Use o Dockerfile atualizado com configurações de rede
docker build -t prontclinic-frontend:latest .
```

#### Opção 2: Dockerfile com NPM
```bash
# Use o Dockerfile alternativo com npm
docker build -f Dockerfile.npm -t prontclinic-frontend:latest .
```

#### Opção 3: Script de Build com Retry
```bash
# Execute o script de build com retry automático
./build-with-retry.sh
```

### 2. Warnings de Peer Dependencies

**Sintomas:**
- Warnings sobre peer dependencies não atendidas
- Conflitos de versões entre pacotes

**Soluções Implementadas:**

1. **Arquivo `.yarnrc`** - Configurações otimizadas do Yarn
2. **Arquivo `.npmrc`** - Configurações do NPM com `legacy-peer-deps`
3. **Overrides no package.json** - Resolução de conflitos específicos

### 3. Configurações de Rede

**Arquivos de Configuração Criados:**

- `.yarnrc` - Configurações do Yarn
- `.npmrc` - Configurações do NPM
- `build-with-retry.sh` - Script com retry automático
- `docker-build.sh` - Script de build do Docker

## Como Usar

### Build com Yarn (Padrão)
```bash
docker build -t prontclinic-frontend:latest .
```

### Build com NPM (Alternativo)
```bash
docker build -f Dockerfile.npm -t prontclinic-frontend:latest .
```

### Build Local com Retry
```bash
./build-with-retry.sh
```

### Script Automático
```bash
./docker-build.sh
```

## Configurações Aplicadas

### Yarn
- `network-timeout: 300000` (5 minutos)
- `network-concurrency: 1` (downloads sequenciais)
- `registry: https://registry.npmjs.org/`

### NPM
- `fetch-timeout: 300000`
- `fetch-retries: 3`
- `legacy-peer-deps: true`
- `strict-peer-deps: false`

## Monitoramento

Para verificar se o build está funcionando:

```bash
# Ver logs do build
docker build --progress=plain -t prontclinic-frontend:latest .

# Testar o container
docker run -p 3000:3000 prontclinic-frontend:latest
```

## Troubleshooting Adicional

Se ainda houver problemas:

1. **Limpe o cache do Docker:**
   ```bash
   docker system prune -a
   ```

2. **Use build sem cache:**
   ```bash
   docker build --no-cache -t prontclinic-frontend:latest .
   ```

3. **Verifique a conectividade:**
   ```bash
   ping registry.npmjs.org
   ```

4. **Use proxy se necessário:**
   ```bash
   docker build --build-arg HTTP_PROXY=http://proxy:port --build-arg HTTPS_PROXY=http://proxy:port -t prontclinic-frontend:latest .
   ```
