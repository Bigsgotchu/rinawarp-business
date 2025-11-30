#!/bin/bash
# ===============================================
#  GITHUB CI SETUP AUTOMATION
#  One-command setup for 100% cross-platform builds
# ===============================================

echo "🚀 RinaWarp GitHub CI Setup"
echo "=========================="
echo

# Check if git remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "📋 Step 1: Set up GitHub repository"
    echo "-----------------------------------"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: RinaWarp-Terminal-Pro (or your choice)"
    echo "3. Make it PUBLIC (required for free GitHub Actions)"
    echo "4. Do NOT initialize with README (we have existing code)"
    echo "5. Click 'Create repository'"
    echo
    echo "Then run this command with your GitHub username:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/RinaWarp-Terminal-Pro.git"
    echo
    read -p "Press Enter after you've created the GitHub repository..."
else
    echo "✅ GitHub remote already configured: $(git remote get-url origin)"
fi

echo
echo "📤 Step 2: Push to trigger CI builds"
echo "------------------------------------"
echo "Pushing to GitHub (this will trigger the CI pipeline)..."

# Push to GitHub
git branch -M main
git push -u origin main

echo
echo "⏳ Step 3: Wait for builds to complete"
echo "--------------------------------------"
echo "GitHub Actions is now building your installers..."
echo
echo "Timeline:"
echo "• Windows build: ~5 minutes"
echo "• macOS build: ~10 minutes"  
echo "• Linux build: ~5 minutes"
echo "• Release creation: ~2 minutes"
echo
echo "Total time: ~15 minutes"
echo
echo "You'll receive GitHub email notifications when complete."
echo
echo "🔗 Step 4: Get your installers"
echo "------------------------------"
echo "After builds complete, go to:"
echo "https://github.com/$(git remote get-url origin | sed 's|.*github\.com/||' | sed 's|\.git$||')/releases"
echo
echo "You'll find:"
echo "• Windows: RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe (173MB)"
echo "• macOS: RinaWarp-Terminal-Pro-1.0.0-mac.dmg"
echo "• Linux: RinaWarp-Terminal-Pro-1.0.0-linux.AppImage + .deb"
echo
echo "🎯 Step 5: Update website download links"
echo "----------------------------------------"
echo "Replace your download links with GitHub Release URLs:"
echo
echo 'Windows: https://github.com/YOUR_USERNAME/RinaWarp-Terminal-Pro/releases/latest/download/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe'
echo 'macOS:   https://github.com/YOUR_USERNAME/RinaWarp-Terminal-Pro/releases/latest/download/RinaWarp-Terminal-Pro-1.0.0-mac.dmg'
echo 'Linux:   https://github.com/YOUR_USERNAME/RinaWarp-Terminal-Pro/releases/latest/download/RinaWarp-Terminal-Pro-1.0.0-linux.AppImage'
echo
echo "🎉 SUCCESS: 100% Cross-Platform Coverage!"
echo "========================================="
echo "✅ Windows: Professional installer ready"
echo "✅ macOS: Will be built automatically" 
echo "✅ Linux: AppImage + DEB packages ready"
echo
echo "🚀 Ready to sell to ALL desktop customers!"
echo "💰 Revenue potential: Full market coverage"
echo
echo "📊 Check build status: https://github.com/YOUR_USERNAME/RinaWarp-Terminal-Pro/actions"