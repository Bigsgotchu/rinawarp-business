#!/usr/bin/env bash
set -euo pipefail

########################################
# RINAWARP ORACLE SMART NETWORK FIX v2
########################################

# 👉 CONFIG (already correct for your setup)
TENANCY_OCID="ocid1.tenancy.oc1..aaaaaaaazruptwuezlpqcarfmk2v7fkxgnlvkpu2id5tngagpksxubbagmzq"
REGION="us-phoenix-1"
INSTANCE_ID="ocid1.instance.oc1.phx.anyhqljtx725ovacwblvi3c7vomqll5jgpgqczy6tk2vi45ikbhzqaejlw3a"
SECURITY_LIST_ID="ocid1.securitylist.oc1.phx.aaaaaaaaoknlgot7s3qr4fpzkwoqsuittwipzx6xem6xeecvufk44yvkq2na"
NSG_ID="ocid1.networksecuritygroup.oc1.phx.aaaaaaaa63z6onop7hk2ivw35fbcihqp3togtpjttu3lfgpo3wzugfxty6hq"

echo "=============================================="
echo " 🚀 RINAWARP ORACLE SMART NETWORK FIX – START "
echo "=============================================="
echo
echo "Using:"
echo "  Region          : $REGION"
echo "  Instance ID     : $INSTANCE_ID"
echo "  Security List   : $SECURITY_LIST_ID"
echo "  NSG             : $NSG_ID"
echo

########################################
# 1) HARDEN / FIX SECURITY LIST (VCN)
########################################

echo "🔍 Fetching current Security List..."
oci network security-list get \
  --security-list-id "$SECURITY_LIST_ID" \
  --region "$REGION" >/tmp/rw-security-list-before.json

echo "✨ Updating Security List ingress rules (22, 80, 443, 4000)..."

cat >/tmp/rw-ingress-rules.json <<'EOF'
[
  {
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "tcpOptions": {
      "destinationPortRange": { "min": 22, "max": 22 }
    },
    "description": "Allow SSH from anywhere"
  },
  {
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "tcpOptions": {
      "destinationPortRange": { "min": 80, "max": 80 }
    },
    "description": "Allow HTTP from anywhere"
  },
  {
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "tcpOptions": {
      "destinationPortRange": { "min": 443, "max": 443 }
    },
    "description": "Allow HTTPS from anywhere"
  },
  {
    "isStateless": false,
    "protocol": "6",
    "source": "0.0.0.0/0",
    "sourceType": "CIDR_BLOCK",
    "tcpOptions": {
      "destinationPortRange": { "min": 4000, "max": 4000 }
    },
    "description": "Allow Backend API (4000) from anywhere"
  }
]
EOF

cat >/tmp/rw-egress-rules.json <<'EOF'
[
  {
    "isStateless": false,
    "protocol": "all",
    "destination": "0.0.0.0/0",
    "destinationType": "CIDR_BLOCK",
    "description": "Allow all outbound traffic"
  }
]
EOF

oci network security-list update \
  --security-list-id "$SECURITY_LIST_ID" \
  --ingress-security-rules file:///tmp/rw-ingress-rules.json \
  --egress-security-rules  file:///tmp/rw-egress-rules.json \
  --region "$REGION" \
  >/tmp/rw-security-list-after.json

echo "✅ Security List updated."

########################################
# 2) FIX NSG RULES (INSTANCE-LEVEL FIREWALL)
########################################

echo
echo "🔍 Checking existing NSG rules..."
oci network nsg rules list \
  --nsg-id "$NSG_ID" \
  --region "$REGION" \
  >/tmp/rw-nsg-rules-before.json

echo "✨ Adding NSG ingress rules (22, 80, 443, 4000)..."
echo "   (If you re-run this, Oracle may show duplicates in UI, but it's harmless.)"

oci network nsg rules add \
  --nsg-id "$NSG_ID" \
  --region "$REGION" \
  --security-rules '[
    {
      "direction": "INGRESS",
      "protocol": "6",
      "source": "0.0.0.0/0",
      "source-type": "CIDR_BLOCK",
      "is-stateless": false,
      "tcp-options": {
        "destination-port-range": { "min": 22, "max": 22 }
      },
      "description": "SSH (22)"
    },
    {
      "direction": "INGRESS",
      "protocol": "6",
      "source": "0.0.0.0/0",
      "source-type": "CIDR_BLOCK",
      "is-stateless": false,
      "tcp-options": {
        "destination-port-range": { "min": 80, "max": 80 }
      },
      "description": "HTTP (80)"
    },
    {
      "direction": "INGRESS",
      "protocol": "6",
      "source": "0.0.0.0/0",
      "source-type": "CIDR_BLOCK",
      "is-stateless": false,
      "tcp-options": {
        "destination-port-range": { "min": 443, "max": 443 }
      },
      "description": "HTTPS (443)"
    },
    {
      "direction": "INGRESS",
      "protocol": "6",
      "source": "0.0.0.0/0",
      "source-type": "CIDR_BLOCK",
      "is-stateless": false,
      "tcp-options": {
        "destination-port-range": { "min": 4000, "max": 4000 }
      },
      "description": "Backend API (4000)"
    }
  ]' >/tmp/rw-nsg-rules-after.json

echo "✅ NSG rules added."

########################################
# 3) QUICK CONNECTIVITY CHECK (FROM YOUR BOX)
########################################

PUBLIC_IP="137.131.48.124"

echo
echo "⏳ Waiting 10 seconds for OCI propagation..."
sleep 10

echo
echo "🧪 Testing connectivity from your local machine:"
echo "  curl -I http://$PUBLIC_IP        (port 80)"
echo "  curl -I http://api.rinawarptech.com"

curl -I "http://${PUBLIC_IP}" || true

echo
echo "=============================================="
echo " ✅ SMART NETWORK FIX APPLIED "
echo "    If curl still fails, wait 2–5 minutes and try again:"
echo "      curl -I http://${PUBLIC_IP}"
echo "=============================================="