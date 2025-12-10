#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------------------------
# RINAWARP - CLOUDFLARE ENVIRONMENT FIXER (SAFE MODE)
# - Validates CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
# - Stores them in ~/.config/rinawarp/env
# - Optionally syncs into .env.test / .env.ci (without committing)
# - NO DNS CHANGES, NO DEPLOYMENTS
# -------------------------------------------------------------------

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
LOG_DIR="$ROOT_DIR/audit/fix-cloudflare-env-$TIMESTAMP"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/fix-cloudflare-env.log"

log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $*" | tee -a "$LOG_FILE"
}

log "=== RINAWARP CLOUDFLARE ENV FIXER (SAFE MODE) ==="
log "ROOT_DIR: $ROOT_DIR"
log "LOG_FILE: $LOG_FILE"

# -------------------------------------------------------------------
# 1. REQUIRE wrangler + curl + jq
# -------------------------------------------------------------------
for cmd in wrangler curl jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log "❌ Missing required command: $cmd"
    log "   Please install '$cmd' and re-run this script."
    exit 1
  fi
done
log "✅ Required tools found (wrangler, curl, jq)"

# -------------------------------------------------------------------
# 2. LOAD EXISTING CONFIG (IF ANY)
# -------------------------------------------------------------------
RINAWARP_CFG_DIR="${HOME}/.config/rinawarp"
RINAWARP_ENV_FILE="${RINAWARP_CFG_DIR}/env"

mkdir -p "$RINAWARP_CFG_DIR"

if [[ -f "$RINAWARP_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$RINAWARP_ENV_FILE"
  log "ℹ️ Loaded existing config from $RINAWARP_ENV_FILE"
fi

CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"

# -------------------------------------------------------------------
# 3. PROMPT FOR MISSING VALUES (WITHOUT LOGGING SECRETS)
# -------------------------------------------------------------------
if [[ -z "${CLOUDFLARE_API_TOKEN}" ]]; then
  echo -n "Enter your CLOUDFLARE_API_TOKEN (will NOT be logged): "
  read -rs CLOUDFLARE_API_TOKEN
  echo ""
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID}" ]]; then
  echo -n "Enter your CLOUDFLARE_ACCOUNT_ID (will NOT be logged): "
  read -r CLOUDFLARE_ACCOUNT_ID
fi

log "🔐 CLOUDFLARE_API_TOKEN length: ${#CLOUDFLARE_API_TOKEN}"
log "🔐 CLOUDFLARE_ACCOUNT_ID: ${CLOUDFLARE_ACCOUNT_ID}"

# -------------------------------------------------------------------
# 4. VALIDATE TOKEN + ACCOUNT WITH CLOUDFLARE API
# -------------------------------------------------------------------
log "🔎 Validating token/account with Cloudflare API..."
CF_RESP_JSON="$LOG_DIR/cloudflare-token-check.json"

set +e
curl -sS \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts?per_page=1" \
  >"$CF_RESP_JSON" 2>>"$LOG_FILE"
CURL_EXIT=$?
set -e

if [[ $CURL_EXIT -ne 0 ]]; then
  log "❌ Failed to call Cloudflare API (curl exit: $CURL_EXIT)"
  log "   Check your network and credentials."
  exit 1
fi

SUCCESS="$(jq -r '.success // false' "$CF_RESP_JSON" 2>/dev/null || echo "false")"

if [[ "$SUCCESS" != "true" ]]; then
  log "❌ Cloudflare API validation failed."
  log "   Response snippet:"
  head -c 400 "$CF_RESP_JSON" | sed 's/$/\n/' | tee -a "$LOG_FILE"
  exit 1
fi

log "✅ Cloudflare API token and account ID are valid."

# -------------------------------------------------------------------
# 5. WRITE TO ~/.config/rinawarp/env (SAFE)
# -------------------------------------------------------------------
if [[ -f "$RINAWARP_ENV_FILE" ]]; then
  cp "$RINAWARP_ENV_FILE" "$RINAWARP_ENV_FILE.bak.$TIMESTAMP"
  log "📦 Backed up existing config to $RINAWARP_ENV_FILE.bak.$TIMESTAMP"
fi

cat >"$RINAWARP_ENV_FILE" <<EOF
# RINAWARP CLOUDFLARE CONFIG (generated $TIMESTAMP)
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}"
EOF

chmod 600 "$RINAWARP_ENV_FILE"
log "✅ Saved Cloudflare env to $RINAWARP_ENV_FILE (chmod 600)"

# -------------------------------------------------------------------
# 6. OPTIONAL: SYNC INTO .env.test / .env.ci (IF THEY EXIST)
# -------------------------------------------------------------------
sync_env_file() {
  local env_file="$1"
  [[ -f "$env_file" ]] || return 0

  local backup="${env_file}.bak.${TIMESTAMP}"
  cp "$env_file" "$backup"
  log "📦 Backup created: $backup"

  # Remove existing lines (if any)
  sed -i '/^CLOUDFLARE_API_TOKEN=/d' "$env_file"
  sed -i '/^CLOUDFLARE_ACCOUNT_ID=/d' "$env_file"

  {
    echo ""
    echo "# Added by fix_cloudflare_env.sh on $TIMESTAMP"
    echo "CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}"
    echo "CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}"
  } >>"$env_file"

  log "✅ Synced Cloudflare env into $env_file"
}

sync_env_file "$ROOT_DIR/.env.test"
sync_env_file "$ROOT_DIR/.env.ci"

log "🎉 DONE: Cloudflare env is now configured and reusable."
log "   Next time, you can just: source \"$RINAWARP_ENV_FILE\" before running tools."