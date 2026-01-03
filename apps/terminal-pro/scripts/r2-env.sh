#!/usr/bin/env bash
set -euo pipefail

# Non-secret config (edit if you ever change these)
export R2_BUCKET="${R2_BUCKET:-rinawarp-downloads}"
export R2_ACCOUNT_ID="${R2_ACCOUNT_ID:-ba2f14cefa19dbdc42ff88d772410689}"
export R2_ENDPOINT="${R2_ENDPOINT:-https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com}"

# Which channel to publish to (stable/canary/nightly)
export CHANNEL="${CHANNEL:-stable}"

# Use your already-configured AWS profile
export AWS_PROFILE="${AWS_PROFILE:-r2}"