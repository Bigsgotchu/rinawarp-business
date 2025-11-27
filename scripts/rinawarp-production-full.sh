#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/karina/Documents/RinaWarp"
WEBSITE_DIR="$ROOT/rinawarp-website"
FIX_PACK="$ROOT/scripts/rinawarp-fix-pack.sh"
DEPLOY_PACKAGE_DIR="$ROOT/rinawarp-tech-com-deployment"
DOWNLOADS_UPLOAD_DIR="$ROOT/downloads-upload"

ORACLE_USER="ubuntu"
ORACLE_HOST="158.101.1.38"
ORACLE_SSH_KEY="$HOME/.ssh/id_rsa"
ORACLE_REMOTE_ROOT="/var/www/rinawarp-api"
ORACLE_DOWNLOADS_DIR="$ORACLE_REMOTE_ROOT/downloads"
ORACLE_DEPLOY_SCRIPT="$ORACLE_REMOTE_ROOT/oracle-vm-deployment-complete.sh"

NETLIFY_MESSAGE="RinaWarp Production Fix + Oracle Upload"

echo "🚀 RINAWARP PRODUCTION FULL RELEASE STARTED"
echo "📂 ROOT: $ROOT"
echo

########################################
# 1) MERGE VISUAL FIX PACKAGE → WEBSITE
########################################
if [ -d "$DEPLOY_PACKAGE_DIR" ]; then
  echo "🎨 Applying visual + layout fixes from $DEPLOY_PACKAGE_DIR → $WEBSITE_DIR ..."
  rsync -av --delete "$DEPLOY_PACKAGE_DIR"/ "$WEBSITE_DIR"/
  echo "✅ Visual package synced into live website source"
else
  echo "⚠️ Visual deployment package not found at:"
  echo "   $DEPLOY_PACKAGE_DIR"
  echo "   Skipping visual overlay (using existing website files)."
fi

########################################
# 2) RUN FIX PACK LOCALLY
########################################
if [ -x "$FIX_PACK" ]; then
  echo
  echo "🧹 Running repo cleanup + website + backend fix pack..."
  "$FIX_PACK" repo    || echo "⚠️ repo fix-pack step failed, continuing..."
  "$FIX_PACK" website || echo "⚠️ website fix-pack step failed, continuing..."
  "$FIX_PACK" backend || echo "⚠️ backend fix-pack step failed, continuing..."
else
  echo
  echo "⚠️ Fix-pack script not executable or missing at:"
  echo "   $FIX_PACK"
fi

########################################
# 3) NETLIFY DEPLOY (PRODUCTION)
########################################
echo
echo "🌐 Deploying website to Netlify (production)..."
if command -v netlify >/dev/null 2>&1; then
  (
    cd "$WEBSITE_DIR"
    netlify deploy --prod --dir=. --message "$NETLIFY_MESSAGE"
  )
  echo "✅ Netlify production deploy command run"
else
  echo "❌ Netlify CLI not installed. Install with:"
  echo "   npm install -g netlify-cli"
fi

########################################
# 4) CHECK FOR INSTALLERS TO UPLOAD
########################################
echo
echo "📦 Checking for installer files in $DOWNLOADS_UPLOAD_DIR ..."
if [ -d "$DOWNLOADS_UPLOAD_DIR" ]; then
  ls -lh "$DOWNLOADS_UPLOAD_DIR" || true
else
  echo "❌ downloads-upload directory not found:"
  echo "   $DOWNLOADS_UPLOAD_DIR"
fi

########################################
# 5) UPLOAD INSTALLERS TO ORACLE VM
########################################
if [ -d "$DOWNLOADS_UPLOAD_DIR" ]; then
  echo
  echo "📤 Uploading installers to Oracle VM ($ORACLE_HOST)..."
  scp -i "$ORACLE_SSH_KEY" "$DOWNLOADS_UPLOAD_DIR"/* \
      "$ORACLE_USER@$ORACLE_HOST:$ORACLE_DOWNLOADS_DIR" || {
    echo "❌ SCP upload failed. Check SSH key, user, and path."
  }
else
  echo "⚠️ Skipping Oracle upload (no downloads-upload directory)."
fi

########################################
# 6) RUN ORACLE VM DEPLOYMENT SCRIPT
########################################
echo
echo "🖥️ Running Oracle VM deployment script..."
ssh -i "$ORACLE_SSH_KEY" "$ORACLE_USER@$ORACLE_HOST" " \
  cd '$ORACLE_REMOTE_ROOT' && \
  if [ -f '$ORACLE_DEPLOY_SCRIPT' ]; then \
    sudo chmod +x '$ORACLE_DEPLOY_SCRIPT' && \
    sudo '$ORACLE_DEPLOY_SCRIPT'; \
  else \
    echo '❌ Deploy script not found at $ORACLE_DEPLOY_SCRIPT'; \
  fi" || echo "⚠️ SSH command failed, please verify server connectivity."

########################################
# 7) HEALTH CHECKS
########################################
echo
echo "🩺 Running post-deploy health checks..."

echo "  → Website (Netlify custom domain expected: rinawarptech.com)"
echo "     (Manually check in browser after DNS / Netlify mapping)"

echo "  → API health:"
curl -sS https://api.rinawarptech.com/health || echo "⚠️ Health check failed"

echo "  → Sample download (AppImage):"
curl -I https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage || echo "⚠️ Download check failed"

echo
echo "✅ RINAWARP PRODUCTION FULL RELEASE SCRIPT COMPLETE"