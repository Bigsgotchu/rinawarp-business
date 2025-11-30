# RinaWarp Asset & Archive Maintenance

This guide outlines the maintenance procedures for keeping RinaWarp's assets organized, optimized, and up-to-date.

## Quick Start Commands

### Monthly Maintenance (≈ 5 minutes)
```bash
# Clean old archives (keep last 30 days)
./scripts/cleanup-archive.sh 30

# Optimize new PNG assets
./scripts/compress-pngs.sh ./assets
```

### Quarterly Review (≈ 15 minutes)
- Review brand assets: logos, icons, banners
- Remove duplicates or unused variants
- Confirm website and app still use current, approved assets
- Verify backup location is valid and restorable

### Annual Cleanup (≈ 1 hour)
```bash
# Archive old, unused assets into yearly-archive/ folder
mkdir -p yearly-archive/$(date +%Y)
# Move old assets manually to the yearly archive

# Run full cleanup of archives older than 180 days
./scripts/cleanup-archive.sh 180

# Update this documentation if processes change
# Confirm offsite/cloud backup is working
```

## Automated Tools

### Archive Cleanup Script
**Location:** `scripts/cleanup-archive.sh`

**Purpose:** Safely removes old archive files (.zip, .tar.gz, .tgz) older than specified days.

**Usage:**
```bash
# Clean archives older than 30 days (default)
./scripts/cleanup-archive.sh

# Clean archives older than 90 days
./scripts/cleanup-archive.sh 90

# Use custom archive root directory
ARCHIVE_ROOT_DIR="/custom/path" ./scripts/cleanup-archive.sh 30
```

**Features:**
- Interactive confirmation before deletion
- Shows total space that will be freed
- Handles non-existent directories gracefully
- Preserves recent files

### PNG Optimization Script
**Location:** `scripts/compress-pngs.sh`

**Purpose:** Lossless PNG optimization using industry-standard tools.

**Usage:**
```bash
# Optimize all PNGs in assets directory
./scripts/compress-pngs.sh ./assets

# Optimize PNGs in specific directory
./scripts/compress-pngs.sh ./website/images
```

**Features:**
- Automatically detects available optimization tools
- Supports `zopflipng` (preferred) and `optipng` (fallback)
- Shows file-by-file optimization results
- Reports total space saved
- Provides optimization statistics

**Installation Requirements:**
```bash
# macOS
brew install zopflipng

# Ubuntu/Debian
sudo apt install zopflipng

# Or use optipng fallback
sudo apt install optipng
```

## Directory Structure

```
RinaWarp/
├── scripts/                    # Automation tools
│   ├── cleanup-archive.sh     # Archive maintenance
│   ├── compress-pngs.sh       # PNG optimization
│   └── generate_icons.sh      # Icon pack generation
├── assets/                     # Main assets directory
│   ├── icons/                 # Generated icon sets
│   ├── web-icons/             # Web application icons
│   └── ...                    # Other assets
├── archives/                   # Archive storage (if exists)
├── yearly-archive/             # Annual asset archives
└── docs/
    ├── ASSET_MAINTENANCE.md   # This file
    └── ...                    # Other documentation
```

## Asset Organization Guidelines

### Icons
- **Base Icon:** `assets/app-icon.png` (128x128 minimum)
- **Generated Sets:** Automatically created by `generate_icons.sh`
- **Web App Icons:** `assets/web-icons/RinaWarp_WebApp_Icons/icons/`
- **VSCode Extension:** `rinawarp-vscode/media/`
- **General Use:** `assets/icons/`

### Archives
- **Temporary Archives:** Store in `./archives/` for 30 days max
- **Yearly Archives:** Move to `./yearly-archive/YYYY/` for permanent storage
- **File Types:** .zip, .tar.gz, .tgz formats supported

### PNG Assets
- **Source Files:** Keep uncompressed originals when possible
- **Generated Files:** Always run through optimization
- **Critical Assets:** Back up before optimization
- **Size Guidelines:** PNG preferred for icons, transparency, simple graphics

## Best Practices

### Regular Maintenance
1. **Set Reminders:** Monthly archive cleanup, quarterly reviews
2. **Track Changes:** Document what assets are updated when
3. **Test Changes:** Verify optimizations don't break functionality
4. **Backup Strategy:** Keep originals of critical assets

### Performance Optimization
1. **PNG Optimization:** Run on all new PNG assets before deployment
2. **Icon Generation:** Use when base icon changes
3. **Archive Management:** Regular cleanup prevents storage bloat

### Version Control
1. **Asset Updates:** Commit changes to version control
2. **Archive Strategy:** Don't version control old archives
3. **Documentation:** Keep maintenance guide updated

## Troubleshooting

### Archive Cleanup Issues
```bash
# If script fails to find archives
ls -la ./archives

# If confirmation fails, run interactively
./scripts/cleanup-archive.sh 30

# If custom paths don't work, check environment
echo $ARCHIVE_ROOT_DIR
```

### PNG Optimization Issues
```bash
# Check if optimization tools are installed
which zopflipng optipng

# Install missing tools
# macOS
brew install zopflipng

# Ubuntu/Debian
sudo apt update && sudo apt install zopflipng

# If files are protected, check permissions
ls -la ./assets/*.png

# Test on a single file first
./scripts/compress-pngs.sh ./assets/one-file.png
```

### Icon Generation Issues
```bash
# Ensure base icon exists
ls -la assets/app-icon.png

# Install Python dependencies
pip3 install Pillow

# Test Python script directly
python3 scripts/generate_rinawarp_icons.py
```

## Automation Integration

### CI/CD Pipeline Integration
Add these commands to your deployment pipeline:

```yaml
# Example GitHub Actions step
- name: Optimize Assets
  run: |
    chmod +x scripts/*.sh
    ./scripts/compress-pngs.sh ./assets
    ./scripts/cleanup-archive.sh 30
```

### Scheduled Maintenance
Set up cron jobs for automatic maintenance:

```bash
# Monthly archive cleanup (1st day of month at 2 AM)
0 2 1 * * cd /path/to/RinaWarp && ./scripts/cleanup-archive.sh 30

# Weekly PNG optimization (Sunday at 3 AM)
0 3 * * 0 cd /path/to/RinaWarp && ./scripts/compress-pngs.sh ./assets
```

## Support & Updates

This maintenance guide should be updated whenever:
- New asset types are added to the project
- Directory structure changes
- Optimization tools are upgraded
- Archive retention policies change

For questions or issues with these tools, refer to the script comments or create an issue in the project repository.