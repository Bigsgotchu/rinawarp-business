#!/bin/bash

# Clean up old Cloudflare Pages deployments
# Keeps only the 3 most recent deployments

PROJECT_NAME="rinawarptech"
KEEP_COUNT=3

echo "🧹 Cleaning up Cloudflare Pages deployments for $PROJECT_NAME"
echo "Keeping $KEEP_COUNT most recent deployments"
echo

# Get all deployment IDs
deployments=$(wrangler pages deployment list --project-name=$PROJECT_NAME | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | sort | uniq)

# Count total deployments
total_count=$(echo "$deployments" | wc -l)
echo "Found $total_count total deployments"

# Keep only the first 3 (most recent)
deployments_to_delete=$(echo "$deployments" | tail -n +$((KEEP_COUNT + 1)))

delete_count=$(echo "$deployments_to_delete" | wc -l)
echo "Will delete $delete_count old deployments"
echo

if [ "$delete_count" -eq 0 ]; then
    echo "✅ No old deployments to delete"
    exit 0
fi

echo "Deployments to delete:"
echo "$deployments_to_delete" | nl
echo

read -p "⚠️  This will permanently delete $delete_count deployments. Continue? (y/N): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo "🗑️  Deleting deployments..."

failed=0
success=0

while IFS= read -r deployment_id; do
    if [ -n "$deployment_id" ]; then
        echo "Deleting $deployment_id..."
        if wrangler pages deployment delete "$deployment_id" --project-name=$PROJECT_NAME; then
            ((success++))
        else
            ((failed++))
            echo "❌ Failed to delete $deployment_id"
        fi
    fi
done <<< "$deployments_to_delete"

echo
echo "📊 Cleanup complete:"
echo "✅ Successfully deleted: $success"
echo "❌ Failed to delete: $failed"
echo "📦 Kept: $KEEP_COUNT most recent deployments"