#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/apps/terminal-pro/frontend"

echo "🎨 [Frontend] Building Terminal Pro frontend..."
if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "❌ Frontend directory not found at $FRONTEND_DIR"
  exit 1
fi

cd "$FRONTEND_DIR"

if [[ ! -f package.json ]]; then
  echo "❌ No package.json in frontend directory."
  exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

if npm run | grep -q "build"; then
  echo "🏗️ Running frontend build (Vite/React/etc)..."
  npm run build
else
  echo "❌ No 'build' script found in frontend package.json."
  exit 1
fi

echo "✅ Frontend build complete. (dist/ should now exist)"