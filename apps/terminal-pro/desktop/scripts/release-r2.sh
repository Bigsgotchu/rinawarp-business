#!/usr/bin/env bash
set -euo pipefail

# ===== CONFIG =====
VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then echo "Usage: scripts/release-r2.sh <version>"; exit 1; fi
PROJECT="RinaWarp Terminal Pro"
BUCKET="rinawarp-downloads"            # R2 bucket name
R2_PREFIX="releases/v$VERSION"         # versioned path
R2_LATEST="latest"                     # alias path
SITE_DIR="site"                        # website source dir (for Pages)
# Set this to your R2 public base URL (custom domain or public bucket URL, no trailing slash)
R2_PUBLIC_BASE="${R2_PUBLIC_BASE:-https://downloads.rinawarptech.com}"

# ===== PRECHECKS =====
command -v wrangler >/dev/null || { echo "Install wrangler: npm i -g wrangler"; exit 1; }
command -v shasum >/dev/null || { echo "shasum is required (macOS: built-in; Linux: apt-get install perl-Digest-SHA)"; exit 1; }

# ===== BUILD =====
rm -rf dist
npm ci
npm run build   # electron-builder -mwl

# ===== COLLECT ARTIFACTS =====
# Adjust patterns if your artifactName differs.
mapfile -t FILES < <(ls dist | grep -E '\.(dmg|exe|AppImage|deb|rpm|zip)$' | sed "s|^|dist/|")
test ${#FILES[@]} -gt 0 || { echo "No artifacts found in dist/"; exit 1; }

# ===== CHECKSUMS =====
TMPDIR="$(mktemp -d)"
cp "${FILES[@]}" "$TMPDIR/"
( cd "$TMPDIR" && shasum -a 256 * > SHA256SUMS.txt )
echo "Checksums:"
cat "$TMPDIR/SHA256SUMS.txt"

# ===== UPLOAD TO R2 (versioned) =====
for f in "${FILES[@]}"; do
  base="$(basename "$f")"
  echo "→ Upload $f  =>  r2://$BUCKET/$R2_PREFIX/$base"
  wrangler r2 object put "$BUCKET/$R2_PREFIX/$base" --file="$f" >/dev/null
done
wrangler r2 object put "$BUCKET/$R2_PREFIX/SHA256SUMS.txt" --file="$TMPDIR/SHA256SUMS.txt" >/dev/null

# ===== CREATE/UPDATE "latest" aliases =====
alias_put () { # $1 src filename (under versioned), $2 alias filename
  local src="$1" ; local alias="$2"
  echo "→ Alias $src  =>  $alias"
  # Copy by re-uploading from local file with alias name
  wrangler r2 object get "$BUCKET/$R2_PREFIX/$src" --file="$TMPDIR/$alias" >/dev/null
  wrangler r2 object put "$BUCKET/$R2_LATEST/$alias" --file="$TMPDIR/$alias" >/dev/null
}

# Pick best mac target (prefer universal if you ship it)
if ls dist/*-universal.dmg >/dev/null 2>&1; then
  alias_put "$(basename "$(ls dist/*-universal.dmg | head -n1)")" "RinaWarp-mac-universal-latest.dmg"
else
  if ls dist/*-arm64.dmg >/dev/null 2>&1; then alias_put "$(basename "$(ls dist/*-arm64.dmg | head -n1)")" "RinaWarp-mac-arm64-latest.dmg"; fi
  if ls dist/*-x64.dmg   >/dev/null 2>&1; then alias_put "$(basename "$(ls dist/*-x64.dmg   | head -n1)")" "RinaWarp-mac-x64-latest.dmg";   fi
fi
if ls dist/*-win-*.exe >/dev/null 2>&1; then alias_put "$(basename "$(ls dist/*-win-*.exe | head -n1)")" "RinaWarp-win-x64-latest.exe"; fi
if ls dist/*linux*x86_64*.AppImage >/dev/null 2>&1; then alias_put "$(basename "$(ls dist/*linux*x86_64*.AppImage | head -n1)")" "RinaWarp-linux-x86_64-latest.AppImage"; fi
if ls dist/*amd64.deb >/dev/null 2>&1; then alias_put "$(basename "$(ls dist/*amd64.deb | head -n1)")" "RinaWarp-linux-amd64-latest.deb"; fi
if ls dist/*.x86_64.rpm >/dev/null 2>&1; then alias_put "$(basename "$(ls dist/*.x86_64.rpm | head -n1)")" "RinaWarp-linux-x86_64-latest.rpm"; fi
wrangler r2 object put "$BUCKET/$R2_LATEST/SHA256SUMS.txt" --file="$TMPDIR/SHA256SUMS.txt" >/dev/null

# ===== META JSON (version + notes + asset aliases) =====
META="${TMPDIR}/meta.json"
DATE_ISO="$(date -I)"
NOTES="${RELEASE_NOTES:-}"

# If RELEASE_NOTES not provided, try CHANGELOG.md top section as fallback (first non-empty 6 lines)
if [[ -z "$NOTES" && -f CHANGELOG.md ]]; then
  NOTES="$(awk 'NF{print} !NF{exit}' CHANGELOG.md | head -n 6 | tr '\n' ' ' )"
fi
[[ -z "$NOTES" ]] && NOTES="RinaWarp ${VERSION} release."

# Resolve which aliases exist (set to empty if not uploaded)
alias_exists () { wrangler r2 object head "$BUCKET/$R2_LATEST/$1" >/dev/null 2>&1 && echo "1" || echo ""; }

HAS_MAC_UNI=$(alias_exists "RinaWarp-mac-universal-latest.dmg")
HAS_MAC_ARM=$(alias_exists "RinaWarp-mac-arm64-latest.dmg")
HAS_MAC_X64=$(alias_exists "RinaWarp-mac-x64-latest.dmg")
HAS_WIN=$(alias_exists "RinaWarp-win-x64-latest.exe")
HAS_APPIMG=$(alias_exists "RinaWarp-linux-x86_64-latest.AppImage")
HAS_DEB=$(alias_exists "RinaWarp-linux-amd64-latest.deb")
HAS_RPM=$(alias_exists "RinaWarp-linux-x86_64-latest.rpm")
# Build assets map relative to bucket root
MAC_URL="$R2_LATEST/RinaWarp-mac-universal-latest.dmg"
[[ -z "$HAS_MAC_UNI" && -n "$HAS_MAC_ARM" ]] && MAC_URL="$R2_LATEST/RinaWarp-mac-arm64-latest.dmg"
[[ -z "$HAS_MAC_UNI" && -z "$HAS_MAC_ARM" && -n "$HAS_MAC_X64" ]] && MAC_URL="$R2_LATEST/RinaWarp-mac-x64-latest.dmg"

cat > "$META" <<JSON
{
  "version": "${VERSION}",
  "date": "${DATE_ISO}",
  "notes": "$(echo "$NOTES" | sed 's/"/\\"/g')",
  "assets": {
    "mac": "/${MAC_URL}"$( [[ -n "$HAS_MAC_X64" ]] && echo ', "mac_x64": "/latest/RinaWarp-mac-x64-latest.dmg"' )$( [[ -n "$HAS_MAC_ARM" ]] && echo ', "mac_arm64": "/latest/RinaWarp-mac-arm64-latest.dmg"' ),
    "win": $( [[ -n "$HAS_WIN" ]] && echo '"/latest/RinaWarp-win-x64-latest.exe"' || echo 'null' ),
    "linux": $( [[ -n "$HAS_APPIMG" ]] && echo '"/latest/RinaWarp-linux-x86_64-latest.AppImage"' || echo 'null' ),
    "deb": $( [[ -n "$HAS_DEB" ]] && echo '"/latest/RinaWarp-linux-amd64-latest.deb"' || echo 'null' ),
    "rpm": $( [[ -n "$HAS_RPM" ]] && echo '"/latest/RinaWarp-linux-x86_64-latest.rpm"' || echo 'null' ),
    "checksums": "/latest/SHA256SUMS.txt"
  }
}
JSON

echo "→ Upload meta.json"
wrangler r2 object put "$BUCKET/$R2_PREFIX/meta.json" --file="$META" >/dev/null
wrangler r2 object put "$BUCKET/$R2_LATEST/meta.json" --file="$META" >/dev/null

echo "Done: meta.json uploaded to:"
echo " - $R2_PUBLIC_BASE/$R2_PREFIX/meta.json"
echo " - $R2_PUBLIC_BASE/$R2_LATEST/meta.json"

# ===== WRITE /site DOWNLOAD PAGE + REDIRECTS =====
mkdir -p "$SITE_DIR/public"
cat > "$SITE_DIR/public/_redirects" <<EOF
/download              /downloads.html  200
/download/mac          $R2_PUBLIC_BASE/$R2_LATEST/RinaWarp-mac-universal-latest.dmg 302
/download/mac/arm      $R2_PUBLIC_BASE/$R2_LATEST/RinaWarp-mac-arm64-latest.dmg 302
/download/mac/x64      $R2_PUBLIC_BASE/$R2_LATEST/RinaWarp-mac-x64-latest.dmg 302
/download/win          $R2_PUBLIC_BASE/$R2_LATEST/RinaWarp-win-x64-latest.exe 302
/download/linux        $R2_PUBLIC_BASE/$R2_LATEST/RinaWarp-linux-x86_64-latest.AppImage 302
/download/linux/deb    $R2_PUBLIC_BASE/$R2_LATEST/RinaWarp-linux-amd64-latest.deb 302
/download/linux/rpm    $R2_PUBLIC_BASE/$R2_LATEST/RinaWarp-linux-x86_64-latest.rpm 302
/download/checksums    $R2_PUBLIC_BASE/$R2_LATEST/SHA256SUMS.txt 302
EOF

cat > "$SITE_DIR/public/downloads.html" <<'EOF'
<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Download RinaWarp Terminal Pro</title>
<style>
body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;margin:0;background:#0d0d0f;color:#eaeaea}
.wrap{max-width:880px;margin:0 auto;padding:32px}
h1{font-weight:600;margin-bottom:12px}
.card{background:#131316;border:1px solid #26262c;border-radius:16px;padding:20px;margin:16px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.btn{display:inline-block;padding:12px 14px;border-radius:12px;border:1px solid #2e2e36;text-decoration:none;color:#eaeaea;background:#1b1b22}
.small{color:#9aa0a6;font-size:12px}
</style>
<div class=wrap>
  <h1>RinaWarp Terminal Pro</h1>
  <p class=small>Local-first, AI-assisted execution terminal.</p>
  <div class=card><a class=btn id=primary href=/download>Detecting your OS…</a></div>
  <div class=card><h3>Direct Downloads</h3><div class=grid>
    <a class=btn href=/download/mac>macOS (Universal)</a>
    <a class=btn href=/download/mac/arm>macOS Apple Silicon</a>
    <a class=btn href=/download/mac/x64>macOS Intel</a>
    <a class=btn href=/download/win>Windows (x64)</a>
    <a class=btn href=/download/linux>Linux AppImage (x86_64)</a>
    <a class=btn href=/download/linux/deb>Linux .deb (amd64)</a>
    <a class=btn href=/download/linux/rpm>Linux .rpm (x86_64)</a>
    <a class=btn href=/download/checksums>SHA256 Checksums</a>
  </div></div>
</div>
<script>
(function(){
  const ua = navigator.userAgent.toLowerCase();
  const btn = document.getElementById('primary');
  const isMac = /mac os x/.test(ua);
  const isWin = /windows nt/.test(ua);
  const isLinux = /linux/.test(ua) && !/android/.test(ua);
  const isARM = /arm|aarch64/.test(ua) || /apple silicon|apple m\d/i.test(ua);
  if (isMac) { btn.textContent = isARM ? 'Download for macOS (Apple Silicon)' : 'Download for macOS (Intel)';
              btn.href = isARM ? '/download/mac/arm' : '/download/mac/x64'; }
  else if (isWin) { btn.textContent = 'Download for Windows (x64)'; btn.href = '/download/win'; }
  else if (isLinux){ btn.textContent = 'Download for Linux (AppImage)'; btn.href = '/download/linux'; }
  else { btn.textContent = 'Choose your OS'; btn.href = '#'; }
})();
</script>
EOF

echo "OK. Next step: wrangler pages deploy $SITE_DIR/public"
echo "Published R2 URLs base: $R2_PUBLIC_BASE/$R2_LATEST/"
