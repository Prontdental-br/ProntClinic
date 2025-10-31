# 🔧 Manifests Compartilhados - ProntDental

Manifests Kubernetes compartilhados entre ambientes de desenvolvimento e produção.

## 📁 Estrutura

```
shared/
└── 📁 ingress/                 # Ingress Controllers
    ├── nginx-ingress-controller.yaml
    ├── nginx-ingress-controller-arm.yaml
    └── traefik-ingress-controller.yaml
```

## 🚀 Deploy Rápido

```bash
# Deploy do NGINX Ingress Controller
kubectl apply -f k8s-manifests/shared/ingress/nginx-ingress-controller.yaml

# Deploy do Traefik Ingress Controller
kubectl apply -f k8s-manifests/shared/ingress/traefik-ingress-controller.yaml
```

## 🔧 Configuração

### **NGINX Ingress Controller**
- **Namespace:** ingress-nginx
- **Tipo:** LoadBalancer
- **IP:** 163.176.250.27
- **Roteamento:** Por domínio

### **Traefik Ingress Controller**
- **Namespace:** traefik-system
- **Tipo:** LoadBalancer
- **SSL:** Automático via Let's Encrypt
- **Roteamento:** Por domínio

## 📋 Comandos Úteis

```bash
# Status dos Ingress Controllers
kubectl get pods -n ingress-nginx
kubectl get pods -n traefik-system

# Logs do NGINX
kubectl logs -n ingress-nginx deployment/nginx-ingress-ingress-nginx-controller

# Logs do Traefik
kubectl logs -n traefik-system deployment/traefik
```

## 🔍 Monitoramento

- **NGINX:** Configurado para roteamento por domínio
- **Traefik:** Configurado para SSL automático
- **IPs:** Reservados e configurados
