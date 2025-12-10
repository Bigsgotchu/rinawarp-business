#!/usr/bin/env bash
#
# RinaWarp — Cloudflare Pages Secret Binding Utility (Production)
# NON-INTERACTIVE MODE — Uses actual production secrets
#
set -euo pipefail

LOG_DIR="./audit/deploy"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/bind-pages-secrets-production-$(date +%Y%m%d-%H%M%S).log"

# This is a production script, so DRY_RUN is disabled by default
DRY_RUN=0

echo "======================================================"
echo "   RINAWARP — CLOUDFLARE PAGES SECRET BINDING TOOL"
echo "   PRODUCTION MODE — Started: $(date)"
echo "======================================================"
echo ""

PROJECT_NAME="rinawarptech"

# --- Helpers -----------------------------------------------------

log() {
    echo "$1" | tee -a "$LOG_FILE"
}

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        log "❌ ERROR: Missing required command: $1"
        exit 1
    fi
}

# --- Preflight Checks --------------------------------------------

log "🧪 Preflight: Checking environment..."
require_cmd wrangler

log "✔ Wrangler installed"
log ""

# Check Cloudflare auth
if ! wrangler whoami >/dev/null 2>&1; then
    log "❌ You are NOT logged into Cloudflare."
    log "👉 Run: wrangler login"
    exit 1
fi

log "✔ Cloudflare authentication OK"
log ""

# --- Function to bind a secret ----------------------------------

bind_secret() {
    local NAME="$1"
    local VALUE="$2"

    log "🔐 Binding secret: $NAME"

    if [[ "$DRY_RUN" == "1" ]]; then
        log "[DRY RUN] wrangler pages secret put $NAME (value hidden)"
        return
    fi

    printf "%s" "$VALUE" | wrangler pages secret put "$NAME" --project-name "$PROJECT_NAME" 2>&1 | tee -a "$LOG_FILE"
}

# --- Load Secrets from Environment Files -------------------------

log "🔑 Loading secrets from environment files..."

# Load STRIPE_SECRET_KEY from terminal .env file
if [[ -f "./domain/terminal/.env" ]]; then
    STRIPE_SECRET_KEY=$(grep "STRIPE_SECRET_KEY=" "./domain/terminal/.env" | cut -d'=' -f2-)
    log "✔ Loaded STRIPE_SECRET_KEY from terminal/.env"
else
    log "❌ ERROR: Missing terminal/.env file with STRIPE_SECRET_KEY"
    exit 1
fi

# Use production AI keys from organized credentials
OPENAI_API_KEY="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"
GROQ_API_KEY="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"
log "✔ Loaded production AI API keys"

# Auto-minify JSON pricing maps
auto_minify_json() {
    local FILE="$1"
    if [[ -f "$FILE" ]]; then
        cat "$FILE" | tr -d '\n\r\t ' 2>/dev/null
    fi
}

log "📊 Loading pricing maps..."
PRICE_MAP="$(auto_minify_json './config/pricing/price_map.json')"
AMVC_PRICE_MAP="$(auto_minify_json './config/pricing/amvc_price_map.json')"
BUNDLE_PRICE_MAP="$(auto_minify_json './config/pricing/bundle_price_map.json')"

if [[ -z "$PRICE_MAP" || -z "$AMVC_PRICE_MAP" || -z "$BUNDLE_PRICE_MAP" ]]; then
    log "❌ ERROR: Missing or invalid pricing map files"
    exit 1
fi

log "✔ All pricing maps loaded successfully"

# Set analytics password (optional)
ANALYTICS_PASSWORD="rinawarp_analytics_2025"  # Default password for production

echo ""
echo "======================================================"
echo "   BINDING SECRETS TO CLOUDFLARE PAGES"
echo "======================================================"

# Bind all required secrets
bind_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
bind_secret "RINA_PRICE_MAP" "$PRICE_MAP"
bind_secret "RINA_AMVC_PRICE_MAP" "$AMVC_PRICE_MAP"
bind_secret "RINA_BUNDLE_PRICE_MAP" "$BUNDLE_PRICE_MAP"

# Bind analytics password
bind_secret "ANALYTICS_PASSWORD" "$ANALYTICS_PASSWORD"

# Bind AI keys if available
if [[ -n "$OPENAI_API_KEY" ]]; then
    bind_secret "OPENAI_API_KEY" "$OPENAI_API_KEY"
fi

if [[ -n "$GROQ_API_KEY" ]]; then
    bind_secret "GROQ_API_KEY" "$GROQ_API_KEY"
fi

echo ""
log "======================================================"
log " ✅ SECRET BINDING COMPLETE — $(date)"
log " Log saved to: $LOG_FILE"
log "======================================================"
echo ""
log "🎉 Cloudflare Functions are now fully configured!"
log "📍 Endpoints available at:"
log "   - https://rinawarptech.com/api/checkout"
log "   - https://rinawarptech.com/api/analytics"
log ""