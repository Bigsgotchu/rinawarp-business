#!/bin/bash

# Simple Google Drive Web Interface Launcher
# Creates a local web page for Google Drive access

echo "🌐 Starting Google Drive Web Interface..."

# Check if rclone is working
if ! rclone ls google-drive: >/dev/null 2>&1; then
    echo "❌ Error: Google Drive connection not working"
    echo "Run: rclone config reconnect google-drive:"
    exit 1
fi

# Create a simple HTML interface
cat > /tmp/google-drive-web.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Drive - Local Interface</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #4285f4; text-align: center; }
        .action { margin: 10px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .btn { display: inline-block; padding: 10px 20px; background: #4285f4; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
        .btn:hover { background: #357ae8; }
        .status { padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; color: #155724; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Google Drive Desktop Interface</h1>
        
        <div class="status">
            ✅ <strong>Connected!</strong> Google Drive is accessible via rclone
        </div>
        
        <h2>Quick Actions</h2>
        
        <div class="action">
            <h3>🌐 Google Drive Web (Official)</h3>
            <p>Open the official Google Drive web interface</p>
            <a href="https://drive.google.com" class="btn" target="_blank">Open Google Drive</a>
        </div>
        
        <div class="action">
            <h3>📁 File Management</h3>
            <p>Use the command-line interface for advanced operations</p>
            <a href="#" onclick="alert('Run: ./google-drive-desktop.sh for interactive menu')" class="btn">File Manager</a>
            <a href="#" onclick="alert('Run: rclone ls google-drive:')" class="btn">List Files</a>
        </div>
        
        <div class="action">
            <h3>💾 Sync Operations</h3>
            <p>Upload, download, and sync your files</p>
            <a href="#" onclick="alert('Run: rclone copy /local/file google-drive:/folder/')" class="btn">Upload File</a>
            <a href="#" onclick="alert('Run: rclone sync /local/folder google-drive:/folder/')" class="btn">Sync Folder</a>
        </div>
        
        <div class="action">
            <h3>🔧 Configuration</h3>
            <p>Configure and manage your Google Drive connection</p>
            <a href="#" onclick="alert('Run: rclone config')" class="btn">Configure</a>
            <a href="#" onclick="alert('Run: rclone about google-drive:')" class="btn">Storage Info</a>
        </div>
        
        <h2>Command Reference</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace;">
            <strong>List files:</strong> rclone ls google-drive:<br>
            <strong>Upload file:</strong> rclone copy local.txt google-drive:/Documents/<br>
            <strong>Download file:</strong> rclone copy google-drive:/Documents/file.txt ./<br>
            <strong>Sync folders:</strong> rclone sync ./local-folder google-drive:/cloud-folder/<br>
            <strong>Check status:</strong> rclone about google-drive:
        </div>
    </div>
</body>
</html>
EOF

# Open the web interface
echo "✅ Web interface created at: /tmp/google-drive-web.html"

if command -v xdg-open >/dev/null; then
    echo "🌐 Opening web interface in your browser..."
    xdg-open /tmp/google-drive-web.html
elif command -v firefox >/dev/null; then
    echo "🌐 Opening web interface in Firefox..."
    firefox /tmp/google-drive-web.html &
elif command -v google-chrome >/dev/null; then
    echo "🌐 Opening web interface in Chrome..."
    google-chrome /tmp/google-drive-web.html &
else
    echo "📂 Web interface saved to: /tmp/google-drive-web.html"
    echo "💡 Open this file in your web browser manually"
fi

echo ""
echo "🎯 You now have Google Drive desktop access through:"
echo "   1. Official Google Drive web interface"
echo "   2. Command-line tool (rclone) for advanced operations"
echo "   3. Web-based interface (this page)"
echo ""
echo "🚀 Google Drive is now integrated with your desktop!"