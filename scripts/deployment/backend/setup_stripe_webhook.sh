#!/bin/bash
# RinaWarp Stripe Webhook Secret Setup Script
# Run this script on your Oracle VM server

echo "🔐 Setting up Stripe webhook secret..."

# Add webhook secret to environment file
WEBHOOK_SECRET="whsec_8dd90aa311dce345172987b5c121d74d633985cb55c96d00f5d490037bae8353"
ENV_FILE="/home/ubuntu/RinaWarp-API/.env.production"

# Check if the file exists, create if not
if [ ! -f "" ]; then
    echo "Creating ..."
    sudo touch ""
    sudo chmod 644 ""
fi

# Add the webhook secret
echo "STRIPE_WEBHOOK_SECRET=" | sudo tee -a ""

# Verify the addition
echo "✅ Webhook secret added to "
echo "📋 Content verification:"
sudo cat "" | grep STRIPE_WEBHOOK_SECRET

# Restart the API service
echo "🔄 Restarting RinaWarp API..."
cd /home/ubuntu/RinaWarp-API
pm2 restart rinawarp-api

# Check API status
echo "📊 API Status:"
pm2 status | grep rinawarp-api

echo "🎉 Stripe webhook secret setup complete!"
echo "Webhook secret is now active and ready to verify Stripe events."
