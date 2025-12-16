#!/bin/bash

# CI/CD Integration Script for RinaWarp Terminal Pro
# Atomic feed promotion & precise cache purge
# Usage: ./scripts/ci-publish-pipeline.sh [VERSION] [UPDATES_ORIGIN]

set -euo pipefail

# Configuration
VERSION=${1:-$(node -p "require('./package.json').version")}
PAGES_PROJECT=${PAGES_PROJECT:-rinawarp-updates}
UPDATES_ORIGIN=${2:-https://updates.rinawarp.dev}
CF_API_TOKEN=${CF_API_TOKEN:-}
CF_ZONE_ID=${CF_ZONE_ID:-}

echo "🚀 Starting CI/CD publish pipeline for RinaWarp Terminal Pro v${VERSION}"
echo "📍 Using origin: ${UPDATES_ORIGIN}"
echo "📦 Pages project: ${PAGES_PROJECT}"

# Check required environment variables
if [[ -z "${CF_API_TOKEN:-}" ]] || [[ -z "${CF_ZONE_ID:-}" ]]; then
    echo "⚠️  Warning: CF_API_TOKEN and CF_ZONE_ID not set. Cache purge will be skipped."
fi

# Step 1: Deploy prepared tree to Pages
echo ""
echo "📤 Step 1: Deploying artifacts to Pages..."
echo "Command: wrangler pages deploy ./dist/updates --project-name ${PAGES_PROJECT}"
wrangler pages deploy ./dist/updates --project-name "${PAGES_PROJECT}"

# Step 2: Guard against the Pages default domain while DNS propagates
echo ""
echo "🔒 Step 2: Running verification guards..."
export UPDATES_ORIGIN="${UPDATES_ORIGIN}"

echo "  🔍 Running pre-publish guard..."
pnpm prepublish:guard

echo "  🔐 Running hash verification..."
pnpm prepublish:hash

echo "  📋 Running feed validation..."
pnpm prepublish:feeds

echo "✅ All verification checks passed!"

# Step 3: Promote feeds (update the two feed files in /stable/)
echo ""
echo "📈 Step 3: Promoting feeds to stable..."
echo "Command: node scripts/prepare-updates-tree.js --promote"
node scripts/prepare-updates-tree.js --promote

# Step 4: Re-deploy lightweight feed change
echo ""
echo "📤 Step 4: Re-deploying feed changes..."
echo "Command: wrangler pages deploy ./dist/updates --project-name ${PAGES_PROJECT}"
wrangler pages deploy ./dist/updates --project-name "${PAGES_PROJECT}"

# Step 5: Purge precisely the two feed paths on Cloudflare
if [[ -n "${CF_API_TOKEN:-}" ]] && [[ -n "${CF_ZONE_ID:-}" ]]; then
    echo ""
    echo "🧹 Step 5: Purging Cloudflare cache for feed files..."
    
    # Convert origin to https:// format for API calls
    CLEAN_ORIGIN="${UPDATES_ORIGIN/https:\/\//https://}"
    
    PURGE_URLS=(
        "${CLEAN_ORIGIN}/stable/latest.yml"
        "${CLEAN_ORIGIN}/stable/latest-mac.yml"
    )
    
    echo "Purging URLs:"
    for url in "${PURGE_URLS[@]}"; do
        echo "  - ${url}"
    done
    
    # Create JSON payload for Cloudflare API
    JSON_PAYLOAD=$(printf '{ "files": [%s] }' "$(printf '"%s"' "${PURGE_URLS[0]}"; printf ', "%s"' "${PURGE_URLS[@]:1}")")
    
    echo "API Request:"
    echo "POST https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache"
    echo "Payload: ${JSON_PAYLOAD}"
    
    # Make the API call
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
        -H "Authorization: Bearer ${CF_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data "${JSON_PAYLOAD}" \
        --silent --show-error --fail
    
    echo "✅ Cache purge completed!"
else
    echo ""
    echo "⚠️  Step 5: Skipped cache purge (missing CF_API_TOKEN or CF_ZONE_ID)"
fi

echo ""
echo "🎉 CI/CD publish pipeline completed successfully!"
echo "✅ Version ${VERSION} is now live at ${UPDATES_ORIGIN}"