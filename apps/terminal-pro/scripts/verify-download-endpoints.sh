#!/usr/bin/env bash
set -euo pipefail

CHANNEL="${1:-stable}"
BASE="https://download.rinawarptech.com/terminal-pro/${CHANNEL}"

echo "Checking metadata endpoints:"
echo "  ${BASE}/latest-linux.yml"
curl -fsSI "${BASE}/latest-linux.yml" | sed -n '1,20p'
echo

echo "Extracting file URLs from latest-linux.yml and verifying they exist..."
mapfile -t URLS < <(curl -fsSL "${BASE}/latest-linux.yml" | awk '/^\s*- url:/{print $3}' | tr -d '\r')

if [ "${#URLS[@]}" -eq 0 ]; then
  echo "❌ No url: entries found in latest-linux.yml"
  exit 1
fi

for u in "${URLS[@]}"; do
  echo "  -> ${BASE}/${u}"
  curl -fsSI "${BASE}/${u}" | sed -n '1,10p'
  echo
done

echo "✅ Endpoint verification complete."