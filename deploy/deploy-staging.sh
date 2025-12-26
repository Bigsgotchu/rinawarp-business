#!/usr/bin/env bash
# RinaWarp: Deploy Staging
# Safe staging deployment with validation

set -e

echo "🔍 Running pre-deployment checks..."
npm run verify:project
npm run backend:health
npm run build:apps

echo "🚀 Deploying to staging..."
npm run deploy:staging

echo "✅ Staging deployment complete"