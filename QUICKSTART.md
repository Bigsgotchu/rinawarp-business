# RinaWarp Quickstart Guide

Get up and running with Terminal Pro in 5 minutes.

## 🚀 Installation

### Prerequisites
- Node.js 18+ (for development)
- Electron 29+ (included in dependencies)
- Git (for source control)

### Quick Install

```bash
# Clone the repository
git clone https://github.com/yourusername/rinawarp.git
cd rinawarp

# Install dependencies
npm install

# Build and launch Terminal Pro
npm run build
npm start
```

### Pre-built Binaries (Coming Soon)
For beta testers, pre-built binaries will be available for:
- macOS (Apple Silicon & Intel)
- Windows (64-bit)
- Linux (64-bit)

## 🔐 Authentication

### First Launch
1. Open Terminal Pro
2. Click "Sign In" in the top-right corner
3. Enter your email and password
4. Complete the 2FA verification (if enabled)

### License Activation
1. Go to **Settings → License**
2. Enter your license key (received via email)
3. Click **Activate**

### No License?
- Try the **Starter tier** (free, basic terminal with safety features)
- Upgrade to **Pro** for AI suggestions and advanced features
- Contact support for **Team** tier options

## 🎯 Using Terminal Pro

### Basic Commands
```bash
# Navigate to your project
cd /path/to/your/project

# Run commands (safety-validated)
ls
npm install
npm run dev
```

### Safety Features

#### Safe Commands (execute immediately)
```bash
ls -la
cat package.json
git status
```

#### Ambiguous Commands (require confirmation)
```bash
npm install
npm update
git pull
docker build
```

#### Destructive Commands (require explicit confirmation)
```bash
rm file.txt
mv old/ new/
chmod 777 script.sh
```

### AI Assistant

#### Inline Suggestions
As you type, the AI assistant suggests:
- Command completions
- Fixes for errors
- Refactoring opportunities
- Documentation improvements

#### AI Panel
Open the AI assistant panel (View → AI Assistant) to see:
- Context-aware suggestions
- Explanations for commands
- Alternative approaches

### Command History

View your command history:
1. Click the **History** button in the sidebar
2. Filter by safety level (Safe/Ambiguous/Destructive)
3. Re-run or undo commands

### Rollback

If a command goes wrong:
1. Open the **History** panel
2. Find the problematic command
3. Click **Rollback**
4. Confirm the rollback

## 🔌 VS Code Extension

### Installation
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "RinaWarp"
4. Click **Install**

### Configuration
1. Open VS Code settings
2. Search for "RinaWarp"
3. Configure:
   - Terminal Pro connection (auto-detected if running)
   - AI suggestion level
   - Safety preferences

### Usage
- Type commands in the RinaWarp terminal panel
- See AI suggestions inline
- Confirm destructive commands via modal
- View command history and logs

## ⚠️ Safety First

### What We Validate
- **Command safety**: Classifies commands as Safe/Ambiguous/Destructive
- **Scope**: Ensures commands stay within project root
- **Permissions**: Warns about privilege escalation
- **Network**: Validates external connections

### What You Should Know
- **All destructive commands require confirmation**
- **Commands are logged** for audit and rollback
- **AI suggestions never auto-execute**
- **You're always in control**

### Common Safety Warnings

| Command | Safety Level | Reason |
|---------|--------------|--------|
| `rm -rf /` | ❌ Destructive | Deletes everything!
| `chmod 777 file` | ⚠️ Ambiguous | Gives everyone full access
| `npm install` | ⚠️ Ambiguous | Modifies package dependencies
| `ls` | ✅ Safe | Just lists files
| `cat file.txt` | ✅ Safe | Only reads files

## 💡 Tips & Tricks

### Keyboard Shortcuts
- `Ctrl+Shift+P` - Open command palette
- `Ctrl+Shift+C` - Copy selected text
- `Ctrl+Shift+V` - Paste text
- `Ctrl+Shift+Z` - Undo last command
- `Ctrl+Shift+H` - Open command history

