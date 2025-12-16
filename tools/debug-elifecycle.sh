#!/usr/bin/env bash
# /tools/debug-elifecycle.sh
# Usage:
#   bash /tools/debug-elifecycle.sh <script> [-- <script-args>]
#   Options:
#     --workspace <nameOrPath>   # workspace name or directory
#     --filter <selector>        # pnpm filter (e.g. pkg... or ./packages/foo)
set -euo pipefail

# ---------- arg parse ----------
WS_NAME_OR_PATH=""
PNPM_FILTER=""
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <script> [--workspace <nameOrPath>] [--filter <selector>] [-- <args>]" >&2
  exit 64
fi
SCRIPT_NAME="$1"; shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --workspace) WS_NAME_OR_PATH="$2"; shift 2 ;;
    --filter)    PNPM_FILTER="$2";     shift 2 ;;
    --)          shift; break ;;
    *)           break ;;
  esac
done
ARGS=("$@")

START_TS=$(date +%s)
mkdir -p .debug
LOG=".debug/pm-run-${SCRIPT_NAME}-$(date +%Y%m%dT%H%M%S).log"
trap 'code=$?; dur=$(( $(date +%s)-START_TS )); echo "== Duration: ${dur}s"; echo "Log saved to: $LOG"; exit $code' EXIT

# ---------- env print ----------
echo "== Env ===================================================================" | tee -a "$LOG"
{ command -v node >/dev/null && node -v || echo "node: not found"
  command -v npm  >/dev/null && npm -v  || echo "npm: not found"
  command -v pnpm >/dev/null && pnpm -v || true
  command -v yarn >/dev/null && yarn -v || true
} | tee -a "$LOG"

# ---------- PM detection (packageManager → lockfiles → npm) ----------
PM=""
PKG_MGR_FIELD=""
if [[ -f package.json ]]; then
  if command -v jq >/dev/null 2>&1; then
    PKG_MGR_FIELD="$(jq -r '.packageManager // empty' package.json 2>/dev/null || true)"
  else
    PKG_MGR_FIELD="$(node -e 'try{const p=require("./package.json");if(p.packageManager)console.log(p.packageManager)}catch{}' 2>/dev/null || true)"
  fi
fi
if [[ -n "$PKG_MGR_FIELD" ]]; then case "$PKG_MGR_FIELD" in pnpm@*) PM="pnpm";; yarn@*) PM="yarn";; npm@*) PM="npm";; esac; fi
if [[ -z "$PM" ]]; then
  if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null; then PM="pnpm"
  elif [[ -f yarn.lock   ]] && command -v yarn >/dev/null; then PM="yarn"
  elif [[ -f package-lock.json ]] && command -v npm >/dev/null; then PM="npm"
  elif command -v npm >/dev/null; then PM="npm"; fi
fi
echo "Using: ${PM:-unknown}" | tee -a "$LOG"
[[ -n "$PKG_MGR_FIELD" ]] && echo "packageManager field: $PKG_MGR_FIELD" | tee -a "$LOG"

# ---------- workspace resolve ----------
WS_DIR=""
WS_NAME=""
if [[ -n "$WS_NAME_OR_PATH" ]]; then
  if [[ -d "$WS_NAME_OR_PATH" && -f "$WS_NAME_OR_PATH/package.json" ]]; then
    WS_DIR="$(cd "$WS_NAME_OR_PATH" && pwd)"
    WS_NAME="$(node -e 'try{const p=require(process.argv[1]);console.log(p.name||"") }catch{}' "$WS_DIR/package.json")"
  else
    # find by name via Node (no external deps)
    WS_JSON="$(node - <<'NODE' 2>/dev/null || true
const fs=require('fs'),path=require('path');
const name=process.env.WS_NAME; let root=process.cwd();
function read(p){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return null}}
const rootPkg=read(path.join(root,'package.json'))||{};
let globs=rootPkg.workspaces||[]; if (rootPkg.workspaces && rootPkg.workspaces.packages) globs=rootPkg.workspaces.packages;
function scan(dir, depth=3, out=[]){
  if (depth<0) return out;
  for (const e of fs.readdirSync(dir,{withFileTypes:true})){
    if (e.name.startsWith('.')) continue;
    const p=path.join(dir,e.name);
    if (e.isDirectory()){
      const pj=path.join(p,'package.json');
      if (fs.existsSync(pj)) out.push(p);
      scan(p, depth-1, out);
    }
  } return out;
}
const candidates=[...new Set(scan(root,3))];
for (const d of candidates){
  const pj=path.join(d,'package.json'); const pkg=read(pj)||{};
  if (pkg.name===name){ console.log(JSON.stringify({dir:d,name:pkg.name})); process.exit(0); }
}
process.exit(1);
NODE
)"
    if [[ -n "$WS_JSON" ]]; then
      WS_DIR="$(node -e 'const o=JSON.parse(process.argv[1]);console.log(o.dir)' "$WS_JSON")"
      WS_NAME="$(node -e 'const o=JSON.parse(process.argv[1]);console.log(o.name)' "$WS_JSON")"
    else
      echo "Error: workspace '$WS_NAME_OR_PATH' not found by name or path." | tee -a "$LOG"; exit 2
    fi
  fi
  echo "Workspace dir: ${WS_DIR:-root}  name: ${WS_NAME:-}" | tee -a "$LOG"
fi

