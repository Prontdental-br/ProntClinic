# 🛠️ Scripts de Automação

Scripts organizados por categoria para facilitar a manutenção e deploy.

## 📁 Estrutura

```
scripts/
├── 📁 deploy/             # Scripts de deploy
│   ├── access-pgadmin.sh
│   ├── setup-pgadmin-nginx-final.sh
│   └── test-pgadmin-access.sh
├── 📁 monitoring/         # Scripts de monitoramento
│   └── (futuro)
└── 📁 utils/              # Utilitários
    ├── validate-config.sh
    ├── validate-auth.sh
    └── node-doctor.sh
```

## 🚀 Scripts de Deploy

### **access-pgadmin.sh**
Configura e testa o acesso ao pgAdmin via NGINX Ingress.
```bash
./scripts/deploy/access-pgadmin.sh
```

### **setup-pgadmin-nginx-final.sh**
Setup completo do pgAdmin com NGINX Ingress Controller.
```bash
./scripts/deploy/setup-pgadmin-nginx-final.sh
```

### **test-pgadmin-access.sh**
Testa a conectividade e funcionalidade do pgAdmin.
```bash
./scripts/deploy/test-pgadmin-access.sh
```

## 🔧 Scripts Utilitários

### **validate-config.sh**
Valida a configuração do ambiente antes do deploy.
```bash
./scripts/utils/validate-config.sh
```

### **validate-auth.sh**
Valida a autenticação OCI.
```bash
./scripts/utils/validate-auth.sh
```

### **node-doctor.sh**
Diagnóstico de problemas nos nós do cluster.
```bash
./scripts/utils/node-doctor.sh
```

## 📋 Uso Recomendado

### **1. Validação Inicial**
```bash
# Validar autenticação
./scripts/utils/validate-auth.sh

# Validar configuração
./scripts/utils/validate-config.sh
```

### **2. Deploy do pgAdmin**
```bash
# Setup completo
./scripts/deploy/setup-pgadmin-nginx-final.sh

# Testar acesso
./scripts/deploy/test-pgadmin-access.sh

# Configurar acesso
./scripts/deploy/access-pgadmin.sh
```

### **3. Monitoramento**
```bash
# Verificar status
kubectl get pods --all-namespaces

# Logs
kubectl logs -n ptcc-development deployment/pgadmin
```

## 🔒 Segurança

- ✅ Todos os scripts são executáveis
- ✅ Validação de pré-requisitos
- ✅ Logs detalhados
- ✅ Tratamento de erros

## 📞 Troubleshooting

Se algum script falhar:
1. Verifique os logs de saída
2. Execute `kubectl get pods --all-namespaces`
3. Consulte a documentação em `docs/`
4. Execute os scripts de validação
