#!/bin/bash
set -e

echo "=============================================="
echo "     🚀 RINAWARP ONE-CLICK ORACLE FIX SCRIPT"
echo "=============================================="

echo ""
echo "🔍 Detecting all Oracle resources..."
echo ""

# --------- CONFIG ---------
COMPARTMENT_ID=$(oci iam compartment list --query 'data[?contains("name", `rinawarptech`)].id | [0]' --raw-output)

INSTANCE_ID=$(oci compute instance list \
  --compartment-id "$COMPARTMENT_ID" \
  --query 'data[?contains("display-name", `Rinawarp-Api`)].id | [0]' \
  --raw-output)

VNIC_ID=$(oci compute instance list-vnics \
  --instance-id "$INSTANCE_ID" \
  --query 'data[0].id' --raw-output)

SUBNET_ID=$(oci compute instance list-vnics \
  --instance-id "$INSTANCE_ID" \
  --query 'data[0]."subnet-id"' --raw-output)

SEC_LIST_ID=$(oci network subnet get --subnet-id "$SUBNET_ID" \
  --query 'data."security-list-ids"[0]' --raw-output)

NSG_ID=$(oci network network-security-group list \
  --compartment-id "$COMPARTMENT_ID" \
  --query 'data[?contains("display-name", `ig-quick-action-NSG`)].id | [0]' \
  --raw-output)

RT_ID=$(oci network subnet get --subnet-id "$SUBNET_ID" \
  --query 'data."route-table-id"' --raw-output)

IGW_ID=$(oci network internet-gateway list \
  --compartment-id "$COMPARTMENT_ID" \
  --query 'data[?state==`AVAILABLE`].id | [0]' --raw-output)

# --------- CHECKS ---------
echo ""
echo "🔎 VALIDATING detected resources:"
echo "Compartment:     $COMPARTMENT_ID"
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
  exit 1
fi

echo "=============================================="
echo "🛠  APPLYING FIXES..."
echo "=============================================="

# --------- ATTACH NSG TO VNIC ---------
echo "🔧 Attaching NSG to VNIC..."
oci network vnic update --vnic-id "$VNIC_ID" \
  --nsg-ids "[\"$NSG_ID\"]" >/dev/null

# --------- NSG RULES ---------
echo "🔧 Adding NSG rules for ports 22, 80, 443, 4000..."

oci network nsg rules add \
  --network-security-group-id "$NSG_ID" \
  --security-rules '[
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":22,"max":22}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":80,"max":80}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":443,"max":443}}},
    {"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":4000,"max":4000}}}
  ]' >/dev/null

# --------- SECURITY LIST RULES ---------
echo "🔧 Updating Security List rules..."

oci network security-list update \
  --security-list-id "$SEC_LIST_ID" \
  --ingress-security-rules '[
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":22,"max":22}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":80,"max":80}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":443,"max":443}}},
    {"protocol":"6","source":"0.0.0.0/0","tcp-options":{"destination-port-range":{"min":4000,"max":4000}}}
  ]' >/dev/null

# --------- ROUTE TABLE FIX ---------
echo "🔧 Ensuring 0.0.0.0/0 → Internet Gateway exists..."

oci network route-table update \
  --rt-id "$RT_ID" \
  --route-rules "[{\"cidr-block\":\"0.0.0.0/0\",\"network-entity-id\":\"$IGW_ID\"}]" >/dev/null


echo ""
echo "=============================================="
echo "  ⚡ NETWORK FIX APPLIED — TESTING NOW"
echo "=============================================="

PUBLIC_IP=$(oci compute instance list-vnics \
  --instance-id "$INSTANCE_ID" \
  --query 'data[0]."public-ip"' --raw-output)

echo "🌍 Public IP: $PUBLIC_IP"
echo ""

echo "Testing ports..."
sleep 3

for PORT in 22 80 443 4000; do
  nc -zv $PUBLIC_IP $PORT && \
  echo "✅ Port $PORT OPEN" || echo "❌ Port $PORT CLOSED"
done

echo ""
echo "=============================================="
echo "   🟢 DONE — Your networking is now FIXED"
echo "=============================================="
echo "   Wait 1–3 min for Oracle propagation"
echo "=============================================="