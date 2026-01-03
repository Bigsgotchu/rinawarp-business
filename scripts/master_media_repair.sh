#!/usr/bin/env bash
set -euo pipefail

# ============= CONFIG =============
ROOT_DIR="$(pwd)"
SITE_DIR="website/rinawarp-website"
ASSETS_DIR="$SITE_DIR/assets"
IMG_DIR="$ASSETS_DIR/img"
CSS_DIR="$SITE_DIR/css"
JS_DIR="$SITE_DIR/js"
REPORT="media_repair_report-$(date +%Y%m%d-%H%M%S).txt"

echo "=============================================="
echo "     🛠  RINAWARP MASTER MEDIA REPAIR TOOL"
echo "=============================================="
echo "Root:      $ROOT_DIR"
echo "Website:   $SITE_DIR"
echo "Assets:    $ASSETS_DIR"
echo "Images:    $IMG_DIR"
echo "Report:    $REPORT"
echo

# Ensure dirs exist
mkdir -p "$ASSETS_DIR"
mkdir -p "$IMG_DIR"

echo "🔍 Scanning for all image files..."
find "$ROOT_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.svg" -o -iname "*.webp" -o -iname "*.ico" \) > all_images.tmp

echo "🌐 Collecting HTML/CSS/JS files..."
find "$SITE_DIR" -type f \( -iname "*.html" -o -iname "*.css" -o -iname "*.js" \) > all_code_files.tmp

echo "📁 Normalizing all images into assets/img/..."
while IFS= read -r img; do
  filename="$(basename "$img")"

  # Skip if already in correct folder
  if [[ "$img" == "$IMG_DIR"* ]]; then
    continue
  fi

  # Never move icons from brand-assets or desktop repos
  if [[ "$img" == *"brand-assets"* ]]; then
    continue
  fi

  # Move image
  dest="$IMG_DIR/$filename"

  if [[ ! -f "$dest" ]]; then
    cp "$img" "$dest"
    echo "Moved: $img → $dest" >> "$REPORT"
  else
    echo "Duplicate image detected: $filename" >> "$REPORT"
  fi

done < all_images.tmp

echo "🔄 Fixing paths inside HTML/CSS/JS files..."
while IFS= read -r file; do
  # Backup
  cp "$file" "$file.bak"

  # Replace absolute or incorrect paths
  sed -i \
    -e 's/src="\/img\//src="\/assets\/img\//g' \
    -e 's/src="img\//src="assets\/img\//g' \
    -e 's/src="\/assets\/\//src="\/assets\//g' \
    -e 's/url(\/img\//url(\/assets\/img\//g' \
    -e 's/url(img\//url(assets\/img\//g' \
    -e 's/href="img\//href="assets\/img\//g' \
    -e 's/href="\/img\//href="\/assets\/img\//g' \
    -e 's/background-image: url(\"\?img\//background-image: url(\"assets\/img\//g' \
    "$file"

  echo "Fixed paths in: $file" >> "$REPORT"

done < all_code_files.tmp

echo "🔎 Detecting broken image references..."
echo "" >> "$REPORT"
echo "===== BROKEN IMAGE REFERENCES =====" >> "$REPORT"

BROKEN_COUNT=0

grep -RoiE "(src|href|url)\([\"']?([^\"')]+)" "$SITE_DIR" | while read -r line; do
  # Extract path
  path=$(echo "$line" | sed -n 's/.*\([src|href|url][^\"'\'')]*\).*/\1/p' | sed -e 's/src=//' -e 's/href=//' -e 's/url(//' -e 's/[\"\')]//g')

  # Only check images
  if [[ "$path" != *".png" && "$path" != *".jpg" && "$path" != *".jpeg" && "$path" != *".svg" && "$path" != *".webp" && "$path" != *".ico" ]]; then
    continue
  fi

  full="$IMG_DIR/$(basename "$path")"

  if [[ ! -f "$full" ]]; then
    echo "❌ Missing: $path → expected: $full" >> "$REPORT"
    ((BROKEN_COUNT++))
  fi

done

echo "" >> "$REPORT"
echo "Total Broken References: $BROKEN_COUNT" >> "$REPORT"

echo "=============================================="
echo "   ✅ MEDIA REPAIR COMPLETE"
echo "   📄 Report saved to: $REPORT"
echo "=============================================="

rm -f all_images.tmp all_code_files.tmp

exit 0