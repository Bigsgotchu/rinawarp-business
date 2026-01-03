#!/bin/bash
# ================================================
# RinaWarp PATH GUARDIAN
# Full Workspace Verification + Auto-Fix Script
# Prevents misplaced files, old path leakage,
# and ensures devcontainer / backend / frontend
# files stay inside the monorepo.
# ================================================

set -e

REPO_ROOT="$HOME/Documents/RinaWarp"
TARGET="$REPO_ROOT/apps/terminal-pro"
OLD_PATH="$HOME/Documents/RinaWarp-Terminal-Pro"

echo "=========================================="
echo " 🔍 RINAWARP PATH VERIFICATION SYSTEM"
echo "=========================================="
echo "Repo root:      $REPO_ROOT"
echo "Terminal Pro:   $TARGET"
echo ""

# ----------------------------
# 1. CHECK IF ANYTHING STILL EXISTS IN OLD PATH
# ----------------------------
if [ -d "$OLD_PATH" ]; then
    echo "⚠️  Old project folder detected at:"
    echo "    $OLD_PATH"
    echo "📦 Moving contents into the new monorepo..."

    rsync -av --remove-source-files "$OLD_PATH"/ "$TARGET"/
    rm -rf "$OLD_PATH"

    echo "✅ Old folder merged and removed."
else
    echo "👌 No old folder found."
fi

# ----------------------------
# 2. SCAN FOR MISPLACED FILES IN HOME / DOCUMENTS
# ----------------------------
echo ""
echo "🔍 Scanning ~/Documents for misplaced files..."

find "$HOME/Documents" -maxdepth 2 -type f | while read file; do
    if [[ "$file" != $REPO_ROOT* ]]; then
        echo "⚠️  Misplaced file found: $file"

        echo "📦 Moving → $TARGET/misplaced/"
        mkdir -p "$TARGET/misplaced"
        mv "$file" "$TARGET/misplaced/"
    fi
done

echo "✅ Misplaced files handled."

# ----------------------------
# 3. VERIFY DEVCONTAINER LOCATION
# ----------------------------
echo ""
echo "🔍 Checking devcontainer placement..."

DEV_A="$TARGET/.devcontainer"
DEV_B="$REPO_ROOT/.devcontainer"

if [ -d "$DEV_B" ] && [ ! -d "$DEV_A" ]; then
    echo "⚠️  Devcontainer found in wrong place:"
    echo "    $DEV_B"
    echo "📦 Moving to $DEV_A"
    mv "$DEV_B" "$DEV_A"
elif [ -d "$DEV_A" ]; then
    echo "✅ Devcontainer correctly placed."
else
    echo "🚫 No devcontainer found at all."
fi

# ----------------------------
# 4. FIND ANY FILES THAT STILL CONTAIN OLD PATH
# ----------------------------
echo ""
echo "🔍 Searching for old path references in files..."

grep -RIl "$OLD_PATH" "$REPO_ROOT" | while read f; do
    echo "⚠️  Old path reference found in: $f"
    echo "✏️  Fixing..."

    sed -i "s|$OLD_PATH|$TARGET|g" "$f"
done

echo "✅ All references updated."

# ----------------------------
# 5. SCAN FOR NODE/ELECTRON/GIT ORPHAN FILES
# ----------------------------
echo ""
echo "🔍 Scanning for orphan Node/Electron config files..."

ORPHANS=$(find "$HOME" -maxdepth 2 -type f \( -name "package.json" -o -name "electron-builder.yml" -o -name "*.toml" -o -name "vite.config.*" \) | grep -v "$REPO_ROOT")

if [ "$ORPHANS" != "" ]; then
    echo "⚠️ Found orphan config files outside workspace:"
    echo "$ORPHANS"
    echo "📦 Moving them into $TARGET/misplaced/"
    
    mkdir -p "$TARGET/misplaced"
    for f in $ORPHANS; do
        mv "$f" "$TARGET/misplaced/"
    done
else
    echo "✨ No orphan configs found."
fi

# ----------------------------
# 6. FINAL CHECK – ENSURE TREE MATCHES EXPECTED
# ----------------------------
echo ""
echo "🔍 Building final project tree snapshot..."

tree "$REPO_ROOT" -a --prune -I "node_modules|dist|build|.git" > "$REPO_ROOT/RINAWARP-TREE-FINAL.txt"

echo "📄 Saved to:"
echo "    $REPO_ROOT/RINAWARP-TREE-FINAL.txt"

echo ""
echo "=========================================="
echo " 🎉 PATH VERIFICATION COMPLETE"
echo "=========================================="