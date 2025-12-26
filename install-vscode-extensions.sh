#!/bin/bash
# install-vscode-extensions.sh
# Fully updated for RinaWarp VS Code setup

echo "Installing RinaWarp VS Code extensions..."

# List of valid extensions to install
extensions=(
  "github.vscode-pull-request-github"
  "github.vscode-github-actions"
  "yzhang.markdown-all-in-one"
  "bierner.markdown-mermaid"
  "shd101wyy.markdown-preview-enhanced"
  "ms-azuretools.vscode-docker"
  "ms-mssql.mssql"
  "ms-vscode.powershell"
  "timonwong.shellcheck"
  "ms-vscode.node-debug2"
  "ms-vscode.node-debug"
  "ms-vscode.js-debug"
  "firefox-devtools.vscode-firefox-debug"
  "ms-edgedevtools.vscode-edge-devtools"
  "ms-vscode.live-server"
  "ritwickdey.LiveServer"
  "formulahendry.code-runner"
  "christian-kohler.npm-intellisense"
  "visualstudioexptteam.vscodeintellicode"
  "kilocode.kilo-code"
)

# Iterate and install
for ext in "${extensions[@]}"; do
  if code --list-extensions | grep -q "^$ext$"; then
    echo "✅ Already installed: $ext"
  else
    echo "📥 Installing: $ext"
    if code --install-extension "$ext"; then
      echo "✅ Successfully installed: $ext"
    else
      echo "❌ Failed to install: $ext"
    fi
  fi
done

echo "✅ All extensions processed!"