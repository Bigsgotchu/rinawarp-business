#!/bin/bash

# RinaWarp Terminal Pro 1.0.0 - GUI Launcher
# Optimized for XFCE + X11 environment
# Includes latest Stripe integration fixes

APPIMAGE_PATH="/home/karina/Documents/rinawarp-business/apps/terminal-pro/desktop/build-output/RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage"
UNPACKED_PATH="/home/karina/Documents/rinawarp-business/apps/terminal-pro/desktop/build-output/linux-unpacked/rinawarp-terminal-pro"

echo "🚀 RinaWarp Terminal Pro 1.0.0 - GUI Launcher"
echo "==============================================="
echo "🔧 Environment Setup:"
echo "   Display: ${DISPLAY:-':0.0'}"
echo "   Desktop: ${XDG_CURRENT_DESKTOP:-'XFCE'}"
echo "   Session: ${XDG_SESSION_TYPE:-'x11'}"
echo ""

# Ensure display is set
export DISPLAY=${DISPLAY:-:0.0}
export XDG_CURRENT_DESKTOP=XFCE
export XDG_SESSION_TYPE=x11

echo "✅ Environment configured:"
echo "   DISPLAY=$DISPLAY"
echo "   XDG_CURRENT_DESKTOP=$XDG_CURRENT_DESKTOP"
echo "   XDG_SESSION_TYPE=$XDG_SESSION_TYPE"
echo ""

# Check if AppImage exists
if [ ! -f "$APPIMAGE_PATH" ]; then
    echo "❌ AppImage not found: $APPIMAGE_PATH"
    exit 1
fi

# Make executable
chmod +x "$APPIMAGE_PATH"

echo "📱 Launching RinaWarp Terminal Pro..."
echo "📋 Instructions:"
echo "   • Look for 'RinaWarp Terminal Pro' window on your desktop"
echo "   • If not visible, try Alt+Tab to cycle windows"
echo "   • Check your XFCE panel/taskbar for the app icon"
echo ""

# Try AppImage first
echo "Attempt 1: Using AppImage..."
"$APPIMAGE_PATH" &
APPIMAGE_PID=$!

sleep 3

# Check if AppImage process is running
if ps -p $APPIMAGE_PID > /dev/null 2>&1; then
    echo "✅ AppImage launched successfully (PID: $APPIMAGE_PID)"
    echo "🖥️  Check your desktop for the RinaWarp window!"
else
    echo "⚠️  AppImage closed quickly, trying unpacked version..."
    
    # Fallback to unpacked version
    if [ -f "$UNPACKED_PATH" ]; then
        echo "Attempt 2: Using unpacked version..."
        "$UNPACKED_PATH" &
        UNPACKED_PID=$!
        
        sleep 3
        
        if ps -p $UNPACKED_PID > /dev/null 2>&1; then
            echo "✅ Unpacked version launched successfully (PID: $UNPACKED_PID)"
            echo "🖥️  Check your desktop for the RinaWarp window!"
        else
            echo "❌ Both versions failed to stay running"
            echo ""
            echo "🔍 Troubleshooting:"
            echo "   • Are you connected to the GUI session?"
            echo "   • Try pressing Ctrl+Alt+F7 to switch to GUI"
            echo "   • Check if other GUI apps work (like Firefox)"
            echo "   • Try: export DISPLAY=:0.0"
        fi
    else
        echo "❌ Unpacked version not found: $UNPACKED_PATH"
    fi
fi

echo ""
echo "📊 Process Status:"
ps aux | grep -E "rinawarp|terminal-pro" | grep -v grep || echo "No RinaWarp processes found"
echo ""
echo "🎯 RinaWarp Terminal Pro launch completed!"
