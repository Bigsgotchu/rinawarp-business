#!/usr/bin/env bash
set -euo pipefail

NEW_ROOT="$HOME/Documents/rinawarp-business"
OLD_ROOT="/home/karina/Documents/RinaWarp"

LOG_DIR="$NEW_ROOT/audit/migrations"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/migration-backend-safe-$(date +%Y%m%d-%H%M%S).log"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "==============================================="
echo " RINAWARP BACKEND MIGRATION (STRICT SAFE MODE)"
echo " Started: $(date)"
echo " Log: $LOG_FILE"
echo "==============================================="
echo

safe_copy() {
  local src="$1"
  local dest="$2"

  # Skip secrets
  if [[ "$src" =~ \.pem$ || "$src" =~ \.key$ || "$src" =~ \.json$ || "$src" =~ \.env ]]; then
    echo "SKIP (secret detected): $src"
    return 0
  fi

  if [ ! -e "$src" ]; then
    echo "SKIP (missing): $src"
    return 0
  fi

  mkdir -p "$(dirname "$dest")"

  if [ -e "$dest" ]; then
    echo "SKIP (exists): $dest"
  else
    echo "COPY: $src -> $dest"
    cp -vn "$src" "$dest" || true
  fi
}

echo "[1/6] Backend architecture docs -> docs/operations/backend/"
mkdir -p "$NEW_ROOT/docs/operations/backend/"

DOCS=(
  "DATABASE-ARCHITECTURE.md"
  "api_endpoints.txt"
  "TECHNICAL-ISSUES-RESOLUTION.md"
)

for f in "${DOCS[@]}"; do
  safe_copy "$OLD_ROOT/$f" "$NEW_ROOT/docs/operations/backend/$f"
done

echo
echo "[2/6] Load testing infra -> infra/load-testing/"
mkdir -p "$NEW_ROOT/infra/load-testing/"
safe_copy "$OLD_ROOT/load-test.yml" "$NEW_ROOT/infra/load-testing/load-test.yml"
safe_copy "$OLD_ROOT/load-test-agent.js" "$NEW_ROOT/infra/load-testing/load-test-agent.js"

echo
echo "[3/6] Monitoring system -> infra/monitoring/"
mkdir -p "$NEW_ROOT/infra/monitoring/"
if [ -d "$OLD_ROOT/monitoring" ]; then
  cp -rvn "$OLD_ROOT/monitoring/"* "$NEW_ROOT/infra/monitoring/" || true
else
  echo "SKIP: monitoring directory not found"
fi

echo
echo "[4/6] Backend deployment scripts -> scripts/deployment/backend/"
mkdir -p "$NEW_ROOT/scripts/deployment/backend/"

DEPLOY_SCRIPTS=(
  "setup-rinawarp-complete.sh"
  "migrate-rinawarp-projects.sh"
  "setup_stripe_webhook.sh"
  "terminal-pro-cleanup.sh"
  "secure-backup-system.sh"
)

for f in "${DEPLOY_SCRIPTS[@]}"; do
  safe_copy "$OLD_ROOT/$f" "$NEW_ROOT/scripts/deployment/backend/$f"
done

echo
echo "[5/6] Backend test utilities -> scripts/tools/backend/"
mkdir -p "$NEW_ROOT/scripts/tools/backend/"

safe_copy "$OLD_ROOT/comprehensive-test.py" "$NEW_ROOT/scripts/tools/backend/comprehensive-test.py"

echo
echo "[6/6] Searching for additional backend docs (auto-detection)"
FOUND=$(grep -Ril "lambda\|api gateway\|backend\|serverless" "$OLD_ROOT" || true)

for f in $FOUND; do
  safe_copy "$f" "$NEW_ROOT/docs/operations/backend/$(basename "$f")"
done

echo
echo "==============================================="
echo " BACKEND MIGRATION COMPLETED (SAFE MODE)"
echo " Finished: $(date)"
echo " Log saved to: $LOG_FILE"
echo "==============================================="