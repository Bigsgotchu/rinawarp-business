# Windows Installer Required for Launch

## Current Status
- ✅ Linux AppImage: Ready for upload
- ❌ Windows Installer: MISSING - REQUIRED FOR LAUNCH

## Required Actions

### 1. Build Windows Installer
```bash
# In the terminal-pro/desktop directory
npm run build:win
# or
npm run dist
```

### 2. Expected Output
- File: `RinaWarp-Terminal-Pro-Setup.exe` (or similar)
- Size: ~76MB (based on documentation)
- Format: NSIS installer for Windows

### 3. Upload to R2
```bash
aws s3 cp dist/RinaWarp-Terminal-Pro-Setup.exe s3://rinawarp-downloads/terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Windows.exe --acl public-read
```

### 4. Update SHA256
```bash
sha256sum RinaWarp-Terminal-Pro-Setup.exe >> SHA256SUMS.txt
```

## Why Windows Installer is Critical

According to the launch playbook:
- "Linux and Windows builds must be available for download"
- "If any fail → STOP and fix R2 permissions"
- Launch cannot proceed without both platforms

## Next Steps
1. Build Windows installer
2. Test installer on Windows system
3. Upload to R2 with public-read permissions
4. Update download URLs on website
5. Test download links
6. Update SHA256SUMS.txt with Windows checksum

