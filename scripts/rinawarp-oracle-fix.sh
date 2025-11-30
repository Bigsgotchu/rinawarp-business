#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo " 🔧 RINAWARP ORACLE NETWORK PERMA-FIX (Rinawarp-Api)"
echo "=============================================="

# 🔐 EDIT THESE ONLY IF YOU CHANGE REGION / TENANCY / INSTANCE
REGION="us-phoenix-1"
TENANCY_OCID="ocid1.tenancy.oc1..aaaaaaaazruptwuezlpqcarfmk2v7fkxgnlvkpu2id5tngagpksxubbagmzq"
COMPARTMENT_OCID="$TENANCY_OCID"
INSTANCE_NAME="Rinawarp-Api"

echo "📍 Region: $REGION"
echo "🏢 Compartment/Tenancy: $COMPARTMENT_OCID"
echo "🖥  Instance Name: $INSTANCE_NAME"
echo

# Make sure oci is using the right region
export OCI_CLI_REGION="$REGION"

echo "🔍 Looking up instance OCID..."
INSTANCE_ID=$(oci compute instance list \
  --compartment-id "$COMPARTMENT_OCID" \
  --all \
  --query "data[?\"display-name\"=='$INSTANCE_NAME'] | [0].id" \
  --raw-output)

if [[ -z "$INSTANCE_ID" || "$INSTANCE_ID" == "null" ]]; then
  echo "❌ Could not find instance with name: $INSTANCE_NAME in $REGION"
  exit 1
fi

echo "✨ Instance ID: $INSTANCE_ID"
echo

echo "🔍 Fetching primary VNIC ID..."
VNIC_ID=$(oci compute instance list-vnics \
  --instance-id "$INSTANCE_ID" \
  --query "data[0].id" \
  --raw-output)

if [[ -z "$VNIC_ID" || "$VNIC_ID" == "null" ]]; then
  echo "❌ Could not find VNIC for instance."
  exit 1
fi
echo "✨ VNIC ID: $VNIC_ID"

SUBNET_ID=$(oci network vnic get \
  --vnic-id "$VNIC_ID" \
  --query "data.\"subnet-id\"" \
  --raw-output)
echo "✨ Subnet ID: $SUBNET_ID"

VCN_ID=$(oci network subnet get \
  --subnet-id "$SUBNET_ID" \
  --query "data.\"vcn-id\"" \
  --raw-output)
echo "✨ VCN ID: $VCN_ID"
echo

echo "🔍 Fetching Default Security List for this VCN..."
SEC_LIST_ID=$(oci network security-list list \
  --compartment-id "$COMPARTMENT_OCID" \
  --vcn-id "$VCN_ID" \
  --query "data[?\"display-name\"=='Default Security List for rinawarp-vcn'] | [0].id" \
  --raw-output)

if [[ -z "$SEC_LIST_ID" || "$SEC_LIST_ID" == "null" ]]; then
  echo "❌ Could not find 'Default Security List for rinawarp-vcn'."
  exit 1
fi
echo "✨ Security List ID: $SEC_LIST_ID"
echo

echo "🔍 Getting current ingress rules..."
CURRENT_RULES_JSON=$(oci network security-list get \
  --security-list-id "$SEC_LIST_ID" \
  --query "data.\"ingress-security-rules\"" \
  --raw-output)

# Build desired rules JSON (22, 80, 443, 4000)
DESIRED_RULES_JSON=$(cat << 'EOF'
[
  {
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "tcpOptions": { "destinationPortRange": { "min": 22, "max": 22 } }
  },
  {
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "tcpOptions": { "destinationPortRange": { "min": 80, "max": 80 } }
  },
  {
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "tcpOptions": { "destinationPortRange": { "min": 443, "max": 443 } }
  },
  {
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "tcpOptions": { "destinationPortRange": { "min": 4000, "max": 4000 } }
  }
]
EOF
)

echo "🚀 Updating Security List ingress rules (22, 80, 443, 4000)..."
oci network security-list update \
  --security-list-id "$SEC_LIST_ID" \
  --ingress-security-rules "$DESIRED_RULES_JSON" \
  > /dev/null

echo "✅ Security List updated."
echo

echo "🔍 Fetching NSG for this VCN (ig-quick-action-NSG)..."
NSG_ID=$(oci network nsg list \
  --compartment-id "$COMPARTMENT_OCID" \
  --vcn-id "$VCN_ID" \
  --query "data[?\"display-name\"=='ig-quick-action-NSG'] | [0].id" \
  --raw-output)

if [[ -z "$NSG_ID" || "$NSG_ID" == "null" ]]; then
  echo "❌ Could not find NSG 'ig-quick-action-NSG'."
  exit 1
fi

echo "✨ NSG ID: $NSG_ID"
echo "🚀 Replacing NSG rules with 22, 80, 443, 4000 (ingress) + all egress..."
NSG_RULES_JSON=$(cat << 'EOF'
[
  {
    "direction": "EGRESS",
    "isStateless": false,
    "protocol": "all",
    "destination": "0.0.0.0/0",
    "destinationType": "CIDR_BLOCK"
  },
  {
    "direction": "INGRESS",
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "description": "SSH",
    "tcpOptions": { "destinationPortRange": { "min": 22, "max": 22 } }
  },
  {
    "direction": "INGRESS",
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "description": "HTTP",
    "tcpOptions": { "destinationPortRange": { "min": 80, "max": 80 } }
  },
  {
    "direction": "INGRESS",
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "description": "HTTPS",
    "tcpOptions": { "destinationPortRange": { "min": 443, "max": 443 } }
  },
  {
    "direction": "INGRESS",
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "description": "Backend API",
    "tcpOptions": { "destinationPortRange": { "min": 4000, "max": 4000 } }
  }
]
EOF
)

oci network nsg rules update \
  --nsg-id "$NSG_ID" \
  --security-rules "$NSG_RULES_JSON" \
  > /dev/null

echo "✅ NSG rules updated."
echo

echo "🔗 Ensuring VNIC is attached to NSG..."
oci network vnic update \
  --vnic-id "$VNIC_ID" \
  --nsg-ids "[\"$NSG_ID\"]" \
  > /dev/null

echo "✅ VNIC attached to NSG."
echo

echo "🧪 Local quick tests (from your machine):"
echo "Run these in a separate terminal:"
echo "  curl -I http://137.131.48.124"
echo "  curl -I http://api.rinawarptech.com"
echo
echo "Also on the VM (over SSH):"
cat << 'EOF2'
  sudo ss -tlnp | grep 80
  sudo ufw status        # should be inactive or allow 80,443,4000
EOF2

echo
echo "✅ Oracle-side networking is now fully configured for Rinawarp-Api."
echo "If curl still fails, the issue is inside the VM (nginx, ufw, app), not Oracle networking."