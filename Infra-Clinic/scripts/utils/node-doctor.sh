#!/bin/bash

# Node Doctor Script para OKE - Baseado na documentação oficial
# https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengtroubleshooting_topic-node_troubleshooting.htm

echo "🔍 Node Doctor Script para OKE"
echo "================================"

# Verificar conectividade com o cluster
CLUSTER_ID=$(terraform output -raw cluster_id)
echo "Cluster ID: $CLUSTER_ID"

# Verificar endpoint do cluster
echo "📡 Verificando endpoint do cluster..."
oci ce cluster get --cluster-id $CLUSTER_ID --query 'data."endpoint-config"."is-public-ip-enabled"' --raw-output

# Verificar subnets
echo "🌐 Verificando configuração de rede..."
echo "Subnet pública:"
oci ce cluster get --cluster-id $CLUSTER_ID --query 'data."endpoint-config"."subnet-id"' --raw-output

echo "Subnet privada (node pool):"
terraform output -raw private_subnet_id

# Verificar security lists
echo "🔒 Verificando security lists..."
PRIVATE_SUBNET_ID=$(terraform output -raw private_subnet_id)
oci network security-list get --security-list-id $(oci network subnet get --subnet-id $PRIVATE_SUBNET_ID --query 'data."security-list-ids"[0]' --raw-output) --query 'data."display-name"' --raw-output

# Verificar route tables
echo "🛣️ Verificando route tables..."
oci network route-table get --rt-id $(oci network subnet get --subnet-id $PRIVATE_SUBNET_ID --query 'data."route-table-id"' --raw-output) --query 'data."display-name"' --raw-output

# Verificar NAT Gateway
echo "🌍 Verificando NAT Gateway..."
NAT_GATEWAY_ID=$(terraform output -raw nat_gateway_id)
oci network nat-gateway get --nat-gateway-id $NAT_GATEWAY_ID --query 'data."lifecycle-state"' --raw-output

# Verificar Service Gateway
echo "🔧 Verificando Service Gateway..."
SERVICE_GATEWAY_ID=$(terraform output -raw service_gateway_id)
oci network service-gateway get --service-gateway-id $SERVICE_GATEWAY_ID --query 'data."lifecycle-state"' --raw-output

echo "✅ Diagnóstico concluído!"
echo "📋 Próximos passos:"
echo "1. Verificar se todos os gateways estão ACTIVE"
echo "2. Verificar se as route tables estão configuradas corretamente"
echo "3. Verificar se as security lists permitem tráfego necessário"
echo "4. Se necessário, abrir Service Request com Oracle Support"

