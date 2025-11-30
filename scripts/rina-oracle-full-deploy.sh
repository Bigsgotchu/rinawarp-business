#!/bin/bash
set -e

###############################################
# 🔧 CONFIG - EDIT THESE BEFORE RUNNING
###############################################

# Oracle Compartment OCID (copy from OCI console: rinawarptech (root))
COMPARTMENT_ID="ocid1.tenancy.oc1..aaaaaaaazruptwuezlpqcarfmk2v7fkxgnlvkpu2id5tngagpksxubbagmzq"

# Instance display name in OCI
INSTANCE_NAME="Rinawarp-Api"

# API domain + backend port
API_DOMAIN="api.rinawarptech.com"
BACKEND_PORT=4000                                   # change to 3001 if your backend listens there

# SSH credentials for the VM
SSH_USER="ubuntu"
SSH_KEY="$HOME/Downloads/karinagilley91@gmail.com-2025-11-26T04_36_19.024Z.pem"   # >>> EDIT ME

# Email for Let's Encrypt
CERTBOT_EMAIL="karina@rinawarptech.com"

# Local script that deploys your backend to the VM
BACKEND_DEPLOY_SCRIPT="./deploy-backend-to-oracle-vm.sh"  # already referenced in your docs

###############################################
# 🔍 PRE-FLIGHT CHECKS
###############################################

echo "=============================================="
echo " 🚀 RINAWARP FULL AUTO-DEPLOY STARTING"
echo "=============================================="

for cmd in oci ssh nc curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Missing required command: $cmd"
    exit 1
  fi
done

if [[ ! -f "$SSH_KEY" ]]; then
  echo "❌ SSH key not found at: $SSH_KEY"
  exit 1
fi

if [[ ! -f "$BACKEND_DEPLOY_SCRIPT" ]]; then
  echo "❌ Backend deploy script not found: $BACKEND_DEPLOY_SCRIPT"
  exit 1
fi

###############################################
# 🔎 DISCOVER ORACLE RESOURCES
###############################################

echo ""
echo "🔍 Discovering Oracle resources..."

INSTANCE_ID=$(
  oci compute instance list \
    --compartment-id "$COMPARTMENT_ID" \
    --all \
    --region us-phoenix-1 \
    --query "data[?contains(\"display-name\", \`$INSTANCE_NAME\`)].id | [0]" \
    --raw-output
)

if [[ -z "$INSTANCE_ID" || "$INSTANCE_ID" == "null" ]]; then
  echo "❌ Could not find instance with name: $INSTANCE_NAME"
  exit 1
fi

VNIC_ID=$(
  oci compute instance list-vnics \
    --instance-id "$INSTANCE_ID" \
    --region us-phoenix-1 \
    --query 'data[0].id' \
    --raw-output
)

SUBNET_ID=$(
  oci compute instance list-vnics \
    --instance-id "$INSTANCE_ID" \
    --region us-phoenix-1 \
    --query 'data[0]."subnet-id"' \
    --raw-output
)

SEC_LIST_ID=$(
  oci network subnet get \
    --subnet-id "$SUBNET_ID" \
    --region us-phoenix-1 \
    --query 'data."security-list-ids"[0]' \
    --raw-output
)

RT_ID=$(
  oci network subnet get \
    --subnet-id "$SUBNET_ID" \
    --query 'data."route-table-id"' \
    --raw-output
)

IGW_ID=$(
  oci network internet-gateway list \
    --compartment-id "$COMPARTMENT_ID" \
    --query 'data[?state==`AVAILABLE`].id | [0]' \
    --raw-output
)

NSG_ID=$(
  oci network network-security-group list \
    --compartment-id "$COMPARTMENT_ID" \
    --query 'data[?contains("display-name", `ig-quick-action-NSG`)].id | [0]' \
    --raw-output
)

PUBLIC_IP=$(
  oci compute instance list-vnics \
    --instance-id "$INSTANCE_ID" \
    --query 'data[0]."public-ip"' \
    --raw-output
)

echo ""
echo "🔎 RESOURCES:"
echo "  Compartment:   $COMPARTMENT_ID"
echo "  Instance:      $INSTANCE_ID ($INSTANCE_NAME)"
echo "  VNIC:          $VNIC_ID"
echo "  Subnet:        $SUBNET_ID"
echo "  Security List: $SEC_LIST_ID"
echo "  Route Table:   $RT_ID"
echo "  Internet GW:   $IGW_ID"
echo "  NSG:           $NSG_ID"
echo "  Public IP:     $PUBLIC_IP"
echo ""

if [[ -z "$VNIC_ID" || -z "$SUBNET_ID" || -z "$SEC_LIST_ID" || -z "$NSG_ID" || -z "$PUBLIC_IP" ]]; then
  echo "❌ Missing required resource IDs. Aborting."
  exit 1
fi

###############################################
# 🛡  ONE-CLICK ORACLE NETWORK FIX
###############################################

echo "=============================================="
echo "🛠  FIXING ORACLE NETWORKING (NSG + SEC LIST)"
echo "=============================================="

# Attach NSG to VNIC
echo "🔧 Attaching NSG to VNIC..."
oci network vnic update \
  --vnic-id "$VNIC_ID" \
  --nsg-ids "[\"$NSG_ID\"]" \
  >/dev/null

