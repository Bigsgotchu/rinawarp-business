#!/usr/bin/env bash
set -euo pipefail
WORKER_NAME="${1:-}"
if [ -z "$WORKER_NAME" ]; then
  echo "Usage: $0 <worker-name>"
  echo "Available workers: admin-api, license-verify, rina-agent"
  exit 1
fi

if [ ! -d "workers/$WORKER_NAME" ]; then
  echo "❌ Worker '$WORKER_NAME' not found in workers/"
  exit 1
fi

echo "☁️  Building worker: $WORKER_NAME"
cd "workers/$WORKER_NAME"
npm ci
echo "✅ Worker '$WORKER_NAME' ready for deployment!"
