#!/usr/bin/env bash
#
# RinaWarp Billing Webhook End-to-End Test
# ----------------------------------------
# This script:
#  - Starts a Stripe CLI webhook listener
#  - Forwards events to your live webhook: https://rinawarptech.com/api/stripe-webhook
#  - Triggers key Stripe events
#  - Verifies KV keys exist in BILLING_KV
#  - Calls the admin billing API to confirm data is visible in the console
#
# STRICT SAFE MODE:
#  - Does NOT modify Cloudflare config
#  - Does NOT change wrangler.toml
#  - Does NOT deploy anything
#  - Only calls Stripe test APIs, existing Cloudflare endpoints, and kv:key list
#

set -euo pipefail

### CONFIGURATION #############################################################

# Base URL of your production site (webhook + admin API live here)
BASE_URL="${BASE_URL:-https://rinawarptech.com}"

# Admin API secret (must match ADMIN_API_SECRET configured in Cloudflare)
ADMIN_API_SECRET="${ADMIN_API_SECRET:-}"

# Billing KV binding name as defined in wrangler.toml
BILLING_KV_BINDING="${BILLING_KV_BINDING:-BILLING_KV}"

# Stripe events to trigger
STRIPE_EVENTS=(
  "checkout.session.completed"
  "invoice.paid"
  "customer.subscription.created"
  "customer.subscription.updated"
  "charge.refunded"
)

###############################################################################

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
AUDIT_DIR="$ROOT_DIR/audit/tests"
LOG_FILE="$AUDIT_DIR/billing_webhook_test_${TIMESTAMP}.log"

mkdir -p "$AUDIT_DIR"

echo "=====================================================" | tee -a "$LOG_FILE"
echo " RINAWARP BILLING WEBHOOK END-TO-END TEST"           | tee -a "$LOG_FILE"
echo " Started: $(date)"                                   | tee -a "$LOG_FILE"
echo " Base URL: $BASE_URL"                               | tee -a "$LOG_FILE"
echo "=====================================================" | tee -a "$LOG_FILE"
echo | tee -a "$LOG_FILE"

###############################################################################
# Helpers
###############################################################################

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Missing required command: $cmd" | tee -a "$LOG_FILE"
    echo "   Please install \"$cmd\" and re-run this script." | tee -a "$LOG_FILE"
    exit 1
  fi
}

section() {
  echo | tee -a "$LOG_FILE"
  echo "-----------------------------------------------------" | tee -a "$LOG_FILE"
  echo " $*" | tee -a "$LOG_FILE"
  echo "-----------------------------------------------------" | tee -a "$LOG_FILE"
}

pass() { echo "✅ $*" | tee -a "$LOG_FILE"; }
fail() { echo "❌ $*" | tee -a "$LOG_FILE"; }

###############################################################################
# Pre-flight checks
###############################################################################

section "STEP 0 — PRE-FLIGHT CHECKS"

require_cmd stripe
require_cmd wrangler
require_cmd curl
require_cmd jq

if [[ -z "$ADMIN_API_SECRET" ]]; then
  fail "ADMIN_API_SECRET is not set in your shell environment."
  echo "   Export it first, e.g.:" | tee -a "$LOG_FILE"
  echo "   export ADMIN_API_SECRET=\"your_admin_secret_here\"" | tee -a "$LOG_FILE"
  exit 1
else
  pass "ADMIN_API_SECRET present in environment."
fi

WEBHOOK_URL="$BASE_URL/api/stripe-webhook"
ADMIN_BILLING_URL="$BASE_URL/api/admin/billing-summary"

echo "Using webhook URL: $WEBHOOK_URL" | tee -a "$LOG_FILE"
echo "Using admin billing URL: $ADMIN_BILLING_URL" | tee -a "$LOG_FILE"
echo "Using KV binding: $BILLING_KV_BINDING" | tee -a "$LOG_FILE"

###############################################################################
# STEP 1 — Start Stripe listener
###############################################################################

section "STEP 1 — START STRIPE LISTENER"

LISTEN_LOG="$AUDIT_DIR/stripe_listen_${TIMESTAMP}.log"

# Start stripe listen in the background
set +e
stripe listen --forward-to "$WEBHOOK_URL" >"$LISTEN_LOG" 2>&1 &
LISTEN_PID=$!
set -e

sleep 5

if ps -p "$LISTEN_PID" >/dev/null 2>&1; then
  pass "Stripe listener started (PID: $LISTEN_PID). Logs at: $LISTEN_LOG"
else
  fail "Stripe listener failed to start. Check logs at: $LISTEN_LOG"
  exit 1
fi

###############################################################################
# STEP 2 — Trigger Stripe events
###############################################################################

section "STEP 2 — TRIGGER STRIPE TEST EVENTS"

