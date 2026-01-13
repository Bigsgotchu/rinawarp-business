#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/set_cf_pages_secrets.sh <owner/repo> <CLOUDFLARE_ACCOUNT_ID> <CLOUDFLARE_API_TOKEN>
#
# Requires: GitHub CLI (`gh`) authenticated.

REPO="${1:?owner/repo required}"
ACCOUNT_ID="${2:?account id required}"
API_TOKEN="${3:?api token required}"

gh secret set CLOUDFLARE_ACCOUNT_ID -R "$REPO" -b"$ACCOUNT_ID"
gh secret set CLOUDFLARE_API_TOKEN  -R "$REPO" -b"$API_TOKEN"

echo "✅ Secrets updated for $REPO"
