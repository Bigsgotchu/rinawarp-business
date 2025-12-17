#!/bin/bash

# Migration Script #6: Website Functions Migration
# Safe Mode: Copy website functions from old locations to new monorepo structure
# Usage: ./migrate_website_functions_safe.sh

set -euo pipefail

# Configuration
SCRIPT_NAME="migrate_website_functions_safe.sh"
LOG_DIR="../../audit/migrations"
LOG_FILE="$LOG_DIR/website_functions_migration_$(date +%Y%m%d_%H%M%S).log"
SOURCE_DIRS=(
    "/home/karina/Documents/RinaWarp/apps/ai-music-video/netlify/functions"
    "/home/karina/Documents/RinaWarp/apps/website/.netlify/functions"
)
TARGET_DIR="../services/website/netlify/functions"

# Create audit directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Safe copy function (never overwrite)
safe_copy() {
    local src="$1"
    local dest="$2"
    local filename=$(basename "$src")

    if [ -f "$dest/$filename" ]; then
        log "⚠️  Skipping $filename (already exists in target)"
        return 0
    fi

    if [ -f "$src" ]; then
        cp "$src" "$dest/"
        log "✅ Copied $filename from $src to $dest/"
    else
        log "❌ Source file $src does not exist"
    fi
}

# Main migration
log "🚀 Starting Website Functions Migration"
log "Source directories: ${SOURCE_DIRS[*]}"
log "Target directory: $TARGET_DIR"
log "Log file: $LOG_FILE"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"
log "📁 Ensured target directory exists: $TARGET_DIR"

# Migrate functions from each source directory
for source_dir in "${SOURCE_DIRS[@]}"; do
    if [ -d "$source_dir" ]; then
        log "📂 Processing source directory: $source_dir"

        # Find all .ts and .js files
        while IFS= read -r -d '' file; do
            safe_copy "$file" "$TARGET_DIR"
        done < <(find "$source_dir" -type f \( -name "*.ts" -o -name "*.js" \) -print0)

        log "✅ Completed processing $source_dir"
    else
        log "⚠️  Source directory does not exist: $source_dir"
    fi
done

# Summary
function_count=$(find "$TARGET_DIR" -type f \( -name "*.ts" -o -name "*.js" \) | wc -l)
log "📊 Migration Summary:"
log "   - Total functions in target: $function_count"
log "   - Log file: $LOG_FILE"
log "   - Migration completed successfully"

echo ""
echo "🎉 Website functions migration completed!"
echo "📁 Functions are now in: $TARGET_DIR"
echo "📊 Total functions: $function_count"
echo "📝 Log file: $LOG_FILE"