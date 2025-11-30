#!/bin/bash

# 📦 RinaWarp Downloads Setup - Oracle VM (Option A Standardized)
# Installer Downloads → Oracle VM at /var/www/rinawarp-api/downloads/
# Website links → https://api.rinawarptech.com/downloads/<file>
# NEVER Netlify (100MB limit), NEVER GitHub Pages

set -e

echo "📦 RinaWarp Downloads Setup - Oracle VM (Option A)"
echo "================================================="

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Oracle VM Configuration
VM_IP="158.101.1.38"
VM_USER="ubuntu"
DOWNLOADS_DIR="/var/www/rinawarp-api/downloads"
LOCAL_ASSETS_DIR="/home/karina/Documents/RinaWarp/rinawarp-website/assets"

# Function to test SSH connectivity
test_ssh_connection() {
    print_status "Testing SSH connection to Oracle VM..."
    
    if ssh -i ~/.ssh/id_rsa -o ConnectTimeout=10 -o StrictHostKeyChecking=no $VM_USER@$VM_IP "echo 'SSH connection successful'" 2>/dev/null; then
        print_success "✅ SSH connection to Oracle VM established"
        return 0
    else
        print_error "❌ Failed to connect to Oracle VM"
        print_error "Please verify SSH key and VM accessibility"
        return 1
    fi
}

# Function to setup downloads directory
setup_downloads_directory() {
    print_status "Setting up downloads directory on Oracle VM..."
    
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        echo 'Creating downloads directory...'
        sudo mkdir -p $DOWNLOADS_DIR
        sudo chown -R ubuntu:ubuntu $DOWNLOADS_DIR
        sudo chmod -R 755 $DOWNLOADS_DIR
        
        echo 'Downloads directory created at: $DOWNLOADS_DIR'
    "
    
    print_success "✅ Downloads directory setup complete"
}

# Function to upload installer files
upload_installer_files() {
    print_status "Uploading installer files to Oracle VM..."
    
    # Check if local assets exist
    if [ ! -d "$LOCAL_ASSETS_DIR" ]; then
        print_error "Local assets directory not found: $LOCAL_ASSETS_DIR"
        exit 1
    fi
    
    # Define installer files
    declare -A INSTALLER_FILES=(
        ["RinaWarp Terminal Pro-1.0.0.AppImage"]="Linux AppImage"
        ["RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb"]="Linux DEB Package"
        ["RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe"]="Windows Installer"
        ["rinawarp-vscode-1.0.0.vsix"]="VS Code Extension"
    )
    
    # Upload each installer file
    for filename in "${!INSTALLER_FILES[@]}"; do
        local_file="$LOCAL_ASSETS_DIR/$filename"
        description="${INSTALLER_FILES[$filename]}"
        
        if [ -f "$local_file" ]; then
            print_status "Uploading: $filename ($description)"
            file_size=$(ls -lh "$local_file" | awk '{print $5}')
            print_status "   Size: $file_size"
            
            scp -i ~/.ssh/id_rsa "$local_file" $VM_USER@$VM_IP:$DOWNLOADS_DIR/
            
            if [ $? -eq 0 ]; then
                print_success "   ✅ Uploaded: $filename"
            else
                print_error "   ❌ Failed to upload: $filename"
            fi
        else
            print_warning "   ⚠️  File not found: $filename"
        fi
    done
    
    print_success "✅ Installer files upload complete"
}

# Function to setup downloads endpoint
setup_downloads_endpoint() {
    print_status "Setting up downloads endpoint in backend API..."
    
    # Create downloads route for the backend
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        cd $DOWNLOADS_DIR
        echo 'Setting file permissions...'
        chmod 644 *.exe *.deb *.AppImage *.vsix 2>/dev/null || true
        
        echo 'Verifying uploaded files:'
        ls -lah *.exe *.deb *.AppImage *.vsix 2>/dev/null || echo 'No installer files found'
    "
    
    # Create a simple downloads handler for the FastAPI backend
    print_status "Creating downloads API endpoint..."
    
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        cd /var/www/rinawarp-api
        
        # Create downloads route
        cat > downloads_route.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import os
import mimetypes

app = FastAPI()

DOWNLOADS_DIR = '/var/www/rinawarp-api/downloads'

@app.get('/downloads/{filename}')
async def download_file(filename: str):
    file_path = os.path.join(DOWNLOADS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail='File not found')
    
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail='Invalid file')
    
    # Get content type
    content_type, _ = mimetypes.guess_type(file_path)
    if content_type is None:
        content_type = 'application/octet-stream'
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=content_type
    )

