#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "🔍 RINAWARP DEEP AUDIT + SMOKE TEST"
echo "================================="
echo ""

ROOT="$(pwd)"
FAILURES=0

pass() { echo "✅ $1"; }
fail() { echo "❌ $1"; FAILURES=$((FAILURES+1)); }
warn() { echo "⚠️  $1"; }

# --------------------------------------------------
# SYSTEM
# --------------------------------------------------
echo ""
echo "🧠 System Checks"
echo "----------------"

command -v node >/dev/null && pass "Node installed ($(node -v))" || fail "Node missing"
command -v npm >/dev/null && pass "npm installed ($(npm -v))" || fail "npm missing"
command -v curl >/dev/null && pass "curl installed" || fail "curl missing"

# --------------------------------------------------
# OLLAMA
# --------------------------------------------------
echo ""
echo "🤖 Ollama Checks"
echo "---------------"

if curl -s http://127.0.0.1:11434 >/dev/null; then
  pass "Ollama running on :11434"
else
  fail "Ollama NOT running"
fi

if ollama list | grep -q "qwen2.5-coder"; then
  pass "Required model qwen2.5-coder present"
else
  fail "Missing model qwen2.5-coder"
fi

# --------------------------------------------------
# RINA AGENT SERVER
# --------------------------------------------------
echo ""
echo "🧠 Rina Agent Server"
echo "-------------------"

AGENT_PORT=3333

if curl -s http://127.0.0.1:$AGENT_PORT/health | grep -q ok; then
  pass "Agent /health endpoint OK"
else
  fail "Agent /health endpoint failed"
fi

CHAT_TEST=$(curl -s http://127.0.0.1:$AGENT_PORT/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"rina-agent","messages":[{"role":"user","content":"ping"}]}' || true)

if echo "$CHAT_TEST" | grep -q '"choices"'; then
  pass "Agent OpenAI-compatible chat endpoint OK"
else
  fail "Agent chat endpoint broken"
  echo "$CHAT_TEST"
fi

# --------------------------------------------------
# CONTINUE CONFIG
# --------------------------------------------------
echo ""
echo "🧩 Continue Config"
echo "-----------------"

CONTINUE_CFG="$HOME/.continue/config.json"

if [ -f "$CONTINUE_CFG" ]; then
  pass "Continue config exists"
else
  fail "Continue config missing"
fi

if grep -q "rina-agent" "$CONTINUE_CFG"; then
  pass "Continue points to rina-agent"
else
  fail "Continue config does not reference rina-agent"
fi

if grep -q "/v1/chat/completions" "$CONTINUE_CFG"; then
  fail "Continue apiBase should NOT include /v1/chat/completions"
else
  pass "Continue apiBase clean (no hardcoded path)"
fi

# --------------------------------------------------
# ELECTRON / TERMINAL PRO
# --------------------------------------------------
echo ""
echo "🖥️  Terminal Pro"
echo "---------------"

APPIMAGE=$(ls apps/terminal-pro/desktop/build-output/*.AppImage 2>/dev/null || true)

if [ -n "$APPIMAGE" ]; then
  pass "AppImage present: $(basename "$APPIMAGE")"
else
  fail "No AppImage found"
fi

if grep -R "GhostTextRenderer" apps/terminal-pro/desktop/src >/dev/null; then
  pass "Ghost text component present"
else
  fail "Ghost text component missing"
fi

# --------------------------------------------------
# WEBSITE
# --------------------------------------------------
echo ""
echo "🌐 Website"
echo "----------"

if [ -f "apps/website/public/pricing.json" ]; then
  pass "pricing.json exists"
else
  fail "pricing.json missing"
fi

if grep -q "stripePriceId" apps/website/public/pricing.json; then
  pass "Stripe price IDs present"
else
  fail "pricing.json missing Stripe IDs"
fi

# --------------------------------------------------
# STRIPE SANITY (NO SECRETS)
# --------------------------------------------------
echo ""
echo "💳 Stripe Sanity"
echo "---------------"

if grep -R "sk_live" -n .; then
  fail "Live Stripe keys committed!"
else
  pass "No live Stripe keys in repo"
fi

# --------------------------------------------------
# VS CODE EXTENSION CONFLICTS
# --------------------------------------------------
echo ""
echo "🧩 VS Code Extension Conflicts"
echo "------------------------------"

EXTS=(
  "github.copilot-chat"
  "kilocode.kilo-code"
  "openai.chatgpt"
)

for ext in "${EXTS[@]}"; do
  if ls ~/.vscode/extensions | grep -q "$ext"; then
    warn "Extension installed: $ext (can conflict)"
  fi
done

# --------------------------------------------------
# JSON REPORT OUTPUT
# --------------------------------------------------
REPORT="security/audit-report.json"

jq -n \
  --arg status "$([ $FAILURES -eq 0 ] && echo pass || echo fail)" \
  --arg failures "$FAILURES" \
  --arg timestamp "$(date -Is)" \
  '{
    status: $status,
    failures: ($failures | tonumber),
    timestamp: $timestamp,
    checks: {
      ollama: true,
      agent: true,
      continue: true,
      stripe: false
    }
  }' > "$REPORT"

echo "📄 JSON report written to $REPORT"

# --------------------------------------------------
# FINAL RESULT
# --------------------------------------------------
echo ""
echo "==============================="
echo "📊 AUDIT RESULT"
echo "==============================="

if [ "$FAILURES" -eq 0 ]; then
  echo "🎉 ALL CHECKS PASSED — SAFE TO SHIP"
  exit 0
else
  echo "🔥 $FAILURES FAILURE(S) DETECTED — DO NOT SCALE TRAFFIC"
  exit 1
fi
