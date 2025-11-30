#!/usr/bin/env bash
set -euo pipefail

echo "🚀 RinaWarp Oracle Networking Fix"
echo "=================================="

##
##  CONFIG SECTION – edit ONLY if any IDs ever change
##

# OCI region
REGION="us-phoenix-1"

# Your compartment
COMPARTMENT_OCID="rinawarptech (root)  # (not directly used, just for reference)"

# VCN / Subnet
VCN_ID="ocid1.vcn.oc1.phx.amaaaaaax725ovaau2dzesz6qefjeh2ldryqxuyn5pz4ennm5jd5gqj76iea"
SUBNET_ID="ocid1.subnet.oc1.phx.aaaaaaaagupovynr2u36v6qdhag53fjvlg56swhg4k2kvlvls3nsa5brwmnq"

# Default Security List for rinawarp-vcn
SEC_LIST_ID="ocid1.securitylist.oc1.phx.aaaaaaaaoknlgot7s3qr4fpzkwoqsuittwipzx6xem6xeecvufk44yvkq2na"

# NSG created by quick action
NSG_ID="ocid1.networksecuritygroup.oc1.phx.aaaaaaaa63z6onop7hk2ivw35fbcihqp3togtpjttu3lfgpo3wzugfxty6hq"

# Your backend instance
INSTANCE_ID="ocid1.instance.oc1.phx.anyhqljtx725ovacwblvi3c7vomqll5jgpgqczy6tk2vi45ikbhzqaejlw3a"

# Backend port (change if you ever move away from 3001 → 4000, etc.)
BACKEND_PORT="4000"

echo "🔎 Using configuration:"
echo "  REGION:        $REGION"
echo "  VCN_ID:        $VCN_ID"
echo "  SUBNET_ID:     $SUBNET_ID"
echo "  SEC_LIST_ID:   $SEC_LIST_ID"
echo "  NSG_ID:        $NSG_ID"
echo "  INSTANCE_ID:   $INSTANCE_ID"
echo "  BACKEND_PORT:  $BACKEND_PORT"
echo

##
##  STEP 1 – sanity checks
##

if ! command -v oci >/dev/null 2>&1; then
  echo "❌ 'oci' CLI not found. Install & configure OCI CLI first."
  exit 1
fi

echo "✅ OCI CLI is installed."

# Quick region test
if ! oci iam region list --region "$REGION" >/dev/null 2>&1; then
  echo "⚠️  Warning: Could not query regions with configured profile/region."
  echo "    Make sure your ~/.oci/config has region set to: $REGION"
else
  echo "✅ OCI profile/region looks usable."
fi

echo

##
##  STEP 2 – build clean Security List rules (L3 firewall on subnet)
##

WORKDIR="$(mktemp -d)"
cd "$WORKDIR"

cat > ingress.json <<EOF
[
  {
    "protocol": "6",
    "source": "0.0.0.0/0",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": { "min": 22, "max": 22 }
    },
    "description": "Allow SSH"
  },
  {
    "protocol": "6",
    "source": "0.0.0.0/0",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": { "min": 80, "max": 80 }
    },
    "description": "Allow HTTP"
  },
  {
    "protocol": "6",
    "source": "0.0.0.0/0",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": { "min": 443, "max": 443 }
    },
    "description": "Allow HTTPS"
  },
  {
    "protocol": "6",
    "source": "0.0.0.0/0",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": { "min": ${BACKEND_PORT}, "max": ${BACKEND_PORT} }
    },
    "description": "Allow Backend API"
  },
  {
    "protocol": "1",
    "source": "0.0.0.0/0",
    "isStateless": false,
    "icmpOptions": {
      "type": 3,
      "code": 4
    },
    "description": "Allow ICMP type 3 code 4 (path MTU)"
  },
  {
    "protocol": "1",
    "source": "10.0.0.0/16",
    "isStateless": false,
    "icmpOptions": {
      "type": 3
    },
    "description": "Allow ICMP type 3 from VCN"
  }
]
EOF

