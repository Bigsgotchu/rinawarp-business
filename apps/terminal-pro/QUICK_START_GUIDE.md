# 🚀 RinaWarp Terminal Pro Desktop - Quick Start Guide

## 🎯 Get Started in 5 Minutes

### 1. Install Terminal Pro

#### Windows
```powershell
Invoke-WebRequest -Uri "https://downloads.rinawarptech.com/terminal-pro/RinaWarp-Terminal-Pro-Setup.exe" -OutFile "RinaWarp-Terminal-Pro-Setup.exe"
Start-Process -Wait -FilePath "RinaWarp-Terminal-Pro-Setup.exe"
Start-Process "RinaWarp Terminal Pro"
```

#### macOS
```bash
curl -L "https://downloads.rinawarptech.com/terminal-pro/RinaWarp-Terminal-Pro.dmg" -o "RinaWarp-Terminal-Pro.dmg"
hdiutil attach "RinaWarp-Terminal-Pro.dmg"
cp -R /Volumes/RinaWarp\ Terminal\ Pro/RinaWarp\ Terminal\ Pro.app /Applications/
hdiutil detach /Volumes/RinaWarp\ Terminal\ Pro
open -a "RinaWarp Terminal Pro"
```

#### Linux
```bash
wget "https://downloads.rinawarptech.com/terminal-pro/RinaWarp-Terminal-Pro-1.0.0.AppImage"
chmod +x RinaWarp-Terminal-Pro-1.0.0.AppImage
./RinaWarp-Terminal-Pro-1.0.0.AppImage
```

### 2. Install VS Code Extension

```bash
cd vscode-extension
npm install
npm run compile
code --install-extension dist/rinawarp-terminal-pro-1.0.0.vsix
```

### 3. Authenticate

1. Open VS Code
2. Run "RinaWarp: Sign In" command
3. Follow the authentication flow
4. ✅ You're ready to go!

## 💡 Essential Commands

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Ctrl+Shift+E` | Split right |
| `Ctrl+Shift+O` | Split down |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+Space` | AI suggestions |
| `Ctrl+Shift+R` | Open Dev Dashboard |
| `Ctrl+Shift+D` | Run Deploy |
| `Ctrl+Shift+A` | AI Fix Suggestions |

## 🎨 Quick Customization

### Change Theme
```bash
:theme dark  # or light, solarized, etc.
```

### Change Font Size
```bash
:font 16
```

### Enable/Disable AI
```bash
:ai on  # or off
```

## 🔗 VS Code Integration

### Launch Terminal Pro from VS Code
1. Press `Ctrl+Shift+R`
2. Or click the RinaWarp icon in the sidebar
3. Select "Launch Terminal Pro"

### Sync Sessions
- Terminal sessions automatically sync between apps
- Clipboard is shared
- File operations are visible in both

## 🤖 AI Features

### Get Command Suggestions
1. Type a command
2. Press `Ctrl+Space`
3. Review suggestions
4. Press `Tab` to accept

### Get Error Analysis
```bash
# Run a command that might fail
npm install

# Terminal Pro will automatically:
# 1. Detect the error
# 2. Analyze the issue
# 3. Show suggestions in the sidebar
# 4. Offer to apply fixes
```

### Natural Language Queries
```bash
"Show me all Python files in this directory"
"What's the memory usage of this process?"
"Find and replace 'old' with 'new' in all files"
```

## 📋 Common Tasks

### Save Current Session
```bash
:session save my-work
```

### Load Saved Session
```bash
:session load my-work
```

### List Saved Sessions
```bash
:session list
```

### Check for Updates
```bash
:update
```

### Reset to Defaults
```bash
rinawarp-terminal-pro --reset
```

## ⚠️ Troubleshooting

### Terminal Pro won't launch
```bash
# Check permissions
chmod +x RinaWarp-Terminal-Pro-1.0.0.AppImage

# Check logs
cat ~/.config/RinaWarp/Terminal\)/logs/main.log
```

### AI suggestions not working
```bash
# Check internet connection
ping api.rinawarptech.com

# Verify AI is enabled
:ai on
```

### VS Code integration not working
```bash
# Verify path setting
{
  "rinawarp.terminalProPath": "/path/to/RinaWarp-Terminal-Pro-1.0.0.AppImage"
}

# Restart both applications
```

## 📚 Need More Help?

📖 **Full Documentation**: See [TERMINAL_PRO_DESKTOP_DOCUMENTATION.md](TERMINAL_PRO_DESKTOP_DOCUMENTATION.md)

💬 **Support**:
- Email: support@rinawarptech.com
- Discord: https://discord.gg/rinawarp
- GitHub: https://github.com/rinawarp/rinawarp-terminal-pro

## 🎉 You're Ready!

Terminal Pro is now installed and ready to use. Explore the features, customize your workspace, and enjoy a more productive development experience!

**Happy coding! 🚀**
