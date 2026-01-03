#!/bin/bash

# OpenHaystack Personal Use Script
# Simple wrapper for tracking your personal items

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
OPENHAYSTACK_DIR="/home/karina/Documents/RinaWarp/openhaystack/Firmware/Linux_HCI"

echo "🔍 OpenHaystack Personal Use Tracker"
echo "====================================="

# Check if key is provided
if [ $# -eq 0 ]; then
    echo ""
    echo "Usage: $0 <BASE64_ADVERTISEMENT_KEY>"
    echo ""
    echo "To get your key:"
    echo "1. Download OpenHaystack macOS app from GitHub"
    echo "2. Create a new accessory in the app"
    echo "3. Right-click on the accessory → Copy advertisement key (Base64)"
    echo "4. Paste the key here: $0 YOUR_KEY_HERE"
    echo ""
    echo "Example:"
    echo "$0 BgAAAAIGc2lnAAACjzANCAAShG6mU4y8i3r3Qe7h8Z3A1b2c9d0e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5"
    exit 1
fi

KEY="$1"

echo "🎯 Starting Bluetooth tracker with your key..."
echo "📍 This will broadcast your item's location signal"
echo "🌍 Location data will be available through Apple's Find My network"
echo ""
echo "⚠️  IMPORTANT: Keep this running to track your item!"
echo "🔄 Press Ctrl+C to stop"
echo ""
echo "Starting tracker..."
echo "========================================"

# Run the OpenHaystack HCI script
sudo python3 "$OPENHAYSTACK_DIR/HCI.py" --key "$KEY"