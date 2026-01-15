#!/bin/bash
# restore_and_launch_rinawarp.sh
# Fully automated RinaWarp restore and launch

# === CONFIGURATION ===
ROOT=~/dev/rinawarp
ARCHIVE=/mnt/external/rinawarp-archive
ENV_FILE="$ROOT/.env"
CANONICAL_MARKER="$ROOT/CANONICAL_PROJECT.md"

# Verify canonical project exists
if [ ! -f "$CANONICAL_MARKER" ]; then
    echo "ERROR: Canonical RinaWarp project not found at $ROOT"
    exit 1
fi

# Source environment variables
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "ERROR: .env file not found at $ENV_FILE"
    exit 1
fi

# === STEP 1: Find stray RinaWarp copies ===
echo "Searching for stray RinaWarp copies..."
find ~/ -type d -name "rinawarp*" ! -path "$ROOT*" | while read stray; do
    echo "Found stray project: $stray"
    # Move to archive with timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    dest="$ARCHIVE/backups/$(basename $stray)_$timestamp"
    mkdir -p "$dest"
    echo "Moving $stray → $dest"
    mv "$stray" "$dest"
done

# === STEP 2: Open canonical project in VS Code ===
echo "Opening canonical project in VS Code..."
code -r "$ROOT" &

# === STEP 3: Launch terminal tabs for each subsystem ===
declare -a paths=(
    "$VSCODE"
    "$TERMINAL"
    "$AI_MV"
    "$API"
    "$BILLING"
    "$LICENSING"
    "$CLOUDFLARE"
    "$GITHUB"
    "$NGINX"
)

echo "Launching terminals for subsystems..."
for p in "${paths[@]}"; do
    if [ -d "$p" ]; then
        gnome-terminal -- bash -c "cd $p && exec bash" &
        echo "Opened terminal in $p"
    fi
done

echo "✅ Restore & launch complete. All stray copies archived and canonical project ready."