### Advanced Features

#### Project Isolation
Terminal Pro automatically detects your project root and restricts commands to that directory.

#### Multi-Tab Support
Open multiple terminal tabs for different tasks:
1. Click the **+** button in the tab bar
2. Each tab maintains its own working directory
3. Switch between tabs with `Ctrl+Tab`

#### Command Palette
Quick access to common actions:
- `RinaWarp: Clear Terminal`
- `RinaWarp: Open Settings`
- `RinaWarp: View License`
- `RinaWarp: Check for Updates`

## 🐛 Troubleshooting

### Common Issues

#### Terminal Pro won't launch
- **Solution**: Delete `~/.rinawarp` and restart
- **Check**: Ensure Node.js is installed (`node -v`)

#### License not activating
- **Solution**: Verify your license key is correct
- **Check**: Ensure you're connected to the internet
- **Check**: Try signing out and back in

#### Commands not executing
- **Solution**: Check the **History** panel for errors
- **Check**: Verify you're within the project root
- **Check**: Ensure the command is not blocked by safety rules

#### VS Code extension not connecting
- **Solution**: Make sure Terminal Pro is running
- **Check**: Verify the connection settings in VS Code
- **Check**: Restart both Terminal Pro and VS Code

### Getting Help

1. **Check the FAQ** (below)
2. **View logs**: Help → View Logs
3. **Contact support**: Help → Contact Support
4. **Join Discord**: Community → Join Discord

## 📖 FAQ

### General Questions

**Q: Is my data safe?**
A: Yes! All commands are validated for safety, and destructive operations require explicit confirmation. We also maintain an immutable log for rollback.

**Q: Can I disable safety checks?**
A: No. Safety is a core feature of RinaWarp. You can adjust the sensitivity in Settings, but you cannot disable it completely.

**Q: How does the AI assistant work?**
A: The AI assistant analyzes your context (current directory, recent commands, file contents) and suggests improvements, fixes, and completions. It never executes commands without your confirmation.

**Q: Is there a free tier?**
A: Yes! The Starter tier is free and includes basic terminal functionality with safety validation.

### Technical Questions

**Q: What's the difference between Terminal Pro and the VS Code extension?**
A: Terminal Pro is the standalone desktop app with full safety features. The VS Code extension provides a convenient UI that connects to Terminal Pro for execution.

**Q: Can I use Terminal Pro without the VS Code extension?**
A: Absolutely! The VS Code extension is optional. Terminal Pro works perfectly as a standalone app.

**Q: How do rollbacks work?**
A: When you execute a destructive command, we take a snapshot of affected files. If you need to undo, we restore those files from the snapshot.

**Q: Is my command history stored locally or in the cloud?**
A: All data is stored locally on your machine. We never upload your command history or project files.

### License & Billing

**Q: How do subscriptions work?**
A: Subscriptions are billed monthly or annually. You can cancel at any time from your account settings.

**Q: What happens if my subscription expires?**
A: Your Pro/Team features will be disabled, but you can continue using the Starter tier for free.

**Q: Can I upgrade/downgrade my plan?**
A: Yes! Changes take effect immediately. Downgrades are prorated.

## 🎯 Next Steps

1. **Try it out**: Run some safe commands to get comfortable
2. **Explore AI**: Enable AI suggestions in Settings
3. **Test rollback**: Run a destructive command, then roll it back
4. **Connect VS Code**: Install the extension for seamless integration
5. **Upgrade**: Consider Pro tier for advanced features

## 📞 Support

- **Documentation**: [rinawarp.com/docs](https://rinawarp.com/docs)
- **Community**: [Discord](https://discord.gg/rinawarp)
- **Support**: [support@rinawarp.com](mailto:support@rinawarp.com)
- **Twitter**: [@rinawarp](https://twitter.com/rinawarp)

---

**Version**: 1.0.0-beta
**Last Updated**: 2026-01-15
