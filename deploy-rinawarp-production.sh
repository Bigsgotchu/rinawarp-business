#!/bin/bash
set -euo pipefail

# ==========================
# Configuration
# ==========================
EXTENSION_DIR="./vscode-rinawarp-extension"
SITE_DIR="./rinawarp-website-deploy"
PROJECT_NAME="rinawarptech-website"
DOMAIN="rinawarptech.com"
VSCE_PUBLISH=false           # Set to true to publish VSIX to Marketplace
PATH="$PATH:/home/karina/.npm-global/bin"  # Ensure wrangler in PATH
CSS_SRC="./rinawarp-colors.css"
COOKIE_BANNER="./cookie-banner.html"
SMOKE_SCRIPT="$EXTENSION_DIR/verify-rinawarp-smoke.js"
LOG_FILE="./deployment-log.csv"

echo "🚀 Starting RinaWarp full production deployment..."

# ==========================
# Step 0: Install dependencies
# ==========================
echo "🛠️ Installing dependencies..."
cd "$EXTENSION_DIR" || exit
npm install
echo "✅ Dependencies installed."

# ==========================
# Step 1: Build VS Code extension
# ==========================
echo "📦 Building VS Code extension..."
npm run compile
echo "✅ Extension build completed."

# ==========================
# Step 2: Package VSIX
# ==========================
echo "📦 Packaging VSIX..."
vsce package
VSIX_FILE=$(ls *.vsix | sort -V | tail -n 1)
echo "✅ VSIX package created: $VSIX_FILE"

# ==========================
# Step 3: Optional Marketplace publish
# ==========================
if [ "$VSCE_PUBLISH" = true ]; then
  echo "🚀 Publishing VSIX to Marketplace..."
  vsce publish
  echo "✅ VSIX published to Marketplace."
fi

cd - || exit  # Return to root

# ==========================
# Step 4: Build Website
# ==========================
echo "🌐 Building website..."
# Add your actual build command if needed, e.g. npm run build
# npm run build --prefix "$SITE_DIR"
echo "✅ Website build completed."

# ==========================
# Step 5: Inject CSS & Cookie Banner
# ==========================
echo "🎨 Injecting RinaWarp CSS and cookie banner..."
mkdir -p "$SITE_DIR/css"
cp "$CSS_SRC" "$SITE_DIR/css/rinawarp-colors.css"

# Inject cookie banner into all HTML pages
for html_file in $(find "$SITE_DIR" -name "*.html"); do
  # Only inject if not already present
  if ! grep -q "id=\"rinawarp-cookie-banner\"" "$html_file"; then
    sed -i "/<\/body>/i\\
    <!-- RinaWarp Cookie Banner -->\\
    $(cat "$COOKIE_BANNER")" "$html_file"
  fi
done
echo "✅ CSS and cookie banner injected."

# ==========================
# Step 6: Deploy to Cloudflare Pages
# ==========================
echo "📤 Deploying website to Cloudflare Pages..."
wrangler pages deploy "$SITE_DIR" --project-name "$PROJECT_NAME" --commit-dirty=true
echo "✅ Deployment complete."

# ==========================
# Step 7: Verify live website
# ==========================
echo "🔍 Verifying website accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://"$DOMAIN")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Website is live and returning HTTP 200 at https://$DOMAIN"
else
  echo "⚠️ Website returned HTTP $HTTP_STATUS. Check deployment!"
fi

# ==========================
# Step 8: Run Puppeteer Smoke Tests
# ==========================
echo "🧪 Running Puppeteer smoke tests..."
cd "$EXTENSION_DIR" || exit

SMOKE_LOG="./smoke-test-log.txt"
set +e
node "$SMOKE_SCRIPT" &> "$SMOKE_LOG"
SMOKE_EXIT=$?
set -e

if [ "$SMOKE_EXIT" -ne 0 ]; then
  echo "❌ Smoke tests failed! See $SMOKE_LOG"
  # Capture screenshot for debugging
  if [ -f "./failure-screenshot.png" ]; then
    echo "📸 Screenshot saved: failure-screenshot.png"
  fi
  exit 1
else
  echo "✅ Smoke tests passed!"
fi
cd - || exit

# ==========================
# Step 9: Audit Logging
# ==========================
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "$TIMESTAMP,$VSIX_FILE,https://$DOMAIN,$HTTP_STATUS" >> "$LOG_FILE"
echo "📝 Deployment logged to $LOG_FILE"

echo "🎯 RinaWarp full production deployment completed successfully!"
