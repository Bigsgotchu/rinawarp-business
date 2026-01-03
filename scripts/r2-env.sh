#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   source scripts/r2-env.sh [channel]
#
# Reads from env if set, otherwise uses safe defaults.
# Requires: AWS profile "r2" OR AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY in env.

CHANNEL="${1:-${CHANNEL:-stable}}"

: "${R2_BUCKET:=rinawarp-downloads}"
: "${R2_ACCOUNT_ID:=ba2f14cefa19dbdc42ff88d772410689}"

R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

export CHANNEL R2_BUCKET R2_ACCOUNT_ID R2_ENDPOINT