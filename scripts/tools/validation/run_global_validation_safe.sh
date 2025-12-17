#!/usr/bin/env bash
set -euo pipefail

OLD_ROOT="/home/karina/Documents/RinaWarp"
NEW_ROOT="/home/karina/Documents/rinawarp-business"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_ROOT="$NEW_ROOT/audit/global-validation-$TIMESTAMP"

mkdir -p "$REPORT_ROOT"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$REPORT_ROOT/global-validation.log"
}

log "====================================================="
log " RINAWARP GLOBAL SAFE VALIDATION (READ-ONLY)"
log " Started: $(date)"
log " Mode   : STRICT SAFE (NO CHANGES)"
log "====================================================="
log ""
log "OLD_ROOT = $OLD_ROOT"
log "NEW_ROOT = $NEW_ROOT"
log "REPORTS  = $REPORT_ROOT"
log ""

########################################
# SECTION 1 — BASIC STRUCTURE CHECK
########################################
STRUCT_REPORT="$REPORT_ROOT/structure-report.txt"
{
  echo "=== STRUCTURE CHECK ==="
  echo "Time: $(date)"
  echo ""
  echo "Expected top-level dirs in NEW_ROOT:"
  echo "  apps/ backend/ workers/ services/ packages/ docs/ config/ infra/ scripts/ tools/ public-downloads/ archive/"
  echo ""

  cd "$NEW_ROOT"

  for d in apps backend workers services packages docs config infra scripts tools public-downloads archive; do
    if [ -d "$d" ]; then
      echo "[OK]   $d exists"
    else
      echo "[MISS] $d is missing"
    fi
  done
  echo ""
  echo "Short tree (depth 3) of apps/:"
  echo "--------------------------------"
  find apps -maxdepth 3 -type d | sed 's|^|  |'
  echo ""
  echo "Short tree (depth 3) of backend/:"
  echo "--------------------------------"
  if [ -d backend ]; then
    find backend -maxdepth 3 -type d | sed 's|^|  |'
  else
    echo "backend/ missing"
  fi
  echo ""
  echo "Short tree (depth 3) of workers/:"
  echo "--------------------------------"
  if [ -d workers ]; then
    find workers -maxdepth 3 -type d | sed 's|^|  |'
  else
    echo "workers/ missing"
  fi
} > "$STRUCT_REPORT"

log "✓ Structure check written to $STRUCT_REPORT"

########################################
# SECTION 2 — MIGRATION SCRIPTS CHECK
########################################
MIGRATION_REPORT="$REPORT_ROOT/migration-scripts-validation.txt"
{
  echo "=== MIGRATION SCRIPTS VALIDATION ==="
  echo "Time: $(date)"
  echo ""
  echo "Checking scripts in:"
  echo "  $OLD_ROOT/scripts/tools/migrations"
  echo "  $NEW_ROOT/scripts/tools/migrations"
  echo ""

  for ROOT in "$OLD_ROOT" "$NEW_ROOT"; do
    SCRIPTS_DIR="$ROOT/scripts/tools/migrations"
    echo "== Repo: $ROOT =="
    if [ ! -d "$SCRIPTS_DIR" ]; then
      echo "  [WARN] $SCRIPTS_DIR does not exist"
      echo ""
      continue
    fi
    find "$SCRIPTS_DIR" -maxdepth 1 -type f -name "*.sh" | while read -r f; do
      echo "  Script: $f"
      # Check OLD_ROOT usage
      if grep -q "$OLD_ROOT" "$f"; then
        echo "    [OK]   References canonical OLD_ROOT"
      else
        echo "    [WARN] Does NOT reference canonical OLD_ROOT ($OLD_ROOT)"
      fi
      # Check for dangerous commands
      if grep -Eq 'rm -rf|rm -r|mv ' "$f"; then
        echo "    [ALERT] Potential destructive commands detected (rm/mv)"
      else
        echo "    [OK]   No obvious rm -rf / mv operations"
      fi
      # Check copy behaviour
      if grep -Eq 'cp ' "$f"; then
        if grep -Eq 'cp -n|cp -rn' "$f"; then
          echo "    [OK]   Uses safe cp (-n / -rn)"
        else
          echo "    [WARN] cp used without -n (might overwrite)"
        fi
      fi
      echo ""
    done
    echo ""
  done
} > "$MIGRATION_REPORT"

