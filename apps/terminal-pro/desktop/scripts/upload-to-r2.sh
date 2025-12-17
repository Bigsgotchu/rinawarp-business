#!/usr/bin/env bash
set -euo pipefail

# Expected env:
#   R2_ACCESS_KEY_ID
#   R2_SECRET_ACCESS_KEY
#   R2_ACCOUNT_ID
#   R2_BUCKET_NAME         # e.g. rinawarp-downloads
#   RELEASE_CHANNEL        # stable | canary | nightly (default: stable)

CHANNEL="${RELEASE_CHANNEL:-stable}"

if [[ -z "${R2_ACCESS_KEY_ID:-}" || -z "${R2_SECRET_ACCESS_KEY:-}" || -z "${R2_ACCOUNT_ID:-}" || -z "${R2_BUCKET_NAME:-}" ]]; then
  echo "Missing required R2 env vars"
  exit 1
fi

BUILD_DIR="${1:-dist}"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build dir not found: $BUILD_DIR"
  exit 1
fi

ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

echo "Uploading artifacts from ${BUILD_DIR} to R2 bucket ${R2_BUCKET_NAME}, channel ${CHANNEL}"

# Install awscli if not present (CI-safe)
if ! command -v aws >/dev/null 2>&1; then
  pip install --user awscli
  export PATH="$HOME/.local/bin:$PATH"
fi

export AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}"
export AWS_EC2_METADATA_DISABLED=true

aws s3 sync "${BUILD_DIR}/" "s3://${R2_BUCKET_NAME}/terminal-pro/${CHANNEL}/" \
  --endpoint-url "${ENDPOINT}" \
  --acl public-read \
  --delete

echo "✅ Upload complete"