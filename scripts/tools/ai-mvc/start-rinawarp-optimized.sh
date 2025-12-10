#!/bin/bash
# RinaWarp AI Music Video Creator - Optimized Startup Script
# This script configures Ollama for optimal performance on low-RAM systems

echo "🚀 Starting RinaWarp AI Music Video Creator (Optimized Mode)..."
echo ""

# Set Ollama environment variables for memory optimization
export OLLAMA_NUM_PARALLEL=1              # Process one request at a time
export OLLAMA_MAX_LOADED_MODELS=1         # Keep only one model in memory
export OLLAMA_FLASH_ATTENTION=1           # Use flash attention for faster inference
export OLLAMA_HOST=127.0.0.1:11434        # Ensure local connection

echo "✅ Ollama optimizations configured:"
echo "   • Single parallel request mode"
echo "   • Maximum 1 model loaded in memory"
echo "   • Flash attention enabled"
echo ""

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  Ollama is not running. Starting Ollama server..."
    ollama serve &
    sleep 3
    echo "✅ Ollama server started"
else
    echo "✅ Ollama server is already running"
fi
echo ""

# Verify the optimized model exists
echo "🔍 Checking for optimized model..."
if ollama list | grep -q "rinawarptech/Rinawarptech:q4_0"; then
    echo "✅ Optimized model 'rinawarptech/Rinawarptech:q4_0' found"
else
    echo "⚠️  Optimized model not found. Using default model."
fi
echo ""

# Display current system resources
echo "📊 System Resources:"
echo "   RAM: $(free -h | awk '/^Mem:/ {print $3 " / " $2 " used"}')"
echo "   Swap: $(free -h | awk '/^Swap:/ {print $3 " / " $2 " used"}')"
echo ""

# Change to the project directory
cd ~/Documents/"Rinawarp Platforms"/8-rinawarp-ai-music-video

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the application
echo "🎵 Launching RinaWarp AI Music Video Creator..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the Node.js server
npm start

# Cleanup function when script exits
cleanup() {
    echo ""
    echo "🛑 Shutting down RinaWarp..."
    exit 0
}

trap cleanup EXIT INT TERM
