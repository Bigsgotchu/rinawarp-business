#!/usr/bin/env bash
set -euo pipefail

echo "=================================================="
echo " RINAWARP – STRIPE LEGAL URL CONFIG"
echo "=================================================="
echo

if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
  echo "❌ STRIPE_SECRET_KEY is not set."
  echo "   Export it first, e.g.:"
  echo '   export STRIPE_SECRET_KEY="sk_live_..."'
  exit 1
fi

ACCOUNT_ENDPOINT="https://api.stripe.com/v1/account"

TERMS_URL="https://rinawarptech.com/legal/terms-of-service.html"
PRIVACY_URL="https://rinawarptech.com/legal/privacy-policy.html"

echo "About to update Stripe account business_profile URLs:"
echo "  Terms of Service: ${TERMS_URL}"
echo "  Privacy Policy:   ${PRIVACY_URL}"
echo

read -r -p "Proceed with live update? (yes/no) " CONFIRM
if [[ "${CONFIRM}" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

echo "➡️  Updating Stripe account business_profile URLs..."
curl -sS "${ACCOUNT_ENDPOINT}" \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "business_profile[terms_of_service_url]=${TERMS_URL}" \
  -d "business_profile[privacy_policy_url]=${PRIVACY_URL}" | jq .

echo
echo "✅ Done. Verify in Stripe Dashboard:"
echo "   Settings → Branding / Public details"