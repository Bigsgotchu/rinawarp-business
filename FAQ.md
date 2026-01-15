# RinaWarp FAQ

Frequently Asked Questions about Terminal Pro, VS Code extension, and the RinaWarp platform.

## 🎯 General Questions

### What is RinaWarp?
RinaWarp is a smart terminal environment with built-in safety features, AI assistance, and seamless VS Code integration. It helps you execute commands with confidence by validating safety, providing AI suggestions, and enabling easy rollback of mistakes.

### Is RinaWarp free?
Yes! We offer a **Starter tier** that's completely free and includes:
- Basic terminal functionality
- Safety validation
- Command history
- Local execution

We also offer paid tiers (**Pro** and **Team**) with additional features like AI suggestions, advanced logging, and rollback capabilities.

### What makes RinaWarp different from regular terminals?
RinaWarp adds several key features:
1. **Safety validation**: Classifies commands as Safe/Ambiguous/Destructive
2. **AI assistance**: Context-aware suggestions and completions
3. **Rollback**: Undo destructive operations
4. **Immutable logging**: Audit trail of all commands
5. **Project isolation**: Commands restricted to project root by default
6. **VS Code integration**: Seamless workflow between editor and terminal

### Can I disable the safety features?
No. Safety is a core principle of RinaWarp. You can adjust the sensitivity of safety checks in Settings, but you cannot disable them completely. This ensures you're always protected from accidental destructive operations.

### Is my data safe with RinaWarp?
Yes! All your data stays local:
- Command history is stored only on your machine
- No data is uploaded to our servers
- All logs are encrypted at rest
- We never access your files without explicit permission

## 🛠️ Installation & Setup

### System Requirements
- **Operating System**: macOS 10.15+, Windows 10/11, Linux (64-bit)
- **Node.js**: 18+ (for development)
- **Electron**: 29+ (included in dependencies)
- **Disk Space**: ~200MB
- **Memory**: 512MB minimum, 1GB recommended

### Installation Issues

#### Terminal Pro won't launch
**Try these steps:**
1. Delete the `~/.rinawarp` directory
2. Reinstall Node.js
3. Run `npm rebuild`
4. Try launching again

**If still not working:**
- Check the logs (Help → View Logs)
- Ensure no other instance is running
- Try running from command line: `npm start`

#### VS Code extension not connecting
**Try these steps:**
1. Make sure Terminal Pro is running
2. Restart both Terminal Pro and VS Code
3. Check connection settings in VS Code (Settings → RinaWarp)
4. Verify no firewall is blocking the connection

#### License not activating
**Common causes:**
- Incorrect license key
- No internet connection
- Account not properly linked
- License already in use on another machine

**Solutions:**
1. Verify your license key is correct (check your email)
2. Ensure you're signed in with the correct account
3. Try signing out and back in
4. Contact support if the issue persists

### Updating RinaWarp

#### How do I update Terminal Pro?
1. Click **Help → Check for Updates**
2. If an update is available, click **Download**
3. Restart Terminal Pro to apply the update

#### How do I update the VS Code extension?
VS Code automatically checks for extension updates. You can also:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Find RinaWarp
4. Click the gear icon → **Check for Updates**

## 🔐 Authentication & Licensing

### How do I sign in?
1. Open Terminal Pro
2. Click **Sign In** in the top-right corner
3. Enter your email and password
4. Complete 2FA verification (if enabled)

### I forgot my password
1. Click **Forgot Password** on the sign-in screen
2. Enter your email address
3. Check your inbox for a reset link
4. Follow the instructions to create a new password

### How do subscriptions work?
- **Monthly billing**: Billed every 30 days
- **Annual billing**: Billed once per year (2 months free)
- **Cancel anytime**: No long-term contracts
- **Proration**: Downgrades are prorated

### What happens if my subscription expires?
- Your Pro/Team features will be disabled
- You can continue using the Starter tier for free
- Your data and command history remain intact
- You can reactivate at any time

### Can I use RinaWarp offline?
Yes! Once authenticated and licensed, you can use Terminal Pro offline. However:
- License verification requires internet
- AI suggestions require internet
- Command execution works offline

