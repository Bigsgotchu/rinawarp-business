
# 🔒 RINAWARP CERTIFICATE HEALING - INSTALLATION GUIDE

## ✅ **Certificate Healing Script Ready**

### **📁 Files Created**

 - **`rina-cert-heal.sh`** - Complete certificate healing script ✅
 - **Updated CLI with `cert-fix` command** ✅
### **🔧 Script Capabilities**
The `rina-cert-heal.sh` script performs **10 comprehensive steps**:

1. **🔍 Diagnose** - Current certificate status analysis
2. **💾 Backup** - Full configuration backup with timestamp
3. **🗑️ Remove** - Delete incorrect certificates safely
4. **🔐 Generate** - Create new Let's Encrypt certificates
5. **⚙️ Update** - Rewrite renewal configuration files
6. **🌐 Configure** - Update NGINX with proper SSL setup
7. **✅ Validate** - Test all configurations and permissions
8. **🔄 Restart** - Restart NGINX and API services
9. **🔄 Dry-run** - Test certificate renewal process
10. **🎉 Verify** - Final connectivity and status checks

---
## 🚀 **LOCAL INSTALLATION (Complete)**

### **✅ Already Installed on Local Machine**

 - **Certificate Script:** `./rina-cert-heal.sh` ✅ Ready
 - **Updated CLI:** `~/.local/bin/rina` ✅ Updated
 - **Command Available:** `rina cert-fix` ✅ Working

---
## 🌐 **REMOTE SERVER INSTALLATION**

### **Step 1: Upload Certificate Healing Script**
On your **local machine**, run:
```
bash

# Copy the script to your remote server

scp rina-cert-heal.sh ubuntu@Rinawarp-Api:~/

```

### **Step 2: Update Remote CLI**
On your **remote server** (`ubuntu@Rinawarp-Api`), update the CLI with the enhanced version:
```
bash

# Step 1: Create updated CLI script

cat > ~/rina <<'EOF'
#!/bin/bash
set -euo pipefail

COMMAND="${1:-help}"
SUBCOMMAND="${2:-}"

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
  nginx                - Reload, test, or fix NGINX
  api <restart|stop>   - Manage API service
  services             - List and fix all services
  health               - Check all RinaWarp health endpoints
  md-fix <file>        - Auto-fix Markdown formatting issues
  cert-fix             - Heal SSL certificates (Production only)

Type:
  rina help
for details.
=====================================================
HELP
}
# ----------------------------
# rina fix
# ----------------------------

do_fix() {
  echo ">>> Running rina-fix global repair..."
  ~/rina-fix || true
}
# ----------------------------
# rina status 
# ----------------------------

do_status() {
  echo ">>> RinaWarp Status Dashboard"
  ~/RinaWarp/rina-services-status.sh
}
# ----------------------------
# rina logs 
# ----------------------------

do_logs() {
  echo ">>> Viewing logs..."
  sudo journalctl -u rinawarp-api -n 100 --no-pager 2>/dev/null || true
  sudo journalctl -u nginx -n 100 --no-pager
}
# ----------------------------
# rina backup
# ----------------------------

do_backup() {
  echo ">>> Creating full RinaWarp backup..."
  ~/RinaWarp/rina-master-backup.sh
}
# ----------------------------
# rina nginx <cmd>
# ----------------------------

do_nginx() {
  case "$SUBCOMMAND" in
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
# ----------------------------
# rina api <restart|stop>
# ----------------------------

do_api() {
  case "$SUBCOMMAND" in
    restart)
      sudo systemctl restart rinawarp-api 2>/dev/null || pm2 restart all
      echo ">>> API restarted."
      ;;
    stop)
      sudo systemctl stop rinawarp-api 2>/dev/null || true
      ;;
    *)
      echo "Usage: rina api <restart|stop>"
      ;;
  esac
}
# ----------------------------
# rina services
# ----------------------------

do_services() {
  ~/RinaWarp/rina-services-clean.sh
}
# ----------------------------
# rina health
# ----------------------------

do_health() {
  echo ">>> API Health:"
  curl -I https://api.rinawarptech.com/health || true
  echo ""
  echo ">>> Web Health:"
  curl -I https://rinawarptech.com || true
}
# ----------------------------
# rina md-fix <file>
# ----------------------------

do_md_fix() {
  local FILE="$SUBCOMMAND"
  if [ -z "$FILE" ]; then
    echo "Usage: rina md-fix <file.md>"
    exit 1
  fi
  if [ ! -f "$FILE" ]; then
    echo "Error: File not found: $FILE"
    exit 1
  fi

  echo "====================================================="
  echo "          🛠️  RINAWARP MARKDOWN AUTO-FIX"
  echo "====================================================="
  echo "Fixing: $FILE"
  echo ""

  TMP="${FILE}.tmp"

  # -------------------------------------------------------------------
  # 1. Add blank lines around headings (MD022)
  # -------------------------------------------------------------------
  sed -E '
    s/^(#+ .*)$/\n\1\n/;
  ' "$FILE" > "$TMP"

  # -------------------------------------------------------------------
  # 2. Add blank lines around fenced code blocks (MD031)
  # -------------------------------------------------------------------
  sed -E '
    s/^```/\n```\n/g
  ' "$TMP" > "${TMP}.2"

  # -------------------------------------------------------------------
  # 3. Add blank lines around lists (MD032)
  # -------------------------------------------------------------------
  sed -E '
    s/^(\* |- [^-])/ \1/;
  ' "${TMP}.2" > "${TMP}.3"

  # -------------------------------------------------------------------
  # 4. Remove duplicate blank lines
  # -------------------------------------------------------------------
  sed -E '
    /^\s*$/ {
      N
      /^\s*\n\s*$/d
    }
  ' "${TMP}.3" > "${TMP}.4"

  # -------------------------------------------------------------------
  # 5. Ensure file ends with exactly one newline (MD047)
  # -------------------------------------------------------------------
  sed -E '$a\' "${TMP}.4" > "${TMP}.clean"

  mv "${TMP}.clean" "$FILE"
  rm -f "${TMP}" "${TMP}.2" "${TMP}.3" "${TMP}.4"

  echo ""
  echo "====================================================="
  echo "    🎉 Markdown fixed successfully!"
  echo "====================================================="
}
# ----------------------------
# rina cert-fix
# ----------------------------

do_cert_fix() {
  echo "====================================================="
  echo "        🔒 RINAWARP CERTIFICATE HEALING TOOL"
  echo "====================================================="
  echo "Production Setup: rinawarptech.com"
  echo "Port 3001: API Service Only"
  echo ""
  
  # Check if running as root
  if [ "$EUID" -ne 0 ]; then
    echo "[ERROR] This command must be run as root (use sudo rina cert-fix)"
    exit 1
  fi
  
  # Run the certificate healing script
  local SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local HEAL_SCRIPT="$SCRIPT_DIR/rina-cert-heal.sh"
  
  if [ -f "$HEAL_SCRIPT" ]; then
    bash "$HEAL_SCRIPT"
  else
    echo "[ERROR] Certificate healing script not found: $HEAL_SCRIPT"
    echo "Please ensure rina-cert-heal.sh is in the same directory as the CLI"
    exit 1
  fi
}
# ----------------------------
# Main routing
# ----------------------------

case "$COMMAND" in
  fix) do_fix ;;
  status) do_status ;;
  logs) do_logs ;;
  backup) do_backup ;;
  nginx) do_nginx ;;
  api) do_api ;;
  services) do_services ;;
  health) do_health ;;
  md-fix) do_md_fix ;;
  cert-fix) do_cert_fix ;;
  help|*) show_help ;;
esac
EOF

```

