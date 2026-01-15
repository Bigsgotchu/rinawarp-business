#!/bin/bash
# RinaWarp One-Click Launcher
# Opens all subsystems in VS Code and sets up environment variables

ROOT=~/dev/rinawarp
ENV_FILE="$ROOT/.env"

# Source environment variables
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "ERROR: .env file not found at $ENV_FILE"
    exit 1
fi

# Function to open VS Code workspace folder
open_vscode() {
    local path="$1"
    if [ -d "$path" ]; then
        code -r "$path" &
    else
        echo "WARNING: Directory $path does not exist"
    fi
}

# Open all subsystems
open_vscode "$VSCODE"
open_vscode "$TERMINAL"
open_vscode "$AI_MV"
open_vscode "$API"
open_vscode "$BILLING"
open_vscode "$LICENSING"
open_vscode "$CLOUDFLARE"
open_vscode "$GITHUB"
open_vscode "$NGINX"

echo "✅ All RinaWarp subsystems opened in VS Code with proper environment variables."
