#!/bin/bash
set -e

# 1️⃣ Go to extension root
cd "$(dirname "$0")"

# 2️⃣ Backup current vscode-mda.json just in case
if [ -f ".vscode/vscode-mda.json" ]; then
    cp .vscode/vscode-mda.json .vscode/vscode-mda.json.bak

    # 3️⃣ Remove any secrets from vscode-mda.json
    #    Replace PATs with placeholder
    jq '.pat="<YOUR_PAT>"' .vscode/vscode-mda.json > .vscode/vscode-mda-clean.json
    mv .vscode/vscode-mda-clean.json .vscode/vscode-mda.json
fi

# 4️⃣ Ensure package.json has correct publisher
jq '.publisher="KarinaGilley"' package.json > package-temp.json
mv package-temp.json package.json

# 5️⃣ Increment version safely (patch bump)
CURRENT_VERSION=$(jq -r '.version' package.json)
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"
jq --arg v "$NEW_VERSION" '.version=$v' package.json > package-temp.json
mv package-temp.json package.json
echo "Version bumped to $NEW_VERSION"

# 6️⃣ Package the extension
vsce package

# 7️⃣ Publish the extension
vsce publish patch

echo "✅ Extension published successfully as version $NEW_VERSION"
