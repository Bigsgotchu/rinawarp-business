#!/bin/bash
set -e

echo "============================================="
echo "   🧬 RINAWARP FULL FRONTEND PIPELINE"
echo "============================================="

# 0) Pre-flight
if [ ! -f "index.html" ]; then
  echo "❌ index.html not found in current directory."
  echo "   Run this from: /home/karina/Documents/RinaWarp"
  exit 1
fi

if ! command -v netlify >/dev/null 2>&1; then
  echo "❌ Netlify CLI is required. Install with: npm install -g netlify-cli"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is required. Aborting."
  exit 1
fi

# 1) Local validation
echo
echo "1️⃣ Running frontend validator (local + live)..."
./rw-front-validate.sh || true

# 2) Optimization
echo
echo "2️⃣ Running optimizer (building dist/)..."
./rw-optimize.sh

# 3) Netlify deploy (dist/)
echo
echo "3️⃣ Deploying optimized build to Netlify..."
./rw-netlify-switcher.sh

# 4) Post-deploy validation
echo
echo "4️⃣ Re-running frontend validator against live site..."
./rw-front-validate.sh || true

# 5) Visual QA checklist
echo
echo "5️⃣ Printing visual QA checklist..."
./rw-visual-qa.sh

echo
echo "============================================="
echo "  🎉 FULL FRONTEND PIPELINE COMPLETE"
echo "  👉 Next: open https://rinawarptech.com in browser"
echo "     and walk through the QA checklist."
echo "============================================="