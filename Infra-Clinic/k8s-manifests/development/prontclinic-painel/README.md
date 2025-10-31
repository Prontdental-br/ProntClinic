# ProntClinic Painel (Frontend) - Development Environment

Este diretório contém os manifestos Kubernetes para o frontend do painel da aplicação ProntClinic no ambiente de desenvolvimento.

## Arquivos

- `prontclinic-painel-deployment.yaml` - Deployment da aplicação
- `prontclinic-painel-service.yaml` - Service para exposição interna
- `prontclinic-painel-ingress.yaml` - Ingress para exposição externa com SSL
- `prontclinic-painel-configmap.yaml` - ConfigMap com configurações da aplicação
- `prontclinic-painel-secret.yaml` - Secret com informações sensíveis

## Configuração

### Variáveis de Ambiente

O frontend do painel utiliza as seguintes variáveis de ambiente principais:

- `NODE_ENV`: Ambiente de execução (development)
- `PORT`: Porta da aplicação (3030)
- `NEXT_PUBLIC_OWN_URL`: URL da aplicação (https://painel-d.prontclinic.com.br)

### Recursos

- **CPU**: 100m (request) / 250m (limit)
- **Memória**: 256Mi (request) / 512Mi (limit)
- **Replicas**: 1

### Health Checks

- **Liveness Probe**: `/health` na porta 3030
- **Readiness Probe**: `/health` na porta 3030

## Deploy

Para fazer o deploy da aplicação:

```bash
# Aplicar os manifestos
kubectl apply -f prontclinic-painel-deployment.yaml
kubectl apply -f prontclinic-painel-service.yaml
kubectl apply -f prontclinic-painel-ingress.yaml
kubectl apply -f prontclinic-painel-configmap.yaml
kubectl apply -f prontclinic-painel-secret.yaml

# Verificar o status
kubectl get pods -n ptcc-development -l app=prontclinic-painel
kubectl get svc -n ptcc-development -l app=prontclinic-painel
kubectl get ingress -n ptcc-development -l app=prontclinic-painel
```

## Acesso

A aplicação estará disponível em:
- **URL**: https://painel-d.prontclinic.com.br
- **SSL**: Gerenciado pelo cert-manager com Let's Encrypt

## Dependências

O frontend do painel é uma aplicação estática que não possui dependências externas específicas.

## Monitoramento

- Logs podem ser visualizados via: `kubectl logs -n ptcc-development -l app=prontclinic-painel`
- Métricas de recursos via: `kubectl top pods -n ptcc-development -l app=prontclinic-painel`
