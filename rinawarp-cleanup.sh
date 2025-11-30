#!/bin/bash
set -euo pipefail

echo "===================================================="
echo "   🧹 RINAWARP PROJECT CLEANUP & CONSOLIDATION"
echo "===================================================="
echo

PROJECT_ROOT="$(pwd)"
echo "📁 Project root: $PROJECT_ROOT"
echo

# --- Sanity check ---
if [ ! -f "index.html" ] && [ ! -d "rinawarp-website-final" ] && [ ! -d "rinawarp-clean-website" ]; then
  echo "❌ This does not look like the RinaWarp web root."
  echo "   Run this from /home/karina/Documents/RinaWarp"
  exit 1
fi

# --- Backup everything first ---
echo "1️⃣ Creating full backup (no files will be deleted)..."
mkdir -p archive
TS="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="archive/rinawarp-full-backup-$TS"

rsync -a --exclude "archive" ./ "$BACKUP_DIR/"
echo "✅ Backup created at: $BACKUP_DIR"
echo

# --- Create clean top-level folders ---
echo "2️⃣ Creating clean structure..."
mkdir -p website docs scripts backend branding
echo "✅ Directories ensured: website/ docs/ scripts/ backend/ branding/"
echo

# --- Seed website/ from your best existing set ---
echo "3️⃣ Consolidating website code into ./website ..."

if [ -d "rinawarp-website-final" ]; then
  echo "   • Using rinawarp-website-final as primary source"
  rsync -a rinawarp-website-final/ website/
elif [ -d "rinawarp-clean-website" ]; then
  echo "   • Using rinawarp-clean-website as primary source"
  rsync -a rinawarp-clean-website/ website/
else
  echo "   • No consolidated folder found, will pull from root files only"
fi

# --- Move HTML from root into website/ if not already there ---
echo "   • Moving root HTML pages into website/ (if not present there already)..."
shopt -s nullglob
for f in *.html; do
  if [ -f "$f" ]; then
    if [ -f "website/$f" ]; then
      echo "     - Skipping $f (already exists in website/)"
    else
      echo "     - Moving $f -> website/"
      mv "$f" website/
    fi
  fi
done

# --- Move core web assets into website/ ---
echo "   • Moving core assets into website/ ..."
for p in assets css js _redirects robots.txt sitemap.xml favicon.ico manifest.json; do
  if [ -e "$p" ]; then
    if [ -e "website/$p" ]; then
      echo "     - Skipping $p (already exists in website/)"
    else
      echo "     - Moving $p -> website/"
      mv "$p" website/
    fi
  fi
done
echo "✅ Website consolidation step complete."
echo

# --- Move docs (.md) into docs/, keep main README at root ---
echo "4️⃣ Consolidating documentation into ./docs ..."
for f in *.md; do
  [ -f "$f" ] || continue
  case "$f" in
    README.md) 
      echo "   - Keeping README.md at project root"
      ;;
    *)
      echo "   - Moving $f -> docs/"
      mv "$f" docs/
      ;;
  esac
done
echo "✅ Markdown docs moved into docs/ (except README.md)."
echo

# --- Move loose shell scripts into scripts/ ---
echo "5️⃣ Moving loose shell scripts into ./scripts ..."
find . -maxdepth 1 -type f -name "*.sh" -print0 | while IFS= read -r -d '' f; do
  fname="$(basename "$f")"
  if [[ "$fname" == "rinawarp-cleanup.sh" ]]; then
    echo "   - Leaving $fname at root (this script)"
    continue
  fi
  echo "   - Moving $fname -> scripts/"
  mv "$fname" scripts/
done
echo "✅ Shell scripts consolidated into scripts/."
echo

# --- Netlify config: publish from website/ ---
echo "6️⃣ Writing clean Netlify config at project root (netlify.toml)..."

cat > netlify.toml << 'NTLF'
[build]
  publish = "website"
  # Static site, no build command needed for now
  command = ""

[[redirects]]
  from = "/api/*"
  to = "https://api.rinawarptech.com/:splat"
  status = 200
  force = true

# Optional: SPA-style fallback so deep links always work
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
NTLF

echo "✅ netlify.toml updated to publish from ./website"
echo

# --- Friendly summary ---
echo "===================================================="
echo "   ✅ RINAWARP CLEANUP COMPLETED"
echo "===================================================="
echo "Backup:     $BACKUP_DIR"
echo "Website:    $PROJECT_ROOT/website"
echo "Docs:       $PROJECT_ROOT/docs"
echo "Scripts:    $PROJECT_ROOT/scripts"
echo
echo "Next steps:"
echo "  1) From this folder, redeploy to Netlify:"
echo "       netlify deploy --prod --dir=website"
echo "  2) Confirm rinawarptech.com, /terminal-pro, /music-video-creator"
echo "  3) If anything looks wrong, files are safely stored in:"
echo "       $BACKUP_DIR"
echo
echo "🚀 RinaWarp repo is now clean, professional, and ready to scale."
echo "===================================================="