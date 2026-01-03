#!/usr/bin/env bash
set -euo pipefail

echo "🌈 RINAWARP MASTER MEDIA REPAIR — STAGE 2"
echo "======================================="
echo "Starting full media optimization, conversion, and link repair..."
echo

# === CONFIG ===
TARGET_DIRS=(
  "website/rinawarp-website"
  "brand-assets"
  "desktop-app/RinaWarp-Terminal-Pro/frontend"
  "desktop-app/RinaWarp-Terminal-Pro/desktop"
)
REPORT_FILE="media-repair-report-$(date +%Y%m%d-%H%M%S).txt"

echo "🗂  Scanning directories:"
for d in "${TARGET_DIRS[@]}"; do
  echo "   → $d"
done
echo

# === REQUIREMENTS CHECK ===
for cmd in magick cwebp avifenc; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "❌ Missing required tool: $cmd"
    echo "Install ImageMagick, libwebp-tools, and avifenc before running."
    exit 1
  fi
done

echo "✅ All required tools detected."
echo

# === START REPORT ===
echo "RinaWarp Media Repair Report" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo >> "$REPORT_FILE"

# === PROCESSING FUNCTION ===
process_image_file() {
  local file="$1"
  local folder
  folder="$(dirname "$file")"

  local base
  base="$(basename "$file")"

  local name="${base%.*}"
  local ext="${base##*.}"

  # Normalized filenames: rinawarp-mermaid-logo → rinawarp_mermaid_logo
  local clean_name="${name//[^a-zA-Z0-9]/_}"

  local webp="${folder}/${clean_name}.webp"
  local avif="${folder}/${clean_name}.avif"

  echo "→ Processing: $file" >> "$REPORT_FILE"

  # Convert to WebP
  if [ ! -f "$webp" ]; then
    echo "   • Creating WebP…" >> "$REPORT_FILE"
    cwebp -q 90 "$file" -o "$webp" >/dev/null 2>&1 || true
  fi

  # Convert to AVIF
  if [ ! -f "$avif" ]; then
    echo "   • Creating AVIF…" >> "$REPORT_FILE"
    avifenc --min 20 --max 35 "$file" "$avif" >/dev/null 2>&1 || true
  fi

  # Compress the original image
  echo "   • Compressing original…" >> "$REPORT_FILE"
  mogrify -strip -interlace Plane -sampling-factor 4:2:0 \
    -quality 85 "$file" >/dev/null 2>&1 || true
}

# === MAIN LOOP ===
for dir in "${TARGET_DIRS[@]}"; do
  echo "📁 Processing directory: $dir"

  find "$dir" -type f \( \
      -iname "*.png" -o \
      -iname "*.jpg" -o \
      -iname "*.jpeg" -o \
      -iname "*.gif" -o \
      -iname "*.ico" \
    \) | while read -r file; do
        process_image_file "$file"
    done

  echo "✔ Completed: $dir"
  echo
done

# === PATH REPAIR — HTML/CSS/JS ===
echo "🔧 Repairing broken media paths in HTML/CSS/JS…"

for dir in "${TARGET_DIRS[@]}"; do
  find "$dir" -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -print0 | \
  while IFS= read -r -d '' file; do
    # Replace weird/old image paths
    sed -i \
      -e 's|/assets/images/|/assets/img/|g' \
      -e 's|./img/|/assets/img/|g' \
      -e 's|images/|img/|g' \
      -e 's|/media/|/assets/media/|g' \
      -e 's|/pics/|/assets/img/|g' \
      "$file"
  done
done

echo
echo "📝 Writing final summary to $REPORT_FILE"
echo "=== MEDIA REPAIR COMPLETE ===" >> "$REPORT_FILE"

echo "🎉 STAGE 2 COMPLETE!"
echo "Report saved to: $REPORT_FILE"
echo