## 💻 Terminal Pro Usage

### How do I navigate between projects?
1. Click the **Project** button in the sidebar
2. Select a recent project or browse to a new one
3. Use `cd` commands as normal

### How do I open multiple terminals?
1. Click the **+** button in the tab bar
2. Each tab maintains its own working directory
3. Switch between tabs with `Ctrl+Tab`

### How do I view command history?
1. Click the **History** button in the sidebar
2. Filter by safety level (Safe/Ambiguous/Destructive)
3. Click a command to see details
4. Click **Re-run** or **Rollback** as needed

### How do rollbacks work?
1. Execute a destructive command (e.g., `rm file.txt`)
2. If you change your mind, open the **History** panel
3. Find the command and click **Rollback**
4. Confirm the rollback
5. RinaWarp restores the file from its snapshot

### Why does RinaWarp ask for confirmation?
RinaWarp classifies commands into three safety levels:

**Safe commands** (execute immediately):
- `ls`, `cat`, `git status`
- Read-only operations

**Ambiguous commands** (require confirmation):
- `npm install`, `git pull`
- Potentially risky but not obviously destructive

**Destructive commands** (require explicit confirmation):
- `rm`, `mv`, `chmod`, `dd`
- Modify files or system state

### Can I trust the AI suggestions?
The AI suggestions are context-aware and based on best practices, but:
- They're just suggestions - you're always in control
- They never auto-execute without your confirmation
- You should review each suggestion before applying
- The AI doesn't have access to your private data

## 🔌 VS Code Extension

### How do I install the extension?
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "RinaWarp"
4. Click **Install**

### How do I connect to Terminal Pro?
The extension automatically detects Terminal Pro if it's running. If not:
1. Open VS Code settings
2. Search for "RinaWarp"
3. Configure the connection settings
4. Ensure Terminal Pro is running

### Can I use the extension without Terminal Pro?
No. The VS Code extension is designed to work with Terminal Pro. It defers all execution authority to Terminal Pro for safety and consistency.

### How do I see AI suggestions in VS Code?
1. Make sure you're on the **Pro** tier
2. Enable AI suggestions in VS Code settings
3. Type commands in the RinaWarp terminal panel
4. Suggestions appear inline as you type

### How do I confirm destructive commands in VS Code?
When you type a destructive command:
1. A modal dialog appears with the command
2. Shows the safety level (Destructive)
3. Displays any AI suggestions
4. You must explicitly confirm to execute

## 🤖 AI Assistant

### How does the AI assistant work?
The AI assistant:
1. Analyzes your current context (directory, files, recent commands)
2. Generates suggestions based on best practices
3. Displays suggestions in the UI
4. Waits for your confirmation before executing anything

### What types of suggestions does the AI provide?
- **Command completions**: Finish your commands as you type
- **Fix suggestions**: Suggest fixes for errors
- **Refactoring**: Improve code quality
- **Documentation**: Add or update documentation
- **Security**: Point out potential security issues
- **Performance**: Suggest performance improvements

### Can I disable AI suggestions?
Yes! You can disable AI suggestions in Settings:
1. Open Terminal Pro
2. Go to **Settings → AI Assistant**
3. Toggle **Enable AI Suggestions** to off

### Are AI suggestions safe?
Yes, with caveats:
- Suggestions never auto-execute
- You must confirm each suggestion
- The AI follows safety rules
- You can review the suggestion before applying

## 🐛 Troubleshooting

### Terminal Pro crashes frequently
**Try these steps:**
1. Check the logs (Help → View Logs)
2. Delete `~/.rinawarp` and restart
3. Reinstall Node.js
4. Run `npm rebuild`
5. Contact support with the logs

### Commands execute slowly
**Possible causes:**
- Network issues (if using cloud features)
- Large command history
- Resource-intensive AI suggestions

**Solutions:**
- Disable AI suggestions temporarily
- Clear old command history
- Restart Terminal Pro
- Check system resources

