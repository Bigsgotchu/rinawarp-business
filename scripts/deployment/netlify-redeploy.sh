#!/bin/bash
set -e

echo "============================================="
echo "     🔵 RINAWARP ONE-CLICK NETLIFY REDEPLOY"
echo "============================================="

cd /home/karina/Documents/RinaWarp

echo "🧹 Cleaning Netlify metadata..."
rm -rf .netlify
mkdir -p .netlify

cat <<EOF > .netlify/state.json
{
  "siteId": "76d96b63-8371-4594-b995-ca6bdac671af"
}
EOF

echo "🧼 Removing old cache and old deploy files..."
rm -rf .netlify/cache
rm -rf .netlify/deploy

echo "📄 Ensuring _redirects file exists..."
cat <<EOF > _redirects
/api/* https://api.rinawarptech.com/:splat 200
/* /index.html 200
EOF

echo "🛠 Regenerating netlify.toml..."
cat <<EOF > netlify.toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/api/*"
  to = "https://api.rinawarptech.com/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
EOF

echo "🚀 Deploying to PRODUCTION..."
netlify deploy --prod --dir=.

echo "============================================="
echo "     🎉 FINISHED — RINAWARP LIVE UPDATED!"
echo "     🔗 https://rinawarptech.com"
echo "============================================="