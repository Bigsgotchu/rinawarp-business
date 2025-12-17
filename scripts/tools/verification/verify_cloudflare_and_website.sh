#!/usr/bin/env bash
set -euo pipefail

# Cloudflare Workers + Website Serverless Verification Script
# This script verifies that the migrated components are functional

echo "====================================================="
echo " RINAWARP CLOUDFlARE + WEBSITE VERIFICATION"
echo " Started: $(date)"
echo "====================================================="
echo

# Step 1 — Verify Cloudflare Worker Builds & Runs
echo "🔍 STEP 1 — VERIFY CLOUDFLARE WORKER"
echo "-------------------------------------"

# Check if we're in the new repo
if [ ! -d "$HOME/Documents/rinawarp-business" ]; then
  echo "❌ New repo directory not found. Please run the migration script first."
  exit 1
fi

cd "$HOME/Documents/rinawarp-business" || exit 1

# 1.1 Validate Wrangler Configuration
echo "1.1 Validating Wrangler Configuration..."
if [ -f "workers/license-verify/wrangler.toml" ]; then
  if command -v wrangler &> /dev/null; then
    if (cd workers/license-verify && wrangler validate); then
      echo "✅ Wrangler configuration is valid"
    else
      echo "❌ Wrangler validation failed"
    fi
  else
    echo "ℹ️  Wrangler CLI not installed. Skipping validation."
    echo "    Install with: npm install -g wrangler"
  fi
else
  echo "❌ Wrangler configuration not found at workers/license-verify/wrangler.toml"
fi

# 1.2 Test Build of Worker
echo
echo "1.2 Testing Worker Build..."
if [ -d "workers/license-verify/src" ] && [ -f "workers/license-verify/wrangler.toml" ]; then
  if command -v wrangler &> /dev/null; then
    if (cd workers/license-verify && wrangler build); then
      echo "✅ Worker build successful"
    else
      echo "❌ Worker build failed"
    fi
  else
    echo "ℹ️  Wrangler CLI not installed. Skipping build test."
  fi
else
  echo "❌ Worker source or configuration missing"
fi

# 1.3 Start Worker Locally for Live Testing (manual step)
echo
echo "1.3 Manual Testing Instructions:"
echo "    To test the worker locally:"
echo "    1. cd workers/license-verify"
echo "    2. wrangler dev"
echo "    3. Visit: http://localhost:8787/verify?license_key=test"
echo "    4. Expected response: {\"valid\": false, \"reason\": \"invalid or test key\"}"

echo
echo "🔍 STEP 2 — VERIFY WEBSITE FUNCTIONS"
echo "-------------------------------------"

# 2.1 Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
  echo "ℹ️  Netlify CLI not found. Installing..."
  if npm install -g netlify-cli; then
    echo "✅ Netlify CLI installed"
  else
    echo "❌ Failed to install Netlify CLI"
  fi
else
  echo "✅ Netlify CLI is already installed"
fi

# 2.2 Check if functions directory exists
if [ -d "services/website/netlify/functions" ]; then
  echo "✅ Website functions directory found"

  # Count functions
  func_count=$(find "services/website/netlify/functions" -name "*.js" -o -name "*.ts" | wc -l)
  echo "📊 Found $func_count serverless function files"

  # 2.3 Test Functions with Netlify Dev
  echo
  echo "2.3 Starting Netlify Dev for Function Testing..."
  echo "    This will automatically boot frontend and functions together."

  if netlify dev --port 8888 --timeout 30 & then
    NETLIFY_PID=$!
    echo "✅ Netlify Dev started (PID: $NETLIFY_PID)"

    # Wait a bit for server to start
    sleep 5

    # Test endpoints
    echo
    echo "Testing function endpoints..."

    # Test create-checkout function
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/.netlify/functions/create-checkout | grep -q "200"; then
      echo "✅ create-checkout function responding"
    else
      echo "❌ create-checkout function not responding"
    fi

    # Test analytics function
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/.netlify/functions/analytics | grep -q "200"; then
      echo "✅ analytics function responding"
    else
      echo "❌ analytics function not responding"
    fi

    # Clean up
    kill $NETLIFY_PID 2>/dev/null || true
  else
    echo "❌ Failed to start Netlify Dev"
  fi
else
  echo "❌ Website functions directory not found"
fi

echo
echo "📋 SUMMARY"
echo "-------------------------------------"
echo "Cloudflare Worker:"
echo "  - Configuration: $(if [ -f "workers/license-verify/wrangler.toml" ]; then echo "✅ Found"; else echo "❌ Missing"; fi)"
echo "  - Source Code: $(if [ -d "workers/license-verify/src" ]; then echo "✅ Found"; else echo "❌ Missing"; fi)"
echo
echo "Website Functions:"
echo "  - Functions Dir: $(if [ -d "services/website/netlify/functions" ]; then echo "✅ Found"; else echo "❌ Missing"; fi)"
echo "  - Netlify CLI: $(if command -v netlify &> /dev/null; then echo "✅ Installed"; else echo "❌ Not installed"; fi)"
echo
echo "====================================================="
echo " VERIFICATION COMPLETE"
echo " Finished: $(date)"
echo "====================================================="

echo
echo "🎯 NEXT PHASE OPTIONS"
echo "-------------------------------------"
echo "Option 1: Phone Manager Migration"
echo "  - Migrates phone management system components"
echo "  - Includes mobile app source, backend services"
echo "  - Phone manager documentation and deployment scripts"
echo
echo "Option 2: Security/Secrets Templates Migration"
echo "  - Migrates security configuration templates"
echo "  - Includes .env templates, encryption keys (safely)"
echo "  - Security documentation and compliance files"
echo
echo "To proceed with a phase, run the corresponding migration script."