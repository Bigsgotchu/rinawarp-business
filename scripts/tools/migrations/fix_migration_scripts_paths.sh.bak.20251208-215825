#!/usr/bin/env bash
set -euo pipefail

# =====================================================
# RINAWARP MIGRATION SCRIPTS PATH FIXER (STRICT SAFE MODE)
# -------------------------------------------------------
# - Canonical old repo root:
#     /home/karina/Documents/RinaWarp
# - Scans: scripts/tools/migrations/*.sh
# - Backs up each script before modification
# - Rewrites OLD_ROOT/SRC_ROOT/SOURCE_ROOT to canonical path
# - Logs all actions to audit/migrations/
# =====================================================

CANONICAL_OLD_ROOT="/home/karina/Documents/RinaWarp"
MIGRATION_DIR="scripts/tools/migrations"
AUDIT_DIR="audit/migrations"

mkdir -p "${AUDIT_DIR}"
TS="$(date +%Y%m%d-%H%M%S)"
LOGFILE="${AUDIT_DIR}/fix-migration-scripts-${TS}.log"

echo "======================================================" | tee -a "$LOGFILE"
echo " RINAWARP MIGRATION SCRIPTS PATH FIXER" | tee -a "$LOGFILE"
echo " Started: $(date)" | tee -a "$LOGFILE"
echo " Canonical OLD_ROOT: ${CANONICAL_OLD_ROOT}" | tee -a "$LOGFILE"
echo " Scanning directory: ${MIGRATION_DIR}" | tee -a "$LOGFILE"
echo "======================================================" | tee -a "$LOGFILE"
echo | tee -a "$LOGFILE"

if [[ ! -d "$MIGRATION_DIR" ]]; then
  echo "❌ Migration directory not found: ${MIGRATION_DIR}" | tee -a "$LOGFILE"
  echo "   Make sure you run this from the rinawarp-business repo root." | tee -a "$LOGFILE"
  exit 1
fi

shopt -s nullglob
SCRIPTS=( "${MIGRATION_DIR}"/*.sh )
shopt -u nullglob

if [[ ${#SCRIPTS[@]} -eq 0 ]]; then
  echo "⚠️  No migration scripts found in ${MIGRATION_DIR}/*.sh" | tee -a "$LOGFILE"
  exit 0
fi

for script in "${SCRIPTS[@]}"; do
  echo "----------------------------------------------" | tee -a "$LOGFILE"
  echo "🔧 Processing script: ${script}" | tee -a "$LOGFILE"

  if [[ ! -f "$script" ]]; then
    echo "   ⚠️  Skipping (not a regular file)" | tee -a "$LOGFILE"
    continue
  fi

  # Backup (STRICT SAFE MODE)
  BACKUP="${script}.bak.${TS}"
  if [[ -f "$BACKUP" ]]; then
    echo "   ℹ️  Backup already exists: ${BACKUP}" | tee -a "$LOGFILE"
  else
    cp -n "$script" "$BACKUP"
    echo "   ✅ Backup created: ${BACKUP}" | tee -a "$LOGFILE"
  fi

  # Rewrite OLD_ROOT / SRC_ROOT / SOURCE_ROOT definitions
  # Only touches lines that START with those variable names.
  perl -pi -e '
    s|^OLD_ROOT=.*$|OLD_ROOT="'"${CANONICAL_OLD_ROOT}"'"|;
    s|^SRC_ROOT=.*$|SRC_ROOT="'"${CANONICAL_OLD_ROOT}"'"|;
    s|^SOURCE_ROOT=.*$|SOURCE_ROOT="'"${CANONICAL_OLD_ROOT}"'"|;
  ' "$script"

  echo "   ✅ Updated path variables in: ${script}" | tee -a "$LOGFILE"

done

echo | tee -a "$LOGFILE"
echo "======================================================" | tee -a "$LOGFILE"
echo " FIX COMPLETE" | tee -a "$LOGFILE"
echo " Finished: $(date)" | tee -a "$LOGFILE"
echo " Log file: ${LOGFILE}" | tee -a "$LOGFILE"
echo " Backups:  *.bak.${TS} next to each script" | tee -a "$LOGFILE"
echo "======================================================" | tee -a "$LOGFILE"