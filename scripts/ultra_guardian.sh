#!/usr/bin/env bash
#
# RinaWarp Ultra Guardian Mode
# Global workspace protection for /home/karina/Documents/RinaWarp
#

set -euo pipefail

ROOT="/home/karina/Documents/RinaWarp"

# Forbidden legacy paths (anything here is considered contamination)
FORBIDDEN_PATHS=(
  "/home/karina/Documents/RinaWarp-Terminal-Pro"
)

# Known app roots (for future expansion)
ALLOWED_APP_ROOTS=(
  "$ROOT/apps/terminal-pro"
)

REPORT_FILE="$ROOT/.rinawarp-ultra-report.txt"

# --- Cosmetics ---

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
blue()  { printf '\033[34m%s\033[0m\n' "$*"; }

log()   { blue "[UltraGuardian] $*"; }
warn()  { yellow "[UltraGuardian] $*"; }
err()   { red "[UltraGuardian] $*"; }
ok()    { green "[UltraGuardian] $*"; }

die()   { err "$*"; exit 1; }

# --- Helpers ---

check_root() {
  if [ ! -d "$ROOT" ]; then
    die "Workspace root $ROOT not found. Aborting."
  fi
}

# Quick text scan for forbidden paths
scan_forbidden_refs() {
  : > "$REPORT_FILE"

  local found=0
  for bad in "${FORBIDDEN_PATHS[@]}"; do
    log "Scanning for forbidden reference: $bad"
    # grep for text references, ignoring .git + node_modules to keep it reasonable
    if grep -RIn --exclude-dir=".git" --exclude-dir="node_modules" --binary-files=without-match "$bad" "$ROOT" >> "$REPORT_FILE" 2>/dev/null; then
      found=1
    fi
  done

  if [ "$found" -eq 1 ]; then
    err "Forbidden path references detected!"
    echo
    echo "=== Ultra Guardian Report ==="
    cat "$REPORT_FILE"
    echo
    echo "Fix all occurrences of the old path and replace with:"
    echo "  $ROOT/apps/terminal-pro"
    return 1
  else
    ok "No forbidden path references found."
    return 0
  fi
}

# Call the existing Python Path Guardian in strict/full mode
run_python_guardian() {
  local PG="$ROOT/apps/terminal-pro/scripts/rinawarp_path_guardian.py"

  if [ ! -f "$PG" ]; then
    warn "Python Path Guardian not found at $PG – skipping Python scan."
    return 0
  fi

  log "Running Python Path Guardian in strict mode..."
  (
    cd "$ROOT/apps/terminal-pro"
    python3 "$PG" --full --auto-move-devcontainers
  )
}

# Lightweight pre-commit mode (fast)
run_pre_commit_mode() {
  log "Pre-commit mode: quick scan only."

  # 1) Quick grep for forbidden paths
  if ! scan_forbidden_refs; then
    err "Pre-commit check failed (forbidden paths)."
    return 1
  fi

  # 2) Ask Python guardian to do pre-commit check if available
  local PG="$ROOT/apps/terminal-pro/scripts/rinawarp_path_guardian.py"
  if [ -f "$PG" ]; then
    log "Running Python Path Guardian in pre-commit mode..."
    (
      cd "$ROOT/apps/terminal-pro"
      python3 "$PG" --pre-commit
    )
  else
    warn "Python Path Guardian not found; skipping pre-commit Python check."
  fi

  ok "Pre-commit Ultra Guardian check passed."
}

# Full deep scan for manual use / cron / VSCode task
run_full_scan() {
  log "Running FULL Ultra Guardian scan..."
  check_root

  if ! scan_forbidden_refs; then
    err "Full scan found forbidden paths."
    return 1
  fi

  run_python_guardian || die "Python Path Guardian reported issues."

  ok "Full Ultra Guardian scan completed successfully."
}

# Panic mode – same as full scan, but with extra emphasis/logging
run_panic_clean() {
  log "PANIC CLEAN mode – maximum strictness."
  if ! run_full_scan; then
    err "Panic clean detected issues."
    err "Review report file:"
    echo "  $REPORT_FILE"
    echo
    echo "Then fix any lines referencing the old root and re-run:"
    echo "  $0 --full"
    return 1
  fi
  ok "Panic clean completed; workspace looks clean."
}

usage() {
  cat <<EOF
RinaWarp Ultra Guardian

Usage:
  $0 --pre-commit       # fast checks used by Git hook
  $0 --full             # deep scan (for manual/VSCode/cron)
  $0 --panic-clean      # same as full but labeled as emergency mode
  $0 --help             # show this help

Root:
  $ROOT
EOF
}

# --- Argument Parsing ---

MODE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pre-commit)  MODE="pre-commit"; shift ;;
    --full)        MODE="full"; shift ;;
    --panic-clean) MODE="panic"; shift ;;
    --help|-h)     usage; exit 0 ;;
    *)
      err "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [ -z "$MODE" ]; then
  # Default to full scan if no mode provided
  MODE="full"
fi

case "$MODE" in
  pre-commit)   run_pre_commit_mode ;;
  full)         run_full_scan ;;
  panic)        run_panic_clean ;;
  *)            die "Invalid mode: $MODE" ;;
esac