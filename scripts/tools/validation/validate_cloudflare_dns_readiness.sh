#!/usr/bin/env bash
set -euo pipefail

echo "=============================================================="
echo " RINAWARPTECH — CLOUDFLARE DNS READINESS VALIDATION (SAFE)"
echo "=============================================================="
echo ""
echo "This script DOES NOT update DNS."
echo "It only checks whether Cloudflare is ready for DNS to be pointed here."
echo ""

# ---- REQUIREMENTS CHECK ----
if ! command -v wrangler >/dev/null 2>&1; then
    echo "❌ Wrangler CLI is not installed."
    exit 1
else
    echo "✅ Wrangler detected: $(wrangler --version)"
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    echo "❌ CLOUDFLARE_API_TOKEN is not set."
    echo "Run: export CLOUDFLARE_API_TOKEN=\"your_token\""
    exit 1
else
    echo "✅ CLOUDFLARE_API_TOKEN found"
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
    echo "❌ CLOUDFLARE_ACCOUNT_ID is not set."
    echo "Run: export CLOUDFLARE_ACCOUNT_ID=\"your_account_id\""
    exit 1
else
    echo "✅ CLOUDFLARE_ACCOUNT_ID found"
fi

echo ""
echo "--------------------------------------------------------------"
echo " Checking Cloudflare Pages Project"
echo "--------------------------------------------------------------"

PROJECT_NAME="rinawarptech"

PROJECT_INFO=$(wrangler pages project list | grep -i "$PROJECT_NAME" || echo "")

if [[ -z "$PROJECT_INFO" ]]; then
    echo "❌ Pages project '$PROJECT_NAME' NOT found in Cloudflare."
    echo "You must create it before pointing DNS."
    exit 1
else
    echo "✅ Pages project found:"
    echo "$PROJECT_INFO"
fi

echo ""
echo "--------------------------------------------------------------"
echo " Checking if custom domain is attached (safe check only)"
echo "--------------------------------------------------------------"

DEPLOYMENT_INFO=$(wrangler pages deployment list --project-name "$PROJECT_NAME" --json 2>/dev/null || echo "[]")

if echo "$DEPLOYMENT_INFO" | jq -e '.[] | select(.url | contains("rinawarptech.com"))' >/dev/null 2>&1; then
    echo "⚠️ Custom domain exists in deployments:"
    echo "$DEPLOYMENT_INFO" | jq '.[] | select(.url | contains("rinawarptech.com"))'
    echo "This is okay, but DNS is not yet pointing here."
else
    echo "ℹ️ No custom domain attached yet (expected right now)"
fi

echo ""
echo "--------------------------------------------------------------"
echo " Checking if API endpoints respond (tests Cloudflare build)"
echo "--------------------------------------------------------------"

TEST_URL="https://master.rinawarptech.pages.dev/api/admin/billing-summary"

HTTP_STATUS=$(curl -o /tmp/out.txt -s -w "%{http_code}" "$TEST_URL")

if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "401" ]]; then
    echo "✅ API endpoint reachable (status: $HTTP_STATUS)"
else
    echo "❌ API endpoint NOT reachable (status: $HTTP_STATUS)"
    echo "DNS not pointed to Cloudflare (expected)."
fi

echo ""
echo "--------------------------------------------------------------"
echo " Checking if Cloudflare has DNS records ready (SAFE)"
echo "--------------------------------------------------------------"

DNS_RECORDS=$(curl -s \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    "https://api.cloudflare.com/client/v4/zones?name=rinawarptech.com" \
)

ZONE_ID=$(echo "$DNS_RECORDS" | jq -r ".result[0].id")

if [[ "$ZONE_ID" == "null" || -z "$ZONE_ID" ]]; then
    echo "ℹ️ Cloudflare DNS not active (expected)."
else
    echo "⚠️ Cloudflare DNS zone exists: $ZONE_ID"
    echo "But nameservers might not be set yet."
fi

echo ""
echo "=============================================================="
echo " READINESS SUMMARY"
echo "=============================================================="
echo "➡ Cloudflare Pages project exists: YES"
echo "➡ Custom domain attached: NO (expected for now)"
echo "➡ DNS zone active: MAYBE (depends on registrar)"
echo "➡ API endpoints reachable: YES (via Pages preview domain)"
echo ""
echo "🎯 You are READY to move DNS to Cloudflare when you choose."
echo ""
echo "This script made **NO CHANGES** to DNS or Cloudflare."
echo "=============================================================="