### Rollback doesn't work
**Common reasons:**
- Command didn't modify files
- Files were already deleted
- Insufficient permissions
- Rollback data was corrupted

**Solutions:**
- Check the error message in the History panel
- Verify file permissions
- Try manual recovery if possible
- Contact support with details

### VS Code extension shows "Connection Failed"
**Try these steps:**
1. Ensure Terminal Pro is running
2. Restart both applications
3. Check firewall settings
4. Verify connection settings in VS Code
5. Try a different network

### License says "Invalid" but I know it's correct
**Try these steps:**
1. Sign out and back in
2. Check your email for the correct license key
3. Verify you're using the right account
4. Contact support with your license details

## 🎓 Learning & Best Practices

### How do I get the most out of RinaWarp?
1. **Start with safe commands** to get comfortable
2. **Enable AI suggestions** for helpful tips
3. **Use the History panel** to review and learn
4. **Test rollbacks** on non-critical files first
5. **Explore keyboard shortcuts** for efficiency

### What are some power user tips?
- Use multiple tabs for different tasks
- Customize your terminal theme
- Set up project-specific configurations
- Use the command palette for quick actions
- Review command history regularly

### How do I report a bug?
1. Check if it's a known issue in the FAQ
2. Check the logs (Help → View Logs)
3. Provide details:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if helpful
   - Log files
4. Submit via Help → Report Bug

### How do I request a feature?
1. Visit our [feature request board](https://rinawarp.com/feedback)
2. Search for existing requests
3. Create a new request if needed
4. Vote on features you'd like to see

## 📞 Support & Community

### How do I contact support?
- **Email**: support@rinawarp.com
- **Discord**: [Join our community](https://discord.gg/rinawarp)
- **Twitter**: [@rinawarp](https://twitter.com/rinawarp)
- **Website**: [rinawarp.com/support](https://rinawarp.com/support)

### What's your response time?
- **Critical issues**: <1 hour (24/7)
- **General support**: <24 hours (business days)
- **Feature requests**: Varies (we prioritize based on community interest)

### Do you offer enterprise support?
Yes! For Team tier customers, we offer:
- Priority support
- Dedicated account manager
- Custom training sessions
- Service-level agreements (SLAs)
- On-premise deployment options

### Can I contribute to RinaWarp?
Absolutely! We welcome contributions:
- **Code**: Check our [GitHub](https://github.com/rinawarp)
- **Documentation**: Improve our docs
- **Translations**: Help localize the app
- **Testing**: Report bugs and suggest improvements
- **Community**: Help others in Discord

## 🔮 Roadmap & Future

### What features are coming soon?
Check our [public roadmap](https://rinawarp.com/roadmap) for upcoming features:
- Multi-user collaboration
- Advanced AI code review
- Custom safety policies
- Team dashboards
- Mobile companion app

### Can I beta test new features?
Yes! Join our [beta program](https://rinawarp.com/beta) to:
- Try new features before release
- Provide feedback
- Shape the future of RinaWarp
- Get exclusive rewards

### Do you have an API?
Not yet, but it's on our roadmap. Follow [rinawarp.com/roadmap](https://rinawarp.com/roadmap) for updates.

## 📝 Miscellaneous

### Can I use RinaWarp for commercial projects?
Yes! All tiers (Starter, Pro, Team) are licensed for commercial use. Team tier includes additional enterprise features.

### Do you offer education discounts?
Yes! Students and educators get 50% off Pro tier. Email support@rinawarp.com with your school email for verification.

### Can I self-host RinaWarp?
Not yet, but we're working on self-hosted options for enterprise customers. Contact sales@rinawarp.com for details.

### Is there a mobile app?
Not yet, but we're exploring mobile companion apps. Sign up for updates at [rinawarp.com/mobile](https://rinawarp.com/mobile).

### Can I integrate RinaWarp with other tools?
Currently, the main integration is with VS Code. We're working on more integrations - check our [roadmap](https://rinawarp.com/roadmap).

---

**Version**: 1.0.0-beta
**Last Updated**: 2026-01-15

Still have questions? [Contact our support team](mailto:support@rinawarp.com)!
