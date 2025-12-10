#!/usr/bin/env bash
# ==============================================
# 🌐 RinaWarp Terminal Pro — Backend Startup Script
# ==============================================

# --- Paths ---
PROJECT_DIR="$HOME/Documents/Rinawarp-Platforms/1-rinawarp-terminal-pro"
VENV_DIR="$HOME/venvs/vllm-env"
BRIDGE_SERVICE="rina-bridge.service"
ENV_FILE="$PROJECT_DIR/.env"
LOG_DIR="$HOME/rina-logs"
mkdir -p "$LOG_DIR"

# --- Load Environment Variables ---
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
  echo "✅ Environment loaded from $ENV_FILE"
else
  echo "⚠️  .env file not found at $ENV_FILE"
fi

# --- Start vLLM backend ---
echo "🧠 Starting vLLM local model..."
source "$VENV_DIR/bin/activate"
nohup vllm serve mistralai/Mistral-7B-Instruct-v0.2 --device cpu --port 8000 > "$LOG_DIR/vllm.log" 2>&1 &
deactivate
sleep 5

# --- Start RinaBridge ---
echo "🌉 Starting RinaBridge service..."
sudo systemctl start "$BRIDGE_SERVICE"
sleep 3

# --- Verify services ---
echo "📡 Checking service statuses..."
systemctl is-active --quiet "$BRIDGE_SERVICE" && echo "🟢 Bridge: Active" || echo "🔴 Bridge: Inactive"
pgrep -f "vllm" >/dev/null && echo "🧠 vLLM: Running" || echo "⚠️ vLLM: Not running"

# --- Final message ---
echo ""
echo "🚀 RinaWarp backend fully launched!"
echo "   API: http://localhost:3001"
echo "   Bridge: http://127.0.0.1:5656"
echo "   Model: mistralai/Mistral-7B-Instruct-v0.2"
echo "   Logs: $LOG_DIR"
