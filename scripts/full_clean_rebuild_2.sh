#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
SOURCE_DIR="rinawarp-website"
DIST_DIR="dist"
ARCHIVE_DIR="archive"

timestamp="$(date +%Y%m%d-%H%M%S)"
backup_dir="${ARCHIVE_DIR}/dist-build-${timestamp}"

echo "🔄 RinaWarp Full Clean Rebuild #2"
echo "Source:  ${SOURCE_DIR}"
echo "Output:  ${DIST_DIR}"
echo "Archive: ${backup_dir}"
echo

# 1) Safety checks
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ ERROR: Source directory '$SOURCE_DIR' does not exist."
  echo "Make sure your canonical site lives in:  ./website/"
  exit 1
fi

mkdir -p "$ARCHIVE_DIR"

# 2) Archive existing dist (if any)
if [ -d "$DIST_DIR" ]; then
  echo "📦 Archiving existing '$DIST_DIR' to '$backup_dir'..."
  mkdir -p "$backup_dir"
  cp -R "$DIST_DIR"/. "$backup_dir"/
  echo "✅ Archive complete."
else
  echo "ℹ️ No existing '$DIST_DIR' directory found. Skipping archive."
fi

# 3) Clean & rebuild dist
echo "🧹 Removing old '$DIST_DIR'..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

echo "📁 Copying fresh site from '$SOURCE_DIR' to '$DIST_DIR'..."
cp -R "$SOURCE_DIR"/. "$DIST_DIR"/

echo "✅ Base copy complete."

# 4) Optional: Minify HTML/CSS/JS if tools are installed
echo
echo "⚙️ Running optional minification (if tools are installed)..."

if command -v html-minifier-terser >/dev/null 2>&1; then
  echo "  • Minifying HTML with html-minifier-terser..."
  find "$DIST_DIR" -name "*.html" -print0 | while IFS= read -r -d '' file; do
    html-minifier-terser \
      --collapse-whitespace \
      --remove-comments \
      --minify-css true \
      --minify-js true \
      -o "$file" "$file"
  done
else
  echo "  • html-minifier-terser not found (skip HTML minify)."
  echo "    To enable: npm install -D html-minifier-terser"
fi

if command -v cleancss >/dev/null 2>&1; then
  echo "  • Minifying CSS with clean-css-cli..."
  find "$DIST_DIR" -name "*.css" -print0 | while IFS= read -r -d '' file; do
    cleancss -o "$file" "$file"
  done
else
  echo "  • clean-css (cleancss) not found (skip CSS minify)."
  echo "    To enable: npm install -D clean-css-cli"
fi

if command -v terser >/dev/null 2>&1; then
  echo "  • Minifying JS with terser..."
  find "$DIST_DIR" -name "*.js" -print0 | while IFS= read -r -d '' file; do
    terser "$file" -c -m -o "$file"
  done
else
  echo "  • terser not found (skip JS minify)."
  echo "    To enable: npm install -D terser"
fi

echo
echo "🎉 FULL CLEAN REBUILD #2 COMPLETE"
echo "→ Deploy from:    $DIST_DIR/"
echo "→ Backup stored:  $backup_dir/"
