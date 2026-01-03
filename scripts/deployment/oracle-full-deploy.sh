#!/usr/bin/env bash
set -euo pipefail

# === CONFIGURE THESE IF NEEDED ===
VM_USER="ubuntu"
VM_HOST="158.101.1.38"
SSH_KEY="${HOME}/.ssh/rinawarp_working"

# Use SSH config alias for better key management
SSH_HOST="rinawarp-prod"

# Local paths on your Kali dev machine
LOCAL_BACKEND_DIR="${HOME}/Documents/RinaWarp/apps/terminal-pro/backend"
LOCAL_BUILD_OUTPUT_DIR="${HOME}/Documents/RinaWarp/build-output"

# Remote paths on Oracle VM
REMOTE_BASE_DIR="/var/www/rinawarp-api"
REMOTE_BACKEND_DIR="${REMOTE_BASE_DIR}/backend"
REMOTE_DOWNLOADS_DIR="${REMOTE_BASE_DIR}/downloads"

echo "🚀 RinaWarp Oracle Full Deployment"
echo "Local backend:      ${LOCAL_BACKEND_DIR}"
echo "Local installers:   ${LOCAL_BUILD_OUTPUT_DIR}"
echo "Remote host:        ${VM_USER}@${VM_HOST}"
echo

# --- 1) Ensure remote base dirs exist ---
echo "📁 Creating remote directories on Oracle VM..."
ssh "${SSH_HOST}" "sudo mkdir -p '${REMOTE_BACKEND_DIR}' '${REMOTE_DOWNLOADS_DIR}' && sudo chown -R ${VM_USER}:${VM_USER} '${REMOTE_BASE_DIR}'"

# --- 2) Upload backend code ---
echo "📤 Uploading FastAPI backend..."
rsync -avz -e "ssh ${SSH_HOST}" \
  "${LOCAL_BACKEND_DIR}/" \
  "${SSH_HOST}:${REMOTE_BACKEND_DIR}/"

# --- 3) Upload installers (downloads) ---
echo "📤 Uploading installer files..."
rsync -avz -e "ssh ${SSH_HOST}" \
  "${LOCAL_BUILD_OUTPUT_DIR}/" \
  "${SSH_HOST}:${REMOTE_DOWNLOADS_DIR}/"

# --- 4) Run remote setup: venv, deps, systemd, nginx ---
echo "⚙️  Running remote setup on Oracle VM..."
ssh "${SSH_HOST}" 'bash -s' << "EOF"
set -euo pipefail

REMOTE_BASE_DIR="/var/www/rinawarp-api"
REMOTE_BACKEND_DIR="${REMOTE_BASE_DIR}/backend"
REMOTE_DOWNLOADS_DIR="${REMOTE_BASE_DIR}/downloads"
SERVICE_NAME="rinawarp-api"
PYTHON_BIN="/usr/bin/python3"

echo "🐍 Ensuring Python & pip are installed..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-venv python3-pip nginx

cd "${REMOTE_BACKEND_DIR}"

# --- 4.1) Create virtualenv & install requirements ---
if [ ! -d "venv" ]; then
  echo "📦 Creating Python virtualenv..."
  ${PYTHON_BIN} -m venv venv
fi

echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
else
  echo "⚠️ requirements.txt not found in ${REMOTE_BACKEND_DIR}"
fi
deactivate

# --- 4.2) Ensure downloads dir permissions ---
echo "🔐 Fixing permissions on downloads directory..."
sudo chown -R www-data:www-data "${REMOTE_DOWNLOADS_DIR}"
sudo chmod -R 755 "${REMOTE_DOWNLOADS_DIR}"

# --- 4.3) Create systemd service for FastAPI ---
echo "🧩 Creating systemd service for FastAPI..."
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

sudo bash -c "cat > '${SERVICE_FILE}'" << SERVICEEOF
[Unit]
Description=RinaWarp FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=${REMOTE_BACKEND_DIR}
ExecStart=${REMOTE_BACKEND_DIR}/venv/bin/python -m uvicorn fastapi_server:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEEOF

echo "🔁 Enabling and restarting ${SERVICE_NAME}..."
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"

sleep 3
sudo systemctl --no-pager status "${SERVICE_NAME}" || true

# --- 4.4) Configure nginx for api.rinawarptech.com ---
echo "🌐 Configuring nginx for api.rinawarptech.com..."
NGINX_SITE="/etc/nginx/sites-available/rinawarp-api"

sudo bash -c "cat > '${NGINX_SITE}'" << NGINXEOF
server {
    server_name api.rinawarptech.com;

    # HTTP -> redirect to HTTPS if certs exist
    listen 80;
    listen [::]:80;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXEOF

sudo ln -sf "${NGINX_SITE}" /etc/nginx/sites-enabled/rinawarp-api

echo "🧪 Testing nginx config..."
sudo nginx -t
echo "🔁 Restarting nginx..."
sudo systemctl restart nginx

# --- 4.5) (Optional) Let's Encrypt SSL hint (does not auto-run) ---
echo
echo "⚠️ If you need HTTPS/SSL via Let's Encrypt, run this ONCE on the VM:"
echo "    sudo apt-get install -y certbot python3-certbot-nginx"
echo "    sudo certbot --nginx -d api.rinawarptech.com"
echo

# --- 4.6) Quick health check ---
echo "🩺 Testing backend health (curl localhost:8000/health)..."
if command -v curl >/dev/null 2>&1; then
  curl -sS http://127.0.0.1:8000/health || echo '⚠️ Health endpoint not responding (check fastapi_server.py)'
else
  echo "curl not installed; skipping local health check."
fi

echo "✅ Remote setup complete."
EOF

echo
echo "🎉 RinaWarp Oracle Full Deployment script finished."
echo "Now test from your machine:"
echo "  curl https://api.rinawarptech.com/api/license-count"
echo "  curl -I https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage"