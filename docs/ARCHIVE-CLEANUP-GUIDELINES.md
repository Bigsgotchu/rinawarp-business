# 🗂️ Archive Cleanup Guidelines

## Purpose

The archive system is designed to preserve historical versions while maintaining a clean main development environment. This document provides guidelines for managing the `archive/` directory.

## Archive Directory Structure

```
archive/
├── rinawarp-website-final-duplicate-YYYYMMDD-HHMMSS/
├── rinawarp-clean-website-duplicate-YYYYMMDD-HHMMSS/
├── dist-build-YYYYMMDD-HHMMSS/
├── cleanup-backup-YYYYMMDD-HHMMSS/
├── website-backup-YYYYMMDD-HHMMSS/
└── [other timestamped backups]
```

## Cleanup Schedule

### 📅 Monthly Reviews (30 days)

**Actions:**
- Review all directories older than 30 days
- Remove temporary development backups
- Consolidate similar dated backups
- Check for duplicate content across archives

**Criteria for Removal:**
- Development test builds
- Temporary feature branches
- Intermediate workflow states
- Duplicate content from same date

### 📅 Quarterly Reviews (90 days)

**Actions:**
- Archive old build artifacts
- Compress large directories if needed
- Update archive documentation
- Verify recovery procedures

**Preserve:**
- Major version releases
- Production deployment snapshots
- Legal/compliance backups
- Customer-facing releases

### 📅 Annual Reviews (365 days)

**Actions:**
- Consolidate historical archives
- Remove outdated development materials
- Archive very old backups to external storage
- Update retention policies

**Long-term Preservation:**
- Production releases
- Security audit results
- Legal documents
- Customer data backups

## Automation Script

```bash
#!/bin/bash
# archive-cleanup.sh - Automated archive maintenance

ARCHIVE_DIR="./archive"
DAYS_TO_KEEP=90

echo "🗂️ Archive Cleanup Script"
echo "=========================="

# List archives older than retention period
OLD_ARCHIVES=$(find "$ARCHIVE_DIR" -type d -mtime +$DAYS_TO_KEEP -name "*duplicate*" -o -name "*backup*")

if [ -z "$OLD_ARCHIVES" ]; then
    echo "✅ No archives older than $DAYS_TO_KEEP days found."
    exit 0
fi

echo "📋 Archives found older than $DAYS_TO_KEEP days:"
echo "$OLD_ARCHIVES"

# Ask for confirmation
read -p "❓ Remove these archives? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Removing old archives..."
    echo "$OLD_ARCHIVES" | while read -r dir; do
        if [ -d "$dir" ]; then
            echo "  Removing: $(basename "$dir")"
            rm -rf "$dir"
        fi
    done
    echo "✅ Cleanup completed!"
else
    echo "⏸️ Cleanup cancelled."
fi
```

## Recovery Procedures

### Finding Files

```bash
# Search for specific files in archives
find archive/ -name "*filename*" -type f

# Search by date
find archive/ -type d -name "*20251129*"

# List contents of archived directory
ls -la archive/rinawarp-website-final-duplicate-20251129-230209/
```

### Restoring Files

```bash
# Copy specific files from archive
cp archive/rinawarp-website-final-duplicate-20251129-230209/index.html ./

# Restore entire directory
cp -r archive/dist-build-20251129-230302/ ./restored-dist/

# Unarchive compressed archives
unzip archive/rinawarp-full-brand-pack.zip -d restored-brand/
```

## Best Practices

### ✅ DO:
- Use descriptive, timestamped directory names
- Document what each archive contains
- Test recovery procedures regularly
- Maintain backup verification logs
- Use external storage for long-term archives

### ❌ DON'T:
- Store sensitive data in public archives
- Keep multiple identical copies indefinitely
- Archive temporary/cached files
- Ignore archive size growth
- Skip documentation updates

## Monitoring & Metrics

### Size Tracking
```bash
# Monitor archive directory size
du -sh archive/

# Track growth over time
du -sh archive/* | sort -hr
```

### Content Verification
```bash
# Verify archive integrity
find archive/ -name "*.zip" -exec unzip -t {} \;

# Check for corruption
find archive/ -type f -exec file {} \;
```

## Emergency Procedures

### Disk Space Issues
1. **Immediate**: Remove oldest development backups
2. **Short-term**: Compress large archives
3. **Long-term**: Move to external storage

### Archive Corruption
1. **Assess**: Determine scope of corruption
2. **Recover**: Use most recent good backup
3. **Verify**: Test recovery procedures
4. **Document**: Update incident report

## Documentation Updates

When adding new archives:
1. Update this document with new directory types
2. Note any special recovery procedures
3. Update the automated cleanup script if needed
4. Log the archive creation in project notes

---

## Quick Reference

| Action | Command |
|--------|---------|
| List all archives | `ls -la archive/` |
| Find old archives | `find archive/ -mtime +90` |
| Check archive size | `du -sh archive/*` |
| Test zip integrity | `find archive/ -name "*.zip" -exec unzip -t {} \;` |
| Recovery check | `find archive/ -name "*recovery*" -o -name "*backup*"` |

*Last Updated: 2025-11-30*