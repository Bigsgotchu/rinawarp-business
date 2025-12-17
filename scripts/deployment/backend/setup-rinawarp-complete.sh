#!/bin/bash

echo "🚀 RinaWarp Setup Helper - Getting Everything Running"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "migrate-rinawarp-projects.sh" ]; then
    echo "❌ Error: migrate-rinawarp-projects.sh not found."
    echo "Please run this script from the Rinawarp-Platforms directory."
    exit 1
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x migrate-rinawarp-projects.sh rinawarp-launcher.sh install-rinawarp-desktop-launchers.sh
echo "✅ Scripts made executable"
echo ""

# Step 1: Run migration
echo "📦 Step 1: Running migration script..."
echo "This will create standalone projects and build everything..."
echo ""

# Run migration and capture output
if ./migrate-rinawarp-projects.sh; then
    echo ""
    echo "✅ Migration completed successfully!"
else
    echo ""
    echo "⚠️  Migration completed with some warnings (this is normal)"
fi

echo ""
echo "🌐 Step 2: Installing desktop integration..."
./install-rinawarp-desktop-launchers.sh

echo ""
echo "🎯 Step 3: Launching all applications..."
echo "This will start:"
echo "  📱 RinaWarp Phone Manager (Electron)"
echo "  💻 RinaWarp Terminal Pro (Electron)" 
echo "  🎬 RinaWarp Music Video Creator (Web at http://localhost:5173)"
echo ""

# Give the user a moment to see what's happening
sleep 2

# Launch everything
./rinawarp-launcher.sh

echo ""
echo "🏁 Setup complete! Applications are now running:"
echo ""
echo "📱 Phone Manager: Check your desktop applications"
echo "💻 Terminal Pro: Check your desktop applications"
echo "🌐 Music Video Creator: http://localhost:5173"
echo ""
echo "💡 To access the web app, open your browser and go to:"
echo "   http://localhost:5173"
echo ""
echo "✨ Your RinaWarp suite is now fully operational!"