cat > egress.json <<EOF
[
  {
    "protocol": "all",
    "destination": "0.0.0.0/0",
    "isStateless": false,
    "description": "Allow all outbound traffic"
  }
]
EOF

echo "🔧 Updating Default Security List ingress/egress rules..."
oci network security-list update \
  --region "$REGION" \
  --security-list-id "$SEC_LIST_ID" \
  --ingress-security-rules file://ingress.json \
  --egress-security-rules  file://egress.json \
  >/dev/null

echo "✅ Security List updated successfully."
echo

##
##  STEP 3 – build NSG rules (L4 firewall on VNIC)
##

cat > nsg-rules.json <<EOF
[
  {
    "direction": "EGRESS",
    "isStateless": false,
    "protocol": "all",
    "destination": "0.0.0.0/0",
    "description": "Allow all outbound traffic"
  },
  {
    "direction": "INGRESS",
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "tcpOptions": {
      "destinationPortRange": { "min": 80, "max": 80 }
    },
    "description": "Allow HTTP"
  },
  {
    "direction": "INGRESS",
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "tcpOptions": {
      "destinationPortRange": { "min": 443, "max": 443 }
    },
    "description": "Allow HTTPS"
  },
  {
    "direction": "INGRESS",
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "tcpOptions": {
      "destinationPortRange": { "min": ${BACKEND_PORT}, "max": ${BACKEND_PORT} }
    },
    "description": "Allow Backend API"
  },
  {
    "direction": "INGRESS",
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "tcpOptions": {
      "destinationPortRange": { "min": 22, "max": 22 }
    },
    "description": "Allow SSH"
  }
]
EOF

echo "🔧 Overwriting NSG rules for ig-quick-action-NSG..."
oci network nsg update \
  --region "$REGION" \
  --network-security-group-id "$NSG_ID" \
  --security-rules file://nsg-rules.json \
  >/dev/null

echo "✅ NSG rules updated successfully."
echo

##
##  STEP 4 – ensure instance VNIC is attached to NSG
##

echo "🔎 Looking up VNIC for instance..."
VNIC_ID="$(
  oci compute instance list-vnics \
    --region "$REGION" \
    --instance-id "$INSTANCE_ID" \
    --query 'data[0].id' \
    --raw-output
)"

if [[ -z "$VNIC_ID" || "$VNIC_ID" == "null" ]]; then
  echo "❌ Could not find VNIC for instance $INSTANCE_ID"
  echo "   Check that INSTANCE_ID is correct."
  exit 1
fi

echo "✅ Found VNIC: $VNIC_ID"

echo "🔎 Checking existing NSG attachments on VNIC..."
CURRENT_NSGS="$(
  oci network vnic get \
    --region "$REGION" \
    --vnic-id "$VNIC_ID" \
    --query 'data."nsg-ids"' \
    --raw-output
)"

# Normalize
CURRENT_NSGS="${CURRENT_NSGS:-[]}"

if echo "$CURRENT_NSGS" | grep -q "$NSG_ID"; then
  echo "✅ VNIC already attached to NSG: $NSG_ID"
else
  echo "🔧 Attaching NSG to VNIC..."
  oci network vnic update \
    --region "$REGION" \
    --vnic-id "$VNIC_ID" \
    --nsg-ids "[\"$NSG_ID\"]" \
    >/dev/null
  echo "✅ VNIC NSG attachment updated."
fi

echo

##
##  STEP 5 – summary + next steps
##

echo "🎉 Oracle networking fix script completed."
echo
echo "NEXT: On your local machine (Kali), test from outside:"
echo
echo "  curl -I http://137.131.48.124"
echo "  curl -I http://api.rinawarptech.com"
echo
echo "You should see HTTP/1.1 200 or 301/302 once nginx + backend are serving."
echo
echo "If HTTP works, then re-run your SSL command on the VM:"
echo "  sudo certbot --nginx -d api.rinawarptech.com"
echo
echo "🧹 Temporary working directory: $WORKDIR (will be left for inspection)"