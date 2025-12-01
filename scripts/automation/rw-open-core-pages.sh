#!/bin/bash
set -e
cd "$(dirname "$0")"

BACKUP_DIR="WebsiteBackup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp index.html pricing.html download.html founder-wave.html "$BACKUP_DIR"/

echo "Backup created in $BACKUP_DIR"
echo "Opening core pages in VS Code..."

code index.html pricing.html download.html founder-wave.html