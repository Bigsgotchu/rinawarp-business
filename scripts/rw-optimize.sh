#!/bin/bash
set -e

echo "============================================="
echo "      🚀 RINAWARP FRONTEND OPTIMIZER"
echo "============================================="

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is required but not installed. Aborting."
  exit 1
fi

# 1) Install tools (only first time takes a bit)
echo "1️⃣ Installing optimization tools (if needed)..."
npm install --save-dev \
  html-minifier-terser \
  terser \
  csso-cli \
  imagemin-cli \
  imagemin-mozjpeg \
  imagemin-pngquant \
  imagemin-svgo >/dev/null 2>&1 || true

# 2) Prepare dist/
echo "2️⃣ Preparing dist/ folder..."
rm -rf dist
mkdir -p dist

echo "   ➜ Copying site files into dist/..."
rsync -av \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  ./ dist/ >/dev/null

cd dist

# 3) Minify CSS
echo "3️⃣ Minifying CSS..."
if ls css/*.css >/dev/null 2>&1; then
  for css in css/*.css; do
    echo "   ➜ $css"
    npx csso "$css" --output "${css}.min" >/dev/null 2>&1 || continue
    mv "${css}.min" "$css"
  done
else
  echo "   ⚠ No CSS files found in css/; skipping."
fi

# 4) Minify JS
echo "4️⃣ Minifying JS..."
if ls js/*.js >/dev/null 2>&1; then
  for js in js/*.js; do
    echo "   ➜ $js"
    npx terser "$js" -c -m -o "${js}.min" >/dev/null 2>&1 || continue
    mv "${js}.min" "$js"
  done
else
  echo "   ⚠ No JS files found in js/; skipping."
fi

# 5) Minify HTML
echo "5️⃣ Minifying HTML..."
for html in *.html; do
  [ -f "$html" ] || continue
  echo "   ➜ $html"
  npx html-minifier-terser \
    --collapse-whitespace \
    --remove-comments \
    --remove-optional-tags \
    --minify-css true \
    --minify-js true \
    "$html" -o "${html}.min" >/dev/null 2>&1 || continue
  mv "${html}.min" "$html"
done

# 6) Optimize images (lossy but reasonable)
echo "6️⃣ Optimizing images..."
if [ -d "assets" ]; then
  npx imagemin "assets/*.{jpg,jpeg,png,svg}" \
    --plugin=mozjpeg \
    --plugin=pngquant \
    --plugin=svgo \
    --out-dir="assets" >/dev/null 2>&1 || echo "   ⚠ imagemin issue (non-fatal)"
else
  echo "   ⚠ No assets/ folder; skipping image optimization."
fi

echo
echo "============================================="
echo "  ✅ OPTIMIZATION COMPLETE"
echo "  ➜ Optimized build in: $(pwd)"
echo "============================================="