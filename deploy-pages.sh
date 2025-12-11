#!/bin/bash

echo "🚀 Deploying RinaWarp Website to Cloudflare Pages..."

# Exit if any command fails
set -e

# Check if we're in the right directory
if [ ! -d "public" ]; then
  echo "❌ Error: public directory not found. Please run this script from the project root."
  exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "📦 Installing Wrangler CLI..."
  npm install -g wrangler
fi

# Deploy to Cloudflare Pages
echo "📤 Uploading to Cloudflare Pages..."
wrangler pages publish public --project-name=rinawarptech

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://rinawarptech.pages.dev"
echo "🔗 Don't forget to set up your custom domain in the Cloudflare dashboard!"
