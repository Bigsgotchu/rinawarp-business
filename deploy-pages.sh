#!/bin/bash

echo "🚀 Deploying RinaWarp Website to Cloudflare Pages..."

# Exit if any command fails
set -e

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "📦 Installing Wrangler CLI..."
  npm install -g wrangler
fi

# Deploy to Cloudflare Pages
echo "📤 Uploading to Cloudflare Pages..."
cd site && wrangler pages deploy ./public --project-name=rinawarptech

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://rinawarptech.com"
echo "🔗 Functions are deployed with the site."
