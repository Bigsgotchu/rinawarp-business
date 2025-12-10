#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo " RINAWARP – STRIPE PRODUCT LEGAL METADATA"
echo "=================================================="
echo

if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
  echo "❌ STRIPE_SECRET_KEY is not set."
  echo "   export STRIPE_SECRET_KEY=\"sk_live_...\""
  exit 1
fi

TERMS_URL="https://rinawarptech.com/legal/terms-of-service.html"
PRIVACY_URL="https://rinawarptech.com/legal/privacy-policy.html"

# 🔧 FILL THESE IN ONCE from your Stripe Dashboard:
TERMINAL_PRODUCT_ID="${TERMINAL_PRODUCT_ID:-prod_TSMDTIPKWO80Qb}"
AIMVC_PRODUCT_ID="${AIMVC_PRODUCT_ID:-prod_TWku0VTZJqcJtR}"
BUNDLE_PRODUCT_ID="${BUNDLE_PRODUCT_ID:-prod_TSMDU4N4jowxyl}"

PRODUCTS=(
  "$TERMINAL_PRODUCT_ID:Terminal Pro"
  "$AIMVC_PRODUCT_ID:AI Music Video Creator"
  "$BUNDLE_PRODUCT_ID:RinaWarp Bundle"
)

for entry in "${PRODUCTS[@]}"; do
  PID="${entry%%:*}"
  NAME="${entry##*:}"

  if [[ "$PID" == prod_* ]]; then
    echo "➡️  Updating product ${NAME} (${PID}) metadata..."
    curl -sS "https://api.stripe.com/v1/products/${PID}" \
      -u "${STRIPE_SECRET_KEY}:" \
      -d "metadata[terms_url]=${TERMS_URL}" \
      -d "metadata[privacy_url]=${PRIVACY_URL}" \
      -d "metadata[company]=RinaWarp Technologies LLC" \
      -d "metadata[product_label]=${NAME}" | jq '.id, .metadata'
    echo
  else
    echo "⚠️  Skipping ${NAME} – product ID not set (PID=${PID})"
  fi
done

echo "✅ Done. Check product metadata in Stripe Dashboard → Products."