#!/usr/bin/env bash
# =====================================================================
# RinaWarp – Full Deployment Pipeline (Phases 1, 2, optional 3)
# =====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==============================================================="
echo "   RINAWARP – FULL DEPLOYMENT PIPELINE"
echo "   (Phase 1: Critical, Phase 2: Auth, Phase 3: Frontend – optional)"
echo "==============================================================="
echo "Date: $(date)"
echo ""

# ---------------------------------------------------------------------
# Phase 1 – Critical fixes (Stripe, Pages, webhook, etc.)
# ---------------------------------------------------------------------
echo "---------------------------------------------------------------"
echo " PHASE 1 — Critical fixes"
echo "---------------------------------------------------------------"

if [ -x "./FINAL_PRODUCTION_DEPLOYMENT_SCRIPT.sh" ]; then
    ./FINAL_PRODUCTION_DEPLOYMENT_SCRIPT.sh
else
    echo "[WARN] FINAL_PRODUCTION_DEPLOYMENT_SCRIPT.sh not found or not executable – skipping Phase 1"
fi

# ---------------------------------------------------------------------
# Phase 2 – Auth database integration
# ---------------------------------------------------------------------
echo ""
echo "---------------------------------------------------------------"
echo " PHASE 2 — Auth database integration"
echo "---------------------------------------------------------------"

if [ -x "./DEPLOY_AUTH_FIXES.sh" ]; then
    ./DEPLOY_AUTH_FIXES.sh
else
    echo "[WARN] DEPLOY_AUTH_FIXES.sh not found or not executable – skipping Phase 2"
fi

# ---------------------------------------------------------------------
# Phase 3 – Frontend cleanup (optional, only if you add the script)
# ---------------------------------------------------------------------
echo ""
echo "---------------------------------------------------------------"
echo " PHASE 3 — Frontend cleanup (optional)"
echo "---------------------------------------------------------------"

if [ -x "./DEPLOY_FRONTEND_CLEANUP.sh" ]; then
    ./DEPLOY_FRONTEND_CLEANUP.sh
else
    echo "[i] DEPLOY_FRONTEND_CLEANUP.sh not present – Phase 3 not implemented yet (this is fine)"
fi

echo ""
echo "==============================================================="
echo "✔ FULL PIPELINE RUN COMPLETE"
echo "==============================================================="
echo ""
