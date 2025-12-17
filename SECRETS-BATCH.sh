#!/bin/bash
# Simple batch secret setup

echo "GitHub Secrets Batch Setup"
echo "=========================="

# Get repository
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repository: $REPO"
echo ""

# Load and set secrets
echo "Loading secrets from my-secrets-ready.txt..."
echo ""

count=0
while IFS= read -r line; do
    # Skip empty lines and comments
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    
    # Parse KEY=VALUE format
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        key=$(echo "$key" | tr -d ' ')
        value=$(echo "$value" | tr -d ' ')
        
        if [ -n "$key" ]; then
            export "SECRET_$key=$value"
            ((count++))
            echo "✓ Loaded: $key"
        fi
    fi
done < my-secrets-ready.txt

echo ""
echo "Loaded $count secrets"
echo ""

# Set the required secrets
echo "Setting secrets..."

for secret_name in CF_ACCOUNT_ID CF_PAGES_PROJECT CLOUDFLARE_API_TOKEN; do
    env_var="SECRET_$secret_name"
    if [ -n "${!env_var:-}" ]; then
        secret_value="${!env_var}"
        echo "Setting $secret_name..."
        if gh secret set "$secret_name" --repo "$REPO" --body "$secret_value"; then
            echo "✓ $secret_name added"
        else
            echo "✗ Failed to add $secret_name"
        fi
    else
        echo "⚠️ $secret_name not found"
    fi
done

echo ""
echo "Done!"