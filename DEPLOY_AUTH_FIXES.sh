#!/usr/bin/env bash
# =====================================================================
# RinaWarp – Phase 2: Authentication Database Integration Fixes
# =====================================================================

set -e

echo "==============================================================="
echo "   RINAWARP – PHASE 2: AUTH DATABASE INTEGRATION"
echo "==============================================================="
echo "Date: $(date)"
echo ""

# Resolve project root to the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ---------------------------------------------------------------------
# Helper: create backup before we touch important files
# ---------------------------------------------------------------------
backup_file() {
    local target="$1"

    if [ -f "$target" ]; then
        local backup="${target}.bak.$(date +%Y%m%d-%H%M%S)"
        cp "$target" "$backup"
        echo "[✔] Backup created: $backup"
    else
        echo "[i] No existing file at $target (skipping backup)"
    fi
}

# ---------------------------------------------------------------------
# STEP 1 — Apply D1 (or other) migrations for auth, if configured
# ---------------------------------------------------------------------
echo "---------------------------------------------------------------"
echo " STEP 1 — Database migrations for auth service"
echo "---------------------------------------------------------------"

# If you have a dedicated D1 schema for auth, reference it here.
# Example: auth-d1-schema.sql with D1 migrations.
if [ -f "auth-d1-schema.sql" ]; then
    DB_NAME="${AUTH_D1_DB_NAME:-rina_auth}"
    echo "[1/3] Applying D1 migrations for auth database: ${DB_NAME}"
    wrangler d1 migrations apply "$DB_NAME" || echo "[WARN] D1 migrations command failed (check DB_NAME or wrangler config)"
else
    echo "[i] No auth-d1-schema.sql file found in project root, skipping D1 auth migrations"
fi

# ---------------------------------------------------------------------
# STEP 2 — Run auth service npm migrations (Node-based service)
# ---------------------------------------------------------------------
echo ""
echo "---------------------------------------------------------------"
echo " STEP 2 — Node service migrations for auth"
echo "---------------------------------------------------------------"

if [ -d "services/api" ]; then
    echo "[2/3] Entering services/api ..."
    pushd services/api >/dev/null

    echo "[2/3] Installing dependencies (if needed)..."
    npm install --no-fund --no-audit

    echo "[2/3] Looking for a migration script..."
    # Prefer a specific auth migration script, fallback to generic db:migrate
    if npm run | grep -q "db:migrate:auth"; then
        echo "[→] Running: npm run db:migrate:auth"
        npm run db:migrate:auth
    elif npm run | grep -q "db:migrate"; then
        echo "[→] Running: npm run db:migrate"
        npm run db:migrate
    else
        echo "[WARN] No db:migrate:auth or db:migrate npm script found in services/api"
    fi

    popd >/dev/null
else
    echo "[i] services/api directory not found, skipping Node-based auth migrations"
fi

# ---------------------------------------------------------------------
# STEP 3 — Propagate AUTH_DATABASE_URL to Cloudflare Pages (if set)
# ---------------------------------------------------------------------
echo ""
echo "---------------------------------------------------------------"
echo " STEP 3 — Cloudflare env for auth database"
echo "---------------------------------------------------------------"

if [ -n "${AUTH_DATABASE_URL:-}" ]; then
    echo "[3/3] Updating AUTH_DATABASE_URL in Cloudflare Pages project ..."
    wrangler pages project secret put AUTH_DATABASE_URL --value "$AUTH_DATABASE_URL" 2>/dev/null || echo "[WARN] Could not set AUTH_DATABASE_URL - Cloudflare project may not be configured"
else
    echo "[i] AUTH_DATABASE_URL not set in shell environment, skipping Pages secret update"
fi

echo ""
echo "==============================================================="
echo "✔ PHASE 2 – AUTH DATABASE INTEGRATION COMPLETE"
echo "==============================================================="
echo ""
