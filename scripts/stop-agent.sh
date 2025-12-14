#!/usr/bin/env bash
set -euo pipefail
PID_FILE="${PID_FILE:-/tmp/rina-agent.pid}"
if [ -f "$PID_FILE" ]; then
  kill "$(cat "$PID_FILE")" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "Stopped RinaWarp Agent."
else
  echo "No PID file found ($PID_FILE)."
fi
