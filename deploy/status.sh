#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}

echo "📊 Checking status of $ENVIRONMENT"

# Cloudflare Pages status checks
case $ENVIRONMENT in
    staging)
        echo "📊 Checking Cloudflare Pages staging deployment..."
        wrangler pages deployment list --project-name=rinawarptech-staging
        ;;
    production)
        echo "📊 Checking Cloudflare Pages production deployment..."
        wrangler pages deployment list --project-name=rinawarptech
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

echo "✅ Status check completed"