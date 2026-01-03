#!/bin/bash

# Google Drive Desktop Launcher
# This script provides desktop integration for Google Drive via rclone

echo "🌟 Google Drive Desktop Integration"
echo "=================================="

# Check if rclone is working
if ! rclone ls google-drive: >/dev/null 2>&1; then
    echo "❌ Error: Google Drive connection not working"
    echo "Run: rclone config reconnect google-drive:"
    exit 1
fi

echo "✅ Google Drive connection verified"
echo ""

# Menu options
echo "Choose an option:"
echo "1) Open Google Drive web interface (drive.google.com)"
echo "2) List Google Drive files"
echo "3) Upload file to Google Drive"
echo "4) Download file from Google Drive"
echo "5) Sync local folder with Google Drive"
echo "6) Open current Google Drive directory in file manager"
echo "7) Exit"
echo ""

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo "Opening Google Drive web interface..."
        # Open web browser with Google Drive
        if command -v xdg-open >/dev/null; then
            xdg-open https://drive.google.com
        elif command -v firefox >/dev/null; then
            firefox https://drive.google.com &
        elif command -v google-chrome >/dev/null; then
            google-chrome https://drive.google.com &
        else
            echo "No web browser found. Please visit: https://drive.google.com"
        fi
        ;;
    2)
        echo "📁 Your Google Drive files:"
        rclone tree google-drive:
        ;;
    3)
        echo "Upload file to Google Drive:"
        read -p "Enter local file path: " local_file
        read -p "Enter remote path (e.g., /Documents/file.txt): " remote_path
        if [ -f "$local_file" ]; then
            rclone copy "$local_file" "google-drive:$remote_path"
            echo "✅ File uploaded successfully!"
        else
            echo "❌ Local file not found: $local_file"
        fi
        ;;
    4)
        echo "Download file from Google Drive:"
        read -p "Enter remote path: " remote_path
        read -p "Enter local destination path: " local_path
        rclone copy "google-drive:$remote_path" "$local_path"
        echo "✅ File downloaded successfully!"
        ;;
    5)
        echo "Sync local folder with Google Drive:"
        read -p "Enter local folder path: " local_folder
        read -p "Enter Google Drive folder path: " remote_folder
        rclone sync "$local_folder" "google-drive:$remote_folder" --progress
        echo "✅ Sync completed!"
        ;;
    6)
        echo "Setting up file manager integration..."
        # Create a symbolic link to Google Drive root
        mkdir -p ~/GoogleDrive
        echo "Created ~/GoogleDrive folder"
        echo "Note: This provides quick access, but file changes need to be synced manually"
        echo ""
        echo "To manually sync changes:"
        echo "rclone sync ~/GoogleDrive google-drive:/ --progress"
        echo ""
        echo "To download latest from Google Drive:"
        echo "rclone sync google-drive:/ ~/GoogleDrive --progress"
        ;;
    7)
        echo "Goodbye! 👋"
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac