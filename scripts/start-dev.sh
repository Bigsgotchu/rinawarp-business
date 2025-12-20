#!/usr/bin/env bash
set -euo pipefail
SERVICE="${1:-website}"

case "$SERVICE" in
  website)
    echo "🌐 Starting website development server..."
    cd apps/website
    npm run dev
    ;;
  admin-console)
    echo "🛠️  Starting admin console..."
    cd apps/admin-console
    npm run dev
    ;;
  ai-music-video)
    echo "🎵 Starting AI music video app..."
    cd apps/ai-music-video
    npm run dev
    ;;
  agent)
    echo "🤖 Starting Rina agent..."
    cd apps/terminal-pro/agent
    npm run dev
    ;;
  api-gateway)
    echo "🔌 Starting API gateway..."
    cd backend/api-gateway
    npm run dev
    ;;
  *)
    echo "Usage: $0 [website|admin-console|ai-music-video|agent|api-gateway]"
    exit 1
    ;;
esac
