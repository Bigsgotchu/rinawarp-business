#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version>"
  exit 1
fi

ROOT="/home/karina/Documents/RinaWarp"
DESKTOP="$ROOT/apps/terminal-pro/desktop/dist/installers"
WORKDIR="$ROOT/build-output/$VERSION"

mkdir -p "$WORKDIR"

echo "📦 Collecting installers for version $VERSION ..."
cp "$DESKTOP"/RinaWarp-Terminal-Pro-*.AppImage "$WORKDIR" 2>/dev/null || true
cp "$DESKTOP"/RinaWarp-Terminal-Pro-*.deb "$WORKDIR" 2>/dev/null || true
cp "$DESKTOP"/RinaWarp-Terminal-Pro-Setup-"$VERSION".exe "$WORKDIR" 2>/dev/null || true
cp "$DESKTOP"/RinaWarp-Terminal-Pro-"$VERSION".dmg "$WORKDIR" 2>/dev/null || true

cd "$WORKDIR"

echo "🔐 Generating hashes ..."
> checksums.txt
for f in *; do
  if [[ -f "$f" && "$f" != "latest.yml" && "$f" != "release-notes.txt" && "$f" != "checksums.txt" ]]; then
    sha256sum "$f" >> checksums.txt
  fi
done

APPIMAGE_FILE=$(ls *.AppImage 2>/dev/null | head -n1 || true)
DEB_FILE=$(ls *.deb 2>/dev/null | head -n1 || true)
WIN_FILE=$(ls *Setup-"$VERSION".exe 2>/dev/null | head -n1 || true)
DMG_FILE=$(ls *-"$VERSION".dmg 2>/dev/null | head -n1 || true)

APPIMAGE_HASH=""
if [[ -n "$APPIMAGE_FILE" ]]; then
  APPIMAGE_HASH=$(sha256sum "$APPIMAGE_FILE" | awk '{print $1}')
fi

cat > latest.yml <<EOF
version: $VERSION
files:
$( [[ -n "$APPIMAGE_FILE" ]] && echo "  - url: https://downloads.rinawarptech.com/terminal/$VERSION/$APPIMAGE_FILE" )
$( [[ -n "$APPIMAGE_FILE" ]] && echo "    sha256: $APPIMAGE_HASH" )
path: ${APPIMAGE_FILE:-""}
releaseNotes: "RinaWarp Terminal Pro $VERSION – stability improvements, UI upgrades, and deployment tooling."
EOF

echo "🌐 Uploading installers + manifest to CDN ..."
# NOTE: Adjust bucket name / endpoint for your setup (R2, S3, etc.)
aws s3 cp . "s3://downloads.rinawarptech.com/terminal/$VERSION/" --recursive
aws s3 cp latest.yml "s3://downloads.rinawarptech.com/terminal/latest/latest.yml"

echo "✅ Release $VERSION published to downloads.rinawarptech.com"
echo "   Installers path: https://downloads.rinawarptech.com/terminal/$VERSION/"
echo "   Auto-update manifest: https://downloads.rinawarptech.com/terminal/latest/latest.yml"