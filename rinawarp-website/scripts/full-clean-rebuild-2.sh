#!/usr/bin/env bash
set -euo pipefail

# === CONFIG – EDIT THESE IF NEEDED ===
PROJECT_ROOT="$HOME/Documents/RinaWarp/website"
WEB_ROOT="/var/www/rinawarptech.com"

# This is the canonical clean build we want to serve:
SOURCE_BUILD="$HOME/Documents/RinaWarp/archive/dist-build-20251129-230302"

# ==========================
# 1) Safety checks
# ==========================
if [ ! -d "$SOURCE_BUILD" ]; then
  echo "ERROR: SOURCE_BUILD does not exist: $SOURCE_BUILD"
  exit 1
fi

if [ ! -d "$WEB_ROOT" ]; then
  echo "ERROR: WEB_ROOT does not exist: $WEB_ROOT"
  exit 1
fi

echo "Using PROJECT_ROOT: $PROJECT_ROOT"
echo "Using WEB_ROOT:     $WEB_ROOT"
echo "Using SOURCE_BUILD: $SOURCE_BUILD"
echo

# ==========================
# 2) Backup current live site
# ==========================
STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$HOME/Documents/RinaWarp/archive/website-backup-$STAMP"

echo "Creating backup of current live site at:"
echo "  $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Copy current live site into archive backup
cp -a "$WEB_ROOT/." "$BACKUP_DIR/"

echo "Backup complete."
echo

# ==========================
# 3) Clean live web root
# ==========================
echo "Cleaning current web root: $WEB_ROOT"
# Remove everything under the web root (but not the directory itself)
rm -rf "$WEB_ROOT"/*
echo "Web root cleaned."
echo

# ==========================
# 4) Deploy clean build to web root
# ==========================
echo "Copying clean build from:"
echo "  $SOURCE_BUILD"
echo "into:"
echo "  $WEB_ROOT"

cp -a "$SOURCE_BUILD/." "$WEB_ROOT/"

echo "Deploy complete."
echo

# ==========================
# 5) Quick sanity check
# ==========================
echo "You can now sanity-check the site with:"
echo "  curl -I https://rinawarptech.com            # home"
echo "  curl -I https://rinawarptech.com/terminal-pro"
echo "  curl -I https://rinawarptech.com/music-video-creator"
echo "  curl -I https://rinawarptech.com/download"
echo
echo "Full Clean Rebuild #2 complete."