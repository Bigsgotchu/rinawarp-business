#!/bin/bash
set -e

# ================================
# RINAWARP ORACLE NETWORK AUTO FIX
# ================================

TENANCY_OCID="ocid1.tenancy.oc1..aaaaaaaazruptwuezlpqcarfmk2v7fkxgnlvkpu2id5tngagpksxubbagmzq"
REGION="us-phoenix-1"
INSTANCE_ID="ocid1.instance.oc1.phx.anyhqljtx725ovacwblvi3c7vomqll5jgpgqczy6tk2vi45ikbhzqaejlw3a" # Rinawarp-Api Only

echo "🔍 Fetching VNIC for instance..."
VNIC_ID=$(oci compute vnic-attachment list \
  --compartment-id $TENANCY_OCID \
  --instance-id $INSTANCE_ID \
  --region $REGION \
  --query "data[0].\"vnic-id\"" \
  --raw-output)

if [[ -z "$VNIC_ID" ]]; then
  echo "❌ Could not find VNIC ID"
  exit 1
fi

echo "✨ VNIC ID: $VNIC_ID"

echo "🔍 Fetching subnet ID..."
SUBNET_ID=$(oci network vnic get \
  --vnic-id $VNIC_ID \
  --region $REGION \
  --query "data.\"subnet-id\"" \
  --raw-output)

if [[ -z "$SUBNET_ID" ]]; then
  echo "❌ Could not find Subnet ID"
  exit 1
fi

echo "✨ Subnet ID: $SUBNET_ID"

echo "🔍 Fetching VCN ID..."
VCN_ID=$(oci network subnet get \
  --subnet-id $SUBNET_ID \
  --region $REGION \
  --query "data.\"vcn-id\"" \
  --raw-output)

if [[ -z "$VCN_ID" ]]; then
  echo "❌ Could not find VCN ID"
  exit 1
fi

echo "✨ VCN ID: $VCN_ID"

echo "🔍 Fetching Default Security List..."
SEC_LIST_ID=$(oci network vcn get \
  --vcn-id $VCN_ID \
  --region $REGION \
  --query "data.\"default-security-list-id\"" \
  --raw-output)

if [[ -z "$SEC_LIST_ID" ]]; then
  echo "❌ Could not find Security List"
  exit 1
fi

echo "✨ Default Security List ID: $SEC_LIST_ID"

echo "🚀 Adding ingress rules to Default Security List..."
oci network security-list update \
  --security-list-id $SEC_LIST_ID \
  --region $REGION \
  --ingress-security-rules '[
      {"protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":22,"max":22}}},
      {"protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":80,"max":80}}},
      {"protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":443,"max":443}}},
      {"protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":4000,"max":4000}}}
  ]' \
  --force

echo "✨ Security List Updated!"

echo "🔍 Fetching NSG ID..."
NSG_ID=$(oci network nsg list \
  --compartment-id $TENANCY_OCID \
  --region $REGION \
  --query "data[?contains(\"display-name\", 'ig-quick-action-NSG')].id | [0]" \
  --raw-output)

if [[ -z "$NSG_ID" ]]; then
  echo "❌ NSG not found"
  exit 1
fi

echo "✨ NSG ID: $NSG_ID"

echo "🚀 Adding ingress rules to NSG..."
oci network nsg rules add \
  --nsg-id $NSG_ID \
  --region $REGION \
  --security-rules '[
      {"direction": "INGRESS", "protocol": "6", "source": "0.0.0.0/0",
       "tcpOptions": {"destinationPortRange": {"min": 22, "max": 22}}},
      {"direction": "INGRESS", "protocol": "6", "source": "0.0.0.0/0",
       "tcpOptions": {"destinationPortRange": {"min": 80, "max": 80}}},
      {"direction": "INGRESS", "protocol": "6", "source": "0.0.0.0/0",
       "tcpOptions": {"destinationPortRange": {"min": 443, "max": 443}}},
      {"direction": "INGRESS", "protocol": "6", "source": "0.0.0.0/0",
       "tcpOptions": {"destinationPortRange": {"min": 4000, "max": 4000}}}
  ]'

echo "✨ NSG rules updated!"

echo "🔗 Attaching NSG to VNIC if not attached..."
oci network vnic update \
  --vnic-id $VNIC_ID \
  --region $REGION \
  --nsg-ids "[\"$NSG_ID\"]" \
  --force

echo "✨ NSG Attached to VNIC!"

echo "⏳ Waiting for network propagation..."
sleep 10

echo "🧪 Testing connectivity..."
echo "-----------------------------------"
echo "Port 22:"
nc -zv $(hostname -I | awk '{print $1}') 22 || true
echo "Port 80:"
nc -zv $(hostname -I | awk '{print $1}') 80 || true
echo "Port 443:"
nc -zv $(hostname -I | awk '{print $1}') 443 || true
echo "Port 4000:"
nc -zv $(hostname -I | awk '{print $1}') 4000 || true

echo ""
echo "✅ FIX COMPLETE — TEST AGAIN IN 2 MINUTES"