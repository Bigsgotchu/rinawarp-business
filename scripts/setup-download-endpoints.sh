#!/bin/bash

# Setup Download Endpoints on Oracle VM Script
# This script creates the download endpoints on your RinaWarp API server

echo "🔧 Setting up Download Endpoints on Oracle VM..."

# Check if we're on the Oracle VM
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Please run this script as the ubuntu user (not root)"
    exit 1
fi

# Set variables
API_DIR="/var/www/rinawarp-api"
DOWNLOAD_DIR="$API_DIR/downloads"
NGINX_CONFIG="/etc/nginx/sites-available/rinawarp-api"

echo "📁 Working directory: $API_DIR"
echo "📥 Downloads directory: $DOWNLOAD_DIR"

# Check if directories exist
if [ ! -d "$API_DIR" ]; then
    echo "❌ API directory not found. Please run this from your Oracle VM after deploying the backend."
    exit 1
fi

if [ ! -d "$DOWNLOAD_DIR" ]; then
    echo "📁 Creating downloads directory..."
    mkdir -p "$DOWNLOAD_DIR"
fi

# Create download route in the API
echo "🔗 Creating download routes in the API server..."

# Create download routes file
cat > "$API_DIR/routes/downloads.js" << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Download endpoint
router.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../downloads', filename);
    
    // Security: Only allow specific file extensions
    const allowedExtensions = ['.AppImage', '.deb', '.exe', '.vsix'];
    const fileExt = path.extname(filename).toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
        return res.status(400).json({
            error: 'Invalid file type',
            message: 'Only .AppImage, .deb, .exe, and .vsix files are allowed'
        });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: 'File not found',
            message: `The requested file ${filename} does not exist`
        });
    }
    
    // Set appropriate headers for file download
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.appimage': 'application/vnd.appimage',
        '.deb': 'application/vnd.debian.binary-package',
        '.exe': 'application/x-msdownload',
        '.vsix': 'application/octet-stream'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Log download
    console.log(`📥 Download served: ${filename}`);
});

module.exports = router;
EOF

# Update main server.js to include download routes
echo "🔄 Updating server.js to include download routes..."

# Backup original server.js
if [ -f "$API_DIR/server.js" ]; then
    cp "$API_DIR/server.js" "$API_DIR/server.js.backup"
    echo "✅ Created backup: server.js.backup"
fi

# Add download routes to server.js
# This is a simple approach - in practice, you might want to be more careful with this
if grep -q "app.use('/api/downloads'" "$API_DIR/server.js"; then
    echo "✅ Download routes already added"
else
    echo "📝 Adding download routes to server.js..."
    # Add the route include and mount
    sed -i '/const app = express();/a const downloadRoutes = require('\''./routes/downloads'\'');' "$API_DIR/server.js"
    sed -i '/app.use('\''\/api'\'',/)a app.use('\''/downloads'\'', downloadRoutes);' "$API_DIR/server.js"
fi

# Update NGINX configuration to serve downloads
echo "🌐 Updating NGINX configuration..."

# Check if downloads location already exists
if grep -q "location /downloads" "$NGINX_CONFIG"; then
    echo "✅ NGINX downloads location already configured"
else
    echo "📝 Adding downloads location to NGINX..."
    # Add downloads location before the closing brace
    sed -i '/location \/ {/i\
\
    # Downloads endpoint\
    location /downloads/ {\
        proxy_pass http://localhost:4000/downloads/;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
    }' "$NGINX_CONFIG"
fi

# Test NGINX configuration
echo "🔍 Testing NGINX configuration..."
if sudo nginx -t; then
    echo "✅ NGINX configuration is valid"
else
    echo "❌ NGINX configuration has errors"
    exit 1
fi

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart nginx
pm2 restart rinawarp-api

# Wait a moment for services to start
sleep 3

# Test the setup
echo "🧪 Testing download endpoint..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/downloads/test.txt" | grep -q "404"; then
    echo "✅ Download endpoint is responding (404 for non-existent file is expected)"
else
    echo "❌ Download endpoint is not responding"
    exit 1
fi

# Show download URLs
echo ""
echo "🎉 Download endpoints setup complete!"
echo ""
echo "📋 Your download URLs are now available:"
echo "   • Linux AppImage: https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage"
echo "   • Linux DEB: https://api.rinawarptech.com/downloads/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb"
echo "   • Windows: https://api.rinawarptech.com/downloads/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe"
echo "   • VS Code: https://api.rinawarptech.com/downloads/rinawarp-vscode-1.0.0.vsix"
echo ""
echo "🔧 Services status:"
pm2 status | head -5
sudo systemctl status nginx --no-pager -l | head -3

echo ""
echo "✅ Setup complete! Your download links should now work."