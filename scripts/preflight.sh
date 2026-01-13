#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://127.0.0.1:8787}"

echo "== Preflight: health =="
curl -fsS "$BASE/health" >/dev/null
curl -fsS "$BASE/api/health" >/dev/null

echo "== Preflight: login + token =="
TOKEN="$(curl -fsS -X POST "$BASE/api/vscode/login" \
  -H 'content-type: application/json' \
  -d '{"email":"preflight@rinawarp.dev","password":"ok"}' \
  | python -c 'import sys,json; print(json.load(sys.stdin)["token"])')"

echo "== Preflight: timeline SSE connect (short) =="
timeout 2s curl -NfsS "$BASE/api/vscode/timeline/stream?token=$TOKEN&workspaceId=preflight" >/dev/null || true

echo "== Preflight: security regression =="
chmod +x ./local-security-test.sh
BASE="$BASE" ./local-security-test.sh

echo "== Preflight: SSE replay regression =="
chmod +x ./test-sse-replay.sh
BASE="$BASE" ./test-sse-replay.sh

echo "== Preflight: session bundle redaction =="
HAS_OUTPUT="$(curl -fsS "$BASE/api/vscode/session-bundle?token=$TOKEN&workspaceId=preflight&limit=10" \
  | python -c 'import sys,json; d=json.load(sys.stdin); print("output" in (d["events"][0] if d["events"] else {}))')"
if [[ "$HAS_OUTPUT" != "False" ]]; then
  echo "FAIL: output present in redacted bundle"
  exit 1
fi

echo "== Preflight: refresh token =="
NEW_TOKEN="$(curl -fsS -X POST "$BASE/api/vscode/refresh?token=$TOKEN" \
  | python -c 'import sys,json; print(json.load(sys.stdin)["token"])')"
[[ -n "$NEW_TOKEN" ]] || (echo "FAIL: refresh returned empty token" && exit 1)

echo "✅ Preflight OK"
