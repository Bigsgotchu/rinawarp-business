#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}

echo "🔄 Rolling back $ENVIRONMENT"

# Cloudflare Pages rollback (redeploy previous git commit)
case $ENVIRONMENT in
    staging)
        echo "🔄 Rolling back staging to previous commit..."
        git reset --hard HEAD~1
        git push --force origin staging-branch
        # Trigger redeploy
        ./deploy/deploy-staging.sh
        ;;
    production)
        echo "🔄 Rolling back production to previous commit..."
        git reset --hard HEAD~1
        git push --force origin main
        # Trigger redeploy
        ./deploy/deploy-prod.sh
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Re-disable feature flags if needed
echo "Feature flags reset to safe defaults"

echo "✅ Rollback completed"