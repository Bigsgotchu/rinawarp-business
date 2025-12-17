#!/bin/bash

echo "🚀 Deploying RinaWarp Website..."

set -e

netlify deploy --prod --dir=public

echo "✅ Deployment complete."
