#!/usr/bin/env bash
set -euo pipefail
ENVIRONMENT="${1:-staging}"

cd apps/website

case "$ENVIRONMENT" in
  staging)
    echo "🌐 Deploying website to staging..."
    npm run build
    wrangler deploy --env staging
    ;;
  prod|production)
    echo "🌐 Deploying website to production..."
    npm run build
    wrangler deploy --env production
    ;;
  *)
    echo "Usage: $0 [staging|production]"
    exit 1
    ;;
esac

echo "✅ Website deployed successfully!"
