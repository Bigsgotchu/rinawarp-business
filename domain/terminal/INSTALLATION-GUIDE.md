# 🧜‍♀️ RinaWarp Terminal Pro - Installation Guide

## Overview

RinaWarp Terminal Pro is a fully unlocked, AI-powered terminal emulator that rivals Warp Terminal with beautiful mermaid theming and advanced features.

## ✨ Features

- **🤖 AI Integration**: Multiple AI providers (Groq, OpenAI, Claude, Gemini, Ollama, Hugging Face, Cohere)
- **🎨 Warp-style Interface**: Modern terminal interface with command blocks and suggestions
- **🌊 Mermaid Theme**: Beautiful underwater theme with glowing effects and animations
- **🔄 Auto-update System**: Automatic updates from your personal development to production
- **📊 Advanced Monitoring**: Real-time system monitoring and analytics
- **🔓 Fully Unlocked**: All premium features included for personal use

## 🚀 Installation

### Method 1: Automatic Installation

```bash
# Run the installation script
./install-rinawarp.sh

```

### Method 2: Manual Installation

```bash
# Copy the app to Applications folder

cp -r "RinaWarp Terminal Pro.app" "/Applications/"
```

## 📋 Requirements

- **macOS 10.15+** (Catalina or later)

- **Node.js 18+** (for running the app)
- **8GB RAM** (recommended)
- **500MB free space**

## 🎯 First Launch

1. **Open Applications folder** and find "RinaWarp Terminal Pro"
2. **Double-click** to launch the app

3. **Wait for loading** - you'll see the beautiful mermaid-themed splash screen
4. **Start using** - the AI terminal is ready!

## 🛠️ Configuration

### AI Backend Setup

```bash
# Start the AI backend server

./setup-ai.sh

# Or manually start the server
npm run server
```

### Update System Setup

```bash
# Set up auto-update system
./setup-auto-update.sh


# Start update server
./start-update-server.sh
```

## 🎮 Usage

### Terminal Commands

- `!help` - Show all available commands
- `!ai-providers` - List AI providers
- `!update` - Check for updates
- `!update-push` - Push personal changes to production
- `!monitor` - Show system monitoring

- `!stats` - Display system statistics

### AI Features

- **Ask questions**: Type naturally and get AI responses
- **Code assistance**: Get help with programming
- **Command suggestions**: Smart command completion
- **Voice mode**: Enable voice responses (if configured)

### Themes

- **Mermaid Enhanced**: Default beautiful underwater theme

- **Ocean Blue**: Classic ocean theme
- **Dark Matrix**: Matrix-style dark theme
- **Cyberpunk**: Neon cyberpunk theme
- **Professional**: Clean professional theme
- **Gaming**: Gaming-focused theme
- **Nature**: Natural green theme
- **Space**: Cosmic space theme

## 🔧 Troubleshooting

### App Won't Launch

```bash
# Check Node.js installation
node --version

# If Node.js not found, install it:
# Visit: https://nodejs.org/
# Or use nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

```

### AI Not Working

```bash
# Check AI backend
./test-ai-backend.js

# Start AI server

./setup-ai.sh
```

### Update Issues

```bash
# Check update status
!update-status

# Manual update
!update-push
```

## 📁 File Structure

```
RinaWarp Terminal Pro.app/
├── Contents/

│   ├── MacOS/
│   │   ├── main.js              # Electron main process

│   │   ├── launcher.sh          # App launcher
│   │   └── preload.js           # Security preload
│   ├── Resources/
│   │   ├── index.html           # Main app

│   │   ├── assets/              # App assets
│   │   ├── icon.svg             # App icon
│   │   └── node_modules/        # Dependencies
│   └── Info.plist               # App metadata

```

## 🔄 Auto-Update System

### Personal Development to Production

1. **Make changes** to your personal terminal
2. **Commit with special tags**:

   ```bash
   git commit -m "[personal] Add new feature"
   git commit -m "[dev] Fix bug"

   ```

3. **Automatic deployment** happens via Git hooks
4. **Customer terminals** get notified and update automatically

### Manual Update Push

```bash
# In the terminal

!update-push

# Or via command line
./deploy-personal-changes.sh
```

## 🎨 Customization

### Themes

- Use the theme selector in the terminal
- Or run: `!theme <t<https://rinawarptech.com/docs>

### AI Providers

<support@rinawarptech.com>

- Switch p<https://github.com/rinawarptech/terminal-pro>
- Or run: `!ai <provider-name>`

### Voice Mode

- Toggle voice in the UI
- Or run: `!voice`

## 🆘 Support

### Built-in Help

- Type `!help` in the terminal
- Use the help button in the UI

### Documenation

- Check the built-in docs: `!docs`
- View online docs: https://rinawarptech.com/docs

### Contact

- Email: support@rinawarptech.com
- GitHub: https://github.com/rinawarptech/terminal-pro

## 🔒 Security

### Personal Use License

- This is a **fully unlocked personal version**
- All premium features are included
- No usage limits or restrictions
- Perfect for personal development

### Data Privacy

- All data stays on your machine
- No telemetry or tracking
- Optional AI providers (you control the data)

## 🎉 Enjoy!

You now have a **professional-grade, AI-powered terminal** that rivals Warp Terminal with beautiful mermaid theming and advanced features. The app is fully unlocked for your personal use with no restrictions.

**Happy coding with RinaWarp Terminal Pro! 🧜‍♀️✨**
