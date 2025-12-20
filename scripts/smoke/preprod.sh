#!/usr/bin/env bash
set -euo pipefail

# Config
SITE_BASE="${SITE_BASE:-https://staging.rinawarptech.com}"   # <-- your staging domain
SMOKE_TOKEN="${SMOKE_TOKEN:?SMOKE_TOKEN is required}"        # export this in CI env
MARK_URL="${MARK_URL:-$SITE_BASE/api/smoke/mark}"

pass() { printf "✅ %s\n" "$*"; }
fail() { printf "❌ %s\n" "$*" ; exit 1; }
have_jq(){ command -v jq >/dev/null 2>&1; }
say() { printf "\n---- %s ----\n" "$*"; }
curl_json () { curl -sS -H 'accept: application/json' "$1"; }
curl_head () { curl -sS -o /dev/null -w "%{http_code}" -I "$1"; }

say "Static pages (staging)"
code=$(curl_head "$SITE_BASE/"); [[ "$code" == 200 ]] || fail "/ index not 200 ($code)"
code=$(curl_head "$SITE_BASE/terminal-pro.html"); [[ "$code" == 200 ]] || fail "terminal-pro not 200 ($code)"
code=$(curl_head "$SITE_BASE/pricing.html"); [[ "$code" == 200 ]] || fail "pricing not 200 ($code)"
code=$(curl_head "$SITE_BASE/download.html"); [[ "$code" == 200 ]] || fail "download not 200 ($code)"
pass "Static pages OK"

say "Status JSON"
status_json=$(curl_json "$SITE_BASE/status.json")
[[ -n "$status_json" ]] || fail "status.json empty"
if have_jq; then jq -e '.ok != null' <<<"$status_json" >/dev/null || fail "status malformed"; fi
pass "Status reachable"

say "Latest meta"
meta=$(curl_json "$SITE_BASE/api/latest/meta")
if have_jq; then jq -e '.version != null' <<<"$meta" >/dev/null || fail "meta.version missing"; fi
pass "Meta OK"

say "Download redirects (staging)"
for p in win mac linux; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" -I "$SITE_BASE/download/$p")
  [[ "$code" =~ ^30[12]$ ]] || fail "/download/$p not 30x ($code)"
done
pass "Redirects OK"

say "Stripe prices"
prices=$(curl_json "$SITE_BASE/api/stripe/prices?_smoke=$(date +%s)")
[[ -n "$prices" ]] || fail "prices empty"
pass "Stripe prices reachable"

say "Analytics endpoints"
ev=$(curl -sS -X POST "$SITE_BASE/api/trk/collect" -H 'content-type: application/json' -d '{"event":"preprod_smoke","path":"/","btn":"preprod","href":"/download"}')
echo "$ev" | grep -q '"ok":true' || fail "trk/collect failed"
sum=$(curl_json "$SITE_BASE/api/trk/summary?range=7d")
echo "$sum" | grep -q '"ok":true' || fail "summary failed"
pass "Analytics OK"

say "Mark staging as last_success"
res=$(curl -sS -X POST "$MARK_URL" -H "x-smoke-token: $SMOKE_TOKEN" -H 'content-type: application/json' -d '{"env":"staging"}')
echo "$res" | grep -q '"ok":true' || fail "mark staging failed"
pass "Staging marked GREEN"

echo
echo "ALL STAGING CHECKS PASSED"
