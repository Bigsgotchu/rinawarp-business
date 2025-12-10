#!/bin/bash

# RinaWarp Terminal Pro - Browser Version (Personal License)
echo "🚀 Opening RinaWarp Terminal Pro in browser..."
echo "🔑 Personal License: RINAWARP-PERSONAL-LIFETIME-001 (Active)"
echo "✨ All premium features unlocked!"

# Start the development server
echo "📡 Starting development server..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Open in browser
echo "🌐 Opening terminal in browser..."
xdg-open http://localhost:5176

echo ""
echo "🎉 Terminal is now open in your browser!"
echo "📋 Your personal license includes:"
echo "   • Unlimited AI requests per day"
echo "   • Voice control and TTS features"
echo "   • All premium themes"
echo "   • Advanced commands"
echo "   • Priority support"
echo "   • Data export capabilities"
echo "   • Full API access"
echo "   • Custom integrations"
echo "   • Lifetime access to all features"
echo ""
echo "🔑 License Key: RINAWARP-PERSONAL-LIFETIME-001"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for server process
wait $SERVER_PID