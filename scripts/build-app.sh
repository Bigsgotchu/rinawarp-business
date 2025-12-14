#!/usr/bin/env bash
set -euo pipefail
APP_NAME="${1:-}"
if [ -z "$APP_NAME" ]; then
  echo "Usage: $0 <app-name>"
  echo "Available apps: admin-console, ai-music-video, phone-manager, terminal-pro, website"
  exit 1
fi

if [ ! -d "apps/$APP_NAME" ]; then
  echo "❌ App '$APP_NAME' not found in apps/"
  exit 1
fi

echo "🏗️  Building app: $APP_NAME"
cd "apps/$APP_NAME"
npm ci
npm run build
echo "✅ App '$APP_NAME' built successfully!"
