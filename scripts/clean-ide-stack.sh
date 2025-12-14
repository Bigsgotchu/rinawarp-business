#!/bin/bash
# Clean IDE Stack Script
# usage:
#   bash scripts/clean-ide-stack.sh [--keep terminal-pro|vscode] [--port 3333] [--dry-run] [--no-ext] [--no-types] [--no-continue]

set -euo pipefail

# ---------- args ----------
KEEP="${1:-}"; PORT="${PORT:-3333}"; DRY=0; DO_EXT=1; DO_TYPES=1; DO_CONTINUE=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep) KEEP="${2:-}"; shift 2 ;;
    --port) PORT="${2:-3333}"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --no-ext) DO_EXT=0; shift ;;
    --no-types) DO_TYPES=0; shift ;;
    --no-continue) DO_CONTINUE=0; shift ;;
    *) shift ;;
  esac
done
[[ -z "${KEEP}" ]] && KEEP="terminal-pro"   # default

# ---------- paths ----------
CODE_BIN="${CODE_BIN:-code}"
CONTINUE_DIR="${CONTINUE_DIR:-$HOME/.continue}"
CONTINUE_CFG="$CONTINUE_DIR/config.yaml"
KILO_MCP="${KILO_MCP:-$HOME/.config/KiloCode/mcp.json}"
APP_DIR="${APP_DIR:-apps/terminal-pro/agent}"

# ---------- helpers ----------
run() { if [[ $DRY -eq 1 ]]; then echo "DRY $*"; else eval "$*"; fi }
exists() { command -v "$1" >/dev/null 2>&1; }

log() { echo "==> $*"; }
warn() { echo "!!  $*" >&2; }

# ---------- VS Code version check ----------
if exists "$CODE_BIN"; then
  VSCODE_VER="$($CODE_BIN --version 2>/dev/null | sed -n '1p' || true)"
  log "VS Code version: ${VSCODE_VER:-unknown}"
  if [[ "$VSCODE_VER" =~ ^([0-9]+)\.([0-9]+)\. ]]; then
    MAJOR="${BASH_REMATCH[1]}"; MINOR="${BASH_REMATCH[2]}"
    # why: Copilot Chat >=0.35.0 needed >=1.107.x in your logs
    if (( MAJOR < 1 || (MAJOR==1 && MINOR < 107) )); then
      warn "VS Code < 1.107.x — consider upgrading if you still hit extension compat issues."
    fi
  fi
else
  warn "'code' not on PATH. Skipping extension management."
  DO_EXT=0
fi

# ---------- free port ----------
log "Kill any process on :$PORT (ignore if none)"
if exists lsof; then
  PIDS="$(lsof -ti tcp:"$PORT" -sTCP:LISTEN || true)"
  [[ -n "$PIDS" ]] && run "kill $PIDS || true"
else
  warn "lsof not found; cannot auto-kill port $PORT"
fi

# ---------- list extensions ----------
if [[ $DO_EXT -eq 1 ]]; then
  log "Installed extensions (before):"
  run "$CODE_BIN --list-extensions | sort || true"
fi

# ---------- extension cleanup/install ----------
if [[ $DO_EXT -eq 1 ]]; then
  log "Remove conflicting AI extensions"
  run "$CODE_BIN --uninstall-extension openai.chatgpt || true"
  run "$CODE_BIN --uninstall-extension github.copilot-chat || true"
  run "$CODE_BIN --uninstall-extension rinawarp.rinawarp-vscode || true"
  [[ "$KEEP" == "vscode" ]] && warn "You chose --keep=vscode; re-installing rinawarp.rinawarp-vscode and removing terminal-pro"
  if [[ "$KEEP" == "terminal-pro" ]]; then
    run "$CODE_BIN --install-extension continue.continue || true"
    run "$CODE_BIN --install-extension rinawarp.rinawarp-terminal-pro || true"
  else
    run "$CODE_BIN --install-extension continue.continue || true"
    run "$CODE_BIN --install-extension rinawarp.rinawarp-vscode || true"
    run "$CODE_BIN --uninstall-extension rinawarp.rinawarp-terminal-pro || true"
  fi
fi

# ---------- fix KiloCode MCP JSON ----------
log "Fix KiloCode MCP JSON (valid empty)"
run "mkdir -p \"$(dirname \"$KILO_MCP\")\""
if [[ -f "$KILO_MCP" ]]; then run "cp \"$KILO_MCP\" \"$KILO_MCP.bak.$(date +%s)\""; fi
if [[ $DRY -eq 1 ]]; then
  echo '{ "servers": [] }' | sed 's/^/DRY write: /'
else
  cat > "$KILO_MCP" <<'JSON'
{ "servers": [] }
JSON
fi

# ---------- Continue config ----------
if [[ $DO_CONTINUE -eq 1 ]]; then
  log "Write Continue config -> http://127.0.0.1:$PORT/v1"
  run "mkdir -p \"$CONTINUE_DIR\""
  if [[ $DRY -eq 1 ]]; then
    echo "version: 3 ... (omitted)" | sed 's/^/DRY write: /'
  else
    cat > "$CONTINUE_CFG" <<YAML
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
YAML
  fi
fi

# ---------- better-sqlite3 types ----------
if [[ $DO_TYPES -eq 1 && -d "$APP_DIR" ]]; then
  log "Ensure @types/better-sqlite3 and fallback declaration"
  pushd "$APP_DIR" >/dev/null
  run "npm i -D @types/better-sqlite3 || true"
  run "mkdir -p types"
  if [[ $DRY -eq 1 ]]; then
    echo "declare module 'better-sqlite3';" | sed 's/^/DRY write: /'
  else
    grep -q "declare module 'better-sqlite3';" types/better-sqlite3.d.ts 2>/dev/null || echo "declare module 'better-sqlite3';" > types/better-sqlite3.d.ts
  fi
  popd >/dev/null
fi

# ---------- smoke tests ----------
log "Smoke checks (if server is up)"
set +e
curl -sf "http://127.0.0.1:${PORT}/health" >/dev/null && echo "health: OK" || echo "health: SKIP/FAIL"
curl -sf "http://127.0.0.1:${PORT}/v1/models" >/dev/null && echo "models: OK" || echo "models: SKIP/FAIL"
set -e

# ---------- after ----------
if [[ $DO_EXT -eq 1 ]]; then
  log "Installed extensions (after):"
  run "$CODE_BIN --list-extensions | sort || true"
fi

cat <<NOTE

✅ Clean stack applied.

Next:
1) Start your server (ensure it prints "Rina Agent running on http://127.0.0.1:<port>").
2) In Continue: pick "Rina (chat)" + set tab autocomplete "Rina (autocomplete)".
3) Keep only ONE RinaWarp extension enabled (you kept: ${KEEP}).
4) If compat errors persist, upgrade VS Code to ≥ 1.107.x.

NOTE
