#!/usr/bin/env bash
set -euo pipefail

# ================================
#  RINAWARP GLOBAL FIX PACK v1.0
#  Root: /home/karina/Documents/RinaWarp
# ================================

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 RinaWarp Fix Pack starting..."
echo "📁 Repo root: $REPO_ROOT"
echo

# ---------- helpers ----------
function section() {
  echo
  echo "============================================"
  echo "  $1"
  echo "============================================"
}

function run_if_exists() {
  local dir="$1"
  local cmd="$2"

  if [ -d "$dir" ]; then
    echo "➡️  [$dir] $cmd"
    (cd "$dir" && eval "$cmd")
  else
    echo "⚠️  Skipping, directory not found: $dir"
  fi
}

# ---------- 1. Repo clean + format ----------
function fix_repo() {
  section "1) REPO CLEANUP & FORMATTING"

  echo "🔍 Node projects: install deps + lint/format if scripts exist"

  # Desktop app (Electron)
  if [ -f "$REPO_ROOT/apps/terminal-pro/desktop/package.json" ]; then
    cd "$REPO_ROOT/apps/terminal-pro/desktop"
    echo "📦 [desktop] npm install (if needed)..."
    npm install --silent || true

    if npx --yes prettier --version >/dev/null 2>&1; then
      echo "✨ [desktop] Running Prettier..."
      npx --yes prettier "src/**/*.{js,ts,tsx,jsx,json,css,html}" --write || true
    fi

    if npm run lint >/dev/null 2>&1; then
      echo "🔎 [desktop] npm run lint..."
      npm run lint || true
    fi
  fi

  # Website
  if [ -f "$REPO_ROOT/rinawarp-website/package.json" ]; then
    cd "$REPO_ROOT/rinawarp-website"
    echo "📦 [website] npm install (if needed)..."
    npm install --silent || true

    if npx --yes prettier --version >/dev/null 2>&1; then
      echo "✨ [website] Running Prettier..."
      npx --yes prettier "**/*.{js,ts,jsx,tsx,css,html,json,md}" --write || true
    fi
  fi

  # VS Code extension
  if [ -f "$REPO_ROOT/rinawarp-vscode/package.json" ]; then
    cd "$REPO_ROOT/rinawarp-vscode"
    echo "📦 [vscode] npm install (if needed)..."
    npm install --silent || true

    if npx --yes prettier --version >/dev/null 2>&1; then
      echo "✨ [vscode] Running Prettier..."
      npx --yes prettier "**/*.{ts,js,json,md}" --write || true
    fi
  fi

  # Python backend formatting (FastAPI)
  if [ -f "$REPO_ROOT/apps/terminal-pro/backend/fastapi_server.py" ]; then
    section "🧠 Backend (Python) - black + isort"

    cd "$REPO_ROOT/apps/terminal-pro/backend"

    # Use local user environment instead of venv to keep it simple
    pip install --user black isort >/dev/null 2>&1 || true

    echo "✨ Running black..."
    python3 -m black fastapi_server.py || true

    echo "✨ Running isort..."
    python3 -m isort fastapi_server.py || true
  fi

  echo
  echo "✅ Repo cleanup & formatting pass complete."
}

# ---------- 2. Desktop builds (Linux / Win / Mac) ----------
function build_desktop() {
  section "2) DESKTOP BUILDS (Linux / Windows / macOS)"

  local DESKTOP_DIR="$REPO_ROOT/apps/terminal-pro/desktop"

  if [ ! -f "$DESKTOP_DIR/package.json" ]; then
    echo "❌ Desktop package.json not found at $DESKTOP_DIR"
    echo "   Skipping desktop build step."
    return 0
  fi

  cd "$DESKTOP_DIR"

  echo "📦 Ensuring Electron deps installed..."
  npm install || true

  echo "🧱 Building Linux (AppImage / DEB) if scripts exist..."
  if npm run | grep -q "build:linux"; then
    npm run build:linux || echo "⚠️ Linux build failed (check logs)."
  else
    echo "⚠️ No build:linux script found."
  fi

  echo "🧱 Building Windows installer if scripts exist..."
  if npm run | grep -q "build:win"; then
    npm run build:win || echo "⚠️ Windows build failed (check logs)."
  else
    echo "⚠️ No build:win script found."
  fi

  echo "🧱 Building macOS installer if scripts exist..."
  if npm run | grep -q "build:mac"; then
    npm run build:mac || echo "⚠️ macOS build failed (check logs)."
  else
    echo "⚠️ No build:mac script found."
  fi

  echo
  echo "📁 Check your dist/ folder for updated installers."
}

