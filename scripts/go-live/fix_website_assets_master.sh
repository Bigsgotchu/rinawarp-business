#!/usr/bin/env bash
set -euo pipefail

# Master "Fix Website Assets" script for RinaWarp
#
# Does:
#   1) Build apps/website into dist/
#   2) Deploy dist/ to Cloudflare Pages (project: rinawarptech, branch: master)
#   3) Run production asset + admin validation
#
# Requirements:
#   - Node + npm
#   - wrangler CLI logged in
#   - STRIPE + Cloudflare env already configured
#   - scripts/tools/validation/validate_assets_and_admin.sh present
#
# Usage:
#   ADMIN_API_SECRET=your_admin_secret \
#     scripts/go-live/fix_website_assets_master.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/audit/fix-website-assets"
mkdir -p "$LOG_DIR"
TS="$(date +"%Y%m%d-%H%M%S")"
LOG_FILE="$LOG_DIR/fix-website-assets-$TS.log"

BASE_URL="${BASE_URL:-https://rinawarptech.com}"
CF_PAGES_PROJECT="${CF_PAGES_PROJECT:-rinawarptech}"
CF_PAGES_BRANCH="${CF_PAGES_BRANCH:-master}"
ADMIN_API_SECRET="${ADMIN_API_SECRET:-}"

echo "========================================" | tee "$LOG_FILE"
echo " RINAWARP FIX WEBSITE ASSETS (MASTER)" | tee -a "$LOG_FILE"
echo " Started: $(date)" | tee -a "$LOG_FILE"
echo " Root:    $ROOT_DIR" | tee -a "$LOG_FILE"
echo " BaseURL: $BASE_URL" | tee -a "$LOG_FILE"
echo " Project: $CF_PAGES_PROJECT (branch: $CF_PAGES_BRANCH)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo | tee -a "$LOG_FILE"

fail() {
  echo "❌ $*" | tee -a "$LOG_FILE"
  exit 1
}

ok() {
  echo "✅ $*" | tee -a "$LOG_FILE"
}

warn() {
  echo "⚠️  $*" | tee -a "$LOG_FILE"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
  fi
}

require_cmd npm
require_cmd npx
require_cmd wrangler
require_cmd curl

VALIDATOR="$ROOT_DIR/scripts/tools/validation/validate_assets_and_admin.sh"
if [[ ! -x "$VALIDATOR" ]]; then
  fail "Validator script not found or not executable: $VALIDATOR"
fi

echo "STEP 1 — Build apps/website → dist/" | tee -a "$LOG_FILE"
echo "------------------------------------" | tee -a "$LOG_FILE"

WEBSITE_DIR="$ROOT_DIR/apps/website"
if [[ ! -d "$WEBSITE_DIR" ]]; then
  fail "apps/website directory not found at $WEBSITE_DIR"
fi

cd "$WEBSITE_DIR"

if [[ ! -f package.json ]]; then
  fail "No package.json in apps/website — cannot run build"
fi

if ! npm run build; then
  fail "npm run build failed for apps/website"
fi

if [[ ! -d dist || ! -f dist/index.html ]]; then
  fail "Build completed but dist/index.html not found"
fi

ok "Website build completed, dist/ ready"
echo | tee -a "$LOG_FILE"

echo "STEP 2 — Deploy dist/ to Cloudflare Pages" | tee -a "$LOG_FILE"
echo "-----------------------------------------" | tee -a "$LOG_FILE"

read -r -p "Deploy dist/ to Cloudflare Pages project '$CF_PAGES_PROJECT' now? [y/N] " ANSWER
ANSWER="${ANSWER:-N}"

if [[ "$ANSWER" != "y" && "$ANSWER" != "Y" ]]; then
  warn "User cancelled deployment step. Skipping deploy and going straight to validation."
else
  if ! npx wrangler pages deploy dist \
        --project-name "$CF_PAGES_PROJECT" \
        --branch "$CF_PAGES_BRANCH"; then
    fail "wrangler pages deploy failed"
  fi
  ok "Cloudflare Pages deploy completed"
fi

echo | tee -a "$LOG_FILE"
echo "STEP 3 — Run production asset + admin validation" | tee -a "$LOG_FILE"
echo "-----------------------------------------------" | tee -a "$LOG_FILE"

cd "$ROOT_DIR"

BASE_URL="$BASE_URL" \
ADMIN_API_SECRET="$ADMIN_API_SECRET" \
bash "$VALIDATOR"

ok "Validation script executed; see its own log in audit/validation/"
echo | tee -a "$LOG_FILE"

echo "========================================" | tee -a "$LOG_FILE"
ok "Fix Website Assets master script completed"
echo "Log: $LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"