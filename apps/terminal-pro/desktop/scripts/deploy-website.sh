#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$ROOT_DIR/website/rinawarp-website"

# set these once and stop touching them
: "${CF_PAGES_PROJECT:=rinawarptech}"
: "${CF_PAGES_BRANCH:=production}"   # optional label for deployments

cd "$SITE_DIR"

# For static site, no build needed - deploy directly
npx wrangler pages deploy "$SITE_DIR" --project-name "$CF_PAGES_PROJECT" --branch "$CF_PAGES_BRANCH"

echo "✅ Website deployed successfully!"