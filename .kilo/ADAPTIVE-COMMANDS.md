# Kilo Adaptive Commands - RinaWarp Examples

# 🔄 Adaptive Linux Desktop Build

```bash
cd /home/karina/Documents/RinaWarp \
    && node .kilo/kilo-autoscan.js \
    && node .kilo/kilo-pre-exec-hook.js --cmd "adaptive-build-linux" \
    && cd apps/terminal-pro/desktop \
    && npm run build:linux
```

# 🔄 Adaptive Cross-Platform Desktop Build

```bash
cd /home/karina/Documents/RinaWarp \
    && node .kilo/kilo-autoscan.js \
    && node .kilo/kilo-pre-exec-hook.js --cmd "adaptive-build-all" \
    && cd apps/terminal-pro/desktop \
    && npm run build:all
```

# 🔄 Adaptive Website Deploy

```bash
cd /home/karina/Documents/RinaWarp \
    && node .kilo/kilo-autoscan.js \
    && node .kilo/kilo-pre-exec-hook.js --cmd "adaptive-website-deploy" \
    && netlify deploy --prod --dir=./rinawarp-website
```

# 🔄 Adaptive Backend Restart

```bash
cd /home/karina/Documents/RinaWarp \
    && node .kilo/kilo-autoscan.js \
    && node .kilo/kilo-pre-exec-hook.js --cmd "adaptive-backend-restart" \
    && cd apps/terminal-pro/backend \
    && pm2 restart rinawarp-api || echo "PM2 failed, trying direct start..." && npm run dev
```

# 🔄 Adaptive Quick Dev Setup

```bash
cd /home/karina/Documents/RinaWarp \
    && node .kilo/kilo-autoscan.js \
    && node .kilo/kilo-pre-exec-hook.js --cmd "adaptive-dev-setup" \
    && echo "Memory refreshed, running project scan..." \
    && echo "Backend:" $(cat .kilo/kilo-memory.json | jq -r '.paths.backend') \
    && echo "Desktop:" $(cat .kilo/kilo-memory.json | jq -r '.paths.desktop') \
    && echo "Website:" $(cat .kilo/kilo-memory.json | jq -r '.paths.website') \
    && echo "Available scripts:" $(cat .kilo/kilo-memory.json | jq -r '.detectedScripts | keys | join(", ")')
```

# 🔄 Adaptive Error Check

```bash
cd /home/karina/Documents/RinaWarp \
    && node .kilo/kilo-pre-exec-hook.js --error "Build failed - electron-builder issues" --cmd "build:linux" \
    && echo "Error logged to Kilo memory for learning..."
```

# 🔄 Show Kilo Brain Status

```bash
cd /home/karina/Documents/RinaWarp \
    && echo "🧠 Kilo Adaptive Brain Status:" \
    && echo "Last scan: $(cat .kilo/kilo-memory.json | jq -r '.lastScan')" \
    && echo "Backend scripts: $(cat .kilo/kilo-memory.json | jq -r '.detectedScripts.backend | keys | join(", ")')" \
    && echo "Desktop scripts: $(cat .kilo/kilo-memory.json | jq -r '.detectedScripts.desktop | keys | join(", ")')" \
    && echo "Recent commands: $(cat .kilo/kilo-memory.json | jq -r '.recentCommands | length')" \
    && echo "Total files indexed: $(cat .kilo/kilo-memory.json | jq -r '.workspaceFiles | length')"
```

# 🎯 How to Use with Kilo

1. **Create Custom Commands in Kilo** using these templates
2. **Kilo will automatically**:
    - Load your memory before each command
    - Scan the project for context
    - Track what you run for learning
    - Adapt future suggestions based on patterns

1. **The brain gets smarter** over time as you use more commands

# 💡 Pro Tips

- The `kilo-memory.json` file is your permanent project knowledge
- Use `--error` flag to log failures for future pattern recognition
- The system learns your exact build/deploy workflows
- Memory persists across Kilo sessions