log "✓ Migration scripts validation written to $MIGRATION_REPORT"

########################################
# SECTION 3 — GIT + UNTRACKED STATUS
########################################
GIT_REPORT="$REPORT_ROOT/git-status.txt"
{
  echo "=== GIT STATUS (NEW_ROOT) ==="
  echo "Time: $(date)"
  echo ""
  cd "$NEW_ROOT"
  git status
  echo ""
  echo "=== SHORT STATUS ==="
  git status --short
} > "$GIT_REPORT"

log "✓ Git status written to $GIT_REPORT"

########################################
# SECTION 4 — WORKERS (CLOUDFLARE) CHECK
########################################
WORKERS_REPORT="$REPORT_ROOT/cloudflare-workers-report.txt"
{
  echo "=== CLOUDFLARE WORKERS VALIDATION (READ-ONLY) ==="
  echo "Time: $(date)"
  echo ""
  if ! command -v wrangler >/dev/null 2>&1; then
    echo "[WARN] wrangler CLI not found in PATH."
    echo "       Please install or ensure it is available to fully validate workers."
  else
    echo "[OK] wrangler found: $(command -v wrangler)"
    echo "Wrangler version:"
    wrangler --version || true
    echo ""

    WORKER_DIR="$NEW_ROOT/workers/license-verify"
    if [ -d "$WORKER_DIR" ]; then
      echo "[OK] Found worker directory: $WORKER_DIR"
      cd "$WORKER_DIR"
      echo ""
      echo "-> Running wrangler whoami (non-destructive)..."
      wrangler whoami || echo "[WARN] wrangler whoami failed (auth or config issue)."
      echo ""
      echo "-> Running wrangler deploy --dry-run (non-destructive)..."
      wrangler deploy --dry-run || echo "[WARN] wrangler deploy --dry-run reported issues."
      echo ""
      echo "Manual test reminder:"
      echo "  cd $WORKER_DIR"
      echo "  wrangler dev"
      echo "  Visit: http://localhost:8787/verify?license_key=test"
    else
      echo "[MISS] Worker directory $WORKER_DIR not found"
    fi
  fi
} > "$WORKERS_REPORT"

log "✓ Cloudflare workers validation written to $WORKERS_REPORT"

########################################
# SECTION 5 — WEBSITE FUNCTIONS / NETLIFY
########################################
NETLIFY_REPORT="$REPORT_ROOT/netlify-functions-report.txt"
{
  echo "=== NETLIFY FUNCTIONS VALIDATION (READ-ONLY) ==="
  echo "Time: $(date)"
  echo ""
  if ! command -v netlify >/dev/null 2>&1; then
    echo "[WARN] netlify CLI not found in PATH."
    echo "       Install with: npm install -g netlify-cli"
  else
    echo "[OK] netlify CLI found: $(command -v netlify)"
    netlify --version || true
    echo ""
  fi

  cd "$NEW_ROOT"

  FUNC_DIRS=(
    "services/website/src/functions"
    "apps/website/netlify/functions"
    "services/ai-music-video/netlify"
  )

  for dir in "${FUNC_DIRS[@]}"; do
    echo "Checking functions dir: $dir"
    if [ -d "$dir" ]; then
      COUNT_TS=$(find "$dir" -type f \( -name "*.ts" -o -name "*.js" \) | wc -l || echo 0)
      echo "  [OK] Exists. Source files: $COUNT_TS"
      echo "  Sample listing:"
      find "$dir" -maxdepth 2 -type f \( -name "*.ts" -o -name "*.js" \) | head -n 10 | sed 's|^|    |'
      echo ""
    else
      echo "  [MISS] Directory does not exist."
      echo ""
    fi
  done

  if command -v netlify >/dev/null 2>&1; then
    echo "-> Suggested manual function test:"
    echo "  cd $NEW_ROOT/apps/website"
    echo "  netlify dev"
    echo "  Then visit:"
    echo "    http://localhost:8888/.netlify/functions/create-checkout"
    echo "    http://localhost:8888/.netlify/functions/analytics"
  fi
} > "$NETLIFY_REPORT"

