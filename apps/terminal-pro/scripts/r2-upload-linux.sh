#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
source scripts/r2-env.sh

DIST_DIR="${1:-dist-terminal-pro}"
PREFIX="terminal-pro/${CHANNEL}/"
DEST="s3://${R2_BUCKET}/${PREFIX}"

echo "Using:"
echo "  AWS_PROFILE=$AWS_PROFILE"
echo "  R2_ENDPOINT=$R2_ENDPOINT"
echo "  DIST_DIR=$DIST_DIR"
echo "  DEST=$DEST"
echo

test -d "$DIST_DIR" || { echo "❌ Missing dir: $DIST_DIR"; exit 1; }

# Required for Linux updater
test -f "$DIST_DIR/latest-linux.yml" || { echo "❌ Missing $DIST_DIR/latest-linux.yml"; exit 1; }

# Require at least one installer artifact
if ! ls "$DIST_DIR"/*.AppImage "$DIST_DIR"/*.deb >/dev/null 2>&1; then
  echo "❌ No .AppImage or .deb found in $DIST_DIR"
  exit 1
fi

echo "📦 Uploading Linux updater files to $DEST"
aws --profile "$AWS_PROFILE" s3 cp "$DIST_DIR/latest-linux.yml" "${DEST}latest-linux.yml" --endpoint-url "$R2_ENDPOINT"

# Upload installers
for f in "$DIST_DIR"/*.AppImage "$DIST_DIR"/*.deb; do
  [ -f "$f" ] || continue
  base="$(basename "$f")"
  echo "  -> $base"
  aws --profile "$AWS_PROFILE" s3 cp "$f" "${DEST}${base}" --endpoint-url "$R2_ENDPOINT"
done

# Optional blockmaps
for f in "$DIST_DIR"/*.blockmap; do
  [ -f "$f" ] || continue
  base="$(basename "$f")"
  echo "  -> $base"
  aws --profile "$AWS_PROFILE" s3 cp "$f" "${DEST}${base}" --endpoint-url "$R2_ENDPOINT"
done

echo
echo "✅ Upload complete. Listing destination:"
aws --profile "$AWS_PROFILE" s3 ls "$DEST" --endpoint-url "$R2_ENDPOINT" | head -50