# ProntClinic App (Frontend) - Development Environment

Este diretório contém os manifestos Kubernetes para o frontend da aplicação ProntClinic App no ambiente de desenvolvimento.

## Arquivos

- `prontclinic-app-deployment.yaml` - Deployment da aplicação
- `prontclinic-app-service.yaml` - Service para exposição interna
- `prontclinic-app-ingress.yaml` - Ingress para exposição externa com SSL
- `prontclinic-app-configmap.yaml` - ConfigMap com configurações da aplicação

## Configuração

### Variáveis de Ambiente

O frontend utiliza as seguintes variáveis de ambiente principais:

- `NODE_ENV`: Ambiente de execução (development)
- `PORT`: Porta da aplicação (3000)
- `APP_URL`: URL da aplicação (https://app-d.prontclinic.com.br)

### Recursos

- **CPU**: 100m (request) / 250m (limit)
- **Memória**: 256Mi (request) / 512Mi (limit)
- **Replicas**: 1

### Health Checks

- **Liveness Probe**: `/health` na porta 3000
- **Readiness Probe**: `/health` na porta 3000

## Deploy

Para fazer o deploy da aplicação:

```bash
# Aplicar os manifestos
kubectl apply -f prontclinic-app-deployment.yaml
kubectl apply -f prontclinic-app-service.yaml
kubectl apply -f prontclinic-app-ingress.yaml
kubectl apply -f prontclinic-app-configmap.yaml

# Verificar o status
kubectl get pods -n ptcc-development -l app=prontclinic-app
kubectl get svc -n ptcc-development -l app=prontclinic-app
kubectl get ingress -n ptcc-development -l app=prontclinic-app
```

## Acesso

A aplicação estará disponível em:
- **URL**: https://app-d.prontclinic.com.br
- **SSL**: Gerenciado pelo cert-manager com Let's Encrypt

## Dependências

O frontend é uma aplicação estática que não possui dependências externas específicas.

## Monitoramento

- Logs podem ser visualizados via: `kubectl logs -n ptcc-development -l app=prontclinic-app`
- Métricas de recursos via: `kubectl top pods -n ptcc-development -l app=prontclinic-app`
