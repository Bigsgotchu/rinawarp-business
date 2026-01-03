#!/bin/bash
# RinaWarp Icon Generation Script
# Run this script to generate the complete RinaWarp icon pack

echo "🎨 RinaWarp Icon Pack Generator"
echo "================================"

# Check if Python dependencies are installed
echo "📦 Checking dependencies..."
python3 -c "import PIL, zipfile" 2>/dev/null || {
    echo "❌ Missing dependencies. Installing Pillow..."
    pip3 install Pillow
}

# Check for base icon
echo "🔍 Checking for base icon..."
if [ ! -f "assets/app-icon.png" ]; then
    echo "⚠️  assets/app-icon.png not found."
    echo "📝 Looking for alternative base icons..."
    
    if [ -f "assets/rinawarp-logo.png" ]; then
        echo "✅ Found: assets/rinawarp-logo.png"
    elif [ -f "assets/icons/icon-128.png" ]; then
        echo "✅ Found: assets/icons/icon-128.png" 
    elif [ -f "assets/web-icons/RinaWarp_WebApp_Icons/icons/icon-128.png" ]; then
        echo "✅ Found: assets/web-icons/RinaWarp_WebApp_Icons/icons/icon-128.png"
    else
        echo "❌ No base icon found. Please add one of:"
        echo "   • assets/app-icon.png (preferred)"
        echo "   • assets/rinawarp-logo.png"
        echo "   • assets/icons/icon-128.png"
        echo "   • assets/web-icons/RinaWarp_WebApp_Icons/icons/icon-128.png"
        exit 1
    fi
fi

echo "🚀 Running icon generation..."
python3 generate_rinawarp_icons.py

echo ""
echo "🎉 Icon generation complete!"
echo "📁 Check the generated ZIP file and updated icon directories."