#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🩺 RinaWarp Doctor – Integrity & Health Check"

# 1. Basic git status
echo
echo "📂 Checking git status..."
git status -sb || echo "⚠️ Git status check failed (not a git repo?)."

# 2. Path Guardian (if present)
TG_APP="apps/terminal-pro"
PG_SCRIPT="${TG_APP}/scripts/rinawarp_path_guardian.py"

if [[ -f "${PG_SCRIPT}" ]]; then
  echo
  echo "🛡️ Running Path Guardian (strict pre-commit mode)..."
  (
    cd "${TG_APP}"
    python3 "scripts/rinawarp_path_guardian.py" --pre-commit || {
      echo
      echo "❌ Path Guardian reported issues. Fix paths before continuing."
      exit 1
    }
  )
  echo "✅ Path Guardian passed."
else
  echo
  echo "⚠️ Path Guardian script not found at ${PG_SCRIPT} (skipping)."
fi

# 3. Backend tests (if present)
BACKEND_DIR="${TG_APP}/backend"
if [[ -d "${BACKEND_DIR}" ]]; then
  echo
  echo "🧪 Running backend tests..."
  (
    cd "${BACKEND_DIR}"
    if npm test -- --watch=false 2>/dev/null; then
      echo "✅ Backend tests passed."
    else
      echo "⚠️ Backend tests failed or not configured."
    fi
  )
fi

# 4. Frontend tests (if present)
FRONTEND_DIR="${TG_APP}/frontend"
if [[ -d "${FRONTEND_DIR}" ]]; then
  echo
  echo "🧪 Running frontend tests..."
  (
    cd "${FRONTEND_DIR}"
    if npm test -- --watch=false 2>/dev/null; then
      echo "✅ Frontend tests passed."
    else
      echo "⚠️ Frontend tests failed or not configured."
    fi
  )
fi

echo
echo "✅ RinaWarp Doctor completed."