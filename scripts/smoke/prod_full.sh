#!/usr/bin/env bash
set -euo pipefail

SITE_BASE="${SITE_BASE:-https://rinawarptech.com}"

pass() { printf "✅ %s\n" "$*"; }
fail() { printf "❌ %s\n" "$*" ; exit 1; }

have_jq(){ command -v jq >/dev/null 2>&1; }

say() { printf "\n---- %s ----\n" "$*"; }

curl_json () { curl -sS -H 'accept: application/json' "$1"; }
curl_head () { curl -sS -o /dev/null -w "%{http_code}" -I "$1"; }

say "Static pages"
code=$(curl_head "$SITE_BASE/"); [[ "$code" == 200 ]] || fail "/ index not 200 ($code)"
code=$(curl_head "$SITE_BASE/terminal-pro"); [[ "$code" =~ ^(200|308)$ ]] || fail "terminal-pro not 200/308 ($code)"
code=$(curl_head "$SITE_BASE/pricing"); [[ "$code" =~ ^(200|308)$ ]] || fail "pricing not 200/308 ($code)"
code=$(curl_head "$SITE_BASE/download"); [[ "$code" =~ ^(200|308)$ ]] || fail "download not 200/308 ($code)"
pass "Static pages OK"

say "Security headers (pricing.html sample)"
hdrs=$(curl -sSI "$SITE_BASE/pricing.html")
echo "$hdrs" | grep -qi "content-security-policy" || fail "Missing CSP"
echo "$hdrs" | grep -qi "strict-transport-security" || fail "Missing HSTS"
echo "$hdrs" | grep -qi "x-content-type-options" || fail "Missing X-Content-Type-Options"
pass "Security headers present"

say "Status JSON (/status.json)"
status_json=$(curl_json "$SITE_BASE/status.json")
[[ -n "$status_json" ]] || fail "status.json empty"
if have_jq; then
  ok=$(jq -r '.ok' <<<"$status_json")
  ver=$(jq -r '.version' <<<"$status_json")
  [[ "$ok" == "true" ]] || fail "status.json ok=false"
  [[ -n "$ver" && "$ver" != "null" ]] || fail "status.json missing version"
else
  echo "$status_json" | grep -q '"ok":true' || fail "status.json ok=false"
fi
pass "Status JSON healthy"

say "Health endpoint (/api/health/downloads)"
health_json=$(curl_json "$SITE_BASE/api/health/downloads")
if have_jq; then
  ok=$(jq -r '.ok' <<<"$health_json")
  [[ "$ok" == "true" ]] || { echo "$health_json" | jq; fail "/api/health/downloads not ok"; }
else
  echo "$health_json" | grep -q '"ok":true' || fail "downloads health not ok"
fi
pass "Downloads health OK"

say "Download smart redirects"
for p in win mac linux; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" -I "$SITE_BASE/download/$p")
  [[ "$code" =~ ^30[12]$ ]] || fail "/download/$p not 30x ($code)"
done
pass "Smart redirects return 302/301"

say "Latest meta proxy (/api/latest/meta)"
meta=$(curl_json "$SITE_BASE/api/latest/meta")
if have_jq; then
  ver=$(jq -r '.version' <<<"$meta")
  [[ "$ver" != "null" && -n "$ver" ]] || fail "meta.version missing"
  # Optional: ensure checksums link exists
  jq -e '.assets.checksums' <<<"$meta" >/dev/null || fail "checksums missing"
else
  echo "$meta" | grep -q '"version"' || fail "meta missing version"
fi
pass "Latest meta OK"

say "Stripe prices API (/api/stripe/prices)"
prices=$(curl_json "$SITE_BASE/api/stripe/prices?_smoke=$(date +%s)")
[[ -n "$prices" ]] || fail "prices empty"
if have_jq; then
  cnt=$(jq '.data|length // 0' <<<"$prices")
  [[ "$cnt" -ge 1 ]] || fail "no prices returned"
else
  echo "$prices" | grep -q 'id' || fail "no prices"
fi
pass "Stripe prices reachable"

say "Stripe portal creation (dry)"
# This should return 4xx with error unless your function allows test emails without a real customer.
portal=$(curl -sS -X POST "$SITE_BASE/api/stripe/portal" -H 'content-type: application/json' -d '{"email":"admin+smoke@rinawarptech.com"}')
echo "$portal" | grep -Eqi '"ok":(true|false)' || fail "portal endpoint unexpected"
pass "Portal endpoint responds"

say "Robots & security.txt"
code=$(curl_head "$SITE_BASE/robots.txt"); [[ "$code" == 200 ]] || fail "robots.txt missing ($code)"
code=$(curl_head "$SITE_BASE/.well-known/security.txt"); [[ "$code" == 200 ]] || fail "security.txt missing ($code)"
pass "Robots/security present"

say "Admin gating (/admin.html)"
code=$(curl -sS -o /dev/null -w "%{http_code}" "$SITE_BASE/admin.html")
[[ "$code" == 401 || "$code" == 403 ]] || fail "admin not gated (code=$code)"
pass "Admin gated (401/403)"

say "KV analytics write (synthetic event)"
ev=$(curl -sS -X POST "$SITE_BASE/api/trk/collect" -H 'content-type: application/json' -d '{"event":"smoke_click","path":"/","btn":"smoke","href":"/download"}')
echo "$ev" | grep -q '"ok":true' || fail "trk/collect failed"
pass "Analytics collect OK"

say "KV analytics summary (7d)"
sum=$(curl_json "$SITE_BASE/api/trk/summary?range=7d")
if have_jq; then
  jq -e '.ok==true' <<<"$sum" >/dev/null || fail "summary ok=false"
else
  echo "$sum" | grep -q '"ok":true' || fail "summary ok=false"
fi
pass "Analytics summary OK"

say "Export CSV (today)"
day=$(date -I)
code=$(curl -sS -o /dev/null -w "%{http_code}" "$SITE_BASE/api/trk/export?day=$day")
[[ "$code" == 200 ]] || fail "export CSV failed ($code)"
pass "Export CSV OK"

say "Pricing page live UI sanity (no JS eval, just 200 + contains Pro)"
html=$(curl -sS "$SITE_BASE/pricing.html")
echo "$html" | grep -qi "Pro" || fail "pricing page missing Pro"
pass "Pricing page renders"

say "ALL CHECKS PASSED"
