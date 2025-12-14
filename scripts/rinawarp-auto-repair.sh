#!/usr/bin/env bash
set -euo pipefail

echo "🛑 AUTO-REPAIR MODE: STRIPE SECRET CONTAINMENT"

QUARANTINE="security/quarantine"
REPORT="security/auto-repair-report.json"

mkdir -p "$QUARANTINE"

MATCHES=$(grep -R "sk_live_" -n . || true)

if [ -z "$MATCHES" ]; then
  echo "✅ No live Stripe keys found"
  exit 0
fi

echo "🔥 LIVE STRIPE KEYS FOUND — REMOVING"

echo "$MATCHES" > "$QUARANTINE/stripe-live-keys.txt"

FILES=$(echo "$MATCHES" | cut -d: -f1 | sort -u)

for file in $FILES; do
  echo "→ Scrubbing $file"
  sed -i.bak \
    -E 's/sk_live_[A-Za-z0-9]+/process.env.STRIPE_SECRET_KEY/g' \
    "$file"
done

cat <<EOF > "$REPORT"
{
  "status": "repaired",
  "issue": "live_stripe_keys_committed",
  "filesAffected": $(echo "$FILES" | jq -R . | jq -s .),
  "actionRequired": [
    "Rotate Stripe keys immediately",
    "Set STRIPE_SECRET_KEY in environment",
    "Invalidate old keys in Stripe dashboard"
  ]
}
EOF

echo ""
echo "🚨 ACTION REQUIRED:"
echo "1. ROTATE STRIPE KEYS NOW"
echo "2. ADD STRIPE_SECRET_KEY to env"
echo "3. COMMIT THE FIX"
echo ""
exit 1
