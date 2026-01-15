# RinaWarp Management Guide

## Quick Start

### 1. Verify and Archive Stray Copies (Already Done)
All stray RinaWarp copies have been identified and archived to:
```bash
/mnt/external/rinawarp-archive/stray-copies/
```

### 2. Use the Automated Restore & Launch Script

```bash
# Run the automated script
~/dev/rinawarp/restore_and_launch_rinawarp.sh

# What it does:
# - Scans for any new stray RinaWarp copies
# - Moves duplicates to external archive with timestamps
# - Opens VS Code on the canonical project
# - Launches terminal tabs for all subsystems
```

## Manual Commands

### Verify Canonical Repository
```bash
cd ~/dev/rinawarp
git status
```

### Check for Stray Copies
```bash
find ~/ -type d -name "*rinawarp*" -o -name "*RinaWarp*" \
  2>/dev/null | grep -v ".local/share/containers" \
  | grep -v "node_modules" | grep -v "/mnt/external" \
  | grep -v "/dev/rinawarp"
```

### Archive a Stray Copy Manually
```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p /mnt/external/rinawarp-archive/stray-copies/$TIMESTAMP-name
cp -a /path/to/stray/copy /mnt/external/rinawarp-archive/stray-copies/$TIMESTAMP-name/
```

## Archive Structure

```
/mnt/external/rinawarp-archive/
├── backups/                    # Automatically created by restore script
├── stray-copies/               # Manually archived copies
│   ├── 20260114_223437-duplicate-project/
│   ├── 20260114_223448-appimage/
│   ├── 20260114_223509-workspace/
│   ├── 20260114_223549-phone-manager-workspace/
│   ├── 20260114_223605-legal-docs/
│   └── 20260114_223638-legal-docs-2/
└── old-builds/                # Previous builds and distributions
```

## Environment Setup

Source the environment variables:
```bash
source ~/dev/rinawarp/.env
```

## Subsystems

The restore script will open terminals in these directories (if they exist):
- `$VSCODE` - VS Code integration
- `$TERMINAL` - Terminal subsystem
- `$AI_MV` - AI Music Video
- `$API` - Backend API
- `$BILLING` - Billing service
- `$LICENSING` - Licensing service
- `$CLOUDFLARE` - Cloudflare configuration
- `$GITHUB` - GitHub integration
- `$NGINX` - Nginx configuration

## Troubleshooting

### Script Fails to Find Environment Variables
Ensure `.env` file exists and has proper variables:
```bash
ls -la ~/dev/rinawarp/.env
```

### VS Code Doesn't Open
Install VS Code or use `code` command:
```bash
sudo apt install code
```

### Terminals Don't Launch
Install gnome-terminal:
```bash
sudo apt install gnome-terminal
```

## Best Practices

1. **Always work from the canonical repository** at `~/dev/rinawarp`
2. **Use the restore script** before starting work to ensure no duplicates
3. **Check git status** regularly to track changes
4. **Archive old builds** to the external drive before creating new ones
5. **Keep Dropbox files** as workspace configurations only

## Reports

- **ARCHIVED_COPIES_REPORT.md** - Detailed report of all archived copies
- **USAGE_GUIDE.md** - This guide
- **restore_and_launch_rinawarp.sh** - Automated restore script
