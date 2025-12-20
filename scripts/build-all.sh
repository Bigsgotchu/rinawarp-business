#!/usr/bin/env bash
set -euo pipefail
echo "🏗️  Building all RinaWarp services..."

# Build frontend apps
echo "📱 Building apps..."
for app in apps/*/; do
  if [ -f "$app/package.json" ]; then
    echo "Building $(basename "$app")..."
    cd "$app" && npm ci && npm run build && cd - > /dev/null
  fi
done

# Build Cloudflare workers
echo "☁️  Building Cloudflare workers..."
for worker in workers/*/; do
  if [ -f "$worker/wrangler.toml" ]; then
    echo "Building $(basename "$worker") worker..."
    cd "$worker" && npm ci && cd - > /dev/null
  fi
done

# Build backend services
echo "🔧 Building backend services..."
for backend in backend/*/; do
  if [ -f "$backend/package.json" ] && [ -d "$backend/src" ] || [ -f "$backend/server.js" ]; then
    echo "Building $(basename "$backend")..."
    cd "$backend" && npm ci && cd - > /dev/null
  fi
done

echo "✅ All builds completed!"
