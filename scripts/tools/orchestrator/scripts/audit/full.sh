#!/usr/bin/env bash
set -euo pipefail
echo "=== audit:full ==="
if [ -x scripts/audit/deps.sh ]; then bash scripts/audit/deps.sh; else echo "deps.sh missing (ok for starter)"; fi
echo "=== audit complete (starter) ==="
