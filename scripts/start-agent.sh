#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-apps/terminal-pro/agent}"
CONTINUE_CFG="${CONTINUE_CFG:-$HOME/.continue/config.yaml}"
KILO_DIR="${KILO_DIR:-$HOME/.config/KiloCode}"
KILO_MCP="$KILO_DIR/mcp.json"
PID_FILE="${PID_FILE:-/tmp/rina-agent.pid}"
DEFAULT_PORT="${PORT:-3333}"

pick_port() {
  local p="${1:-3333}"
  while (ss -ltn "sport = :$p" 2>/dev/null | grep -q ":$p") || \
        (command -v lsof >/dev/null 2>&1 && lsof -ti tcp:"$p" -sTCP:LISTEN >/dev/null 2>&1); do
    p=$((p+1))
  done
  echo "$p"
}

start_agent() {
  [ -d "$APP_DIR" ] || { echo "App folder not found: $APP_DIR"; exit 1; }
  cd "$APP_DIR"

  PORT="$(pick_port "${PORT:-$DEFAULT_PORT}")"
  export PORT
  echo "==> Using PORT=$PORT"

  echo "==> Installing deps (may noop)…"
  if [ -f package-lock.json ]; then npm ci || npm install; else npm install; fi

  npm i -D @types/better-sqlite3 >/dev/null 2>&1 || true
  mkdir -p types
  grep -q "declare module 'better-sqlite3';" types/better-sqlite3.d.ts 2>/dev/null || \
    echo "declare module 'better-sqlite3';" > types/better-sqlite3.d.ts

  echo "==> Building (if tsconfig present)…"
  [ -f tsconfig.json ] && npm run build || true

  echo "==> Starting server…"
  # stop previous
  if [ -f "$PID_FILE" ]; then
    OLD_PID="$(cat "$PID_FILE" || true)"
    [ -n "${OLD_PID:-}" ] && kill "$OLD_PID" >/dev/null 2>&1 || true
    rm -f "$PID_FILE"
  fi

  # prefer TSX until build is fully ESM-safe
  if [ -f src/server.ts ]; then
    npx tsx src/server.ts &
  elif [ -f dist/server.js ] && [ -f dist/app.js ]; then
    node dist/server.js &
  else
    echo "No suitable entry found (src/server.ts OR dist/server.js + dist/app.js)."
    exit 1
  fi

  AGENT_PID=$!
  echo "$AGENT_PID" > "$PID_FILE"

  echo "==> Health check:"
  for i in {1..30}; do
    curl -sf "http://127.0.0.1:$PORT/health" >/dev/null && { echo "health OK"; break; }
    sleep 0.3
  done
  curl -sf "http://127.0.0.1:$PORT/health" >/dev/null || { echo "health check FAILED"; exit 1; }

  echo "$PORT"
}

update_continue() {
  local PORT="$1"
  echo "==> Updating Continue config → http://127.0.0.1:${PORT}/v1"
  mkdir -p "$(dirname "$CONTINUE_CFG")"
  if [ ! -f "$CONTINUE_CFG" ]; then
    cat > "$CONTINUE_CFG" <<EOF
version: 3
models:
  - title: Rina (chat)
    model: rina-agent
    provider: openai
    apiBase: http://127.0.0.1:${PORT}/v1
    apiKey: dummy
    streaming: true
  - title: Rina (autocomplete)
    model: rina-agent
    provider: openai
    apiBase: http://127.0.0.1:${PORT}/v1
    apiKey: dummy
    contextLength: 32768
tabAutocompleteModel: Rina (autocomplete)
experimental:
  enableTools: false
EOF
  else
    sed -i "s#apiBase: http://127\.0\.0\.1:[0-9]\+/v1#apiBase: http://127.0.0.1:${PORT}/v1#g" "$CONTINUE_CFG"
  fi
}

update_kilo_and_clear_cache() {
  echo "==> Fixing Kilo MCP JSON & clearing cache"
  mkdir -p "$KILO_DIR"
  echo '{ "servers": [] }' > "$KILO_MCP"
  rm -rf "$KILO_DIR/Cache" 2>/dev/null || true
}

verify_endpoints() {
  local PORT="$1"
  echo "==> Verify endpoints"
  curl -sf "http://127.0.0.1:${PORT}/v1/models" >/dev/null && echo "models OK" || { echo "models FAIL"; return 1; }
}

reload_vscode() {
  if command -v code >/dev/null 2>&1; then
    echo "==> Reloading VS Code window"
    code --command workbench.action.reloadWindow || true
  fi
}

rerun_checks() {
  echo "==> Re-run quick checks"
  [ -x "./verify-stack.sh" ] && ./verify-stack.sh || true
}

main() {
  PORT="$(start_agent)"
  update_continue "$PORT"
  update_kilo_and_clear_cache
  verify_endpoints "$PORT"
  reload_vscode
  rerun_checks
  echo -e "\n✅ Done — agent running on :$PORT\n"
}
main "$@"
