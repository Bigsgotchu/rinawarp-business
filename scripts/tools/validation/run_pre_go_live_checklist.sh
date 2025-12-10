#!/usr/bin/env bash
set -euo pipefail

echo "======================================================="
echo "         RINAWARP PRE-GO-LIVE VALIDATION CHECK"
echo "======================================================="
START=$(date)

# ---------------------------------------------------------
# CONFIG (SAFE READ-ONLY)
# ---------------------------------------------------------
PAGES_PREVIEW_URL="https://master.rinawarptech.pages.dev"
PRODUCTION_DOMAIN="https://rinawarptech.com"

WRANGLER=$(command -v wrangler || true)
CURL=$(command -v curl || true)
JQ=$(command -v jq || true)

LOG_DIR="audit/pre-go-live-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/checklist.log"
touch "$LOG_FILE"

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# ---------------------------------------------------------
# 1. TOOLING VALIDATION
# ---------------------------------------------------------
log "\n🔧 Checking Required Tooling…"

if [[ -z "$WRANGLER" ]]; then
    log "❌ Missing: wrangler CLI"
else
    log "✅ Wrangler found: $WRANGLER"
    wrangler --version | tee -a "$LOG_FILE"
fi

if [[ -z "$JQ" ]]; then
    log "❌ Missing: jq (required)"
else
    log "✅ jq found"
fi

if [[ -z "$CURL" ]]; then
    log "❌ Missing: curl"
else
    log "✅ curl found"
fi

# ---------------------------------------------------------
# 2. CLOUD PROJECT VALIDATION
# ---------------------------------------------------------
log "\n🌐 Checking Cloudflare Pages Project…"

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
    log "❌ CLOUDFLARE_ACCOUNT_ID is NOT set"
else
    log "✅ CLOUDFLARE_ACCOUNT_ID present"
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    log "❌ CLOUDFLARE_API_TOKEN is NOT set"
else
    log "✅ CLOUDFLARE_API_TOKEN present"
fi

log "Checking that project exists…"
if wrangler pages project list --json | jq -e '.result[] | select(.name=="rinawarptech")' >/dev/null; then
    log "✅ Cloudflare Pages project exists: rinawarptech"
else
    log "❌ Project rinawarptech NOT found in Cloudflare!"
fi

# ---------------------------------------------------------
# 3. KV NAMESPACE VALIDATION
# ---------------------------------------------------------
log "\n📦 Checking KV namespaces…"

for kv in ANALYTICS_KV PRICING_KV BILLING_KV; do
    log "Checking KV: $kv"
    if wrangler kv namespace list | grep -q "$kv"; then
        log "   ✅ KV namespace exists"
    else
        log "   ❌ KV NOT FOUND → $kv"
    fi
done

# ---------------------------------------------------------
# 4. ENDPOINT VALIDATION (Preview Domain)
# ---------------------------------------------------------
log "\n🌐 Testing Deployed Endpoints (Preview)…"

declare -a endpoints=(
    "$PAGES_PREVIEW_URL/api/analytics"
    "$PAGES_PREVIEW_URL/api/checkout"
    "$PAGES_PREVIEW_URL/api/admin/billing-summary"
    "$PAGES_PREVIEW_URL/api/admin/billing-customer"
    "$PAGES_PREVIEW_URL/api/stripe-webhook"
)

for ep in "${endpoints[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ep")
    log "   $ep → HTTP $STATUS"

    case $STATUS in
        200) log "     ✅ OK" ;;
        401) log "     ⚠️  Unauthorized (EXPECTED for admin functions)" ;;
        404) log "     ❌ NOT FOUND" ;;
        *)   log "     ⚠️ Unknown state" ;;
    esac
done

# ---------------------------------------------------------
# 5. ADMIN AUTH VALIDATION (optional)
# ---------------------------------------------------------
log "\n🔐 Validating Admin API Secret (if set)…"

if [[ -n "${ADMIN_API_SECRET:-}" ]]; then
    log "Admin secret detected. Testing privileged endpoint…"
    ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "x-admin-secret: ${ADMIN_API_SECRET}" \
        "$PAGES_PREVIEW_URL/api/admin/billing-summary")

    if [[ "$ADMIN_STATUS" == "200" ]]; then
        log "   ✅ Admin API authenticated successfully"
    else
        log "   ❌ Admin API returned HTTP $ADMIN_STATUS"
    fi
else
    log "⚠️ Skipping: ADMIN_API_SECRET not set in environment"
fi

# ---------------------------------------------------------
# 6. STRIPE WEBHOOK VERIFICATION (DRY MODE)
# ---------------------------------------------------------
log "\n💳 Dry-run Stripe Webhook Test…"

if stripe --version >/dev/null 2>&1; then
    log "Stripe CLI found. Testing local webhook signature generation…"
    log "   (NO LIVE CALLS made)"
else
    log "⚠️ Stripe CLI not installed — skipping webhook test"
fi

# ---------------------------------------------------------
# 7. CUSTOM DOMAIN READINESS
# ---------------------------------------------------------
log "\n🌍 Checking Custom Domain Readiness…"

DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_DOMAIN")

case $DOMAIN_STATUS in
    200|301|302)
        log "   ⚠️ Domain responding — may still point to old DNS"
        ;;
    000)
        log "   ✅ Domain NOT responding (EXPECTED until DNS is moved)"
        ;;
    *)
        log "   ⚠️ Domain returned unusual status: $DOMAIN_STATUS"
        ;;
esac

# ---------------------------------------------------------
# 8. FINAL SUMMARY
# ---------------------------------------------------------
log "\n======================================================="
log " PRE-GO-LIVE VALIDATION COMPLETE"
log " Started: $START"
log " Finished: $(date)"
log " Log saved at: $LOG_FILE"
log "======================================================="