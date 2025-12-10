#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"

# Adjust if your old repo lives somewhere else:
OLD_ROOT="/home/karina/Documents/RinaWarp"
NEW_ROOT="${NEW_ROOT:-$HOME/Documents/rinawarp-business}"

LOG_DIR="$NEW_ROOT/audit/migrations"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/migration-terminal-pro-safe-$TS.log"

log() {
  echo "[$(date +%F\ %T)] $*" | tee -a "$LOG_FILE"
}

copy_safe_file() {
  local src="$1"
  local dest="$2"

  if [ ! -f "$src" ]; then
    log "SKIP (missing file): $src"
    return
  fi

  mkdir -p "$(dirname "$dest")"

  if cp -n "$src" "$dest" 2>/dev/null; then
    log "COPIED: $src -> $dest"
  else
    log "SKIP (exists): $dest"
  fi
}

copy_safe_dir() {
  local src="$1"
  local dest="$2"

  if [ ! -d "$src" ]; then
    log "SKIP (missing dir): $src"
    return
  fi

  mkdir -p "$dest"

  # Copy contents (.) to avoid extra nesting, never overwrite
  if cp -rn "$src"/. "$dest"/ 2>/dev/null; then
    log "COPIED DIR: $src -> $dest"
  else
    log "SKIP DIR (already populated or no changes): $src"
  fi
}

log "=== Terminal Pro STRICT SAFE migration starting ==="
log "OLD_ROOT=$OLD_ROOT"
log "NEW_ROOT=$NEW_ROOT"
log "LOG_FILE=$LOG_FILE"

###############################################################################
# 1) Terminal Pro docs (extra / full docs)
#    We already migrated the core 4 docs; here we keep the full original set
#    under a clearly-marked subfolder for reference.
###############################################################################
copy_safe_dir \
  "$OLD_ROOT/RinaWarp-Terminal-Pro/docs" \
  "$NEW_ROOT/docs/product/terminal-pro/_full-source"

###############################################################################
# 2) Terminal Pro domain bundle (src/domain/terminal)
#    This is a clean, clearly-scoped domain tree. We keep it separate under
#    domain/terminal for now, to refactor later.
###############################################################################
copy_safe_dir \
  "$OLD_ROOT/src/domain/terminal" \
  "$NEW_ROOT/domain/terminal"

###############################################################################
# 3) Stripe / billing docs that are clearly global + production-grade
#    These are business-critical but not secrets. They go into docs/billing/stripe.
###############################################################################
copy_safe_file \
  "$OLD_ROOT/STRIPE_WEBHOOK_SETUP_INSTRUCTIONS.txt" \
  "$NEW_ROOT/docs/billing/stripe/global/STRIPE_WEBHOOK_SETUP_INSTRUCTIONS.txt"

copy_safe_file \
  "$OLD_ROOT/STRIPE-SECURITY-UPDATE-DOCUMENT.md" \
  "$NEW_ROOT/docs/billing/stripe/global/STRIPE-SECURITY-UPDATE-DOCUMENT.md"

copy_safe_file \
  "$OLD_ROOT/STRIPE-PRODUCTION-CHECKLIST.md" \
  "$NEW_ROOT/docs/billing/stripe/global/STRIPE-PRODUCTION-CHECKLIST.md"

copy_safe_file \
  "$OLD_ROOT/STRIPE-INTEGRATION-REVIEW-REPORT.md" \
  "$NEW_ROOT/docs/billing/stripe/global/STRIPE-INTEGRATION-REVIEW-REPORT.md"

copy_safe_file \
  "$OLD_ROOT/STRIPE-DEPLOYMENT-GUIDE.md" \
  "$NEW_ROOT/docs/billing/stripe/global/STRIPE-DEPLOYMENT-GUIDE.md"

copy_safe_file \
  "$OLD_ROOT/STRIPE-CONFIGURATION.md" \
  "$NEW_ROOT/docs/billing/stripe/global/STRIPE-CONFIGURATION.md"

# Stripe price exports (non-secret, but sensitive business info)
copy_safe_file \
  "$OLD_ROOT/stripe_prices_public.csv" \
  "$NEW_ROOT/docs/billing/stripe/data/stripe_prices_public.csv"

copy_safe_file \
  "$OLD_ROOT/stripe_prices_export.csv" \
  "$NEW_ROOT/docs/billing/stripe/data/stripe_prices_export.csv"

###############################################################################
# 4) Stripe tools / scripts that are clearly safe and useful
###############################################################################
copy_safe_file \
  "$OLD_ROOT/stripe-test-endtoend-safe.js" \
  "$NEW_ROOT/scripts/tools/stripe/stripe-test-endtoend-safe.js"

copy_safe_file \
  "$OLD_ROOT/stripe-production-setup.sh" \
  "$NEW_ROOT/scripts/tools/stripe/stripe-production-setup.sh"

# Extra "stripe" utils directory, kept in a fenced-off tools area
copy_safe_dir \
  "$OLD_ROOT/stripe" \
  "$NEW_ROOT/scripts/tools/stripe/stripe-extra"

###############################################################################
# DONE
###############################################################################
log "=== Terminal Pro STRICT SAFE migration complete ==="
log "Now run: git status  (to review new files)"