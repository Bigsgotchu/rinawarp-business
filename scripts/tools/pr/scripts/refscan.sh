#!/usr/bin/env bash
set -euo pipefail
# Fail if references to legacy dirs exist outside archive/
# Requires ripgrep (rg)
PATTERN='src/app/(revenue|marketing|production)'
EXCLUDES="--glob=!archive/** --glob=!node_modules/** --glob=!.git/**"

if rg -n $EXCLUDES "$PATTERN" ; then
  echo "::error::Legacy path references detected. Migrate to archive/."
  exit 1
else
  echo "No legacy path references detected."
fi
