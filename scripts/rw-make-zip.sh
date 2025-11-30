#!/bin/bash
set -e

echo "======================================================="
echo "        📦 RINAWARP WEBSITE SNAPSHOT BACKUP"
echo "======================================================="

cd /home/karina/Documents/RinaWarp

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="rinawarp-website-${TIMESTAMP}.zip"
FULL_PATH="$HOME/Documents/$BACKUP_NAME"

echo "🕒 Creating snapshot: $BACKUP_NAME"
echo "📁 Backup location: $FULL_PATH"
echo ""

echo "🧹 Cleaning temporary files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

echo "📋 Including essential website files..."

# Create the backup with essential files only
zip -r "$FULL_PATH" \
    *.html \
    css/ \
    js/ \
    assets/ \
    netlify.toml \
    _redirects \
    favicon.ico \
    manifest.json \
    robots.txt \
    sitemap.xml \
    *.sh \
    --exclude="*.md" \
    --exclude="*.txt" \
    --exclude="*.json" \
    --exclude=".git/*" \
    --exclude="node_modules/*" \
    --exclude=".vscode/*" \
    --exclude=".netlify/*" \
    -x "*.log" "*.cache" "*.tmp" \
    > /dev/null 2>&1

# Verify backup creation
if [ -f "$FULL_PATH" ]; then
    BACKUP_SIZE=$(du -h "$FULL_PATH" | cut -f1)
    echo "✅ Backup created successfully!"
    echo "   📦 File: $BACKUP_NAME"
    echo "   💾 Size: $BACKUP_SIZE"
    echo "   📍 Location: $FULL_PATH"
    
    echo ""
    echo "🔐 Storing in backup locations..."
    
    # Copy to additional backup locations if they exist
    if [ -d "$HOME/Google Drive" ]; then
        cp "$FULL_PATH" "$HOME/Google Drive/" 2>/dev/null && echo "   ✅ Google Drive backup created" || true
    fi
    
    if [ -d "$HOME/Documents/GitHub" ]; then
        cp "$FULL_PATH" "$HOME/Documents/GitHub/" 2>/dev/null && echo "   ✅ GitHub folder backup created" || true
    fi
    
    echo ""
    echo "🎯 BACKUP SUMMARY:"
    echo "   Timestamp: $TIMESTAMP"
    echo "   File: $BACKUP_NAME"
    echo "   Size: $BACKUP_SIZE"
    echo "   Location: $FULL_PATH"
    echo ""
    echo "💡 Store this file in:"
    echo "   • Google Drive (secure cloud storage)"
    echo "   • GitHub private repository"
    echo "   • External hard drive backup"
    echo "   • Multiple geographic locations"
    
else
    echo "❌ ERROR: Backup creation failed!"
    exit 1
fi

echo ""
echo "======================================================="
echo "         🎉 SNAPSHOT BACKUP COMPLETE"
echo "======================================================="