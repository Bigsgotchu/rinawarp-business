#!/usr/bin/env bash
set -euo pipefail

# Tiny production validator for:
#  - CSS/JS asset MIME types
#  - Admin billing endpoint auth
#
# Usage:
#   BASE_URL=https://rinawarptech.com ADMIN_API_SECRET=your_secret \
#     scripts/tools/validation/validate_assets_and_admin.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
LOG_DIR="$ROOT_DIR/audit/validation"
mkdir -p "$LOG_DIR"
TS="$(date +"%Y%m%d-%H%M%S")"
LOG_FILE="$LOG_DIR/validate_assets_and_admin-$TS.log"

BASE_URL="${BASE_URL:-https://rinawarptech.com}"
ADMIN_API_SECRET="${ADMIN_API_SECRET:-}"

echo "========================================" | tee "$LOG_FILE"
echo " RINAWARP PRODUCTION ASSET VALIDATION" | tee -a "$LOG_FILE"
echo " Started: $(date)" | tee -a "$LOG_FILE"
echo " Base URL: $BASE_URL" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo | tee -a "$LOG_FILE"

fail() {
  echo "❌ $*" | tee -a "$LOG_FILE"
  exit 1
}

warn() {
  echo "⚠️  $*" | tee -a "$LOG_FILE"
}

ok() {
  echo "✅ $*" | tee -a "$LOG_FILE"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
  fi
}

require_cmd curl
require_cmd grep
require_cmd awk
require_cmd sed

echo "STEP 1 — Fetch homepage HTML and extract asset URLs" | tee -a "$LOG_FILE"
echo "---------------------------------------------------" | tee -a "$LOG_FILE"

HTML_TMP="$(mktemp)"
if ! curl -fsSL "$BASE_URL/" -o "$HTML_TMP"; then
  fail "Unable to fetch $BASE_URL/ (check DNS/Cloudflare/Pages deployment)"
fi

CSS_PATH="$(grep -oE '/assets/[^\"'\'']+\.css' "$HTML_TMP" | head -n 1 || true)"
JS_PATH="$(grep -oE '/assets/[^\"'\'']+\.js' "$HTML_TMP" | head -n 1 || true)"

if [[ -z "$CSS_PATH" ]]; then
  fail "Could not find any /assets/*.css reference in homepage HTML"
fi

if [[ -z "$JS_PATH" ]]; then
  fail "Could not find any /assets/*.js reference in homepage HTML"
fi

ok "Found CSS asset: $CSS_PATH"
ok "Found JS asset:  $JS_PATH"
echo | tee -a "$LOG_FILE"

echo "STEP 2 — Validate CSS Content-Type" | tee -a "$LOG_FILE"
echo "----------------------------------" | tee -a "$LOG_FILE"

CSS_HEADERS="$(mktemp)"
if ! curl -sSL -D "$CSS_HEADERS" -o /dev/null "$BASE_URL$CSS_PATH"; then
  fail "Failed to fetch CSS asset: $BASE_URL$CSS_PATH"
fi

CSS_STATUS="$(head -n 1 "$CSS_HEADERS" | awk '{print $2}')"
CSS_CTYPE="$(grep -i '^content-type:' "$CSS_HEADERS" | awk '{print $2}' | tr -d '\r')"

echo "CSS Status: $CSS_STATUS" | tee -a "$LOG_FILE"
echo "CSS Content-Type: $CSS_CTYPE" | tee -a "$LOG_FILE"

if [[ "$CSS_STATUS" != "200" ]]; then
  fail "CSS asset returned non-200 status: $CSS_STATUS"
fi

if [[ "$CSS_CTYPE" != text/css* && "$CSS_CTYPE" != text/css ]]; then
  fail "CSS asset has wrong Content-Type (expected text/css)"
fi

ok "CSS asset OK (200 + text/css)"
echo | tee -a "$LOG_FILE"

echo "STEP 3 — Validate JS Content-Type" | tee -a "$LOG_FILE"
echo "---------------------------------" | tee -a "$LOG_FILE"

JS_HEADERS="$(mktemp)"
if ! curl -sSL -D "$JS_HEADERS" -o /dev/null "$BASE_URL$JS_PATH"; then
  fail "Failed to fetch JS asset: $BASE_URL$JS_PATH"
fi

JS_STATUS="$(head -n 1 "$JS_HEADERS" | awk '{print $2}')"
JS_CTYPE="$(grep -i '^content-type:' "$JS_HEADERS" | awk '{print $2}' | tr -d '\r')"

echo "JS Status: $JS_STATUS" | tee -a "$LOG_FILE"
echo "JS Content-Type: $JS_CTYPE" | tee -a "$LOG_FILE"

if [[ "$JS_STATUS" != "200" ]]; then
  fail "JS asset returned non-200 status: $JS_STATUS"
fi

JS_LOWER="$(printf '%s' "$JS_CTYPE" | tr 'A-Z' 'a-z')"
if [[ "$JS_LOWER" != *"javascript"* ]]; then
  fail "JS asset has wrong Content-Type (expected *javascript*, got $JS_CTYPE)"
fi

ok "JS asset OK (200 + javascript MIME)"
echo | tee -a "$LOG_FILE"

echo "STEP 4 — Validate Admin Billing Endpoint" | tee -a "$LOG_FILE"
echo "----------------------------------------" | tee -a "$LOG_FILE"

if [[ -z "$ADMIN_API_SECRET" ]]; then
  warn "ADMIN_API_SECRET not set — skipping authenticated admin check"
else
  ADMIN_HEADERS="$(mktemp)"
  ADMIN_BODY="$(mktemp)"

  if ! curl -sSL -D "$ADMIN_HEADERS" -o "$ADMIN_BODY" \
      -H "x-admin-secret: $ADMIN_API_SECRET" \
      "$BASE_URL/api/admin/billing-summary"; then
    fail "Request to /api/admin/billing-summary failed"
  fi

  ADMIN_STATUS="$(head -n 1 "$ADMIN_HEADERS" | awk '{print $2}')"
  echo "Admin /billing-summary status: $ADMIN_STATUS" | tee -a "$LOG_FILE"

  if [[ "$ADMIN_STATUS" == "200" ]]; then
    ok "Admin endpoint authenticated successfully (200)"
  elif [[ "$ADMIN_STATUS" == "401" || "$ADMIN_STATUS" == "403" ]]; then
    warn "Admin endpoint responded with $ADMIN_STATUS (check ADMIN_API_SECRET in Cloudflare env)"
  else
    warn "Unexpected admin endpoint status: $ADMIN_STATUS"
  fi
fi

echo | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
ok "Validation completed. Log: $LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"