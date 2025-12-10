#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# RinaWarp Business Monorepo - Phase 5 Migration
# Marketing Docs, Campaign Scripts, and Generated Content
# STRICT SAFE MODE: no overwrites, no deletes, secrets skipped.
# ============================================================================

OLD_ROOT="/home/karina/Documents/RinaWarp"
NEW_ROOT="$HOME/Documents/rinawarp-business"

TS="$(date +%Y%m%d-%H%M%S)"
LOG_DIR="$NEW_ROOT/audit/migrations"
LOG_FILE="$LOG_DIR/migration-marketing-safe-$TS.log"

mkdir -p "$LOG_DIR"

log() {
  local msg="$1"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$msg" | tee -a "$LOG_FILE"
}

copy_safe() {
  local src="$1"
  local dest="$2"

  if [ ! -f "$src" ]; then
    log "MISSING: $src"
    return
  fi

  mkdir -p "$(dirname "$dest")"

  if cp -n "$src" "$dest" 2>/dev/null; then
    log "COPIED: $src -> $dest"
  else
    if [ -f "$dest" ]; then
      log "SKIPPED (exists): $dest"
    else
      log "ERROR copying: $src -> $dest"
    fi
  fi
}

log "==================================================================="
log "RINAWARP PHASE 5 MIGRATION - MARKETING DOCS & SCRIPTS (SAFE MODE)"
log "OLD_ROOT = $OLD_ROOT"
log "NEW_ROOT = $NEW_ROOT"
log "LOG_FILE = $LOG_FILE"
log "==================================================================="

# --------------------------------------------------------------------
# 1) High-level marketing docs (strategy, roadmap, action plan)
# --------------------------------------------------------------------
copy_safe "$OLD_ROOT/archive/app/marketing/MARKETING.md" \
          "$NEW_ROOT/docs/business/marketing/MARKETING.md"

copy_safe "$OLD_ROOT/archive/app/marketing/6-MONTH-ROADMAP.md" \
          "$NEW_ROOT/docs/business/marketing/6-MONTH-ROADMAP.md"

copy_safe "$OLD_ROOT/archive/app/marketing/COMPLETE-ACTION-PLAN.md" \
          "$NEW_ROOT/docs/business/marketing/COMPLETE-ACTION-PLAN.md"

# --------------------------------------------------------------------
# 2) Generated marketing content (email, posts, launch checklists, PR)
# --------------------------------------------------------------------
copy_safe "$OLD_ROOT/archive/app/marketing/marketing/generated/email_campaign.html" \
          "$NEW_ROOT/docs/business/marketing/generated/email_campaign.html"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/generated/hackernews_posts.md" \
          "$NEW_ROOT/docs/business/marketing/generated/hackernews_posts.md"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/generated/launch_checklist.md" \
          "$NEW_ROOT/docs/business/marketing/generated/launch_checklist.md"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/generated/linkedin_posts.md" \
          "$NEW_ROOT/docs/business/marketing/generated/linkedin_posts.md"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/generated/press_release.md" \
          "$NEW_ROOT/docs/business/marketing/generated/press_release.md"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/generated/reddit_posts.md" \
          "$NEW_ROOT/docs/business/marketing/generated/reddit_posts.md"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/generated/twitter_posts.md" \
          "$NEW_ROOT/docs/business/marketing/generated/twitter_posts.md"

# --------------------------------------------------------------------
# 3) Marketing campaign scripts and utilities
# --------------------------------------------------------------------
copy_safe "$OLD_ROOT/archive/app/marketing/marketing/basic-tier-campaign.js" \
          "$NEW_ROOT/scripts/marketing/basic-tier-campaign.js"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/email-campaign.js" \
          "$NEW_ROOT/scripts/marketing/email-campaign.js"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/feature-enhancement-strategy.js" \
          "$NEW_ROOT/scripts/marketing/feature-enhancement-strategy.js"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/feature-enhancement-strategy.json" \
          "$NEW_ROOT/scripts/marketing/feature-enhancement-strategy.json"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/growth-hacking.js" \
          "$NEW_ROOT/scripts/marketing/growth-hacking.js"

copy_safe "$OLD_ROOT/archive/app/marketing/marketing/launch-campaign.js" \
          "$NEW_ROOT/scripts/marketing/launch-campaign.js"

# Revenue-focused launch helper
copy_safe "$OLD_ROOT/archive/app/marketing/LAUNCH-REVENUE-GENERATION.sh" \
          "$NEW_ROOT/scripts/marketing/LAUNCH-REVENUE-GENERATION.sh"

# --------------------------------------------------------------------
# 4) Explicitly skip secret-like files (document decision in log)
# --------------------------------------------------------------------
if [ -f "$OLD_ROOT/archive/app/marketing/.env" ]; then
  log "SKIP SECRET-LIKE FILE: $OLD_ROOT/archive/app/marketing/.env (not copied by design)"
fi

log "-------------------------------------------------------------------"
log "PHASE 5 COMPLETE (MARKETING DOCS & SCRIPTS - SAFE MODE)."
log "Review new files under docs/business/marketing and scripts/marketing."
log "-------------------------------------------------------------------"