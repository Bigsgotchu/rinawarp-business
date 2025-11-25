#!/usr/bin/env bash
set -e

echo "🚀 RinaWarp One-Click Deploy"

ROOT="/home/karina/Documents/RinaWarp"
BACKEND="$ROOT/apps/terminal-pro/backend"
WEBSITE="$ROOT/rinawarp-website"

echo "1) Build desktop artifacts (Linux only here)..."
cd "$ROOT/apps/terminal-pro/desktop"
npm run build:linux

echo "2) Sync latest installers to website download links (already wired by URL)..."

echo "3) Restart backend via PM2..."
cd "$BACKEND"
python3 -m venv venv || true
source venv/bin/activate
pip install -r requirements.txt
pm2 delete rinawarp-api || true
pm2 start uvicorn --name rinawarp-api -- "fastapi_server:app" --host 0.0.0.0 --port 8000
pm2 save

echo "4) Deploy website to Netlify..."
cd "$WEBSITE"
netlify deploy --prod --dir=. --message 'one-click deploy'

echo "✅ Deployment complete."