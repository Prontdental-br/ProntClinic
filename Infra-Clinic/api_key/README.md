# 🔐 Pasta de Chaves de API - ProntClinic

Esta pasta contém as chaves de autenticação OCI para o projeto ProntClinic.

## 📋 Arquivos Necessários

### 1. Chave Privada OCI
- **Nome do arquivo**: `oci_api_key.pem`
- **Permissões**: `600` (apenas o proprietário pode ler/escrever)
- **Formato**: Chave privada RSA no formato PEM

### 2. Como Adicionar a Chave

```bash
# 1. Colocar a chave privada nesta pasta
cp /caminho/para/sua/chave/privada.pem ./oci_api_key.pem

# 2. Definir permissões corretas
chmod 600 oci_api_key.pem

# 3. Verificar se está correto
ls -la oci_api_key.pem
# Deve mostrar: -rw------- 1 user user
```

## ⚠️ Importante

- **NUNCA** faça commit desta pasta
- Esta pasta está no `.gitignore`
- Mantenha as permissões corretas (600)
- A chave deve ser a correspondente ao fingerprint: `92:61:03:c2:e5:61:81:01:30:a7:09:e7:9a:60:41:2f`

## 🔧 Troubleshooting

### Problema: "Invalid key"
```bash
# Verificar permissões
ls -la oci_api_key.pem

# Corrigir permissões
chmod 600 oci_api_key.pem
```

### Problema: "Key not found"
```bash
# Verificar se o arquivo existe
ls -la oci_api_key.pem

# Verificar se está na pasta correta
pwd
# Deve mostrar: .../Kubernetes/api_key
```

## 📞 Suporte

Para problemas com a chave privada:
1. Verificar se o arquivo existe e tem as permissões corretas
2. Verificar se o fingerprint corresponde ao da chave
3. Verificar se o usuário tem as permissões necessárias no OCI
