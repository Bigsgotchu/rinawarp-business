#!/bin/bash

########################################
# CLOUDFLARE DNS FIX SCRIPT
########################################

echo "🔧 CLOUDFLARE DNS ROUTING FIX"
echo "=================================="
echo

# Check if API token is provided
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable not set"
    echo
    echo "To fix this:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Create a new API Token with DNS:Edit permissions for rinawarptech.com"
    echo "3. Export the token: export CLOUDFLARE_API_TOKEN='your_token_here'"
    echo "4. Run this script again"
    echo
    echo "Example:"
    echo "export CLOUDFLARE_API_TOKEN='abc123xyz789...'"
    echo "bash fix-cloudflare-dns.sh"
    exit 1
fi

# Get Zone ID for rinawarptech.com
echo "🔍 Fetching Cloudflare Zone ID..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=rinawarptech.com&status=active" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[0].id')

if [ "$ZONE_ID" = "null" ] || [ -z "$ZONE_ID" ]; then
    echo "❌ Could not find rinawarptech.com zone"
    exit 1
fi

echo "✨ Zone ID: $ZONE_ID"
echo

# Check current DNS records
echo "🔍 Current DNS records for api.rinawarptech.com:"
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=api.rinawarptech.com" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[] | "\(.type): \(.content) -> Proxy: \(.proxied)"' || echo "No records found"
echo

# Create or update A record for api.rinawarptech.com
echo "🚀 Creating/Updating A record for api.rinawarptech.com..."
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "A",
    "name": "api.rinawarptech.com",
    "content": "137.131.48.124",
    "ttl": 1,
    "proxied": false
  }')

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ DNS record created/updated successfully"
    echo "$RESPONSE" | jq -r '.result | "   Type: \(.type), Content: \(.content), Proxy: \(.proxied)"'
else
    echo "❌ Failed to create DNS record"
    echo "$RESPONSE" | jq -r '.errors[]?.message // "Unknown error"'
    exit 1
fi

echo
echo "⏳ Waiting 30 seconds for DNS propagation..."
sleep 30

echo
echo "🧪 Testing connectivity..."
curl -I "http://api.rinawarptech.com/api/license-count" --max-time 10 || echo "❌ Still failing - may need more time for propagation"

echo
echo "✅ Cloudflare DNS fix completed!"
echo
echo "If connectivity still fails, the issue may be:"
echo "1. DNS propagation still in progress (wait 5-10 minutes)"
echo "2. Oracle Cloud routing still blocked (check Security List/NSG)"
echo "3. SSL certificate issues (nginx configuration)"