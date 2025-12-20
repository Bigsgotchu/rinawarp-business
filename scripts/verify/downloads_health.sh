#!/usr/bin/env bash
set -euo pipefail

SITE_BASE="${SITE_BASE:-https://rinawarptech.com}"
URL="${SITE_BASE%/}/api/health/downloads"

echo "→ Checking ${URL}"
HTTP_STATUS="$(curl -s -o /tmp/dl_health.json -w '%{http_code}' "$URL")"

if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "HTTP $HTTP_STATUS from /api/health/downloads"
  cat /tmp/dl_health.json || true
  exit 1
fi

if command -v jq >/dev/null 2>&1; then
  OK="$(jq -r '.ok' /tmp/dl_health.json)"
  if [[ "$OK" != "true" ]]; then
    echo "Download health NOT OK"
    jq -r '.results[] | select(.ok==false) | "\(.name) \(.status) \(.url)"' /tmp/dl_health.json || true
    exit 1
  fi
  echo "OK version: $(jq -r '.version' /tmp/dl_health.json)"
else
  # Fallback without jq
  if ! grep -q '"ok":true' /tmp/dl_health.json; then
    echo "Download health NOT OK (jq not installed)"
    cat /tmp/dl_health.json
    exit 1
  fi
  echo "OK (jq not installed)"
fi
