#!/bin/bash

echo "🚀 Deploying RinaWarp Website to Cloudflare Pages..."

set -e

# Check if Wrangler CLI is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed."
    echo "📦 Install it with: npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Cloudflare."
    echo "🔑 Login with: wrangler login"
    exit 1
fi

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages deploy public --project-name=rinawarptech

echo "✅ Deployment complete."
