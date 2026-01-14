#!/bin/bash

# === Configuration ===
EXTENSION_DIR="./vscode-rinawarp-extension"
SITE_DIR="./rinawarp-website-deploy"  # Your website build output
PROJECT_NAME="rinawarptech-website"
DOMAIN="rinawarptech.com"
PATH="$PATH:/home/karina/.npm-global/bin"  # Ensure wrangler is in PATH

echo "🚀 Starting full RinaWarp build-and-deploy workflow..."

# === Step 1: Build VS Code extension ===
echo "📦 Building VS Code extension..."
cd "$EXTENSION_DIR" || exit
npm install
npm run compile
echo "✅ Extension build completed."

# === Step 2: Build website ===
echo "🌐 Building website..."
# Add your site build command here (replace with your actual build command)
# For example, if using Vite/React:
# npm run build
cd - || exit  # Return to root directory
echo "✅ Website build completed."

# === Step 3: Inject RinaWarp color CSS ===
echo "🎨 Injecting RinaWarp color palette CSS..."
CSS_SOURCE="./rinawarp-colors.css"
CSS_DEST="$SITE_DIR/css/rinawarp-colors.css"

mkdir -p "$(dirname "$CSS_DEST")"
cp "$CSS_SOURCE" "$CSS_DEST"
echo "✅ RinaWarp color CSS injected."

# === Step 4: Deploy to Cloudflare Pages ===
echo "📤 Deploying website to Cloudflare Pages..."
wrangler pages deploy "$SITE_DIR" --project-name "$PROJECT_NAME"
echo "✅ Deployment complete."

# === Step 4: Add/verify custom domain ===
echo "🔗 Linking domain $DOMAIN..."
wrangler pages project domain add "$PROJECT_NAME" "$DOMAIN" --yes
wrangler pages project domain list "$PROJECT_NAME"

# === Step 5: Verify live website ===
echo "🔍 Verifying website accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://"$DOMAIN")
if [ "$HTTP_STATUS" -eq 200 ]; then
  echo "✅ Website is live and returning HTTP 200 at https://$DOMAIN"
else
  echo "⚠️ Website returned HTTP $HTTP_STATUS. Check the deployment!"
fi

echo "🎯 Full build-and-deploy workflow completed!"
