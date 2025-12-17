#!/bin/bash

# Update Cloudflare Pages environment variables
# This script updates the RINA_PRICE_MAP in Pages Functions scope

set -e

echo "🔧 Updating Cloudflare Pages environment variables..."

# Check if required env vars are set
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set"
  echo "Run: export CLOUDFLARE_API_TOKEN=your_token"
  echo "      export CLOUDFLARE_ACCOUNT_ID=your_account_id"
  exit 1
fi

PROJECT_NAME="rinawarptech"

echo "📤 Updating Pages project: $PROJECT_NAME"

# Use the update_pages_config.json as the payload
RESPONSE=$(curl -s -X PATCH \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @update_pages_config.json \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME")

# Check if successful
SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Successfully updated Pages environment variables"
else
  echo "❌ Failed to update Pages environment variables"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "🔄 Triggering Pages redeploy..."

# Trigger a redeploy by creating a new deployment
# This will use the updated env vars
DEPLOY_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments")

DEPLOY_SUCCESS=$(echo "$DEPLOY_RESPONSE" | jq -r '.success // false')

if [ "$DEPLOY_SUCCESS" = "true" ]; then
  echo "✅ Redeploy triggered successfully"
else
  echo "⚠️ Redeploy may have failed, but env vars were updated"
  echo "Response: $DEPLOY_RESPONSE"
fi

echo "🎉 Done! RINA_PRICE_MAP should now be visible to Pages Functions."