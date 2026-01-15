#!/bin/bash
set -e

echo "🧹 Cleaning old node_modules and dist..."
rm -rf node_modules package-lock.json dist

echo "📦 Installing core dependencies..."
npm install electron@26.2.0 electron-is-dev@2.0.0 node-pty@0.10.1 xterm@5.0.1 xterm-addon-fit@0.7.0

echo "🛠 Installing dev dependencies..."
npm install --save-dev typescript@5.2.2 @types/node@20.5.1 @types/electron@26.0.0

# Auto-detect missing @types for dependencies
echo "🔍 Detecting missing type definitions..."
missing_types=()
for pkg in $(jq -r '.dependencies + .devDependencies | keys[]' package.json); do
  if ! ls node_modules/@types/$pkg &>/dev/null && ! npm view $pkg types &>/dev/null; then
    # Check if @types exists
    if npm view @types/$pkg version &>/dev/null; then
      missing_types+=("@types/$pkg")
    fi
  fi
done

if [ ${#missing_types[@]} -gt 0 ]; then
  echo "⚡ Installing missing type definitions: ${missing_types[*]}"
  npm install --save-dev "${missing_types[@]}"
else
  echo "✅ No missing types detected."
fi

# Verify TypeScript
echo "⚡ Verifying TypeScript..."
npx tsc --version

# Compile TypeScript
echo "🏗 Compiling TypeScript..."
if ! npx tsc --noEmit; then
  echo "❌ TypeScript compilation failed. Trying to fix missing types..."
  # Attempt to auto-install missing types based on error messages
  npx tsc 2>&1 | grep "Cannot find type definition file" | while read -r line ; do
    type_name=$(echo $line | sed -n "s/.*'\\('.*\\')'.*/\\1/p")
    if [ ! -z "$type_name" ]; then
      echo "📥 Installing @$type_name types..."
      npm install --save-dev "@types/$type_name" || true
    fi
  done
  echo "🔁 Re-running TypeScript compile..."
  npx tsc
fi

# Launch Electron app
echo "🚀 Starting Electron app..."
npm start

echo "✅ Setup complete!"
