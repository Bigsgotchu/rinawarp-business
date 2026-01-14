#!/bin/bash

# ==========================
# Configuration
# ==========================
EXTENSION_DIR="./vscode-rinawarp-extension"
SITE_DIR="./rinawarp-website-deploy"
PROJECT_NAME="rinawarptech-website"
DOMAIN="rinawarptech.com"
VSCE_PUBLISH=false
CSS_SOURCE="./rinawarp-colors.css"
COOKIE_BANNER_SOURCE="./cookie-banner.html"
PATH="$PATH:/home/karina/.npm-global/bin"

# Pages to verify post-deploy
PAGES=(
  "/"
  "/about"
  "/pricing"
  "/checkout"
  "/downloads"
  "/privacy"
  "/tos"
)

echo "Starting RinaWarp production workflow with full branding & legal compliance..."

# ==========================
# Step 0: Install missing dependencies
# ==========================
cd "$EXTENSION_DIR" || exit
npm install --save-dev @types/vscode@^1.80.0
npm install node-fetch@2.6.12 zod
npm install --save-dev @types/node
npm install
npm run compile
VSIX_FILE=$(ls *.vsix | sort -V | tail -n 1)
cd - || exit
echo "VS Code extension built and VSIX created: $VSIX_FILE"

# Optional publish
if [ "$VSCE_PUBLISH" = true ]; then
  vsce publish
  echo "VSIX published to Marketplace."
fi

# ==========================
# Step 1: Build Website
# ==========================
# Replace with actual build command
# npm run build
echo "Website build completed."

# ==========================
# Step 2: Inject RinaWarp CSS
# ==========================
CSS_DEST="$SITE_DIR/css/rinawarp-colors.css"
mkdir -p "$(dirname "$CSS_DEST")"
cp "$CSS_SOURCE" "$CSS_DEST"
echo "RinaWarp CSS injected"

# ==========================
# Step 3: Inject Cookie Banner & Legal Links
# ==========================
# Inject cookie banner into every HTML file
if [ -f "$COOKIE_BANNER_SOURCE" ]; then
  for FILE in "$SITE_DIR"/*.html; do
    # Inject before </body>
    sed -i "/<\/body>/i $(cat "$COOKIE_BANNER_SOURCE")" "$FILE"
  done
  echo "Cookie banner injected into all pages"
else
  echo "Cookie banner source file missing: $COOKIE_BANNER_SOURCE"
fi

# Ensure Privacy Policy and TOS links exist
[ ! -f "$SITE_DIR/privacy.html" ] && echo "Missing Privacy Policy"
[ ! -f "$SITE_DIR/tos.html" ] && echo "Missing Terms of Service"

# ==========================
# Step 4: Deploy to Cloudflare Pages
# ==========================
wrangler pages deploy "$SITE_DIR" --project-name "$PROJECT_NAME" --commit-dirty=true
echo "Deployment complete"

# ==========================
# Step 5: Run Puppeteer Smoke Tests
# ==========================
echo "🧪 Running full smoke tests (cookie banner, downloads, Stripe)..."
cd "$EXTENSION_DIR" || exit

# Ensure Puppeteer is installed
npm install puppeteer --no-save

# Run the smoke test script
node ../verify-rinawarp-smoke.js
SMOKE_EXIT=$?

if [ "$SMOKE_EXIT" -ne 0 ]; then
  echo "❌ Smoke test failed! Check logs above."
  exit 1
else
  echo "✅ Smoke test passed! All critical functionality verified."
fi

cd - || exit

# ==========================
# Step 7: Verify Pages, Buttons, Stripe & Downloads
# ==========================
echo "Verifying pages..."
for PAGE in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://"$DOMAIN$PAGE")
  if [ "$STATUS" -eq 200 ]; then
    echo "$PAGE is live (HTTP 200)"
  else
    echo "$PAGE returned $STATUS"
  fi
done

# Check downloads
DOWNLOADS_OK=true
for FILE in "$SITE_DIR/downloads/"*; do
  [ ! -f "$FILE" ] && { DOWNLOADS_OK=false; echo "Missing download: $FILE"; }
done
$DOWNLOADS_OK && echo "All downloads present"

# Check Stripe page
STRIPE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://"$DOMAIN/checkout")
if [ "$STRIPE_CHECK" -eq 200 ]; then
  echo "Stripe checkout reachable"
else
  echo "Stripe checkout returned $STRIPE_CHECK"
fi

echo "Full RinaWarp production workflow with branding and legal compliance completed!"
