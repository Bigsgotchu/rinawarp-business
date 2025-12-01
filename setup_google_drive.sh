#!/bin/bash
# Google Drive rclone Configuration Script

echo "=== Google Drive rclone Configuration ==="
echo ""
echo "Starting rclone configuration for Google Drive..."
echo ""

# Run rclone config in non-interactive mode
rclone config create google-drive drive config_is_local false

echo ""
echo "Configuration created! Now you'll need to authenticate:"
echo "1. A browser window will open with a Google OAuth URL"
echo "2. Copy that URL and paste it here"
echo "3. Complete the Google sign-in process"
echo "4. Copy the authorization code and paste it here"
echo ""

# List current remotes to verify
echo "Current remotes:"
rclone listremotes

echo ""
echo "If configuration was successful, test with:"
echo "rclone ls google-drive:"