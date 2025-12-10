#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------------------------
# RINAWARP - KV NAMESPACE AUTO-CREATOR (SAFE MODE)
# - Ensures required KV namespaces exist (ANALYTICS_KV, etc.)
# - Creates missing namespaces via Cloudflare API
# - Adds binding blocks to wrangler.toml if missing
# - NO DNS CHANGES, NO DEPLOYS
# -------------------------------------------------------------------

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
LOG_DIR="$ROOT_DIR/audit/kv-fixer-$TIMESTAMP"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/kv-fixer.log"

log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $*" | tee -a "$LOG_FILE"
}

log "=== RINAWARP KV NAMESPACE FIXER (SAFE MODE) ==="
log "ROOT_DIR: $ROOT_DIR"
log "LOG_FILE: $LOG_FILE"

# Required tools
for cmd in curl jq; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log "❌ Missing required command: $cmd"
    exit 1
  fi
done

# Load Cloudflare env from ~/.config/rinawarp/env if present
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

# Expected KV namespaces: binding name + "pretty" title
# You can add more later if needed.
BINDINGS=(      "ANALYTICS_KV" )
TITLES=(        "RINAWARP_ANALYTICS" )

WRANGLER_FILE="$ROOT_DIR/wrangler.toml"
if [[ ! -f "$WRANGLER_FILE" ]]; then
  log "❌ wrangler.toml not found at $WRANGLER_FILE"
  exit 1
fi

cp "$WRANGLER_FILE" "$WRANGLER_FILE.bak.$TIMESTAMP"
log "📦 Backed up wrangler.toml -> $WRANGLER_FILE.bak.$TIMESTAMP"

# Fetch existing KV namespaces
log "🔎 Fetching existing KV namespaces from Cloudflare..."
NAMESPACES_JSON="$LOG_DIR/namespaces.json"

curl -sS \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces" \
  >"$NAMESPACES_JSON"

SUCCESS="$(jq -r '.success // false' "$NAMESPACES_JSON" 2>/dev/null || echo "false")"
if [[ "$SUCCESS" != "true" ]]; then
  log "❌ Failed to list KV namespaces."
  head -c 400 "$NAMESPACES_JSON" | sed 's/$/\n/' | tee -a "$LOG_FILE"
  exit 1
fi

log "✅ Retrieved KV namespace list."

ensure_namespace() {
  local binding="$1"
  local title="$2"

  log ""
  log "── Ensuring KV binding '$binding' (title: '$title')"

  # Check if a namespace with this title already exists
  local existing_id
  existing_id="$(jq -r --arg title "$title" '.result[]? | select(.title == $title) | .id' "$NAMESPACES_JSON" | head -n1 || true)"

  if [[ -n "$existing_id" && "$existing_id" != "null" ]]; then
    log "ℹ️ Namespace with title '$title' already exists (id=$existing_id)"
    KV_ID="$existing_id"
  else
    log "⚠️ Namespace '$title' not found. Creating..."
    CREATE_JSON="$LOG_DIR/create-${binding}.json"
    curl -sS -X POST \
      -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      -H "Content-Type: application/json" \
      "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces" \
      -d "{\"title\":\"${title}\"}" \
      >"$CREATE_JSON"

    local create_success
    create_success="$(jq -r '.success // false' "$CREATE_JSON" 2>/dev/null || echo "false")"
    if [[ "$create_success" != "true" ]]; then
      log "❌ Failed to create KV namespace '$title'"
      head -c 400 "$CREATE_JSON" | sed 's/$/\n/' | tee -a "$LOG_FILE"
      return 1
    fi

    KV_ID="$(jq -r '.result.id' "$CREATE_JSON")"
    log "✅ Created KV namespace '$title' with id=$KV_ID"
  fi

  # Now ensure wrangler.toml has a kv_namespaces binding for this
  if grep -q "binding *= *\"$binding\"" "$WRANGLER_FILE"; then
    log "ℹ️ Binding '$binding' already present in wrangler.toml."
    log "   Not overwriting; please update id manually if needed."
  else
    cat >>"$WRANGLER_FILE" <<EOF

[[kv_namespaces]]
binding = "$binding"
id = "$KV_ID"
preview_id = "$KV_ID"
EOF
    log "✅ Added kv_namespaces block for '$binding' to wrangler.toml"
  fi
}

for i in "${!BINDINGS[@]}"; do
  ensure_namespace "${BINDINGS[$i]}" "${TITLES[$i]}"
done

log ""
log "🎉 DONE: KV namespaces ensured. wrangler.toml backed up and updated where needed."
log "   No DNS or deployment changes were made."