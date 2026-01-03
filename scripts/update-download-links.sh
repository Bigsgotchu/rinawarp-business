#!/bin/bash

# Update Download Links Script
# This script updates the website download page with GitHub Release URLs

echo "🔄 Updating download links for GitHub Releases..."

# Backup original file
cp rinawarp-website/download.html rinawarp-website/download.html.backup

# Update Linux AppImage link
sed -i 's|https://ba2f14cefa19dbdc42ff88d772410689.r2.cloudflarestorage.com/terminal/RinaWarp%20Terminal%20Pro-1.0.0.AppImage|https://github.com/Bigsgotchu/rinawarptech-website/releases/latest/download/RinaWarp-Terminal-Pro-1.0.0-linux.AppImage|g' rinawarp-website/download.html

# Update Linux DEB link  
sed -i 's|assets/downloads/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb|https://github.com/Bigsgotchu/rinawarptech-website/releases/latest/download/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb|g' rinawarp-website/download.html

# Add Windows and macOS download sections
cat >> rinawarp-website/download.html << 'EOF'

    <div class="download-card">
      <h2 style="color: #e9007f; margin-bottom: 1rem;">🪟 Windows Installer</h2>
      <p><strong>Windows Setup</strong> - Complete installer for Windows 10/11.</p>
      
      <div class="file-info">
        <strong>File:</strong> RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe<br>
        <strong>Size:</strong> 173 MB<br>
        <strong>Requirements:</strong> Windows 10/11 (64-bit)
      </div>
      
      <p><strong>Installation:</strong></p>
      <code style="background: #f3f4f6; padding: 0.5rem; border-radius: 4px; display: block; margin: 1rem 0;">
        Download and run the installer<br>
        Follow the setup wizard
      </code>
      
      <a href="https://github.com/Bigsgotchu/rinawarptech-website/releases/latest/download/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe" 
         class="download-button" 
         download="RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe"
         onclick="gtag('event', 'download', {event_category: 'app', event_label: 'Windows Installer'})">
        Download for Windows (173 MB)
      </a>
    </div>

    <div class="download-card">
      <h2 style="color: #e9007f; margin-bottom: 1rem;">🍎 macOS Installer</h2>
      <p><strong>macOS DMG</strong> - Native installer for macOS 10.14+.</p>
      
      <div class="file-info">
        <strong>File:</strong> RinaWarp-Terminal-Pro-1.0.0-mac.dmg<br>
        <strong>Size:</strong> ~150 MB<br>
        <strong>Requirements:</strong> macOS 10.14+ (Intel/Apple Silicon)
      </div>
      
      <p><strong>Installation:</strong></p>
      <code style="background: #f3f4f6; padding: 0.5rem; border-radius: 4px; display: block; margin: 1rem 0;">
        Download and open DMG file<br>
        Drag RinaWarp Terminal Pro to Applications folder
      </code>
      
      <a href="https://github.com/Bigsgotchu/rinawarptech-website/releases/latest/download/RinaWarp-Terminal-Pro-1.0.0-mac.dmg" 
         class="download-button" 
         download="RinaWarp-Terminal-Pro-1.0.0-mac.dmg"
         onclick="gtag('event', 'download', {event_category: 'app', event_label: 'macOS DMG'})">
        Download for macOS
      </a>
    </div>

    <div class="download-card">
      <h2 style="color: #e9007f; margin-bottom: 1rem;">🔌 VS Code Extension</h2>
      <p><strong>RinaWarp VS Code Extension</strong> - Enhance your coding workflow with AI-powered tools.</p>
      
      <div class="file-info">
        <strong>File:</strong> rinawarp-vscode-1.0.0.vsix<br>
        <strong>Size:</strong> 1.7 MB<br>
        <strong>Requirements:</strong> Visual Studio Code
      </div>
      
      <p><strong>Installation:</strong></p>
      <code style="background: #f3f4f6; padding: 0.5rem; border-radius: 4px; display: block; margin: 1rem 0;">
        Download and install in VS Code:<br>
        Extensions → ... → Install from VSIX
      </code>
      
      <a href="https://github.com/Bigsgotchu/rinawarptech-website/releases/latest/download/rinawarp-vscode-1.0.0.vsix" 
         class="download-button" 
         download="rinawarp-vscode-1.0.0.vsix"
         onclick="gtag('event', 'download', {event_category: 'extension', event_label: 'VS Code Extension'})">
        Install VS Code Extension
      </a>
    </div>
EOF

echo "✅ Download links updated successfully!"
echo ""
echo "📋 Changes made:"
echo "  • Linux AppImage → GitHub Release URL"
echo "  • Linux DEB → GitHub Release URL" 
echo "  • Added Windows installer section"
echo "  • Added macOS installer section"
echo "  • Added VS Code Extension section"
echo ""
echo "🔗 All downloads now point to GitHub Releases"
echo "🌐 Deploy updated website to make changes live"
echo ""
echo "📁 Backup saved as: download.html.backup"