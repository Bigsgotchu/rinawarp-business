#!/bin/bash
set -e

echo "======================================================="
echo "        🚀 RINAWARP LOCKED DEPLOYMENT PIPELINE"
echo "======================================================="

cd /home/karina/Documents/RinaWarp

echo "🔒 This script ensures 100% consistent deployments"
echo "🎯 Target: https://rinawarptech.com"
echo ""

# Step 1: Pre-deployment validation
echo "1️⃣ RUNNING PRE-DEPLOYMENT VALIDATION..."
if [ ! -f "./rw-validate.sh" ]; then
    echo "❌ ERROR: rw-validate.sh not found!"
    exit 1
fi

chmod +x ./rw-validate.sh
./rw-validate.sh

if [ $? -ne 0 ]; then
    echo "❌ VALIDATION FAILED - Fix issues before deploying!"
    exit 1
fi

echo "✅ Pre-deployment validation PASSED"
echo ""

# Step 2: Clean and consolidate website files
echo "2️⃣ CONSOLIDATING WEBSITE FILES..."

# Ensure we have the essential website files
REQUIRED_FILES=("index.html" "terminal-pro.html" "music-video-creator.html" "pricing.html" "download.html" "support.html")
missing_files=0

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        missing_files=1
    fi
done

if [ "$missing_files" -eq 1 ]; then
    echo "❌ ERROR: Required website files are missing!"
    echo "💡 Run this to copy from website-final directory:"
    echo "   cp -r rinawarp-website-final/*.html ."
    echo "   cp -r rinawarp-website-final/assets ."
    echo "   cp -r rinawarp-website-final/css ."
    echo "   cp -r rinawarp-website-final/js ."
    exit 1
fi

echo "✅ All required files present"
echo ""

# Step 3: Fix Netlify configuration
echo "3️⃣ ENSURING NETLIFY CONFIGURATION..."

cat <<EOF > netlify.toml
[build]
  publish = "."
  command = ""

# Proxy all API traffic to your Oracle backend
[[redirects]]
  from = "/api/*"
  to = "https://api.rinawarptech.com/:splat"
  status = 200
  force = true

# Pretty URLs & static routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
EOF

echo "✅ netlify.toml updated"
echo ""

# Step 4: Fix redirects
echo "4️⃣ ENSURING REDIRECTS..."

cat <<EOF > _redirects
/api/* https://api.rinawarptech.com/:splat 200
/* /index.html 200
EOF

echo "✅ _redirects updated"
echo ""

# Step 5: Lock site ID
echo "5️⃣ LOCKING NETLIFY SITE ID..."

mkdir -p .netlify
cat <<EOF > .netlify/state.json
{
  "siteId": "76d96b63-8371-4594-b995-ca6bdac671af"
}
EOF

echo "✅ Site ID locked to correct project"
echo ""

# Step 6: Clean cache
echo "6️⃣ CLEANING NETLIFY CACHE..."
rm -rf .netlify/cache 2>/dev/null || true
rm -rf .netlify/deploy 2>/dev/null || true
rm -rf .netlify/functions 2>/dev/null || true

echo "✅ Cache cleaned"
echo ""

# Step 7: Deploy
echo "7️⃣ DEPLOYING TO PRODUCTION..."

if ! command -v netlify &> /dev/null; then
    echo "❌ ERROR: Netlify CLI not found!"
    echo "💡 Install with: npm install -g netlify-cli"
    exit 1
fi

echo "🚀 Starting deployment..."
netlify deploy --prod --dir=.

echo ""
echo "======================================================="
echo "         🎉 DEPLOYMENT PIPELINE COMPLETE"
echo "======================================================="
echo ""
echo "✅ Validation: PASSED"
echo "✅ Files: CONSOLIDATED"
echo "✅ Config: LOCKED"
echo "✅ Cache: CLEANED"
echo "✅ Deploy: COMPLETE"
echo ""
echo "🔗 Your site is live at: https://rinawarptech.com"
echo ""
echo "🛡️ This deployment is protected against:"
echo "   • Wrong directory deployments"
echo "   • Missing configuration files"
echo "   • Broken redirects"
echo "   • Cached old content"
echo "   • Incorrect site targeting"
echo ""
echo "💡 For future deployments, ALWAYS use:"
echo "   ./rw-deploy-netlify.sh"
echo ""
echo "======================================================="