# ---------- script existence check ----------
echo "== Ensure script exists ===================================================" | tee -a "$LOG"
PKG_JSON_PATH="${WS_DIR:-.}/package.json"
if ! node -e "try{const p=require('$PKG_JSON_PATH');process.exit(p.scripts && p.scripts['$SCRIPT_NAME']?0:1)}catch{process.exit(1)}"; then
  echo "Error: ${PKG_JSON_PATH} has no scripts['$SCRIPT_NAME']." | tee -a "$LOG"
  echo "Available scripts:" | tee -a "$LOG"
  node -e "try{const p=require('$PKG_JSON_PATH');if(p.scripts){for(const k of Object.keys(p.scripts))console.log(k)}}catch{}" | tee -a "$LOG"
  exit 2
fi

# ---------- install if needed (target: workspace dir or root) ----------
TARGET_DIR="${WS_DIR:-.}"
echo "== Install (if needed) in $TARGET_DIR ====================================" | tee -a "$LOG"
if [[ ! -d "$TARGET_DIR/node_modules" ]]; then
  case "$PM" in
    pnpm)
      (cd "$TARGET_DIR" && (pnpm i --frozen-lockfile 2>&1 || pnpm i)) | tee -a "$LOG"
      ;;
    yarn)
      (cd "$TARGET_DIR" && (yarn install --frozen-lockfile 2>&1 || yarn install)) | tee -a "$LOG"
      ;;
    npm|*)
      if [[ -f "$TARGET_DIR/package-lock.json" ]]; then
        (cd "$TARGET_DIR" && npm ci) | tee -a "$LOG"
      else
        (cd "$TARGET_DIR" && npm install --no-audit --no-fund) | tee -a "$LOG"
      fi
      ;;
  esac
fi

# ---------- run with max verbosity (workspace-aware) ----------
echo "== Run with maximum verbosity ============================================" | tee -a "$LOG"
set +e
CODE=0
case "$PM" in
  pnpm)
    if [[ -n "$PNPM_FILTER" ]]; then
      pnpm --reporter=ndjson -F "$PNPM_FILTER" run "$SCRIPT_NAME" -- "${ARGS[@]}" 2>&1 | tee -a "$LOG"; CODE=${PIPESTATUS[0]}
    elif [[ -n "$WS_DIR" ]]; then
      pnpm --reporter=ndjson -C "$WS_DIR" run "$SCRIPT_NAME" -- "${ARGS[@]}" 2>&1 | tee -a "$LOG"; CODE=${PIPESTATUS[0]}
    else
      pnpm --reporter=ndjson run "$SCRIPT_NAME" -- "${ARGS[@]}" 2>&1 | tee -a "$LOG"; CODE=${PIPESTATUS[0]}
    fi
    ;;
  yarn)
    if [[ -n "$WS_NAME" ]]; then
      yarn workspace "$WS_NAME" run "$SCRIPT_NAME" --verbose -- "${ARGS[@]}" 2>&1 | tee -a "$LOG"; CODE=${PIPESTATUS[0]}
    elif [[ -n "$WS_DIR" ]]; then
      (cd "$WS_DIR" && yarn run "$SCRIPT_NAME" --verbose -- "${ARGS[@]}") 2>&1 | tee -a "$LOG"; CODE=${PIPESTATUS[0]}
    else
      yarn run "$SCRIPT_NAME" --verbose -- "${ARGS[@]}" 2>&1 | tee -a "$LOG"; CODE=${PIPESTATUS[0]}
    fi
    ;;
  npm|*)
    if [[ -n "$WS_DIR" ]]; then
      (cd "$WS_DIR" && npm_config_loglevel=silly npm run "$SCRIPT_NAME" -- "${ARGS[@]}") 2>&1 | tee -a "$LOG"; CODE=${PIPESTATUS[0]}
    else
      npm_config_loglevel=silly npm run "$SCRIPT_NAME" -- "${ARGS[@]}" 2>&1 | tee -a "$LOG"; CODE=${PIPESTATUS[0]}
    fi
    ;;
esac
set -e

echo "== Exit code: $CODE =======================================================" | tee -a "$LOG"
if [[ $CODE -ne 0 ]]; then
  echo "--- Error scan (context) --------------------------------------------------" | tee -a "$LOG"
  if command -v rg >/dev/null 2>&1; then
    rg -n -C3 -e 'ERR!|error |Error:|Failed|TS[0-9]{4}|node-gyp|ELIFECYCLE|eslint|TypeError|SyntaxError' "$LOG" | head -n 120 || true
  else
    grep -n -C3 -E 'ERR!|error |Error:|Failed|TS[0-9]{4}|node-gyp|ELIFECYCLE|eslint|TypeError|SyntaxError' "$LOG" | head -n 120 || true
  fi
  echo "--- npm debug logs (if any) ----------------------------------------------" | tee -a "$LOG"
  NPM_DEBUG=$(ls -1t "${HOME}/.npm/_logs/"*debug*log 2>/dev/null | head -n 1 || true)
  if [[ -n "${NPM_DEBUG}" && -r "${NPM_DEBUG}" ]]; then
    echo "Found: ${NPM_DEBUG}" | tee -a "$LOG"; sed -n '1,120p' "$NPM_DEBUG" | tee -a "$LOG"
  else
    echo "No npm debug log found." | tee -a "$LOG"
  fi
  echo "--- Hints -----------------------------------------------------------------" | tee -a "$LOG"
  if grep -q "tsc" "$LOG"; then echo "TS: try 'npx tsc -p ${WS_DIR:-.}/tsconfig.json --pretty false'." | tee -a "$LOG"; fi
  if grep -qi "eslint" "$LOG"; then echo "ESLint: 'npx eslint ${WS_DIR:-.} --max-warnings=0'." | tee -a "$LOG"; fi
  if grep -qi "node-gyp" "$LOG"; then echo "Native deps: ensure Python 3 & build tools; 'npm rebuild' in ${WS_DIR:-.}." | tee -a "$LOG"; fi
fi
exit "$CODE"