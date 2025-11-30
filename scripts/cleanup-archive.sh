#!/usr/bin/env bash
#
# cleanup-archive.sh [days-to-keep]
# Safely remove old archive files (.zip, .tar.gz, .tgz) older than N days
# Default: 30 days
#

set -euo pipefail

DAYS="${1:-30}"
ROOT_DIR="${ARCHIVE_ROOT_DIR:-./archives}"

echo "🧹 RinaWarp Archive Cleanup"
echo "Root directory : $ROOT_DIR"
echo "Days to keep   : $DAYS"
echo

if [ ! -d "$ROOT_DIR" ]; then
  echo "⚠️  Directory '$ROOT_DIR' does not exist. Nothing to clean."
  exit 0
fi

echo "🔍 Scanning for archives older than $DAYS days..."
echo

# Find candidate files
mapfile -t CANDIDATES < <(find "$ROOT_DIR" -type f \( -name "*.zip" -o -name "*.tar.gz" -o -name "*.tgz" \) -mtime +"$DAYS")

if [ "${#CANDIDATES[@]}" -eq 0 ]; then
  echo "✅ No old archives found. You're all clean!"
  exit 0
fi

TOTAL_SIZE_BYTES=0
for f in "${CANDIDATES[@]}"; do
  sz=$(stat -c%s "$f")
  TOTAL_SIZE_BYTES=$((TOTAL_SIZE_BYTES + sz))
done

# Human readable size
hr_size=$(numfmt --to=iec --suffix=B "$TOTAL_SIZE_BYTES" 2>/dev/null || echo "${TOTAL_SIZE_BYTES}B")

echo "The following files will be removed:"
printf '  - %s\n' "${CANDIDATES[@]}"
echo
echo "Total space to be freed: $hr_size"
echo

read -r -p "Proceed with deletion? (y/N) " answer
case "$answer" in
  [yY][eE][sS]|[yY]) ;;
  *) echo "❎ Aborted. No files deleted."; exit 0 ;;
esac

for f in "${CANDIDATES[@]}"; do
  echo "Deleting: $f"
  rm -f -- "$f"
done

echo
echo "✅ Cleanup complete."
