#!/bin/bash
set -euo pipefail

echo "====================================================="
echo "        🔐 RINAWARP CERT & NGINX HEALER (A: One SAN)"
echo "====================================================="

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_ROOT="$HOME/RinaWarp/cert-nginx-backups/$STAMP"

echo ""
echo "[STEP] Backing up /etc/letsencrypt and /etc/nginx to:"
echo "       $BACKUP_ROOT"
sudo mkdir -p "$BACKUP_ROOT"

sudo tar -czpf "$BACKUP_ROOT/etc-letsencrypt.tar.gz" /etc/letsencrypt
sudo tar -czpf "$BACKUP_ROOT/etc-nginx.tar.gz" /etc/nginx

echo ""
echo "[OK] Backup complete."

# ------------------------------------------------------
# 1. Consolidate renewal configs to ONE SAN cert
# ------------------------------------------------------
RENEWAL_DIR="/etc/letsencrypt/renewal"
ARCHIVE_DIR="/etc/letsencrypt/renewal-archive-$STAMP"

echo ""
echo "[STEP] Archiving extra renewal configs to: $ARCHIVE_DIR"
sudo mkdir -p "$ARCHIVE_DIR"

# We KEEP: api.rinawarptech.com.conf (SAN: api + downloads + monitoring + main + www)
KEEP_CONF="api.rinawarptech.com.conf"

for f in api.rinawarptech.com-0001.conf \
         downloads.rinawarptech.com.conf \
         monitoring.rinawarptech.com.conf \
         rinawarptech.com-0001.conf \
         rinawarptech.com.conf; do
  if [ -f "$RENEWAL_DIR/$f" ]; then
    echo "  - Archiving $f"
    sudo mv "$RENEWAL_DIR/$f" "$ARCHIVE_DIR/"
  fi
done

echo ""
echo "[INFO] Keeping renewal config:"
echo "       $RENEWAL_DIR/$KEEP_CONF"

# ------------------------------------------------------
# 2. Choose canonical live cert dir
# ------------------------------------------------------
CANON_DIR="/etc/letsencrypt/live/api.rinawarptech.com"

echo ""
echo "[STEP] Checking canonical cert directory: $CANON_DIR"
if [ ! -f "$CANON_DIR/fullchain.pem" ] || [ ! -f "$CANON_DIR/privkey.pem" ]; then
  echo "❌ ERROR: $CANON_DIR/fullchain.pem or privkey.pem not found."
  echo "   Aborting BEFORE changing nginx."
  exit 1
fi
echo "[OK] Canonical cert exists."

# ------------------------------------------------------
# 3. Point ALL nginx sites to this one cert
# ------------------------------------------------------
echo ""
echo "[STEP] Updating nginx vhosts to use canonical cert..."

SITES=(
  "api.rinawarptech.com"
  "downloads.rinawarptech.com"
  "monitoring.rinawarptech.com"
  "rinawarptech.com"
)

for site in "${SITES[@]}"; do
  CONF="/etc/nginx/sites-available/$site"
  if [ -f "$CONF" ]; then
    echo "  - Updating $CONF"
    sudo sed -E -i "s|ssl_certificate[[:space:]]+/etc/letsencrypt/live/[^;]+/fullchain.pem;|ssl_certificate $CANON_DIR/fullchain.pem;|g" "$CONF"
    sudo sed -E -i "s|ssl_certificate_key[[:space:]]+/etc/letsencrypt/live/[^;]+/privkey.pem;|ssl_certificate_key $CANON_DIR/privkey.pem;|g" "$CONF"
  else
    echo "  - Skipping $CONF (not found)"
  fi
done

# ------------------------------------------------------
# 4. Test & restart nginx cleanly
# ------------------------------------------------------
echo ""
echo "[STEP] Testing nginx configuration..."
sudo nginx -t

echo ""
echo "[STEP] Resetting nginx failed state (if any) and restarting..."
sudo systemctl stop nginx || true
sudo systemctl reset-failed nginx || true
sudo systemctl start nginx

echo ""
echo "[STEP] nginx status (short):"
sudo systemctl status nginx --no-pager -l | head -n 20

# ------------------------------------------------------
# 5. Test certbot renew dry-run with the new layout
# ------------------------------------------------------
echo ""
echo "[STEP] Running certbot renew --dry-run (this may take a bit)..."
if sudo certbot renew --dry-run; then
  echo ""
  echo "✅ Certbot dry-run succeeded. Renewal is healthy."
else
  echo ""
  echo "⚠️ WARNING: certbot dry-run still reported errors."
  echo "   Check: /var/log/letsencrypt/letsencrypt.log"
fi

echo ""
echo "====================================================="
echo "   🎉 RINAWARP CERT & NGINX HEALER COMPLETED"
echo "   - Backups: $BACKUP_ROOT"
echo "   - Canonical cert: $CANON_DIR"
echo "   - Active renewal: $RENEWAL_DIR/$KEEP_CONF"
echo "====================================================="