log "✓ Netlify / functions validation written to $NETLIFY_REPORT"

########################################
# SECTION 6 — SECURITY / SECRETS SCAN
########################################
SECURITY_REPORT="$REPORT_ROOT/security-scan.txt"
{
  echo "=== SECURITY / SECRETS SCAN (NEW_ROOT) ==="
  echo "Time: $(date)"
  echo ""
  cd "$NEW_ROOT"

  echo "1) Searching for potentially sensitive files..."
  echo ""

  # Exclude the old repo path just in case, focus on NEW_ROOT
  find . \
    -path "./.git" -prune -o \
    -path "./node_modules" -prune -o \
    -path "./target" -prune -o \
    -type f \( \
      -name "*.pem" -o \
      -name "*.p12" -o \
      -name ".env" -o \
      -name ".env.*" -o \
      -name "*firebase*adminsdk*.json" -o \
      -name "*service-account*.json" -o \
      -name "id_rsa" -o \
      -name "id_ed25519" \
    \) -print | sed 's|^|  [POTENTIAL SECRET] |'

  echo ""
  echo "2) Checking secrets/ directory policy..."
  echo ""
  if [ -d "secrets" ]; then
    echo "[OK] secrets/ exists. Listing non-template files:"
    find secrets -type f ! -name "*.template" ! -name "*.example" ! -name "*.md" | sed 's|^|  [NON-TEMPLATE] |'
  else
    echo "[WARN] secrets/ directory missing. Consider adding templates (no real keys)."
  fi

  echo ""
  echo "3) Quick grep for hardcoded secrets (very rough heuristic)..."
  echo ""
  grep -RIn --exclude-dir={.git,node_modules,target} \
    -E "API_KEY|SECRET_KEY|STRIPE_SECRET|STRIPE_KEY|FIREBASE_API_KEY|PRIVATE_KEY" \
    . 2>/dev/null | sed 's|^|  [HINT] |' || echo "  No obvious matches found."
} > "$SECURITY_REPORT"

log "✓ Security scan written to $SECURITY_REPORT"

########################################
# SECTION 7 — MONOREPO HEALTH SUMMARY
########################################
SUMMARY_REPORT="$REPORT_ROOT/monorepo-health-summary.txt"
{
  echo "=== MONOREPO HEALTH SUMMARY ==="
  echo "Time: $(date)"
  echo ""
  echo "Reports generated under:"
  echo "  $REPORT_ROOT"
  echo ""
  echo "Included reports:"
  ls -1 "$REPORT_ROOT"
  echo ""
  echo "Manual Follow-ups Suggested:"
  echo "  1) Run Cloudflare worker locally:"
  echo "       cd $NEW_ROOT/workers/license-verify"
  echo "       wrangler dev"
  echo ""
  echo "  2) Run Netlify dev for website + functions:"
  echo "       cd $NEW_ROOT/apps/website"
  echo "       netlify dev"
  echo ""
  echo "  3) Run AI Music Video dev build:"
  echo "       cd $NEW_ROOT/apps/ai-music-video"
  echo "       npm install"
  echo "       npm run dev   # or npm run build"
  echo ""
  echo "  4) Check Phone Manager app (future phase):"
  echo "       cd $NEW_ROOT/apps/phone-manager"
  echo "       # run the existing dev/build commands"
} > "$SUMMARY_REPORT"

log "✓ Monorepo health summary written to $SUMMARY_REPORT"

log ""
log "====================================================="
log " GLOBAL VALIDATION COMPLETE (STRICT SAFE MODE)"
log " Reports: $REPORT_ROOT"
log " Finished: $(date)"
log "====================================================="