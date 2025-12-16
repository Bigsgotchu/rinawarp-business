#!/bin/bash

# Sign Linux packages with GPG
set -e

echo "Signing Linux packages..."

# Sign AppImage with GPG
if [ -f "dist/*.AppImage" ]; then
  echo "Signing AppImage..."
  gpg --detach-sign --armor dist/*.AppImage
  echo "AppImage signed"
fi

# Sign .deb packages
if [ -f "dist/*.deb" ]; then
  echo "Signing .deb packages..."
  for deb in dist/*.deb; do
    dpkg-sig --sign builder "$deb"
  done
  echo ".deb packages signed"
fi

# Sign .rpm packages
if [ -f "dist/*.rpm" ]; then
  echo "Signing .rpm packages..."
  for rpm in dist/*.rpm; do
    rpm --addsign "$rpm"
  done
  echo ".rpm packages signed"
fi

echo "Linux package signing complete"