#!/bin/bash
set -e

echo "==============================================="
echo "      🎨 RINAWARP HYBRID THEME APPLICATOR"
echo "==============================================="

TARGET_DIR="."
CSS_FILE="./css/styles.css"

# Ensure CSS file exists
if [ ! -f "$CSS_FILE" ]; then
  echo "❌ ERROR: styles.css not found in ./css/"
  exit 1
fi

echo "✔ Found styles.css — applying theme to all pages..."

# -----------------------------
# APPLY GLOBAL PAGE STRUCTURE
# -----------------------------
for f in *.html; do
  echo "→ Updating $f"

  # Add global container to body
  sed -i 's/<body>/<body>\n<div class="container">/' "$f"
  sed -i 's@</body>@</div>\n</body>@' "$f"

  # Convert old buttons to neon buttons
  sed -i 's/class="button"/class="button-mermaid"/g' "$f"
  sed -i 's/class="btn"/class="button-mermaid"/g' "$f"

  # Add card styling to major sections
  sed -i 's/<section>/<section class="section section-dark card">/g' "$f"

  # Ensure footer exists & is standardized
  if ! grep -q "<footer" "$f"; then
    cat <<'FOOTER_BLOCK' >> "$f"

<footer>
  <p>© 2025 RinaWarp Technologies, LLC — All Rights Reserved</p>
  <a href="/privacy.html">Privacy Policy</a> •
  <a href="/terms.html">Terms of Service</a> •
  <a href="/refund-policy.html">Refund Policy</a> •
  <a href="/dmca.html">DMCA</a>
</footer>

FOOTER_BLOCK
  fi
done

# ----------------------------------------
# TERMINAL PRO PAGE — MERMAID THEME
# ----------------------------------------
if [ -f "terminal-pro.html" ]; then
  sed -i 's/<h1>/<h1 class="mermaid-accent">/' terminal-pro.html
  sed -i 's/class="button-mermaid"/class="button-mermaid"/g' terminal-pro.html
fi

# ----------------------------------------
# MUSIC VIDEO CREATOR — UNICORN THEME
# ----------------------------------------
if [ -f "music-video-creator.html" ]; then
  sed -i 's/<h1>/<h1 class="unicorn-accent">/' music-video-creator.html
  sed -i 's/button-mermaid/button-unicorn/g' music-video-creator.html
fi

echo "==============================================="
echo "  🎉 THEME APPLIED TO ALL PAGES SUCCESSFULLY!"
echo "  👉 You can now redeploy to Netlify"
echo "==============================================="