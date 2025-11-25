#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/apps/terminal-pro/backend"

echo "🧱 [Backend] Building Terminal Pro backend..."
if [[ ! -d "$BACKEND_DIR" ]]; then
  echo "❌ Backend directory not found at $BACKEND_DIR"
  exit 1
fi

cd "$BACKEND_DIR"

if [[ ! -f package.json ]]; then
  echo "❌ No package.json in backend directory."
  exit 1
fi

echo "📦 Installing backend dependencies..."
npm install

if npm run | grep -q "build"; then
  echo "🏗️ Running backend build..."
  npm run build
else
  echo "ℹ️ No 'build' script found in backend package.json – skipping build step."
fi

if npm run | grep -q "test"; then
  echo "🧪 Running backend tests..."
  npm test
else
  echo "ℹ️ No 'test' script found – skipping tests."
fi

echo "✅ Backend build complete."