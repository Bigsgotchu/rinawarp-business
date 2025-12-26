#!/usr/bin/env bash
# RinaWarp: Deploy Production
# Production deployment with safety checks

set -e

echo "🔒 Verifying production environment..."
npm run verify:prod

echo "🚀 Deploying to production..."
npm run deploy:production

echo "✅ Production deployment complete"