# 🚨 RINAWARP REMOTE SERVER - COMPLETE FIX GUIDE

## 🔍 **Issues Identified**

From your terminal output, I can see:

1. **❌ CLI Not Installed:** `sudo: rina: command not found`
2. **❌ NGINX Failed:** Service status shows "failed"
3. **❌ Certificate Renewal Issues:** Multiple nginx restart failures
4. **✅ Health Check Working:** API responds (HTTP/2 405), but web shows 404

---

## 🔧 **COMPLETE REMEDIATION STEPS**

### **Step 1: Install the RinaWarp CLI**

On your remote server (`ubuntu@Rinawarp-Api`):

```bash
# Create the RinaWarp CLI script
sudo tee /usr/local/bin/rina > /dev/null <<'EOF'
#!/bin/bash
set -euo pipefail

COMMAND="${1:-help}"
ARG="${2:-}"

show_help() {
cat <<'HELP'
=====================================================
                💎 RINAWARP CLI
=====================================================
Usage:
  rina <command> [option]

Core commands:
  fix                  - Full VSCode + Node + Git repair
  status               - Full system status dashboard
  logs                 - View logs for API, NGINX, system
  backup               - Create full RinaWarp server backup
  nginx <reload|test|fix>
                       - Manage NGINX
  api <restart|stop>   - Manage API service
  services             - Run safe services cleanup
  health               - Check API + Web health
  cert-fix             - Heal certbot + nginx + consolidate certs
  md-fix <file.md>     - Auto-fix markdownlint issues in a file

Examples:
  rina fix
  rina status
  rina nginx test
  rina api restart
  rina cert-fix
  rina md-fix RINAWARP-CLI-COMPLETE-GUIDE.md
=====================================================
HELP
}

do_fix() {
  echo ">>> Running rina-fix global repair..."
  /usr/local/bin/rina-fix || true
}

do_status() {
  echo ">>> RinaWarp Status Dashboard"
  ~/RinaWarp/rina-services-status.sh
}

do_logs() {
  echo ">>> Viewing logs (rinawarp-api + nginx)..."
  sudo journalctl -u rinawarp-api -n 100 --no-pager 2>/dev/null || true
  sudo journalctl -u nginx -n 100 --no-pager 2>/dev/null || true
}

do_backup() {
  echo ">>> Creating full RinaWarp backup..."
  ~/RinaWarp/rina-master-backup.sh
}

do_nginx() {
  local sub="${ARG:-}"
  case "$sub" in
    reload)
      sudo nginx -t && sudo systemctl reload nginx
      echo ">>> NGINX Reloaded."
      ;;
    test)
      sudo nginx -t
      ;;
    fix)
      echo ">>> Running bulletproof nginx repair..."
      ~/RinaWarp/nginx-bulletproof-fix.sh
      ;;
    *)
      echo "Usage: rina nginx <reload|test|fix>"
      ;;
  esac
}

do_api() {
  local sub="${ARG:-}"
  case "$sub" in
    restart)
      sudo systemctl restart rinawarp-api 2>/dev/null || pm2 restart rinawarp-api || pm2 restart all
      echo ">>> API restarted."
      ;;
    stop)
      sudo systemctl stop rinawarp-api 2>/dev/null || true
      echo ">>> API stopped."
      ;;
    *)
      echo "Usage: rina api <restart|stop>"
      ;;
  esac
}

do_services() {
  ~/RinaWarp/rina-services-clean.sh
}

do_health() {
  echo ">>> API Health:"
  curl -I https://api.rinawarptech.com/health || true
  echo ""
  echo ">>> Web Health:"
  curl -I https://rinawarptech.com || true
}

do_cert_fix() {
  echo ">>> Running RinaWarp Cert & NGINX Healer..."
  sudo ~/RinaWarp/rina-cert-fix.sh
}

do_md_fix() {
  local file="${ARG:-}"
  if [ -z "$file" ]; then
    echo "Usage: rina md-fix <file.md>"
    exit 1
  fi
  echo ">>> Fixing markdown file: $file"
  ~/RinaWarp/rina-md-fix.sh "$file"
}

case "$COMMAND" in
  fix)        do_fix ;;
  status)     do_status ;;
  logs)       do_logs ;;
  backup)     do_backup ;;
  nginx)      do_nginx ;;
  api)        do_api ;;
  services)   do_services ;;
  health)     do_health ;;
  cert-fix)   do_cert_fix ;;
  md-fix)     do_md_fix ;;
  help|*)     show_help ;;
esac
EOF

# Make CLI executable
sudo chmod +x /usr/local/bin/rina

# Create RinaWarp directory and scripts
mkdir -p ~/RinaWarp

# Copy the scripts (if you uploaded them via scp)
# If not, create them:
```

### **Step 2: Create the Certificate Fix Script**

```bash
cat > ~/RinaWarp/rina-cert-fix.sh <<'EOF'
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
EOF

chmod +x ~/RinaWarp/rina-cert-fix.sh
```

### **Step 3: Fix NGINX First**

Before running certificate consolidation, fix NGINX:

```bash
# Fix NGINX configuration
sudo nginx -t

# Reset NGINX completely
sudo systemctl stop nginx
sudo systemctl reset-failed nginx
sudo systemctl start nginx

# Check status
sudo systemctl status nginx
```

### **Step 4: Run Certificate Consolidation**

```bash
# Now run the certificate consolidation
sudo rina cert-fix
```

### **Step 5: Test Everything**

```bash
# Test CLI installation
rina help

# Check system status
rina status

# Test health endpoints
rina health

# Test certificate renewal manually
sudo certbot renew --dry-run
```

---

## 🎯 **EXPECTED RESULTS**

After completing these steps, you should see:

- ✅ **CLI Working:** `rina help` shows all commands
- ✅ **NGINX Running:** Service status shows "active (running)"
- ✅ **Cert Consolidation:** Single SAN certificate in use
- ✅ **Healthy Endpoints:** Both API and web responding properly
- ✅ **Certificate Renewal:** Dry-run succeeds without errors

---

## 🚨 **IF ISSUES PERSIST**

If you still encounter problems:

1. **Check NGINX logs:** `sudo journalctl -u nginx -f`
2. **Check certbot logs:** `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
3. **Verify certificate files:** `ls -la /etc/letsencrypt/live/api.rinawarptech.com/`
4. **Test manual renewal:** `sudo certbot renew --force-renewal --dry-run`

**This comprehensive fix should resolve all the issues identified in your terminal output.**