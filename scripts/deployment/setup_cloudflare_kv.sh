#!/bin/bash
# ============================================================
#  RINAWARP BUSINESS — Cloudflare KV Setup Script
#  Automates KV namespace creation and binding
# ============================================================

set -euo pipefail

# Configuration
KV_NAMESPACE="RINAWARP_ANALYTICS"
PAGES_PROJECT="rinawarptech"
BINDING_NAME="ANALYTICS_KV"

# Check for required environment variables
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo "❌ ERROR: Missing Cloudflare API token"
    echo "Please set CLOUDFLARE_API_TOKEN environment variable"
    echo "Example:"
    echo "  export CLOUDFLARE_API_TOKEN='your_token_here'"
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Configure wrangler to use API token
echo "🔑 Configuring Wrangler with API token..."
mkdir -p ~/.config/.wrangler
cat > ~/.config/.wrangler/config.toml << EOF
[Login]
api_token = "$CLOUDFLARE_API_TOKEN"
EOF

# Create KV namespace using API directly
echo "📦 Creating KV namespace: $KV_NAMESPACE"
namespace_response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/storage/kv/namespaces" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"title\":\"$KV_NAMESPACE\"}")

namespace_id=$(echo "$namespace_response" | jq -r '.result.id')

if [ -z "$namespace_id" ] || [ "$namespace_id" == "null" ]; then
    echo "❌ Failed to create KV namespace"
    echo "API Response: $namespace_response"
    exit 1
fi

echo "✅ KV namespace created with ID: $namespace_id"

# Create wrangler.toml for Pages configuration
echo "📝 Creating wrangler.toml for Pages configuration..."
cat > wrangler.toml << EOF
name = "$PAGES_PROJECT"
pages_build_output_dir = "./apps/website/dist"
compatibility_date = "$(date +%Y-%m-%d)"

[kv_namespaces]
$BINDING_NAME = { binding = "$BINDING_NAME", id = "$namespace_id" }
EOF

echo "✅ wrangler.toml created with KV binding configuration"

# Output summary
echo ""
echo "📋 Cloudflare KV Setup Complete"
echo "================================="
echo "Namespace: $KV_NAMESPACE"
echo "Binding: $BINDING_NAME"
echo "Pages Project: $PAGES_PROJECT"
echo "Namespace ID: $namespace_id"
echo ""
echo "✅ Your analytics function is now fully persistent!"
echo ""
echo "Next steps:"
echo "1. Deploy your Pages project with: wrangler pages deploy apps/website/dist"
echo "2. The KV binding will be automatically available to your functions"