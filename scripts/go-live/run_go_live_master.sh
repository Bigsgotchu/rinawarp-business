#!/usr/bin/env bash
set -euo pipefail

# ================================================================
#  RINAWARP — MASTER GO-LIVE SCRIPT (SAFE MODE)
#  Orchestrates:
#     1. Cloudflare env validation
#     2. KV namespace creation/repair
#     3. Production domain auto-switch
#     4. Pre-Go-Live validation suite
#
#  No DNS changes. No deployments. All safe & reversible.
# ================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
LOG_DIR="$ROOT_DIR/audit/go-live-$TIMESTAMP"
MASTER_LOG="$LOG_DIR/go-live-master.log"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $*" | tee -a "$MASTER_LOG"
}

log "=============================================================="
log "   RINAWARP — MASTER GO-LIVE SCRIPT"
log "   SAFE MODE (NO DNS OR DEPLOYMENT CHANGES)"
log "=============================================================="
log "ROOT: $ROOT_DIR"
log "LOG:  $MASTER_LOG"
log ""

# ---------------------------------------------------------------
# 0. Ensure all sub-scripts exist
# ---------------------------------------------------------------
REQUIRED_SCRIPTS=(
  "scripts/tools/fix_cloudflare_env.sh"
  "scripts/tools/create_missing_kv_namespaces.sh"
  "scripts/tools/fix_production_domain_auto.sh"
  "scripts/tools/validation/validate_pre_go_live.sh"
)

for s in "${REQUIRED_SCRIPTS[@]}"; do
  if [[ ! -f "$ROOT_DIR/$s" ]]; then
    log "❌ Missing required script: $s"
    log "   Cannot continue."
    exit 1
  fi
done

log "✅ All required sub-scripts found."
log ""

# ---------------------------------------------------------------
# 1. FIX CLOUDLFARE ENVIRONMENT
# ---------------------------------------------------------------
log "--------------------------------------------------------------"
log " STEP 1: Validating / repairing Cloudflare environment"
log "--------------------------------------------------------------"

bash "$ROOT_DIR/scripts/tools/fix_cloudflare_env.sh" \
  2>&1 | tee -a "$MASTER_LOG"

log "✔ Completed Cloudflare environment repair."
log ""

# ---------------------------------------------------------------
# 2. ENSURE ALL KV NAMESPACES EXIST
# ---------------------------------------------------------------
log "--------------------------------------------------------------"
log " STEP 2: Ensuring KV namespaces exist"
log "--------------------------------------------------------------"

bash "$ROOT_DIR/scripts/tools/create_missing_kv_namespaces.sh" \
  2>&1 | tee -a "$MASTER_LOG"

log "✔ KV namespaces validated / created."
log ""

# ---------------------------------------------------------------
# 3. AUTO-SWITCH PRODUCTION DOMAIN (IF READY)
# ---------------------------------------------------------------
log "--------------------------------------------------------------"
log " STEP 3: Production domain auto-switch"
log "--------------------------------------------------------------"

bash "$ROOT_DIR/scripts/tools/fix_production_domain_auto.sh" \
  2>&1 | tee -a "$MASTER_LOG"

log "✔ Domain fix script completed (safe mode)."
log ""

# ---------------------------------------------------------------
# 4. RUN PRE-GO-LIVE VALIDATION SUITE
# ---------------------------------------------------------------
log "--------------------------------------------------------------"
log " STEP 4: Pre-Go-Live Validation"
log "--------------------------------------------------------------"

bash "$ROOT_DIR/scripts/tools/validation/validate_pre_go_live.sh" \
  2>&1 | tee -a "$MASTER_LOG"

log ""
log "=============================================================="
log "🎉 MASTER GO-LIVE CHECK COMPLETED"
log "Logs saved to: $LOG_DIR"
log "=============================================================="