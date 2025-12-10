#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------------------------
# RINAWARP - PRODUCTION DOMAIN AUTO-SWITCHER (SAFE MODE)
# - Checks if rinawarptech.com is attached to Cloudflare Pages project
# - If yes, offers to replace preview URLs with production URL
# - Only edits local files (with backups). NO DNS CHANGES.
# -------------------------------------------------------------------

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
LOG_DIR="$ROOT_DIR/audit/fix-production-domain-$TIMESTAMP"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/fix-production-domain.log"

log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $*" | tee -a "$LOG_FILE"
}

log "=== RINAWARP PRODUCTION DOMAIN FIXER (SAFE MODE) ==="
log "ROOT_DIR: $ROOT_DIR"
log "LOG_FILE: $LOG_FILE"

# Required tools
for cmd in curl jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log "❌ Missing required command: $cmd"
    exit 1
  fi
done

# Load Cloudflare env
RINAWARP_CFG_DIR="${HOME}/.config/rinawarp"
RINAWARP_ENV_FILE="${RINAWARP_CFG_DIR}/env"
if [[ -f "$RINAWARP_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$RINAWARP_ENV_FILE"
  log "ℹ️ Loaded Cloudflare config from $RINAWARP_ENV_FILE"
else
  log "ℹ️ No ~/.config/rinawarp/env found, relying on current env."
fi

CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"

if [[ -z "$CLOUDFLARE_API_TOKEN" || -z "$CLOUDFLARE_ACCOUNT_ID" ]]; then
  log "❌ CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID not set."
  log "   Run scripts/tools/fix_cloudflare_env.sh first."
  exit 1
fi

PAGES_PROJECT="${PAGES_PROJECT:-rinawarptech}"
PREVIEW_URL="https://master.rinawarptech.pages.dev"
PROD_URL="https://rinawarptech.com"

log "🔎 Checking Cloudflare Pages project '$PAGES_PROJECT' for custom domain..."

PROJECT_JSON="$LOG_DIR/pages-project.json"
curl -sS \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}" \
  >"$PROJECT_JSON"

SUCCESS="$(jq -r '.success // false' "$PROJECT_JSON" 2>/dev/null || echo "false")"
if [[ "$SUCCESS" != "true" ]]; then
  log "❌ Failed to retrieve Pages project details."
  head -c 400 "$PROJECT_JSON" | sed 's/$/\n/' | tee -a "$LOG_FILE"
  exit 1
fi

# Extract domains
DOMAINS="$(jq -r '.result.domains[]? // empty' "$PROJECT_JSON")"

if echo "$DOMAINS" | grep -q "^rinawarptech.com$"; then
  log "✅ Custom domain rinawarptech.com is attached to Pages project."
else
  log "⚠️ rinawarptech.com is NOT attached to the Pages project yet."
  log "   No changes will be made."
  log "   Attach the custom domain in Cloudflare Pages first, then re-run this script."
  exit 0
fi

log "🔎 Scanning repo for preview URL: $PREVIEW_URL"
MATCH_FILE="$LOG_DIR/files-with-preview-url.txt"
cd "$ROOT_DIR"
grep -RIl --exclude-dir=".git" --exclude-dir="audit" --exclude-dir="node_modules" "$PREVIEW_URL" . >"$MATCH_FILE" || true

if [[ ! -s "$MATCH_FILE" ]]; then
  log "ℹ️ No files contain the preview URL. Nothing to change."
  exit 0
fi

log "📄 Files containing preview URL:"
cat "$MATCH_FILE" | sed 's/^/ - /' | tee -a "$LOG_FILE"

echo ""
read -r -p "⚠️ Replace all occurrences of $PREVIEW_URL with $PROD_URL in these files? (yes/no) " answer
case "$answer" in
  yes|y|Y)
    log "✅ User confirmed URL replacement."
    ;;
  *)
    log "❌ User cancelled. No changes made."
    exit 0
    ;;
esac

BACKUP_DIR="$LOG_DIR/backups"
mkdir -p "$BACKUP_DIR"

while IFS= read -r file; do
  # Normalize leading ./ from grep
  clean_path="${file#./}"
  src="$ROOT_DIR/$clean_path"
  dest_backup="$BACKUP_DIR/${clean_path//\//__}.bak"

  if [[ -f "$src" ]]; then
    cp "$src" "$dest_backup"
    log "📦 Backup created for $clean_path -> $dest_backup"
    sed -i "s|$PREVIEW_URL|$PROD_URL|g" "$src"
    log "✅ Updated $clean_path"
  else
    log "⚠️ Skipping missing file: $clean_path"
  fi
done <"$MATCH_FILE"

log ""
log "🎉 DONE: All occurrences of:"
log "   $PREVIEW_URL"
log "   have been replaced with:"
log "   $PROD_URL"
log "   Backups are in $BACKUP_DIR"
log "   No DNS settings were modified."