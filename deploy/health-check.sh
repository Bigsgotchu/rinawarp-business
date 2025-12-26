#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}

echo "🏥 Running health checks for $ENVIRONMENT"

# Health check URLs (customize for your domains)
case $ENVIRONMENT in
    staging)
        WEBSITE_URL="https://rinawarptech-staging.pages.dev"
        API_URL="https://api-staging.rinawarptech.com"
        ;;
    production)
        WEBSITE_URL="https://rinawarptech.com"
        API_URL="https://api.rinawarptech.com"
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Check website health
echo "🌐 Checking website health..."
WEBSITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL/health" || echo "000")
if [ "$WEBSITE_STATUS" != "200" ]; then
    echo "❌ Website health check failed (HTTP $WEBSITE_STATUS)"
    exit 1
fi

# Check API health
echo "🔧 Checking API health..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" || echo "000")
if [ "$API_STATUS" != "200" ]; then
    echo "❌ API health check failed (HTTP $API_STATUS)"
    exit 1
fi

# Check Cloudflare Workers status
echo "☁️  Checking Cloudflare Workers..."
# Add wrangler tail or status checks here

echo "✅ All health checks passed for $ENVIRONMENT"