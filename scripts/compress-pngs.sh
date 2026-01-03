#!/usr/bin/env bash
#
# compress-pngs.sh [source-dir]
# Lossless PNG optimization using zopflipng (or optipng fallback)
#

set -euo pipefail

SRC="${1:-./assets}"

if [ ! -d "$SRC" ]; then
  echo "❌ Source directory '$SRC' not found."
  exit 1
fi

echo "🎨 RinaWarp PNG Optimization"
echo "Source: $SRC"
echo

OPT_TOOL=""
if command -v zopflipng >/dev/null 2>&1; then
  OPT_TOOL="zopflipng"
elif command -v optipng >/dev/null 2>&1; then
  OPT_TOOL="optipng"
else
  echo "⚠️ Neither 'zopflipng' nor 'optipng' found. Install one and retry."
  echo "Install with: brew install zopflipng  (macOS) or apt install zopflipng  (Ubuntu)"
  exit 1
fi

echo "Using optimization tool: $OPT_TOOL"
echo

PNG_COUNT=0
OPTIMIZED_COUNT=0
SAVED_BYTES=0

find "$SRC" -type f -name "*.png" | while read -r f; do
  echo "📁 Processing: $f"
  
  # Get original file size
  ORIG_SIZE=$(stat -c%s "$f")
  ((PNG_COUNT++))
  
  # Optimize the file
  if [ "$OPT_TOOL" = "zopflipng" ]; then
    zopflipng -y "$f" "$f"
  else
    optipng -o7 "$f"
  fi
  
  # Get new file size
  NEW_SIZE=$(stat -c%s "$f")
  SAVED=$((ORIG_SIZE - NEW_SIZE))
  
  if [ $SAVED -gt 0 ]; then
    ((OPTIMIZED_COUNT++))
    SAVED_BYTES=$((SAVED_BYTES + SAVED))
    
    # Show size reduction
    PERCENT=$((SAVED * 100 / ORIG_SIZE))
    echo "  ✅ Optimized: -$SAVED bytes (-$PERCENT%)"
  else
    echo "  ℹ️  Already optimized"
  fi
  echo
done

# Summary
echo "🎯 RinaWarp PNG Optimization Summary"
echo "==================================="
echo "Files processed: $PNG_COUNT"
echo "Files optimized: $OPTIMIZED_COUNT"

if [ $SAVED_BYTES -gt 0 ]; then
  echo "Total space saved: $(numfmt --to=iec --suffix=B $SAVED_BYTES 2>/dev/null || echo "${SAVED_BYTES}B")"
else
  echo "Total space saved: 0B"
fi

echo
echo "✅ PNG optimization complete."