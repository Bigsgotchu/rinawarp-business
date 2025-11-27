#!/bin/bash

# Upload Download Files to Oracle VM Script
# This script uploads the RinaWarp Terminal Pro installers to your Oracle VM

echo "🚀 Uploading RinaWarp Terminal Pro Download Files to Oracle VM..."

# Oracle VM details
VM_IP="158.101.1.38"
VM_USER="ubuntu"
DOWNLOAD_DIR="/var/www/rinawarp-api/downloads"

# Create upload directory locally
mkdir -p downloads-upload

# Copy files to upload directory with correct names
cp "release-files/RinaWarp Terminal Pro-1.0.0.AppImage" "downloads-upload/RinaWarp.Terminal.Pro-1.0.0.AppImage"
cp "release-files/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb" "downloads-upload/"
cp "release-files/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe" "downloads-upload/"
cp "release-files/rinawarp-vscode-1.0.0.vsix" "downloads-upload/"

echo "📦 Files prepared for upload:"
ls -la downloads-upload/

echo ""
echo "🌐 Now run these commands on your Oracle VM (158.101.1.38):"
echo "============================================="
echo ""
echo "# 1. Connect to your VM:"
echo "ssh ubuntu@$VM_IP"
echo ""
echo "# 2. Create downloads directory:"
echo "sudo mkdir -p $DOWNLOAD_DIR"
echo "sudo chown ubuntu:ubuntu $DOWNLOAD_DIR"
echo "cd $DOWNLOAD_DIR"
echo ""
echo "# 3. Upload files (run from your local machine):"
echo "# Upload each file individually:"
for file in downloads-upload/*; do
    filename=$(basename "$file")
    echo "scp -i ~/.ssh/id_rsa $file ubuntu@$VM_IP:$DOWNLOAD_DIR/"
done
echo ""
echo "# 4. On your VM, set proper permissions:"
echo "sudo chmod 644 $DOWNLOAD_DIR/*"
echo ""
echo "# 5. Verify files are uploaded:"
echo "ls -la $DOWNLOAD_DIR/"
echo ""
echo "✅ After uploading files, the downloads will be available at:"
echo "   https://api.rinawarptech.com/downloads/filename"
echo ""
echo "🔗 Expected download URLs:"
echo "   https://api.rinawarptech.com/downloads/RinaWarp.Terminal.Pro-1.0.0.AppImage"
echo "   https://api.rinawarptech.com/downloads/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb"
echo "   https://api.rinawarptech.com/downloads/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe"
echo "   https://api.rinawarptech.com/downloads/rinawarp-vscode-1.0.0.vsix"
echo ""
echo "📋 Next: Run setup-download-endpoints.sh on your Oracle VM"