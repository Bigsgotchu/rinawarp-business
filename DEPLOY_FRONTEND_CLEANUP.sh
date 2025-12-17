#!/usr/bin/env bash
# =====================================================================
# RinaWarp – Phase 3: Frontend cleanup and verification
# =====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==============================================================="
echo "   RINAWARP – PHASE 3: FRONTEND CLEANUP"
echo "==============================================================="
echo "Date: $(date)"
echo ""

# apps/website – main marketing + portal
if [ -d "apps/website" ]; then
    echo "→ Cleaning apps/website ..."
    pushd apps/website >/dev/null
    
    echo "Installing dependencies..."
    npm install --no-fund --no-audit
    
    echo "Running lint checks..."
    if npm run lint 2>/dev/null; then
        echo "✅ Lint passed for apps/website"
    else
        echo "[WARN] Lint errors detected in apps/website"
    fi
    
    echo "Building application..."
    if npm run build 2>/dev/null; then
        echo "✅ Build successful for apps/website"
    else
        echo "[WARN] Build failed in apps/website"
    fi
    
    popd >/dev/null
else
    echo "[i] apps/website not found – skipping"
fi

# Admin Console cleanup
if [ -d "apps/admin-console" ]; then
    echo ""
    echo "→ Cleaning apps/admin-console ..."
    pushd apps/admin-console >/dev/null
    
    echo "Installing dependencies..."
    npm install --no-fund --no-audit
    
    echo "Running lint checks..."
    if npm run lint 2>/dev/null; then
        echo "✅ Lint passed for apps/admin-console"
    else
        echo "[WARN] Lint errors detected in apps/admin-console"
    fi
    
    echo "Building application..."
    if npm run build 2>/dev/null; then
        echo "✅ Build successful for apps/admin-console"
    else
        echo "[WARN] Build failed in apps/admin-console"
    fi
    
    popd >/dev/null
else
    echo "[i] apps/admin-console not found – skipping"
fi

# AI Music Video cleanup
if [ -d "apps/ai-music-video" ]; then
    echo ""
    echo "→ Cleaning apps/ai-music-video ..."
    pushd apps/ai-music-video >/dev/null
    
    echo "Installing dependencies..."
    npm install --no-fund --no-audit
    
    echo "Running lint checks..."
    if npm run lint 2>/dev/null; then
        echo "✅ Lint passed for apps/ai-music-video"
    else
        echo "[WARN] Lint errors detected in apps/ai-music-video"
    fi
    
    echo "Building application..."
    if npm run build 2>/dev/null; then
        echo "✅ Build successful for apps/ai-music-video"
    else
        echo "[WARN] Build failed in apps/ai-music-video"
    fi
    
    popd >/dev/null
else
    echo "[i] apps/ai-music-video not found – skipping"
fi

echo ""
echo "==============================================================="
echo "✔ PHASE 3 – FRONTEND CLEANUP SCRIPT COMPLETED"
echo "==============================================================="
echo ""
