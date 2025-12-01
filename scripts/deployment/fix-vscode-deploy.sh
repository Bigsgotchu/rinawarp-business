#!/bin/bash
echo "🔧 Resetting VS Code Netlify Deploy State"

rm -rf .netlify

mkdir -p .netlify
cat <<EOF > .netlify/state.json
{
  "siteId": "76d96b63-8371-4594-b995-ca6bdac671af"
}
EOF

echo "✔ VS Code Netlify Deploy fixed"