#!/usr/bin/env bash
set -euo pipefail

BASE_DOMAIN="https://rinawarptech.com"
TERMS_URL="${BASE_DOMAIN}/legal/terms-of-service.html"
PRIVACY_URL="${BASE_DOMAIN}/legal/privacy-policy.html"

echo "=================================================="
echo " RINAWARP – STRIPE & LEGAL HEALTH CHECK"
echo "=================================================="
echo

if ! command -v curl >/dev/null 2>&1; then
  echo "❌ curl not found"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq not found"
  exit 1
fi

if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
  echo "⚠️ STRIPE_SECRET_KEY not set – Stripe verification will be skipped."
  CHECK_STRIPE=false
else
  CHECK_STRIPE=true
fi

echo "🔎 Checking legal pages..."
for url in "$TERMS_URL" "$PRIVACY_URL"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  if [[ "$code" == "200" ]]; then
    echo "  ✅ $url (200 OK)"
  else
    echo "  ❌ $url (HTTP $code)"
  fi
done

if [[ "$CHECK_STRIPE" == true ]]; then
  echo
  echo "🔎 Checking Stripe account legal URLs..."
  account_json=$(curl -sS https://api.stripe.com/v1/account -u "${STRIPE_SECRET_KEY}:")
  bp_terms=$(echo "$account_json" | jq -r '.business_profile.terms_of_service_url // ""')
  bp_privacy=$(echo "$account_json" | jq -r '.business_profile.privacy_policy_url // ""')

  echo "  Stripe Terms URL:   ${bp_terms:-<none>}"
  echo "  Stripe Privacy URL: ${bp_privacy:-<none>}"

  errors=0

  if [[ "$bp_terms" != "$TERMS_URL" ]]; then
    echo "  ❌ mismatch: Stripe terms_of_service_url != ${TERMS_URL}"
    ((errors++))
  else
    echo "  ✅ terms_of_service_url matches"
  fi

  if [[ "$bp_privacy" != "$PRIVACY_URL" ]]; then
    echo "  ❌ mismatch: Stripe privacy_policy_url != ${PRIVACY_URL}"
    ((errors++))
  else
    echo "  ✅ privacy_policy_url matches"
  fi

  echo
  if ((errors == 0)); then
    echo "✅ Stripe & legal URLs are consistent."
  else
    echo "⚠️ Stripe & legal URL mismatches: $errors"
    exit 1
  fi
else
  echo
  echo "ℹ️ Skipping Stripe checks (no STRIPE_SECRET_KEY set)."
fi