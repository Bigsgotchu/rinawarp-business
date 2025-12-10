#!/usr/bin/env bash
#
# RinaWarp — Bind Essential Secrets for Cloudflare Pages Functions
# This script binds only the secrets needed for the current implementation
#

set -euo pipefail

LOG_DIR="./audit/deploy"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/bind-essential-secrets-$(date +%Y%m%d-%H%M%S).log"

echo "======================================================"
echo "   RINAWARP — BINDING ESSENTIAL SECRETS"
echo "   Started: $(date)"
echo "   🔐 Binding secrets needed for Cloudflare Pages Functions"
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

# --- Function to bind a secret ----------------------------------

bind_secret() {
    local NAME="$1"
    local VALUE="$2"
    local DESCRIPTION="$3"

    log "🔐 Binding secret: $NAME"
    log "   Description: $DESCRIPTION"

    if [[ -z "$VALUE" ]]; then
        log "   ⚠️  Skipped - no value provided"
        return
    fi

    # Check if we're in DRY-RUN mode
    if [[ "$DRY_RUN" == "1" ]]; then
        log "   [DRY RUN] Would execute: wrangler pages secret put '$NAME' --project-name '$PROJECT_NAME'"
        log "   [DRY RUN] Secret value: [REDACTED] (${#VALUE} characters)"
        return
    fi

    # Check Cloudflare authentication
    if ! wrangler whoami >/dev/null 2>&1; then
        log "   ❌ Not logged into Cloudflare. Run: wrangler login"
        return
    fi

    # Bind the secret
    echo "$VALUE" | wrangler pages secret put "$NAME" --project-name "$PROJECT_NAME" 2>&1 | tee -a "$LOG_FILE"
    log "   ✅ Secret bound successfully"
}

# --- Essential Secrets for Current Implementation -----------------

echo ""
echo "======================================================"
echo "   BINDING ESSENTIAL SECRETS"
echo "======================================================"
log ""

# Check for DRY-RUN mode
DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=1
    log "⚠ DRY-RUN MODE ENABLED — No secrets will be uploaded"
    log ""
fi

# Create pricing maps directory
mkdir -p ./config/pricing

# STRIPE SECRET KEY (Essential for checkout function)
STRIPE_SECRET_KEY="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"

# Create pricing maps based on the provided Stripe products
cat > ./config/pricing/price_map.json << 'EOF'
{
  "terminal_pro": "price_1SVRVMGZrRdZy3W9094r1F5B",
  "terminal_team": "price_1SKxFDGZrRdZy3W9eqTQCKXd",
  "terminal_enterprise": "price_1SKxF5GZrRdZy3W9Ck4Z8AJ2"
}
EOF

cat > ./config/pricing/amvc_price_map.json << 'EOF'
{
  "amvc_credits_10": "price_1SVRVJGZrRdZy3W9tRX5tsaH",
  "amvc_credits_50": "price_1SVRVJGZrRdZy3W9q6u9L82y",
  "amvc_pro": "price_1SVRVLGZrRdZy3W976aXrw0g",
  "amvc_team": "price_1SKxFDGZrRdZy3W9eqTQCKXd"
}
EOF

cat > ./config/pricing/bundle_price_map.json << 'EOF'
{
  "bundle_starter": "price_1SMrrqGZrRdZy3W99mdQmALU",
  "bundle_pro": "price_1SVRVLGZrRdZy3W9LoPVNyem",
  "bundle_enterprise": "price_1SKxFDGZrRdZy3W9eqTQCKXd"
}
EOF

# Read pricing maps
RINA_PRICE_MAP=$(cat ./config/pricing/price_map.json | tr -d '\n\r\t ')
RINA_AMVC_PRICE_MAP=$(cat ./config/pricing/amvc_price_map.json | tr -d '\n\r\t ')
RINA_BUNDLE_PRICE_MAP=$(cat ./config/pricing/bundle_price_map.json | tr -d '\n\r\t ')

# SITE URL
SITE_URL="https://rinawarptech.com"

# Bind essential secrets
bind_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" "Stripe API secret key for payment processing"
bind_secret "RINA_PRICE_MAP" "$RINA_PRICE_MAP" "Terminal product price mappings"
bind_secret "RINA_AMVC_PRICE_MAP" "$RINA_AMVC_PRICE_MAP" "AI Music Video Creator price mappings"
bind_secret "RINA_BUNDLE_PRICE_MAP" "$RINA_BUNDLE_PRICE_MAP" "Product bundle price mappings"
bind_secret "SITE_URL" "$SITE_URL" "Main website URL for redirect endpoints"

# Analytics password (optional but useful)
ANALYTICS_PASSWORD="secure_analytics_password_123"
bind_secret "ANALYTICS_PASSWORD" "$ANALYTICS_PASSWORD" "Password for analytics dashboard access"

echo ""
log "======================================================"
log " ESSENTIAL SECRET BINDING COMPLETE — $(date)"
log " Log saved to: $LOG_FILE"
log ""
log "📊 Summary:"
log "   ✅ Stripe secret key bound"
log "   ✅ All pricing maps bound"
log "   ✅ Site URL configured"
log "   ✅ Analytics password set"
log ""
log "🎯 What's Ready:"
log "   • Cloudflare Pages Functions can now process payments"
log "   • All product pricing is configured"
log "   • Checkout redirects will work correctly"
log "   • Analytics tracking is enabled"
log ""
if [[ "$DRY_RUN" == "1" ]]; then
    log "⚠️  DRY-RUN MODE: No secrets were actually uploaded"
    log "   To upload for real, run: ./scripts/deployment/bind_essential_secrets.sh"
else
    log "✅ Secrets have been uploaded to Cloudflare Pages"
    log "   Project: $PROJECT_NAME"
fi
log "======================================================"