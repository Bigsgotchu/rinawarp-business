#!/bin/bash

echo "🧪 Testing RinaWarp Frontend Applications"
echo "========================================"

# Test Admin Console
echo "🔍 Testing Admin Console..."
if [ -d "apps/admin-console" ]; then
    cd apps/admin-console
    
    if [ -f "package.json" ]; then
        echo "  📦 Installing dependencies..."
        npm install --silent
        
        echo "  🔨 Building application..."
        if npm run build --silent; then
            echo "  ✅ Admin Console build successful"
        else
            echo "  ❌ Admin Console build failed"
        fi
    else
        echo "  ⚠️  No package.json found"
    fi
    
    cd - > /dev/null
else
    echo "  ⚠️  Admin Console directory not found"
fi

# Test AI Music Video
echo ""
echo "🔍 Testing AI Music Video..."
if [ -d "apps/ai-music-video" ]; then
    cd apps/ai-music-video
    
    if [ -f "package.json" ]; then
        echo "  📦 Installing dependencies..."
        npm install --silent
        
        echo "  🔨 Building application..."
        if npm run build --silent; then
            echo "  ✅ AI Music Video build successful"
        else
            echo "  ❌ AI Music Video build failed"
        fi
    else
        echo "  ⚠️  No package.json found"
    fi
    
    cd - > /dev/null
else
    echo "  ⚠️  AI Music Video directory not found"
fi

echo ""
echo "✅ Frontend application testing completed"
