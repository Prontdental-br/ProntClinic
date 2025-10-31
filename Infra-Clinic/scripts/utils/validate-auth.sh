#!/bin/bash

# =============================================================================
# SCRIPT DE VALIDAÇÃO DE AUTENTICAÇÃO OCI - PRONTCLINIC
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Validando configuração de autenticação OCI para ProntClinic...${NC}"
echo ""

# Verificar se OCI CLI está instalado
if ! command -v oci &> /dev/null; then
    echo -e "${RED}❌ OCI CLI não está instalado${NC}"
    echo "Instale com: curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh | bash"
    exit 1
fi

echo -e "${GREEN}✅ OCI CLI está instalado${NC}"

# Verificar se o arquivo de configuração existe
if [ ! -f ~/.oci/config ]; then
    echo -e "${YELLOW}⚠️  Arquivo de configuração OCI não encontrado${NC}"
    echo "Copie o arquivo de exemplo: cp oci_config_example ~/.oci/config"
    echo "Edite o arquivo para adicionar o caminho da chave privada"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo de configuração OCI encontrado${NC}"

# Verificar se a chave privada existe
if [ ! -f "./api_key/oci_api_key.pem" ]; then
    echo -e "${YELLOW}⚠️  Chave privada não encontrada${NC}"
    echo "Adicione a chave privada em: ./api_key/oci_api_key.pem"
    exit 1
fi

echo -e "${GREEN}✅ Chave privada encontrada${NC}"

# Verificar permissões da chave privada
KEY_PERMS=$(stat -c "%a" ./api_key/oci_api_key.pem 2>/dev/null || echo "000")
if [ "$KEY_PERMS" != "600" ]; then
    echo -e "${YELLOW}⚠️  Permissões da chave privada incorretas (atual: $KEY_PERMS)${NC}"
    echo "Corrigindo permissões..."
    chmod 600 ./api_key/oci_api_key.pem
    echo -e "${GREEN}✅ Permissões corrigidas${NC}"
else
    echo -e "${GREEN}✅ Permissões da chave privada corretas${NC}"
fi

# Testar autenticação
echo ""
echo -e "${BLUE}🧪 Testando autenticação...${NC}"

# Verificar se consegue listar usuários
if oci iam user get --user-id "ocid1.user.oc1..aaaaaaaameqgjjitxorm6cdsnjwaqkrnzi5l3fjz5cn4mglmzj2c6n5jtu2a" --profile PRONTCLINIC &>/dev/null; then
    echo -e "${GREEN}✅ Autenticação OCI funcionando${NC}"
else
    echo -e "${RED}❌ Falha na autenticação OCI${NC}"
    echo "Verifique:"
    echo "1. Se a chave privada está correta"
    echo "2. Se o fingerprint está correto"
    echo "3. Se o usuário tem as permissões necessárias"
    exit 1
fi

# Verificar região
echo -e "${BLUE}🌍 Verificando região...${NC}"
if oci iam region list | grep -q "sa-saopaulo-1"; then
    echo -e "${GREEN}✅ Região sa-saopaulo-1 configurada${NC}"
else
    echo -e "${YELLOW}⚠️  Região sa-saopaulo-1 não encontrada${NC}"
fi

# Verificar compartment
echo -e "${BLUE}📁 Verificando compartment...${NC}"
if oci iam compartment get --compartment-id "ocid1.compartment.oc1..aaaaaaaag5axnqchrn2oi5csox5squb76cdi2zhx5sp2qta3cckd4ub2ijza" --profile PRONTCLINIC &>/dev/null; then
    echo -e "${GREEN}✅ Compartment acessível${NC}"
else
    echo -e "${RED}❌ Compartment não acessível${NC}"
    echo "Verifique se o usuário tem permissões no compartment"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Configuração de autenticação OCI válida!${NC}"
echo -e "${BLUE}📋 Credenciais configuradas:${NC}"
echo "   User OCID: ocid1.user.oc1..aaaaaaaameqgjjitxorm6cdsnjwaqkrnzi5l3fjz5cn4mglmzj2c6n5jtu2a"
echo "   Tenancy OCID: ocid1.tenancy.oc1..aaaaaaaavy552uq26dqwka7lj6ri5m6hs6s5aknim22uyukfvlwgblffbmja"
echo "   Fingerprint: 92:61:03:c2:e5:61:81:01:30:a7:09:e7:9a:60:41:2f"
echo "   Região: sa-saopaulo-1"
echo ""
echo -e "${BLUE}🚀 Pronto para fazer deploy da infraestrutura!${NC}"
echo "Execute: terraform init && terraform plan && terraform apply"
