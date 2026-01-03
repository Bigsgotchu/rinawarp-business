#!/bin/bash
set -e

echo "=============================================="
echo "     🚀 RINAWARP ORACLE FIX SCRIPT"
echo "     (Manual Configuration Required)"
echo "=============================================="
echo ""
echo "This script requires manual configuration of Oracle Cloud Infrastructure."
echo "Please provide the following OCIDs:"
echo ""

# Manual configuration
read -p "Enter your Compartment OCID: " COMPARTMENT_ID
read -p "Enter your Instance Name (e.g., Rinawarp-Api): " INSTANCE_NAME
read -p "Enter your NSG Name (e.g., ig-quick-action-NSG): " NSG_NAME
read -p "Enter your Oracle Region (e.g., us-phoenix-1): " REGION

echo ""
echo "🔍 Discovering Oracle resources with provided configuration..."
echo "Compartment: $COMPARTMENT_ID"
echo "Instance Name: $INSTANCE_NAME"
echo "NSG Name: $NSG_NAME"
echo "Region: $REGION"
echo ""

# Discover resources
INSTANCE_ID=$(oci compute instance list \
  --compartment-id "$COMPARTMENT_ID" \
  --region "$REGION" \
  --query "data[?contains(\"display-name\", \`$INSTANCE_NAME\`)].id | [0]" \
  --raw-output)

if [[ -z "$INSTANCE_ID" || "$INSTANCE_ID" == "null" ]]; then
  echo "❌ Could not find instance with name: $INSTANCE_NAME"
  echo "Please verify the instance name and compartment ID."
  exit 1
fi

VNIC_ID=$(oci compute instance list-vnics \
  --instance-id "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'data[0].id' --raw-output)

SUBNET_ID=$(oci compute instance list-vnics \
  --instance-id "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'data[0]."subnet-id"' --raw-output)

SEC_LIST_ID=$(oci network subnet get --subnet-id "$SUBNET_ID" \
  --region "$REGION" \
  --query 'data."security-list-ids"[0]' --raw-output)

NSG_ID=$(oci network network-security-group list \
  --compartment-id "$COMPARTMENT_ID" \
  --region "$REGION" \
  --query "data[?contains(\"display-name\", \`$NSG_NAME\`)].id | [0]" \
  --raw-output)

RT_ID=$(oci network subnet get --subnet-id "$SUBNET_ID" \
  --region "$REGION" \
  --query 'data."route-table-id"' --raw-output)

IGW_ID=$(oci network internet-gateway list \
  --compartment-id "$COMPARTMENT_ID" \
  --region "$REGION" \
  --query 'data[?state==`AVAILABLE`].id | [0]' --raw-output)

# Validate resources
echo ""
echo "🔎 VALIDATING detected resources:"
echo "Instance:        $INSTANCE_ID"
echo "VNIC:            $VNIC_ID"
echo "Subnet:          $SUBNET_ID"
echo "Security List:   $SEC_LIST_ID"
echo "NSG:             $NSG_ID"
echo "Route Table:     $RT_ID"
echo "Internet GW:     $IGW_ID"
echo ""

if [[ -z "$VNIC_ID" || -z "$SUBNET_ID" || -z "$SEC_LIST_ID" || -z "$NSG_ID" ]]; then
  echo "❌ Missing required resource IDs. Cannot continue."
  echo "Please verify your configuration and ensure resources exist."
  exit 1
fi

echo "=============================================="
echo "🛠  APPLYING FIXES..."
echo "=============================================="

# Attach NSG to VNIC
echo "🔧 Attaching NSG to VNIC..."
oci network vnic update \
  --vnic-id "$VNIC_ID" \
  --region "$REGION" \
  --nsg-ids "[\"$NSG_ID\"]" >/dev/null

# NSG Rules
echo "🔧 Adding NSG rules for ports 22, 80, 443, 4000..."
oci network nsg rules add \
  --network-security-group-id "$NSG_ID" \
  --region "$REGION" \
  --security-rules '[
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":22,"max":22}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":80,"max":80}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":443,"max":443}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":4000,"max":4000}}}
  ]' >/dev/null

# Security List Rules
echo "🔧 Updating Security List rules..."
oci network security-list update \
  --security-list-id "$SEC_LIST_ID" \
  --region "$REGION" \
  --ingress-security-rules '[
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":22,"max":22}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":80,"max":80}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":443,"max":443}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":4000,"max":4000}}}
  ]' >/dev/null

# Route Table Fix
echo "🔧 Ensuring 0.0.0.0/0 → Internet Gateway exists..."
oci network route-table update \
  --rt-id "$RT_ID" \
  --region "$REGION" \
  --route-rules "[{\"cidr-block\":\"0.0.0.0/0\",\"network-entity-id\":\"$IGW_ID\"}]" >/dev/null

echo ""
echo "=============================================="
echo "  ⚡ NETWORK FIX APPLIED — TESTING NOW"
echo "=============================================="

PUBLIC_IP=$(oci compute instance list-vnics \
  --instance-id "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'data[0]."public-ip"' --raw-output)

echo "🌍 Public IP: $PUBLIC_IP"
echo ""

echo "Testing ports..."
sleep 3

for PORT in 22 80 443 4000; do
  nc -zv $PUBLIC_IP $PORT 2>/dev/null && \
  echo "✅ Port $PORT OPEN" || echo "❌ Port $PORT CLOSED"
done

echo ""
echo "=============================================="
echo "   🟢 DONE — Your networking is now FIXED"
echo "=============================================="
echo "   Wait 1–3 min for Oracle propagation"
echo "   Instance: $INSTANCE_NAME ($PUBLIC_IP)"
echo "=============================================="

# Save configuration for future use
echo ""
echo "💾 Configuration saved for future use:"
cat > oracle-config.env << EOF
# Oracle Cloud Infrastructure Configuration
COMPARTMENT_ID="$COMPARTMENT_ID"
INSTANCE_NAME="$INSTANCE_NAME"
NSG_NAME="$NSG_NAME"
REGION="$REGION"
INSTANCE_ID="$INSTANCE_ID"
VNIC_ID="$VNIC_ID"
SUBNET_ID="$SUBNET_ID"
SEC_LIST_ID="$SEC_LIST_ID"
NSG_ID="$NSG_ID"
PUBLIC_IP="$PUBLIC_IP"
EOF

echo "✅ Configuration saved to oracle-config.env"
echo ""
echo "Next time, you can source this file and run the script again."