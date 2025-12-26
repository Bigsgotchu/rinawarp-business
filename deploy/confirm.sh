#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}

echo "🛂 Confirming deployment to $ENVIRONMENT"

if [ "$ENVIRONMENT" = "production" ]; then
    echo "⚠️  PRODUCTION DEPLOYMENT REQUIRES MANUAL CONFIRMATION"
    read -p "Type 'DEPLOY_PROD' to continue: " input
    if [ "$input" != "DEPLOY_PROD" ]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
else
    echo "✅ Staging deployment auto-confirmed"
fi

echo "✅ Confirmation completed"