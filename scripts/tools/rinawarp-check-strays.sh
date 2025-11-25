#!/usr/bin/env bash
set -e

ROOT="$(
  "$(dirname "$0")/../../tools/find-rinawarp-root.sh"
)"

echo "🔍 RinaWarp root: $ROOT"
echo

echo "Checking for suspicious RinaWarp-related files outside root..."

# Adjust patterns as needed
CANDIDATE_DIRS=(
  "$HOME/Downloads"
  "$HOME/Desktop"
)

PATTERNS=(
  "RinaWarp"
  "Terminal-Pro"
  "rinawarp"
)

found_any=false

for d in "${CANDIDATE_DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    echo "📂 Scanning $d..."
    for p in "${PATTERNS[@]}"; do
      matches=$(find "$d" -maxdepth 3 -iname "*$p*" 2>/dev/null || true)
      if [[ -n "$matches" ]]; then
        found_any=true
        echo "  ⚠️  Found possible stray items matching '$p':"
        echo "$matches" | sed 's/^/    - /'
        echo
      fi
    done
  fi
done

if ! $found_any; then
  echo "✅ No obvious stray RinaWarp files found outside the root."
else
  echo "⚠️ Review the above files and move anything important into: $ROOT"
fi