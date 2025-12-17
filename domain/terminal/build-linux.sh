#!/bin/bash

# Build script for Linux packaging with Electron Builder

# 1) Clean + deps (repeatable)
rm -rf node_modules dist build release
export RINAWARP_LICENSE_VERIFY_URL="https://rinawarptech.com/api/license/verify"
RINAWARP_SKIP_MODELS=1 npm ci
npm dedupe
npx electron-rebuild -f -w --module-dir .

# 2) Build renderer (if Vite)
[ -f vite.config.ts ] || [ -f vite.config.js ] && npx vite build || true

# 3) Package Linux (x64)
NODE_OPTIONS=--max_old_space_size=4096 \
npx electron-builder --linux AppImage deb --x64 -c electron-builder.yml

# 4) List generated files
find release -maxdepth 1 -type f \( -name "*.AppImage" -o -name "*.deb" \) -print

# 5) Generate checksums and release notes
cd release
sha256sum * > SHA256SUMS.txt
printf "Rinawarp Terminal Pro — %s\n\n" "$(date -Iseconds)" > RELEASE-NOTES.txt
printf "* Linux installers built on Kali\n* Checksums in SHA256SUMS.txt\n" >> RELEASE-NOTES.txt
cd -

# 6) Test the built AppImage (optional)
chmod +x release/*.AppImage || true
./release/*.AppImage --no-sandbox &  # launch once
sleep 8 && pkill -f "Rinawarp Terminal Pro" || true

# 7) Copy release files to website downloads
mkdir -p ../website/public/downloads/terminal-pro/
cp release/* ../website/public/downloads/terminal-pro/ || true

# 8) Optional: Quick Windows build (unsigned)
# sudo apt install -y wine mono-devel
# npx electron-builder --win nsis -c.directories.output=release

# 9) Freeze & tag build as v0.1.0 candidate
cd release
zip -r ../rinawarp-terminal-pro-v0.1.0-candidate.zip .
cd -