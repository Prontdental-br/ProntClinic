#!/bin/bash

# Support Bundle Script para Oracle Support
# Baseado na documentação oficial: https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengtroubleshooting_topic-node_troubleshooting.htm

echo "📦 Gerando Support Bundle para Oracle Support"
echo "=============================================="

# Criar diretório para o bundle
BUNDLE_DIR="support-bundle-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BUNDLE_DIR

# Informações do cluster
CLUSTER_ID=$(terraform output -raw cluster_id)
echo "Cluster ID: $CLUSTER_ID" > $BUNDLE_DIR/cluster-info.txt

# Informações de rede
echo "🌐 Coletando informações de rede..."
terraform output > $BUNDLE_DIR/terraform-outputs.txt

# Informações do cluster
echo "📡 Coletando informações do cluster..."
oci ce cluster get --cluster-id $CLUSTER_ID > $BUNDLE_DIR/cluster-details.json

# Informações do node pool (se existir)
NODE_POOL_ID=$(terraform output -raw node_pool_id 2>/dev/null || echo "N/A")
if [ "$NODE_POOL_ID" != "N/A" ]; then
    echo "🔧 Coletando informações do node pool..."
    oci ce node-pool get --node-pool-id $NODE_POOL_ID > $BUNDLE_DIR/node-pool-details.json
fi

# Informações de rede detalhadas
echo "🌍 Coletando informações de rede detalhadas..."
PRIVATE_SUBNET_ID=$(terraform output -raw private_subnet_id)
PUBLIC_SUBNET_ID=$(terraform output -raw public_subnet_id)

oci network subnet get --subnet-id $PRIVATE_SUBNET_ID > $BUNDLE_DIR/private-subnet.json
oci network subnet get --subnet-id $PUBLIC_SUBNET_ID > $BUNDLE_DIR/public-subnet.json

# Security lists
echo "🔒 Coletando security lists..."
oci network security-list get --security-list-id $(oci network subnet get --subnet-id $PRIVATE_SUBNET_ID --query 'data."security-list-ids"[0]' --raw-output) > $BUNDLE_DIR/private-security-list.json
oci network security-list get --security-list-id $(oci network subnet get --subnet-id $PUBLIC_SUBNET_ID --query 'data."security-list-ids"[0]' --raw-output) > $BUNDLE_DIR/public-security-list.json

# Route tables
echo "🛣️ Coletando route tables..."
oci network route-table get --rt-id $(oci network subnet get --subnet-id $PRIVATE_SUBNET_ID --query 'data."route-table-id"' --raw-output) > $BUNDLE_DIR/private-route-table.json
oci network route-table get --rt-id $(oci network subnet get --subnet-id $PUBLIC_SUBNET_ID --query 'data."route-table-id"' --raw-output) > $BUNDLE_DIR/public-route-table.json

# Gateways
echo "🌉 Coletando informações dos gateways..."
NAT_GATEWAY_ID=$(terraform output -raw nat_gateway_id)
SERVICE_GATEWAY_ID=$(terraform output -raw service_gateway_id)

oci network nat-gateway get --nat-gateway-id $NAT_GATEWAY_ID > $BUNDLE_DIR/nat-gateway.json
oci network service-gateway get --service-gateway-id $SERVICE_GATEWAY_ID > $BUNDLE_DIR/service-gateway.json

# Logs de work requests
echo "📋 Coletando work requests..."
oci ce work-request list --compartment-id $(grep compartment_id terraform.tfvars | cut -d'"' -f2) --resource-id $CLUSTER_ID > $BUNDLE_DIR/work-requests.json

# Configuração do Terraform
echo "⚙️ Coletando configuração do Terraform..."
cp main.tf $BUNDLE_DIR/
cp variables.tf $BUNDLE_DIR/
cp terraform.tfvars $BUNDLE_DIR/

# Criar arquivo de resumo
echo "📄 Criando resumo do problema..."
cat > $BUNDLE_DIR/problem-summary.txt << EOF
PROBLEMA: Node Registration Timeout no OKE
==========================================

Descrição:
- Cluster OKE criado com sucesso
- Node pool falha ao registrar nós após timeout
- Erro: "1 nodes(s) register timeout"

Configuração:
- Região: sa-saopaulo-1
- Cluster: kt-cluster-prontclinic-prod
- Node Pool: kt-cluster-prontclinic-prod-np
- Shape: VM.Standard.A2.Flex
- Imagem: Oracle Linux 8.10

Tentativas realizadas:
1. ✅ Provider OCI atualizado para 6.37.0
2. ✅ Security lists configurados conforme documentação
3. ✅ Imagem Oracle Linux 8.10 mais recente
4. ✅ Configuração de rede otimizada
5. ✅ Node Doctor script executado

Próximos passos recomendados:
1. Abrir Service Request com Oracle Support
2. Anexar este support bundle
3. Solicitar investigação específica da região sa-saopaulo-1
4. Considerar usar Quick Create workflow

Data: $(date)
EOF

# Criar arquivo tar
echo "📦 Criando arquivo de suporte..."
tar -czf "${BUNDLE_DIR}.tar.gz" $BUNDLE_DIR/

echo "✅ Support bundle criado: ${BUNDLE_DIR}.tar.gz"
echo "📋 Para abrir Service Request:"
echo "1. Acesse: https://support.oracle.com"
echo "2. Anexe o arquivo: ${BUNDLE_DIR}.tar.gz"
echo "3. Descreva o problema: Node Registration Timeout"
echo "4. Mencione que já seguiu a documentação oficial OKE"

