#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Documents/rinawarp-business"
LOG_DIR="$ROOT/audit/security"
TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/setup-security-and-secrets-$TS.log"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date --iso-8601=seconds)] $*" | tee -a "$LOG_FILE"
}

create_file_if_missing() {
  local path="$1"
  local content="$2"

  if [ -e "$path" ]; then
    log "SKIP existing file: $path"
  else
    mkdir -p "$(dirname "$path")"
    log "CREATE file: $path"
    printf "%s\n" "$content" > "$path"
  fi
}

append_if_missing() {
  local path="$1"
  local line="$2"

  mkdir -p "$(dirname "$path")"
  touch "$path"

  if grep -Fxq "$line" "$path"; then
    log "SKIP (line already present) in $path: $line"
  else
    log "APPEND to $path: $line"
    printf "%s\n" "$line" >> "$path"
  fi
}

log "=== SECURITY + SECRETS SETUP (STRICT SAFE MODE) ==="
log "ROOT = $ROOT"
log "Log file: $LOG_FILE"

# --- 1) secrets/ directory (gitignored, templates only) ---

SECRETS_DIR="$ROOT/secrets"

mkdir -p "$SECRETS_DIR"

create_file_if_missing "$SECRETS_DIR/.env.production.template" \
"# Production environment template
# Copy to .env.production (DO NOT COMMIT)
APP_ENV=production
RINAWARP_LICENSE_SERVER_URL=
RINAWARP_API_BASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
"

create_file_if_missing "$SECRETS_DIR/.env.development.template" \
"# Development environment template
APP_ENV=development
RINAWARP_LOCAL_API_URL=http://localhost:3000
STRIPE_TEST_SECRET_KEY=
CLOUDflare_TUNNEL_TOKEN=
"

create_file_if_missing "$SECRETS_DIR/stripe.env.template" \
"# Stripe configuration (template)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_TERMINAL_PRO=
STRIPE_PRICE_AI_MUSIC_VIDEO=
"

create_file_if_missing "$SECRETS_DIR/license-server.env.template" \
"# License server configuration (template)
LICENSE_SERVER_DB_URL=
LICENSE_SERVER_JWT_SECRET=
LICENSE_SERVER_ADMIN_EMAIL=
"

create_file_if_missing "$SECRETS_DIR/database.env.template" \
"# Database configuration (template)
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
"

create_file_if_missing "$SECRETS_DIR/cloudflare-worker.secrets.example" \
"# Cloudflare worker secrets (template)
LICENSE_WORKER_API_KEY=
LICENSE_WORKER_STRIPE_WEBHOOK_SECRET=
"

# --- 2) config/templates/ ---

CONFIG_TEMPLATES_DIR="$ROOT/config/templates"

create_file_if_missing "$CONFIG_TEMPLATES_DIR/config.schema.json" \
"{
  \"description\": \"Central environment variable schema for RinaWarp monorepo\",
  \"type\": \"object\",
  \"properties\": {
    \"APP_ENV\": { \"type\": \"string\", \"enum\": [\"development\", \"staging\", \"production\"] },
    \"STRIPE_SECRET_KEY\": { \"type\": \"string\" },
    \"STRIPE_WEBHOOK_SECRET\": { \"type\": \"string\" },
    \"RINAWARP_LICENSE_SERVER_URL\": { \"type\": \"string\" },
    \"RINAWARP_API_BASE_URL\": { \"type\": \"string\" }
  },
  \"required\": [\"APP_ENV\"]
}
"

create_file_if_missing "$CONFIG_TEMPLATES_DIR/config.loader.js" \
"// Central config loader (template)
// Usage: import validateConfig from '../config/templates/config.loader'

const fs = require('fs');
const path = require('path');

function loadEnvFile(fileName) {
  const fullPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(fullPath)) return {};
  const content = fs.readFileSync(fullPath, 'utf8');
  return Object.fromEntries(
    content.split(/\\r?\\n/).filter(Boolean).map(line => {
      const idx = line.indexOf('=');
      if (idx === -1) return [line.trim(), ''];
      const key = line.trim();
      const val = line.slice(idx + 1).trim();
      return [key, val];
    })
  );
}

function loadConfig() {
  const env = process.env.APP_ENV || 'development';
  const base = loadEnvFile('.env');
  const specific = env === 'production'
    ? loadEnvFile('.env.production')
    : loadEnvFile('.env.development');

  return { ...base, ...specific, ...process.env };
}

module.exports = {
  loadConfig,
};
"

create_file_if_missing "$CONFIG_TEMPLATES_DIR/environment-matrix.md" \
"# Environment Matrix (Template)

| Service              | Env File                | Deployment Target         |
|----------------------|-------------------------|---------------------------|
| Website              | .env.production         | Cloudflare Pages / Netlify|
| Terminal Pro Backend | secrets/.env.production | VPS / Docker / Node      |
| AI Music Video       | secrets/.env.production | VPS / Node                |
| License Worker       | cloudflare secrets      | Cloudflare Workers        |
| API Gateway          | secrets/.env.production | AWS Lambda / API Gateway  |
"

# --- 3) docs/security/ ---

SEC_DOCS_DIR="$ROOT/docs/security"

create_file_if_missing "$SEC_DOCS_DIR/SECURITY-POLICY.md" \
"# RinaWarp Security Policy (Template)

- Principle of least privilege for all services
- Separate test and production Stripe keys
- No hard-coded secrets in source code
- All real secrets stored outside of Git in ./secrets or managed secret stores
- Regular key rotation for:
  - Stripe
  - Cloudflare
  - License server
  - Database
"

create_file_if_missing "$SEC_DOCS_DIR/KEY-ROTATION-PROCEDURE.md" \
"# Key Rotation Procedure (Template)

1. Generate new keys in the relevant provider dashboard (Stripe, Cloudflare, etc.)
2. Update the corresponding file in ./secrets/*.env (never commit the real values)
3. Redeploy affected services
4. Invalidate old keys in provider dashboards
5. Record change in CHANGELOG or internal runbook
"

# --- 4) Strengthen .gitignore and .gitattributes ---

GITIGNORE="$ROOT/.gitignore"
GITATTR="$ROOT/.gitattributes"

append_if_missing "$GITIGNORE" "secrets/"
append_if_missing "$GITIGNORE" "*.pem"
append_if_missing "$GITIGNORE" "*.key"
append_if_missing "$GITIGNORE" ".env"
append_if_missing "$GITIGNORE" ".env.*"
append_if_missing "$GITIGNORE" ".DS_Store"
append_if_missing "$GITIGNORE" "*.log"

create_file_if_missing "$GITATTR" \
"# Treat secrets as binary and exclude from diff tools
secrets/* -diff
"

log "=== SECURITY + SECRETS SETUP COMPLETE (STRICT SAFE MODE) ==="
log "Review templates under: $SECRETS_DIR and $CONFIG_TEMPLATES_DIR"
log "Log file: $LOG_FILE"