# ---------- 3. Website deploy (Netlify) ----------
function deploy_website() {
  section "3) WEBSITE LINK CHECK + NETLIFY DEPLOY"

  local WEB_DIR="$REPO_ROOT/rinawarp-website"

  if [ ! -d "$WEB_DIR" ]; then
    echo "❌ Website folder not found: $WEB_DIR"
    return 0
  fi

  cd "$WEB_DIR"

  echo "🔍 Optional: link check with npx linkinator (if installed)..."
  if npx --yes linkinator --version >/dev/null 2>&1; then
    npx --yes linkinator . --silent || echo "⚠️ Linkinator found potential issues (see above)."
  else
    echo "ℹ️ linkinator not installed, skipping deep link check."
  fi

  echo "🚀 Deploying to Netlify (requires 'netlify' CLI & auth)..."
  if command -v netlify >/dev/null 2>&1; then
    netlify deploy --prod --dir=. --message "RinaWarp Fix Pack deploy" || echo "⚠️ Netlify deploy failed (check auth / site config)."
  else
    echo "❌ Netlify CLI not found. Install with: npm install -g netlify-cli"
  fi
}

# ---------- 4. VS Code extension build + publish ----------
function vscode_release() {
  section "4) VS CODE EXTENSION BUILD + PUBLISH"

  local VSCODE_DIR="$REPO_ROOT/rinawarp-vscode"

  if [ ! -d "$VSCODE_DIR" ]; then
    echo "❌ VS Code extension folder not found: $VSCODE_DIR"
    return 0
  fi

  cd "$VSCODE_DIR"

  echo "📦 Installing extension deps..."
  npm install || true

  echo "🧱 Building .vsix package..."
  if ! command -v vsce >/dev/null 2>&1; then
    echo "❌ 'vsce' not installed. Install with: npm install -g @vscode/vsce"
    return 0
  fi

  vsce package || echo "⚠️ vsce package failed (check errors)."

  if [ "${RINAWARP_VSCE_PUBLISH:-0}" = "1" ]; then
    echo "🚀 Publishing to Marketplace (VSCE_PUBLISH=1)..."
    vsce publish || echo "⚠️ vsce publish failed (check PAT / publisher)."
  else
    echo "ℹ️ Skipping vsce publish. Set RINAWARP_VSCE_PUBLISH=1 to auto-publish."
  fi
}

# ---------- 5. Backend restart (PM2) ----------
function backend_restart() {
  section "5) BACKEND RESTART (PM2)"

  # Adjust if your PM2 process name or path differs
  if command -v pm2 >/dev/null 2>&1; then
    echo "♻️ Restarting PM2 process: rinawarp-api"
    pm2 restart rinawarp-api || echo "⚠️ pm2 restart failed (check process name)."
    pm2 save || true
  else
    echo "❌ pm2 not installed or not on PATH."
  fi
}

# ---------- 6. All-in-one ----------
function run_all() {
  fix_repo
  build_desktop
  deploy_website
  vscode_release
  backend_restart

  section "✅ RINAWARP FIX PACK COMPLETE"
  echo "✨ Repo cleaned & formatted"
  echo "✨ Desktop builds attempted (Linux/Win/Mac)"
  echo "✨ Website deploy attempted via Netlify"
  echo "✨ VS Code extension packaged (and optionally published)"
  echo "✨ Backend restart attempted via PM2"
}

# ---------- CLI ----------
case "${1:-all}" in
  repo)
    fix_repo
    ;;
  desktop)
    build_desktop
    ;;
  web|website)
    deploy_website
    ;;
  vscode|vscode-release)
    vscode_release
    ;;
  backend)
    backend_restart
    ;;
  all)
    run_all
    ;;
  *)
    echo "Usage: $0 [all|repo|desktop|website|vscode|backend]"
    exit 1
    ;;
esac