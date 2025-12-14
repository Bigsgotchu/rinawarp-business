#!/usr/bin/env bash
set -euo pipefail
WORKER_NAME="${1:-}"
ENVIRONMENT="${2:-staging}"

if [ -z "$WORKER_NAME" ]; then
  echo "Usage: $0 <worker-name> [environment]"
  echo "Available workers: admin-api, license-verify, rina-agent"
  echo "Environments: staging, production"
  exit 1
fi

if [ ! -d "workers/$WORKER_NAME" ]; then
  echo "❌ Worker '$WORKER_NAME' not found"
  exit 1
fi

cd "workers/$WORKER_NAME"
echo "🚀 Deploying $WORKER_NAME to $ENVIRONMENT..."

case "$ENVIRONMENT" in
  staging)
    wrangler deploy --env staging
    ;;
  prod|production)
    wrangler deploy --env production
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "✅ $WORKER_NAME deployed successfully!"