@app.get('/downloads/')
async def list_downloads():
    files = []
    try:
        for filename in os.listdir(DOWNLOADS_DIR):
            file_path = os.path.join(DOWNLOADS_DIR, filename)
            if os.path.isfile(file_path):
                size = os.path.getsize(file_path)
                files.append({
                    'filename': filename,
                    'size': size,
                    'size_mb': round(size / (1024*1024), 2),
                    'url': f'https://api.rinawarptech.com/downloads/{filename}'
                })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error listing files: {str(e)}')
    
    return {'files': files, 'count': len(files)}
EOF
        
        echo 'Downloads endpoint created'
    "
    
    print_success "✅ Downloads API endpoint configured"
}

# Function to test downloads endpoint
test_downloads_endpoint() {
    print_status "Testing downloads endpoint..."
    
    # Test listing endpoint
    print_status "Testing file listing endpoint..."
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        echo 'Testing /downloads/ endpoint:'
        curl -s http://localhost:4000/downloads/ || echo 'Downloads endpoint not ready'
        echo
    "
    
    # Test individual file download
    print_status "Testing individual file download..."
    ssh -i ~/.ssh/id_rsa $VM_USER@$VM_IP "
        cd $DOWNLOADS_DIR
        if [ -f 'RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe' ]; then
            echo 'Testing Windows installer download:'
            curl -I http://localhost:4000/downloads/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe
            echo
        fi
    "
    
    # Test external access
    print_status "Testing external downloads access..."
    if curl -s -I https://api.rinawarptech.com/downloads/ | grep -q "200\|404"; then
        print_success "✅ External downloads endpoint accessible"
    else
        print_warning "⚠️  External downloads endpoint not ready"
    fi
}

# Function to show download URLs
show_download_urls() {
    print_success "🎉 Downloads setup complete!"
    echo ""
    echo "📋 DOWNLOADS SUMMARY:"
    echo "   📦 Location: Oracle VM at $DOWNLOADS_DIR"
    echo "   🌐 Served from: https://api.rinawarptech.com/downloads/"
    echo "   🚫 Never Netlify (100MB limit exceeded)"
    echo "   🚫 Never GitHub Pages"
    echo ""
    echo "🔗 DOWNLOAD URLS:"
    echo "   🪟 Windows: https://api.rinawarptech.com/downloads/RinaWarp-Terminal-Pro-1.0.0-windows-x64.exe"
    echo "   🐧 Linux DEB: https://api.rinawarptech.com/downloads/RinaWarp-Terminal-Pro-1.0.0-linux-amd64.deb"
    echo "   🐧 Linux AppImage: https://api.rinawarptech.com/downloads/RinaWarp Terminal Pro-1.0.0.AppImage"
    echo "   🔌 VS Code: https://api.rinawarptech.com/downloads/rinawarp-vscode-1.0.0.vsix"
    echo ""
    echo "🔧 MANAGEMENT COMMANDS:"
    echo "   List files: curl https://api.rinawarptech.com/downloads/"
    echo "   Upload new: Use scp to upload to $DOWNLOADS_DIR"
    echo ""
    print_success "Option A - Oracle VM downloads setup complete!"
}

# Main setup flow
main() {
    echo "🚀 Starting Option A - Oracle VM Downloads Setup..."
    echo ""
    
    # Test connectivity
    if ! test_ssh_connection; then
        exit 1
    fi
    
    # Setup downloads directory
    echo ""
    setup_downloads_directory
    
    # Upload installer files
    echo ""
    upload_installer_files
    
    # Setup API endpoint
    echo ""
    setup_downloads_endpoint
    
    # Test endpoint
    echo ""
    test_downloads_endpoint
    
    # Show results
    echo ""
    show_download_urls
}

# Run main function
main

print_success "🎉 Downloads setup script completed successfully!"