for evt in "${STRIPE_EVENTS[@]}"; do
  echo "➡ Triggering event: $evt" | tee -a "$LOG_FILE"
  if stripe trigger "$evt" >>"$LOG_FILE" 2>&1; then
    pass "Stripe event triggered: $evt"
  else
    fail "Failed to trigger event: $evt (see log for details)"
  fi
  sleep 3
done

###############################################################################
# STEP 3 — Wait for webhook processing
###############################################################################

section "STEP 3 — WAIT FOR WEBHOOK PROCESSING"

echo "Allowing 10 seconds for Cloudflare + KV to process events..." | tee -a "$LOG_FILE"
sleep 10

###############################################################################
# STEP 4 — Validate KV keys
###############################################################################

section "STEP 4 — VALIDATE BILLING KV KEYS"

set +e
KV_JSON=$(cd "$ROOT_DIR" && npx wrangler kv key list --binding="$BILLING_KV_BINDING" 2>>"$LOG_FILE")
KV_STATUS=$?
set -e

if [[ $KV_STATUS -ne 0 ]]; then
  fail "Failed to list keys for KV binding \"$BILLING_KV_BINDING\"."
  echo "   Check wrangler authentication and binding name in wrangler.toml." | tee -a "$LOG_FILE"
else
  echo "$KV_JSON" | jq '.' >>"$LOG_FILE"
  CUSTOMER_KEYS=$(echo "$KV_JSON" | jq -r '.[].name | select(startswith("billing:customer:"))' | wc -l | tr -d ' ')
  PURCHASE_KEYS=$(echo "$KV_JSON" | jq -r '.[].name | select(startswith("billing:purchase:"))' | wc -l | tr -d ' ')
  SUB_KEYS=$(echo "$KV_JSON" | jq -r '.[].name | select(startswith("billing:subscription:"))' | wc -l | tr -d ' ')

  pass "KV keys found:"
  echo "   Customers:      $CUSTOMER_KEYS" | tee -a "$LOG_FILE"
  echo "   Purchases:      $PURCHASE_KEYS" | tee -a "$LOG_FILE"
  echo "   Subscriptions:  $SUB_KEYS" | tee -a "$LOG_FILE"

  if [[ "$CUSTOMER_KEYS" -gt 0 && "$PURCHASE_KEYS" -gt 0 ]]; then
    pass "Billing KV appears to contain customer and purchase data."
  else
    fail "Billing KV has no customer/purchase keys; webhook may not be writing data."
  fi
fi

###############################################################################
# STEP 5 — Call Admin Billing API
###############################################################################

section "STEP 5 — VALIDATE ADMIN BILLING API"

set +e
ADMIN_RESP=$(curl -sS -H "x-admin-secret: $ADMIN_API_SECRET" "$ADMIN_BILLING_URL")
CURL_STATUS=$?
set -e

if [[ $CURL_STATUS -ne 0 ]]; then
  fail "Failed to call admin billing API at $ADMIN_BILLING_URL"
  echo "   cURL exit status: $CURL_STATUS" | tee -a "$LOG_FILE"
else
  echo "$ADMIN_RESP" | jq '.' >>"$LOG_FILE" 2>/dev/null || echo "$ADMIN_RESP" >>"$LOG_FILE"

  # Try to extract some fields
  TOTAL_REVENUE=$(echo "$ADMIN_RESP" | jq -r '.totalRevenue // empty' 2>/dev/null || true)
  PURCHASE_COUNT=$(echo "$ADMIN_RESP" | jq -r '.totalPurchases // empty' 2>/dev/null || true)

  if [[ -n "$TOTAL_REVENUE" || -n "$PURCHASE_COUNT" ]]; then
    pass "Admin billing API is returning structured data."
    echo "   totalRevenue:   ${TOTAL_REVENUE:-N/A}" | tee -a "$LOG_FILE"
    echo "   totalPurchases: ${PURCHASE_COUNT:-N/A}" | tee -a "$LOG_FILE"
  else
    fail "Admin billing API responded but didn't return expected fields."
  fi
fi

###############################################################################
# STEP 6 — Cleanup
###############################################################################

section "STEP 6 — CLEANUP"

if ps -p "$LISTEN_PID" >/dev/null 2>&1; then
  kill "$LISTEN_PID" >/dev/null 2>&1 || true
  pass "Stopped Stripe listener (PID: $LISTEN_PID)."
else
  echo "Stripe listener was not running at cleanup time." | tee -a "$LOG_FILE"
fi

echo | tee -a "$LOG_FILE"
echo "=====================================================" | tee -a "$LOG_FILE"
echo " TEST COMPLETE"                                       | tee -a "$LOG_FILE"
echo " Finished: $(date)"                                  | tee -a "$LOG_FILE"
echo " Log file: $LOG_FILE"                               | tee -a "$LOG_FILE"
echo "=====================================================" | tee -a "$LOG_FILE"