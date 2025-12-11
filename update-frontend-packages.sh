#!/bin/bash

echo "📦 Updating Frontend Application Packages"
echo "========================================="

# Function to update package in directory
update_package() {
    local dir=$1
    local name=$2
    
    echo "🔄 Updating $name packages..."
    cd "$dir"
    
    if [ -f "package.json" ]; then
        echo "  Running npm audit fix..."
        npm audit fix --silent
        
        echo "  Updating dependencies..."
        npm update --silent
        
        echo "✅ $name packages updated"
    else
        echo "⚠️  No package.json found in $dir"
    fi
    
    cd - > /dev/null
}

# Update all frontend applications
update_package "apps/admin-console" "Admin Console"
update_package "apps/terminal-pro/desktop" "Terminal Pro Desktop"
update_package "apps/ai-music-video" "AI Music Video"
update_package "apps/phone-manager" "Phone Manager"

echo ""
echo "🎉 All frontend packages updated successfully!"
