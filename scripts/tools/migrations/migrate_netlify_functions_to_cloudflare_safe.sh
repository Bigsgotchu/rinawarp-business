#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

OLD_ROOT="/home/karina/Documents/RinaWarp"
NEW_ROOT="/home/karina/Documents/rinawarp-business"
LOG_DIR="$NEW_ROOT/audit/migrations"
LOG_FILE="$LOG_DIR/migration-netlify-functions-safe-$TIMESTAMP.log"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "====================================================="
log " RINAWARP SAFE MIGRATION — NETLIFY → CLOUDFLARE SOURCE"
log " Started at: $TIMESTAMP"
log " STRICT SAFE MODE: copy-only, no overwrites"
log " OLD_ROOT: $OLD_ROOT"
log " NEW_ROOT: $NEW_ROOT"
log "====================================================="

SRC_WEBSITE_FUNCS="$OLD_ROOT/apps/website/netlify/functions"
SRC_AIMVC_FUNCS="$OLD_ROOT/apps/ai-music-video/netlify/functions"

DEST_BASE="$NEW_ROOT/functions/_netlify_source"
DEST_WEBSITE="$DEST_BASE/website"
DEST_AIMVC="$DEST_BASE/ai-music-video"

mkdir -p "$DEST_WEBSITE" "$DEST_AIMVC"

copy_dir_safe() {
  local src="$1"
  local dest="$2"
  local label="$3"

  if [ -d "$src" ]; then
    log "[$label] Found: $src → copying into $dest (cp -rn)"
    mkdir -p "$dest"
    # -r: recursive, -n: no clobber (do not overwrite)
    cp -rn "$src"/. "$dest"/ 2>>"$LOG_FILE" || true
    log "[$label] Copy completed (safe mode)"
  else
    log "[$label] SKIP — directory not found: $src"
  fi
}

copy_dir_safe "$SRC_WEBSITE_FUNCS" "$DEST_WEBSITE" "WEBSITE_FUNCS"
copy_dir_safe "$SRC_AIMVC_FUNCS" "$DEST_AIMVC" "AIMVC_FUNCS"

log "====================================================="
log " SAFE COPY COMPLETE — no files overwritten"
log " Review copied functions under: $DEST_BASE"
log " Log written to: $LOG_FILE"
log "====================================================="

log "NEXT STEPS:"
log " 1) Create Cloudflare Pages Functions in $NEW_ROOT/functions"
log " 2) Manually port logic from _netlify_source → new /functions/*.ts"
log " 3) Commit & push to trigger Cloudflare Pages deploy for rinawarptech.com"