
# 🚀 RINA CLI INSTALLATION FOR REMOTE SERVER

## 📋 **Install Rina CLI on Remote Server**
Run these commands on your remote server (`ubuntu@Rinawarp-Api`):
### **Step 1: Create the CLI script**
```
bash
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
  help|*) show_help ;;
esac
EOF

```

### **Step 2: Make executable and install globally**
```
bash

# Make executable

chmod +x ~/rina
# Option A: Install to user local bin (recommended)

mkdir -p ~/.local/bin
cp ~/rina ~/.local/bin/rina
chmod +x ~/.local/bin/rina
# Add to PATH

echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
# Option B: OR install to /usr/local/bin (if you have sudo)
# sudo cp ~/rina /usr/local/bin/rina
# sudo chmod +x /usr/local/bin/rina
```

### **Step 3: Test the installation**
```
bash

# Show help

rina help
# Test fix command

rina fix
# Test other commands

rina status
rina nginx test
rina logs

```

## ✅ **Verification**
After installation, you should be able to run:

```
bash
rina help

```
This should display:

```

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

Type:
  rina help
for details.
=====================================================

```

## 🎯 **Expected Result**
After installation, your remote server will have:
 - ✅ `rina` CLI command available globally
 - ✅ `rina-fix` integration working properly  
 - ✅ All 8 CLI commands operational
 - ✅ Complete RinaWarp system management capabilities
