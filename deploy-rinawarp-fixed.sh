#!/bin/bash

# ==========================
# Configuration
# ==========================
EXTENSION_DIR="./vscode-rinawarp-extension"
SITE_DIR="./rinawarp-website-deploy"  # Your website build output
PROJECT_NAME="rinawarptech-website"
DOMAIN="rinawarptech.com"
VSCE_PUBLISH=false  # Set to true to publish VSIX to Marketplace
PATH="$PATH:/home/karina/.npm-global/bin"  # Ensure wrangler is in PATH

echo "🚀 Starting RinaWarp full build-and-deploy workflow..."

# ==========================
# Step 0: Fix missing dependencies (VS Code extension)
# ==========================
echo "🛠️ Installing missing dependencies..."
cd "$EXTENSION_DIR" || exit
npm install --save-dev @types/vscode@^1.80.0
npm install node-fetch@2.6.12 zod
npm install --save-dev @types/node
echo "✅ Dependencies installed."

# ==========================
# Step 1: Build VS Code extension
# ==========================
echo "📦 Building VS Code extension..."
npm install
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
# Step 3: Optional publish to Marketplace
# ==========================
if [ "$VSCE_PUBLISH" = true ]; then
  echo "🚀 Publishing VSIX to Marketplace..."
  vsce publish
  echo "✅ VSIX published to Marketplace."
fi

cd - || exit  # Return to root directory

# ==========================
# Step 4: Build website
# ==========================
echo "🌐 Building website..."
# Add your actual website build command here, e.g., npm run build
# npm run build
echo "✅ Website build completed."

# ==========================
# Step 5: Inject RinaWarp color CSS
# ==========================
echo "🎨 Injecting RinaWarp color palette CSS..."
CSS_SOURCE="./rinawarp-colors.css"
CSS_DEST="$SITE_DIR/css/rinawarp-colors.css"

mkdir -p "$(dirname "$CSS_DEST")"
cp "$CSS_SOURCE" "$CSS_DEST"
echo "✅ RinaWarp color CSS injected."

# ==========================
# Step 6: Deploy to Cloudflare Pages
# ==========================
echo "📤 Deploying website to Cloudflare Pages..."
wrangler pages deploy "$SITE_DIR" --project-name "$PROJECT_NAME" --commit-dirty=true
echo "✅ Deployment complete."

# ==========================
# Step 6: Verify live website
# ==========================
echo "🔍 Verifying website accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://"$DOMAIN")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Website is live and returning HTTP 200 at https://$DOMAIN"
else
  echo "⚠️ Website returned HTTP $HTTP_STATUS. Check the deployment!"
fi

echo "🎯 Full RinaWarp build-and-deploy workflow completed!"
