#!/usr/bin/env bash
set -euo pipefail

DOMAIN="api.rinawarptech.com"
BACKUP_DIR="/etc/nginx/backup-$(date +%Y%m%d-%H%M%S)"

echo "====================================================="
echo "  RINAWARP API NGINX AUTO-FIX"
echo "  Target: ${DOMAIN}"
echo "====================================================="

echo "[STEP] Creating backup in: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"

for f in /etc/nginx/sites-available/api.rinawarptech.com /etc/nginx/sites-available/rinawarp-api.conf; do
  if [ -f "$f" ]; then
    echo "  - Backing up ${f}"
    cp "$f" "${BACKUP_DIR}/$(basename "$f")"
  fi
done

echo "[STEP] Detecting certificate directory..."
CERT_DIR=$(ls -d /etc/letsencrypt/live/api.rinawarptech.com* 2>/dev/null | head -n1 || true)

if [ -z "${CERT_DIR}" ]; then
  echo "❌ Could not find certificate directory for ${DOMAIN} in /etc/letsencrypt/live"
  echo "   Run: sudo ls -la /etc/letsencrypt/live  and check folder names."
  exit 1
fi

echo "  → Using certificate directory: ${CERT_DIR}"

echo "[STEP] Writing new /etc/nginx/sites-available/api.rinawarptech.com"
cat > /etc/nginx/sites-available/api.rinawarptech.com << NGINXCONF
server {
    listen 80;
    server_name ${DOMAIN};

    # ACME HTTP-01 challenge (for renewal)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Handle CORS preflight for API
    if (\$request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin "https://rinawarptech.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Max-Age 3600;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    # Health endpoint (plain HTTP)
    location /api/health {
        proxy_pass http://127.0.0.1:3001/api/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

        add_header Access-Control-Allow-Origin "https://rinawarptech.com" always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Main API proxy
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        add_header Access-Control-Allow-Origin "https://rinawarptech.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate ${CERT_DIR}/fullchain.pem;
    ssl_certificate_key ${CERT_DIR}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ACME HTTP-01 challenge (for renewal via HTTP->HTTPS)
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Handle CORS preflight for API over HTTPS
    if (\$request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin "https://rinawarptech.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Max-Age 3600;
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }

    # Health endpoint (HTTPS)
    location /api/health {
        proxy_pass http://127.0.0.1:3001/api/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

        add_header Access-Control-Allow-Origin "https://rinawarptech.com" always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    # Main API proxy over HTTPS
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        add_header Access-Control-Allow-Origin "https://rinawarptech.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}
NGINXCONF

echo "[STEP] Enabling new site configuration"
ln -sf /etc/nginx/sites-available/api.rinawarptech.com /etc/nginx/sites-enabled/api.rinawarptech.com

# Just in case an old conflicting symlink exists:
if [ -L /etc/nginx/sites-enabled/rinawarp-api.conf ]; then
  echo "  - Removing old sites-enabled/rinawarp-api.conf symlink"
  rm /etc/nginx/sites-enabled/rinawarp-api.conf
fi

echo "[STEP] Testing nginx configuration..."
nginx -t

echo "[STEP] Reloading nginx..."
systemctl reload nginx

echo "====================================================="
echo "  ✅ NGINX API configuration rebuilt successfully"
echo "  Test from this server with:"
echo "    curl -i https://api.rinawarptech.com/api/health"
echo "====================================================="
