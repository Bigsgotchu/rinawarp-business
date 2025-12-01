# Google Drive Setup Guide with rclone

## Quick Start - Configuration Steps

### 1. Configure Google Drive Connection
```bash
rclone config
```

### 2. Follow the Interactive Setup
- Press `n` to create a new remote
- Enter name: `google-drive`
- Choose storage type: `13` (Google Drive)
- Press Enter for all prompts until OAuth setup
- Copy the provided URL to your browser
- Complete Google OAuth authentication
- Copy the authorization code back to the terminal

### 3. Verify Connection
```bash
# List your Google Drive root directory
rclone ls google-drive:

# List with more details
rclone lsd google-drive:
```

## Common Usage Examples

### File Operations
```bash
# Upload a file to Google Drive
rclone copy /path/to/local/file.txt google-drive:/folder/

# Download a file from Google Drive
rclone copy google-drive:/folder/file.txt /path/to/local/

# Sync local folder with Google Drive (one-way)
rclone sync /local/folder google-drive:/remote/folder

# Two-way sync
rclone bisync /local/folder google-drive:/remote/folder

# Remove file from Google Drive
rclone delete google-drive:/folder/file.txt

# List files recursively
rclone tree google-drive:/folder/
```

### Folder Operations
```bash
# Create a folder
rclone mkdir google-drive:/new-folder

# List all folders
rclone listremotes

# Copy entire directory
rclone copy /local/directory google-drive:/remote/directory
```

### Performance & Monitoring
```bash
# Check disk usage
rclone about google-drive:

# Show transfer progress
rclone copy --progress /local/file google-drive:/folder/

# Check sync status
rclone check /local/folder google-drive:/remote/folder
```

## Advanced Configuration

### Set up Auto-sync (Optional)
Create a simple sync script:
```bash
#!/bin/bash
# Auto-sync script
rclone sync /home/yourname/Documents google-drive:/Documents --progress
```

### Limit Bandwidth
```bash
# Limit upload/download speed
rclone copy --bwlimit 10M /local/file google-drive:/folder/
```

### Exclude Files
```bash
# Skip certain file types
rclone copy --exclude "*.tmp" /local/folder google-drive:/remote/folder
```

## Troubleshooting

### Authentication Issues
1. Ensure OAuth credentials are properly configured
2. Check that your Google account has Drive access enabled
3. Re-run `rclone config` to reset authentication

### Sync Problems
1. Check network connectivity
2. Verify file permissions
3. Monitor with `--progress` flag for detailed output

### Performance Issues
1. Adjust chunk size with `--transfers` parameter
2. Limit bandwidth with `--bwlimit`
3. Use `--checksum` for integrity checking

## Desktop Integration Ideas

### Nautilus/GNOME Files Integration
```bash
# Create symbolic links for quick access
ln -s $(rclone lsd --format json google-drive: | jq -r '.[0].Name') ~/GoogleDrive
```

### Desktop Notifications
```bash
# Add to your sync script
notify-send "Google Drive Sync" "Synchronization completed"
```

## File Management Best Practices

1. **Regular Backups**: Set up periodic sync jobs
2. **Version Control**: Enable Google Drive's version history
3. **Organization**: Use clear folder structure
4. **Monitoring**: Regular check of sync status
5. **Security**: Keep authentication tokens secure

---

*This guide provides comprehensive coverage for Google Drive access using rclone on Linux.*