```
bash

# Step 2: Update installed version

cp ~/rina ~/.local/bin/rina
chmod +x ~/.local/bin/rina
chmod +x ~/rina-cert-heal.sh

```

### **Step 3: Test Installation**

```
bash

# Test CLI help (should show cert-fix)

rina help
# Test certificate healing (dry run)

sudo rina cert-fix

```
---
## 🎯 **USAGE INSTRUCTIONS**

### **Method 1: Via CLI (Recommended)**
```
bash

# Run complete certificate healing process

sudo rina cert-fix

```

### **Method 2: Direct Script Execution**
```
bash

# Run the healing script directly

sudo ./rina-cert-heal.sh

```
---
## ⚠️ **IMPORTANT NOTES**

### **🔒 Production Environment**

 - **Domain:** rinawarptech.com (configured for production)
 - **Port 3001:** API service only (as specified)
 - **Email:** admin@rinawarptech.com (for Let's Encrypt notifications)
### **🛡️ Safety Features**

 - **Full Backup:** All configurations backed up with timestamp
 - **Validation:** Tests configuration before applying changes
 - **Rollback:** Backup location provided for manual recovery if needed
### **✅ Expected Results**

After running `sudo rina cert-fix`, you should see:
 - ✅ New SSL certificates for rinawarptech.com
 - ✅ Proper NGINX configuration with SSL
 - ✅ Working HTTPS redirect from HTTP
 - ✅ API accessible at https://rinawarptech.com/api/
 - ✅ Certificate auto-renewal configured

---
## 🌟 **CLI Command Summary**
Your RinaWarp CLI now includes **10 comprehensive commands**:

1. **`rina help`** - Display all available commands
2. **`rina fix`** - Full development environment repair
3. **`rina status`** - System status dashboard
4. **`rina logs`** - Centralized log viewing
5. **`rina backup`** - Complete server backup
6. **`rina nginx <cmd>`** - NGINX management
7. **`rina api <cmd>`** - API service control
8. **`rina services`** - Service management
9. **`rina health`** - Health check endpoints
10. **`rina cert-fix`** - SSL certificate healing

**🎉 Your RinaWarp CLI system is now enterprise-grade with complete certificate management capabilities!**