# Add required NSG ingress rules (22, 80, 443, BACKEND_PORT)
echo "🔧 Adding NSG ingress rules..."
oci network nsg rules add \
  --network-security-group-id "$NSG_ID" \
  --security-rules "[
    {\"direction\":\"INGRESS\",\"protocol\":\"6\",\"source\":\"0.0.0.0/0\",\"tcp-options\":{\"destination-port-range\":{\"min\":22,\"max\":22}}},
    {\"direction\":\"INGRESS\",\"protocol\":\"6\",\"source\":\"0.0.0.0/0\",\"tcp-options\":{\"destination-port-range\":{\"min\":80,\"max\":80}}},
    {\"direction\":\"INGRESS\",\"protocol\":\"6\",\"source\":\"0.0.0.0/0\",\"tcp-options\":{\"destination-port-range\":{\"min\":443,\"max\":443}}},
    {\"direction\":\"INGRESS\",\"protocol\":\"6\",\"source\":\"0.0.0.0/0\",\"tcp-options\":{\"destination-port-range\":{\"min\":$BACKEND_PORT,\"max\":$BACKEND_PORT}}}
  ]" \
  >/dev/null

# Overwrite Security List ingress rules with clean set
echo "🔧 Updating Security List ingress rules..."
oci network security-list update \
  --security-list-id "$SEC_LIST_ID" \
  --ingress-security-rules "[
    {\"protocol\":\"6\",\"source\":\"0.0.0.0/0\",\"tcp-options\":{\"destination-port-range\":{\"min\":22,\"max\":22}}},
    {\"protocol\":\"6\",\"source\":\"0.0.0.0/0\",\"tcp-options\":{\"destination-port-range\":{\"min\":80,\"max\":80}}},
    {\"protocol\":\"6\",\"source\":\"0.0.0.0/0\",\"tcp-options\":{\"destination-port-range\":{\"min\":443,\"max\":443}}},
    {\"protocol\":\"6\",\"source\":\"0.0.0.0/0\",\"tcp-options\":{\"destination-port-range\":{\"min\":$BACKEND_PORT,\"max\":$BACKEND_PORT}}}
  ]" \
  >/dev/null

# Ensure route to Internet Gateway
echo "🔧 Ensuring 0.0.0.0/0 → Internet Gateway..."
oci network route-table update \
  --rt-id "$RT_ID" \
  --route-rules "[{\"cidr-block\":\"0.0.0.0/0\",\"network-entity-id\":\"$IGW_ID\"}]" \
  >/dev/null

echo ""
echo "⏳ Waiting 10 seconds for OCI propagation..."
sleep 10

echo ""
echo "=============================================="
echo "  🔬 TESTING PORTS AFTER NETWORK FIX"
echo "=============================================="

for PORT in 22 80 443 "$BACKEND_PORT"; do
  echo -n "Checking port $PORT ... "
  if nc -z -w 3 "$PUBLIC_IP" "$PORT" 2>/dev/null; then
    echo "✅ OPEN"
  else
    echo "⚠️ CLOSED (may still be propagating)"
  fi
done

###############################################
# 📦 BACKEND DEPLOYMENT
###############################################

echo ""
echo "=============================================="
echo "📦 DEPLOYING BACKEND VIA LOCAL SCRIPT"
echo "=============================================="

# If your deploy script needs the IP, you can pass it; otherwise it can ignore.
chmod +x "$BACKEND_DEPLOY_SCRIPT"
"$BACKEND_DEPLOY_SCRIPT" "$PUBLIC_IP" || echo "⚠️ Backend deploy script returned non-zero (check its output)."

echo ""
echo "⏳ Waiting 5 seconds before health check..."
sleep 5

echo "🔍 Testing backend health on VM..."

if curl -s "http://$PUBLIC_IP:$BACKEND_PORT/health" >/dev/null 2>&1; then
  echo "✅ Backend responding on http://$PUBLIC_IP:$BACKEND_PORT/health"
else
  echo "⚠️ Backend not responding yet on http://$PUBLIC_IP:$BACKEND_PORT/health"
fi

###############################################
# 🌐 NGINX + SSL SETUP ON VM
###############################################

echo ""
echo "=============================================="
echo "🌐 CONFIGURING NGINX + LET'S ENCRYPT ON VM"
echo "=============================================="

ssh -i "$SSH_KEY" "$SSH_USER@$PUBLIC_IP" bash -s <<EOF
set -e

echo "🔧 Updating apt & installing nginx + certbot..."
sudo apt-get update -y
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "🔧 Writing nginx config for $API_DOMAIN → 127.0.0.1:$BACKEND_PORT ..."
sudo tee /etc/nginx/sites-available/rinawarp-api.conf >/dev/null <<NGINX
server {
    listen 80;
    server_name $API_DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Basic security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
NGINX

sudo ln -sf /etc/nginx/sites-available/rinawarp-api.conf /etc/nginx/sites-enabled/rinawarp-api.conf

echo "🔍 Testing nginx config..."
sudo nginx -t
sudo systemctl restart nginx

echo "🔐 Requesting Let's Encrypt certificate for $API_DOMAIN ..."
sudo certbot --nginx -d $API_DOMAIN \
  --non-interactive --agree-tos -m $CERTBOT_EMAIL --redirect || echo "⚠️ Certbot failed, check logs on VM."

EOF

###############################################
# ✅ FINAL VERIFICATION
###############################################

echo ""
echo "=============================================="
echo "✅ FINAL VERIFICATION FROM LOCAL MACHINE"
echo "=============================================="

echo "🔍 HTTP on raw IP:"
curl -I "http://$PUBLIC_IP" || echo "⚠️ Raw IP HTTP check failed"

echo ""
echo "🔍 HTTP on domain:"
curl -I "http://$API_DOMAIN" || echo "⚠️ Domain HTTP check failed"

echo ""
echo "🔍 HTTPS /health on domain:"
curl -I "https://$API_DOMAIN/health" || echo "⚠️ HTTPS /health check failed"

echo ""
echo "=============================================="
echo "🎉 FULL AUTO-DEPLOY SCRIPT FINISHED"
echo "   API should be at: https://$API_DOMAIN/health"
echo "=============================================="