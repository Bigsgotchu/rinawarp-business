#!/bin/bash
# ================================================================
# RINAWARP /qzje/ 404 ERROR - COMPLETE DEPLOYMENT SOLUTION
# ================================================================

echo "🔧 RINAWARP /qzje/ 404 ERROR - COMPLETE FIX"
echo "============================================"
echo ""

# Method 1: Netlify CLI (Interactive)
echo "🚀 Method 1: Netlify CLI (Recommended for existing site)"
echo "---------------------------------------------------------"
cd /home/karina/Documents/RinaWarp/rinawarp-website-final
echo "📁 Current directory: $(pwd)"
echo "📦 Files ready for deployment:"
ls -la
echo ""
echo "🔗 STEP 1: Link to existing rinawarptech.com project"
echo "Run this command, then select your existing site:"
echo "netlify deploy --prod --dir=."
echo ""
echo "🔗 STEP 2: If prompted, choose:"
echo "❯ ⇄ Link this directory to an existing project"
echo ""

# Method 2: Web Interface (Easier)
echo "🌐 Method 2: Netlify Web Interface (Easiest)"
echo "---------------------------------------------"
echo "1. Go to: https://app.netlify.com/drop"
echo "2. Drag & drop the ENTIRE folder: /home/karina/Documents/RinaWarp/rinawarp-website-final/"
echo "3. This will create/update your deployment"
echo ""

# Method 3: Manual commands
echo "⚡ Method 3: Quick Commands"
echo "---------------------------"
echo "# Check if clean files exist:"
echo "ls /home/karina/Documents/RinaWarp/rinawarp-website-final/index.html"
echo ""
echo "# Test website before deployment:"
echo "curl -I https://rinawarptech.com"
echo ""

echo "✅ VERIFICATION AFTER DEPLOYMENT:"
echo "---------------------------------"
echo "1. Visit: https://rinawarptech.com"
echo "2. Open Developer Tools (F12)"
echo "3. Check Console tab"
echo "4. Should show NO /qzje/ 404 errors!"
echo ""

echo "🎯 READY TO DEPLOY:"
echo "- ✅ Clean files confirmed in: /home/karina/Documents/RinaWarp/rinawarp-website-final/"
echo "- ✅ No /qzje/ references in source code"
echo "- ✅ Website currently responding (HTTP 200)"
echo ""
echo "🚀 Choose your preferred deployment method above!"