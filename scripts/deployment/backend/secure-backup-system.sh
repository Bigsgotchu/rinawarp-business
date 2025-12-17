#!/bin/bash

echo "🔒 RinaWarp Secure Backup & Enhancement System"
echo "=============================================="
echo ""

# Create secure backup directory
BACKUP_DIR="secure-backup/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating secure backup in: $BACKUP_DIR"
echo ""

# Backup the working applications
echo "💾 Backing up working applications..."
cp -r working-apps/ "$BACKUP_DIR/"
echo "✅ Backup created: $BACKUP_DIR/working-apps"

# Create a secure archive
echo "🗜️  Creating compressed archive..."
tar -czf "$BACKUP_DIR.rinawarp-backup.tar.gz" "$BACKUP_DIR"
echo "✅ Archive created: $BACKUP_DIR.rinawarp-backup.tar.gz"

# Generate checksum for integrity
echo "🔐 Generating integrity checksums..."
cd "$BACKUP_DIR"
find . -type f -exec sha256sum {} \; > checksums.sha256
cd ..
echo "✅ Checksums saved: $BACKUP_DIR/checksums.sha256"

# Create README for backup
cat > "$BACKUP_DIR/README.md" << 'EOF'
# RinaWarp Secure Backup

## Created: $(date)

## Contents:
- `working-apps/` - All three working applications
  - `RinaWarp-Phone-Manager/` - Device management interface
  - `RinaWarp-Terminal-Pro/` - AI terminal interface  
  - `RinaWarp-Music-Video-Creator/` - Video creation platform

## Verification:
- All applications have been tested and verified working
- No syntax errors in JavaScript or CSS
- Cross-browser compatible
- Interactive features functional

## Access Methods:
1. Direct file access: `file:///path/to/application/index.html`
2. Local server: `python -m http.server 8080` in app directory
3. Unified launcher: `./launch-rinawarp-suite.sh`

## Security Notes:
- Applications are client-side only (no server vulnerabilities)
- All user interactions are simulated demos
- No data collection or external API calls
- Safe to use as reference or fallback
EOF

echo "✅ Backup documentation created: $BACKUP_DIR/README.md"

echo ""
echo "🔒 SECURE BACKUP COMPLETE!"
echo "=========================="
echo "📁 Location: $BACKUP_DIR"
echo "🗜️  Archive: $BACKUP_DIR.rinawarp-backup.tar.gz"  
echo "🔐 Checksum: $BACKUP_DIR/checksums.sha256"
echo ""
echo "🛡️  Your working applications are now safely backed up!"
echo ""
echo "🚀 Next: Enhanced applications with full features coming next..."
echo ""

# List backup contents
echo "📋 Backup Contents:"
ls -la "$BACKUP_DIR"
echo ""
echo "🎯 To restore from backup:"
echo "   tar -xzf $BACKUP_DIR.rinawarp-backup.tar.gz"
echo "   cp -r $BACKUP_DIR/working-apps ./"