#!/bin/bash

# RinaWarp Terminal Pro - Production Deployment Script
echo "🚀 Deploying RinaWarp Terminal Pro Backend Server"
echo "=================================================="

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

echo "✅ PM2 found: $(pm2 --version)"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file with your API keys:"
    echo "   - STRIPE_SECRET_KEY (required)"
    echo "   - STRIPE_PUBLISHABLE_KEY (required)"
    echo "   - STRIPE_WEBHOOK_SECRET (required)"
    echo "   - Other API keys (optional)"
    exit 1
fi

echo "✅ Environment file found"

# Stop any existing processes
echo "🔄 Stopping existing processes..."
pm2 stop rinawarp-backend-server 2>/dev/null || true
pm2 delete rinawarp-backend-server 2>/dev/null || true

# Start the server with PM2
echo "🚀 Starting server with PM2..."
pm2 start ecosystem.config.cjs --only rinawarp-backend-server

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Show status
echo ""
echo "📊 Server Status:"
pm2 status

echo ""
echo "🌐 Server URLs:"
echo "   API: http://localhost:3001/api/create-checkout-session"
echo "   Health: http://localhost:3001/health"
echo "   WebSocket: ws://localhost:3001/stream"

echo ""
echo "📋 Management Commands:"
echo "   View logs: pm2 logs rinawarp-backend-server"
echo "   Restart: pm2 restart rinawarp-backend-server"
echo "   Stop: pm2 stop rinawarp-backend-server"
echo "   Monitor: pm2 monit"

echo ""
echo "✅ Deployment complete!"
echo "⚠️  Remember to update your Stripe webhook URL to: http://your-domain.com/api/webhook"