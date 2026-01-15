# ⚠️ RinaWarp Terminal Pro - Comprehensive Troubleshooting Guide

## 🎯 Table of Contents

- [Common Issues](#common-issues)
- [Installation Problems](#installation-problems)
- [Terminal Pro Issues](#terminal-pro-issues)
- [VS Code Extension Issues](#vs-code-extension-issues)
- [AI Features Issues](#ai-features-issues)
- [Network and Connectivity](#network-and-connectivity)
- [Performance Issues](#performance-issues)
- [Configuration Problems](#configuration-problems)
- [Security and Authentication](#security-and-authentication)
- [Debugging Tools](#debugging-tools)
- [Log Files](#log-files)
- [FAQ](#faq)
- [Support Resources](#support-resources)

## 🔍 Common Issues

### Issue: Terminal Pro won't launch

**Symptoms**: Application doesn't start, no error message

**Solutions**:

1. **Check permissions** (Linux/macOS):
   ```bash
   chmod +x RinaWarp-Terminal-Pro-1.0.0.AppImage
   ```

2. **Run from terminal to see errors**:
   ```bash
   ./RinaWarp-Terminal-Pro-1.0.0.AppImage
   ```

3. **Check dependencies**:
   - Ensure you have the required libraries installed
   - On Ubuntu/Debian: `sudo apt-get install libgtk-3-0 libnss3 libxss1 libasound2`

4. **Try a different installation method**:
   - Use the .deb package instead of AppImage
   - Install from source

5. **Check for conflicts**:
   - Close other terminal applications
   - Disable antivirus temporarily

6. **Reinstall**:
   ```bash
   rm -rf ~/.config/RinaWarp/Terminal\)
   # Then reinstall
   ```

### Issue: VS Code extension not working

**Symptoms**: Extension installed but not functioning

**Solutions**:

1. **Check extension logs**:
   - Open VS Code
   - Go to `Help > Toggle Developer Tools`
   - Check the console for errors

2. **Verify Terminal Pro path**:
   ```json
   {
     "rinawarp.terminalProPath": "/path/to/RinaWarp-Terminal-Pro-1.0.0.AppImage"
   }
   ```

3. **Restart both applications**:
   - Close VS Code and Terminal Pro
   - Reopen both

4. **Reinstall extension**:
   ```bash
   cd vscode-extension
   npm install
   npm run compile
   code --uninstall-extension rinawarp-terminal-pro
   code --install-extension dist/rinawarp-terminal-pro-1.0.0.vsix
   ```

5. **Check VS Code version**:
   - Ensure you have VS Code 1.70.0 or later
   - Update VS Code if needed

### Issue: AI suggestions not working

**Symptoms**: AI features don't provide suggestions or show errors

**Solutions**:

1. **Check internet connection**:
   ```bash
   ping api.rinawarptech.com
   ```

2. **Verify AI is enabled**:
   ```bash
   :ai on
   ```

3. **Check backend API status**:
   - Ensure your backend is running
   - Verify the API endpoint is correct

4. **Check configuration**:
   ```json
   {
     "ai": {
       "enabled": true,
       "endpoint": "https://api.rinawarptech.com/ai"
     }
   }
   ```

5. **Test AI manually**:
   ```bash
   :ai suggest "test command"
   ```

6. **Check for API errors**:
   - Look at network traffic in browser dev tools
   - Check backend logs for errors

### Issue: Theme not applying

**Symptoms**: Theme changes don't take effect

**Solutions**:

1. **Restart Terminal Pro**:
   ```bash
   rinawarp-terminal-pro --reset
   ```

2. **Check configuration file**:
   - Ensure no syntax errors in config.json
   - Validate JSON structure

3. **Try a different theme**:
   ```bash
   :theme dark
   :theme light
   ```

4. **Reset to default**:
   ```bash
   rm -rf ~/.config/RinaWarp/Terminal\)
   # Terminal Pro will recreate with defaults
   ```

5. **Check for theme conflicts**:
   - Disable custom themes
   - Use built-in themes only

## 📦 Installation Problems

### Issue: Installation fails on Windows

**Symptoms**: Installer doesn't complete or shows errors

**Solutions**:

1. **Run as Administrator**:
   - Right-click installer > "Run as Administrator"

2. **Disable antivirus**:
   - Temporarily disable antivirus software
   - Add exception for RinaWarp installer

3. **Check system requirements**:
   - Windows 10/11 required
   - .NET Framework 4.8+
   - Admin privileges

4. **Use alternative installer**:
   - Try the portable version
   - Use chocolatey: `choco install rinawarp-terminal-pro`

5. **Manual installation**:
   - Download ZIP version
   - Extract to desired location
   - Run directly

### Issue: Installation fails on macOS

**Symptoms**: DMG won't mount or application won't copy

**Solutions**:

1. **Check Gatekeeper**:
   ```bash
   xattr -d com.apple.quarantine RinaWarp-Terminal-Pro.dmg
   ```

2. **Allow in Security preferences**:
   - Go to `System Preferences > Security & Privacy`
   - Click "Open Anyway" for RinaWarp

3. **Use terminal to install**:
   ```bash
   hdiutil attach RinaWarp-Terminal-Pro.dmg
   cp -R /Volumes/RinaWarp\ Terminal\ Pro/RinaWarp\ Terminal\ Pro.app /Applications/
   hdiutil detach /Volumes/RinaWarp\ Terminal\ Pro
   ```

4. **Check for conflicts**:
   - Remove old versions: `rm -rf /Applications/RinaWarp*`
   - Clear cache: `rm -rf ~/Library/Caches/RinaWarp*`

### Issue: Installation fails on Linux

**Symptoms**: AppImage doesn't run or shows library errors

**Solutions**:

1. **Check AppImage permissions**:
   ```bash
   chmod +x RinaWarp-Terminal-Pro-1.0.0.AppImage
   ```

2. **Run with FUSE**:
   ```bash
   ./RinaWarp-Terminal-Pro-1.0.0.AppImage --appimage-extract
   cd squashfs-root
   ./usr/bin/RinaWarp-Terminal-Pro
   ```

3. **Install dependencies**:
   - Ubuntu/Debian: `sudo apt-get install libfuse2`
   - Fedora: `sudo dnf install fuse`
   - Arch: `sudo pacman -S fuse2`

4. **Use package manager**:
   ```bash
   # Add repository
   sudo curl -fsSL "https://downloads.rinawarptech.com/terminal-pro/rinawarp.list" -o /etc/apt/sources.list.d/rinawarp.list
   sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys YOUR_KEY
   sudo apt update
   sudo apt install rinawarp-terminal-pro
   ```

5. **Run in compatibility mode**:
   ```bash
   export APPIMAGE_EXTRACT_AND_RUN=1
   ./RinaWarp-Terminal-Pro-1.0.0.AppImage
   ```

## 🖥️ Terminal Pro Issues

### Issue: Terminal crashes frequently

**Symptoms**: Application crashes or becomes unresponsive

**Solutions**:

1. **Check for memory issues**:
   - Monitor memory usage
   - Reduce open tabs/splits

2. **Disable plugins**:
   ```json
   {
     "plugins": {
       "enabled": []
     }
   }
   ```

3. **Reset configuration**:
   ```bash
   rm -rf ~/.config/RinaWarp/Terminal\)
   ```

4. **Run in safe mode**:
   ```bash
   rinawarp-terminal-pro --safe-mode
   ```

5. **Check for conflicting applications**:
   - Close other terminal emulators
   - Disable shell extensions

### Issue: Terminal is slow or laggy

**Symptoms**: UI is unresponsive, typing is delayed

**Solutions**:

1. **Reduce scrollback buffer**:
   ```json
   {
     "general": {
       "scrollbackLines": 5000
     }
   }
   ```

2. **Disable AI features**:
   ```bash
   :ai off
   ```

3. **Use lighter theme**:
   ```bash
   :theme terminal-basic
   ```

4. **Close unnecessary tabs**:
   - Reduce to essential tabs only
   - Use session management

5. **Check system resources**:
   - Ensure sufficient RAM and CPU
   - Close other memory-intensive applications

### Issue: Terminal doesn't recognize commands

**Symptoms**: Commands like `:theme` or `:ai` don't work

**Solutions**:

1. **Check if in command mode**:
   - Ensure you're not in a shell session
   - Type commands at the terminal prompt

2. **Verify shell integration**:
   ```bash
   echo $SHELL
   # Should show bash, zsh, etc.
   ```

3. **Check configuration**:
   ```json
   {
     "general": {
       "enableInternalCommands": true
     }
   }
   ```

4. **Restart Terminal Pro**:
   ```bash
   rinawarp-terminal-pro --reset
   ```

### Issue: Split panes not working

**Symptoms**: Can't create or navigate splits

**Solutions**:

1. **Check keyboard shortcuts**:
   - Ensure no conflicts with other applications
   - Try using the command palette instead

2. **Verify configuration**:
   ```json
   {
     "general": {
       "enableSplitPanes": true
     }
   }
   ```

3. **Reset layout**:
   ```bash
   :layout reset
   ```

4. **Check for UI issues**:
   - Try a different theme
   - Test in safe mode

## 🔌 VS Code Extension Issues

### Issue: Extension not showing in VS Code

**Symptoms**: Extension installed but not visible

**Solutions**:

1. **Check extension host**:
   - Restart VS Code
   - Check `Help > Restart Extension Host`

2. **Verify installation**:
   ```bash
   code --list-extensions | grep rinawarp
   ```

3. **Reinstall extension**:
   ```bash
   code --uninstall-extension rinawarp-terminal-pro
   code --install-extension dist/rinawarp-terminal-pro-1.0.0.vsix
   ```

4. **Check workspace trust**:
   - Ensure workspace is trusted
   - Check VS Code settings for extension restrictions

### Issue: Sidebar panel not visible

**Symptoms**: RinaWarp panel missing from sidebar

**Solutions**:

1. **Show explorer view**:
   - Click the explorer icon in VS Code
   - Or press `Ctrl+Shift+E`

2. **Check extension activation**:
   - Open command palette (`Ctrl+Shift+P`)
   - Type "RinaWarp: Open Dev Dashboard"

3. **Verify settings**:
   ```json
   {
     "rinawarp.showSidebar": true
   }
   ```

4. **Restart VS Code**:
   - Sometimes required for UI updates

### Issue: Dev Dashboard not opening

**Symptoms**: Dashboard command doesn't work

**Solutions**:

1. **Check backend URL**:
   ```json
   {
     "rinawarp.dashboardUrl": "http://localhost:8080/dev-dashboard"
   }
   ```

2. **Verify backend is running**:
   ```bash
   curl http://localhost:8080/dev-dashboard
   ```

3. **Test in browser**:
   - Open the dashboard URL in your browser
   - Ensure it works outside VS Code

4. **Check authentication**:
   - Ensure you're signed in
   - Run "RinaWarp: Sign In" if needed

### Issue: Commands not appearing in palette

**Symptoms**: RinaWarp commands missing from command palette

**Solutions**:

1. **Re-register commands**:
   ```bash
   cd vscode-extension
   npm run compile
   ```

2. **Check extension logs**:
   - Open developer tools in VS Code
   - Look for registration errors

3. **Verify package.json**:
   - Ensure commands are properly defined
   - Check for syntax errors

4. **Restart VS Code completely**:
   - Close all instances
   - Reopen

## 🤖 AI Features Issues

### Issue: AI suggestions not appearing

**Symptoms**: No suggestions when typing commands

**Solutions**:

1. **Enable AI features**:
   ```bash
   :ai on
   ```

2. **Check configuration**:
   ```json
   {
     "ai": {
       "enabled": true,
       "suggestionLevel": "advanced"
     }
   }
   ```

3. **Verify API endpoint**:
   ```json
   {
     "ai": {
       "endpoint": "https://api.rinawarptech.com/ai"
     }
   }
   ```

4. **Test connectivity**:
   ```bash
   curl https://api.rinawarptech.com/ai/health
   ```

5. **Check for errors**:
   - Look at AI service logs
   - Check network requests in dev tools

### Issue: AI suggestions are incorrect

**Symptoms**: Suggestions don't make sense or are irrelevant

**Solutions**:

1. **Adjust suggestion level**:
   ```json
   {
     "ai": {
       "suggestionLevel": "basic"  # or "advanced"
     }
   }
   ```

2. **Provide more context**:
   - Type more complete commands
   - Use natural language queries

3. **Train the AI**:
   - Use more commands to improve suggestions
   - Provide feedback on suggestions

4. **Check for conflicts**:
   - Disable other AI tools
   - Ensure no other extensions interfere

### Issue: AI analysis not working

**Symptoms**: AI doesn't analyze errors or provide fixes

**Solutions**:

1. **Enable auto-analysis**:
   ```json
   {
     "ai": {
       "autoFixEnabled": true
     }
   }
   ```

2. **Check error detection**:
   ```bash
   :ai analyze
   ```

3. **Verify backend integration**:
   - Ensure backend API is accessible
   - Check that error logs are being captured

4. **Test manually**:
   ```bash
   :ai explain "npm install"
   ```

## 🌐 Network and Connectivity

### Issue: Can't connect to backend

**Symptoms**: Connection errors, API timeouts

**Solutions**:

1. **Check backend status**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Verify URL configuration**:
   ```json
   {
     "rinawarp.backendUrl": "http://localhost:3001"
   }
   ```

3. **Check firewall settings**:
   - Ensure port 3001 is open
   - Add exception for Terminal Pro

4. **Test network connectivity**:
   ```bash
   ping localhost
   telnet localhost 3001
   ```

5. **Check for VPN/proxy issues**:
   - Disable VPN if using
   - Configure proxy settings if needed

### Issue: VS Code can't reach Terminal Pro

**Symptoms**: Extension shows "Terminal Pro not connected"

**Solutions**:

1. **Verify Terminal Pro is running**:
   ```bash
   ps aux | grep RinaWarp
   ```

2. **Check connection settings**:
   ```json
   {
     "rinawarp.terminalProPath": "/path/to/app",
     "rinawarp.terminalProPort": 3000
   }
   ```

3. **Test WebSocket connection**:
   - Open browser dev tools
   - Check WebSocket connections

4. **Restart both applications**:
   - Close and reopen both VS Code and Terminal Pro

### Issue: Internet connection required for AI

**Symptoms**: AI features require internet even when disabled

**Solutions**:

1. **Disable AI completely**:
   ```json
   {
     "ai": {
       "enabled": false,
       "useLocalModel": true
     }
   }
   ```

2. **Use offline mode**:
   ```bash
   :ai offline on
   ```

3. **Check for background processes**:
   - Ensure no AI services are running
   - Check running processes

## ⚡ Performance Issues

### Issue: High CPU usage

**Symptoms**: Terminal Pro using excessive CPU

**Solutions**:

1. **Disable AI features**:
   ```bash
   :ai off
   ```

2. **Reduce terminal count**:
   - Close unnecessary tabs
   - Reduce split panes

3. **Simplify configuration**:
   - Use basic theme
   - Disable plugins

4. **Check for runaway processes**:
   ```bash
   top -p $(pgrep -d',' RinaWarp)
   ```

5. **Update Terminal Pro**:
   ```bash
   :update
   ```

### Issue: High memory usage

**Symptoms**: Terminal Pro consuming too much RAM

**Solutions**:

1. **Limit scrollback**:
   ```json
   {
     "general": {
       "scrollbackLines": 1000
     }
   }
   ```

2. **Close sessions**:
   - Save important sessions
   - Close unused tabs

3. **Restart periodically**:
   - Helps free memory
   - Prevents leaks

4. **Check for memory leaks**:
   - Monitor memory over time
   - Report if usage grows continuously

### Issue: Slow terminal response

**Symptoms**: Lag when typing or executing commands

**Solutions**:

1. **Disable input processing**:
   ```json
   {
     "general": {
       "enableInputProcessing": false
     }
   }
   ```

2. **Use simpler shell**:
   - Try bash instead of zsh
   - Disable shell extensions

3. **Reduce features**:
   - Disable AI
   - Disable syntax highlighting

4. **Check system performance**:
   - Ensure sufficient resources
   - Close other applications

## ⚙️ Configuration Problems

### Issue: Configuration file corrupted

**Symptoms**: Settings not saving, errors on startup

**Solutions**:

1. **Backup current config**:
   ```bash
   cp ~/.config/RinaWarp/Terminal\)/config.json ~/.config/RinaWarp/Terminal\)/config.json.bak
   ```

2. **Reset configuration**:
   ```bash
   rm ~/.config/RinaWarp/Terminal\)/config.json
   # Terminal Pro will create a new one
   ```

3. **Validate JSON**:
   ```bash
   python3 -m json.tool ~/.config/RinaWarp/Terminal\)/config.json
   ```

4. **Edit carefully**:
   - Use a JSON validator
   - Make changes incrementally
   - Backup before editing

### Issue: Settings not applying

**Symptoms**: Changes to config.json don't take effect

**Solutions**:

1. **Restart Terminal Pro**:
   ```bash
   rinawarp-terminal-pro --reset
   ```

2. **Check file permissions**:
   ```bash
   chmod 644 ~/.config/RinaWarp/Terminal\)/config.json
   ```

3. **Verify file location**:
   - Ensure editing the correct config file
   - Check for multiple config files

4. **Check for overrides**:
   - Look for environment variables
   - Check command-line arguments

### Issue: Keyboard shortcuts not working

**Symptoms**: Shortcuts don't respond or conflict

**Solutions**:

1. **Check for conflicts**:
   - Other applications using same shortcuts
   - System-wide shortcuts

2. **Rebind shortcuts**:
   ```json
   {
     "keybindings": {
       "newTab": "Ctrl+T",
       "closeTab": "Ctrl+W"
     }
   }
   ```

3. **Use command palette**:
   - Access features without shortcuts
   - `Ctrl+Shift+P` > "RinaWarp: ..."

4. **Reset keybindings**:
   ```bash
   rm ~/.config/RinaWarp/Terminal\)/keybindings.json
   ```

## 🔒 Security and Authentication

### Issue: Authentication fails

**Symptoms**: Can't sign in, authentication errors

**Solutions**:

1. **Check credentials**:
   - Verify email and password
   - Try resetting password

2. **Clear stored credentials**:
   ```bash
   rm ~/.config/RinaWarp/Terminal\)/auth.json
   ```

3. **Check backend status**:
   ```bash
   curl http://localhost:3001/api/vscode/login
   ```

4. **Test authentication flow**:
   - Open login page in browser
   - Ensure it works outside VS Code

### Issue: Token expired or invalid

**Symptoms**: "Invalid token" errors, features locked

**Solutions**:

1. **Sign out and back in**:
   - Run "RinaWarp: Sign Out"
   - Sign in again

2. **Clear tokens**:
   ```bash
   rm ~/.config/RinaWarp/Terminal\)/tokens.json
   ```

3. **Check token expiration**:
   ```bash
   :auth status
   ```

4. **Refresh token**:
   ```bash
   :auth refresh
   ```

### Issue: Permission denied errors

**Symptoms**: Can't access files or features

**Solutions**:

1. **Check file permissions**:
   ```bash
   chmod -R 755 ~/.config/RinaWarp/
   ```

2. **Run as admin (Windows)**:
   - Right-click > "Run as Administrator"

3. **Check app permissions (macOS)**:
   - Go to `System Preferences > Security & Privacy`
   - Add Terminal Pro to Full Disk Access

4. **Check Linux permissions**:
   ```bash
   sudo chown -R $USER:$USER ~/.config/RinaWarp/
   ```

## 🔧 Debugging Tools

### Enable Debug Mode

```bash
# Set environment variable
RINAWARP_TERMINAL_PRO_DEBUG=true rinawarp-terminal-pro

# Or in configuration
{
  "general": {
    "debugMode": true
  }
}
```

### Check Running Processes

```bash
# Linux/macOS
ps aux | grep RinaWarp

# Windows
tasklist | findstr RinaWarp
```

### Monitor Network Activity

```bash
# Linux
sudo tcpdump -i any -n port 3000

# macOS
sudo lsof -i :3000

# Windows
netstat -ano | findstr 3000
```

### Check Log Files

See [Log Files](#log-files) section for locations.

### Use Developer Tools

1. **Terminal Pro**:
   - `Help > Toggle Developer Tools`
   - Check console for errors

2. **VS Code**:
   - `Help > Toggle Developer Tools`
   - Check extension host logs

## 📁 Log Files

### Terminal Pro Logs

| Platform | Log Location |
|----------|--------------|
| Windows | `%APPDATA%\RinaWarp\Terminal Pro\logs\` |
| macOS | `~/Library/Logs/RinaWarp/Terminal Pro/` |
| Linux | `~/.config/RinaWarp/Terminal Pro/logs/` |

### VS Code Extension Logs

- **Extension Host Logs**: `Help > Toggle Developer Tools > Console`
- **Extension Logs**: `~/.vscode/extensions/rinawarp-terminal-pro-*/logs/`

### Backend Logs

- **FastAPI Logs**: Check your backend server logs
- **API Requests**: Monitor with `curl` or Postman

### System Logs

```bash
# Linux
journalctl -u rinawarp-terminal-pro

# macOS
console | grep RinaWarp

# Windows
Event Viewer > Applications and Services Logs > RinaWarp
```

## ❓ FAQ

### General Questions

**Q: How do I completely uninstall Terminal Pro?**
A: Delete the installation directory and configuration files, then remove any system integrations.

**Q: Can I use Terminal Pro without VS Code?**
A: Yes, Terminal Pro works as a standalone application with all core features.

**Q: How do I backup my configuration?**
A: Copy the `~/.config/RinaWarp/Terminal Pro/` directory to a safe location.

**Q: Can I customize the terminal colors?**
A: Yes, edit the theme settings in config.json or use the `:theme` command.

### Installation Questions

**Q: Do I need admin privileges to install?**
A: Yes, for system-wide installation. You can also use portable versions.

**Q: Can I install multiple versions?**
A: Yes, but install them in different directories.

**Q: How do I update Terminal Pro?**
A: Run `:update` in Terminal Pro or download the latest version from the website.

### Usage Questions

**Q: How do I save my terminal sessions?**
A: Use `:session save [name]` to save, `:session load [name]` to restore.

**Q: Can I use my own shell?**
A: Yes, configure it in the settings or use the `:shell` command.

**Q: How do I import my existing terminal settings?**
A: Export your current settings and import them into the RinaWarp config file.

### AI Questions

**Q: How accurate are the AI suggestions?**
A: The AI provides context-aware suggestions based on your code and command history.

**Q: Can the AI write code for me?**
A: Yes, the AI can generate code snippets, suggest fixes, and explain concepts.

**Q: Is my code sent to external servers?**
A: Only when using AI features. You can disable this in settings.

### Integration Questions

**Q: How does VS Code integration work?**
A: Terminal Pro communicates with VS Code via a WebSocket connection and shared configuration.

**Q: Can I use Terminal Pro with other editors?**
A: Currently, only VS Code is officially supported, but the terminal itself works with any editor.

**Q: How do I sync sessions between multiple machines?**
A: Use the cloud sync feature (requires premium subscription).

## 🆘 Support Resources

### Getting Help

#### Community Support

- **GitHub Discussions**: [https://github.com/rinawarp/rinawarp-terminal-pro/discussions](https://github.com/rinawarp/rinawarp-terminal-pro/discussions)
- **Discord Server**: [https://discord.gg/rinawarp](https://discord.gg/rinawarp)
- **Forum**: [https://forum.rinawarptech.com](https://forum.rinawarptech.com)

#### Official Support

- **Email**: support@rinawarptech.com
- **Phone**: +1 (555) 123-4567 (Business hours only)
- **Live Chat**: Available on website during business hours

### Support Resources

- **Documentation**: [https://docs.rinawarptech.com/terminal-pro](https://docs.rinawarptech.com/terminal-pro)
- **FAQ**: [https://docs.rinawarptech.com/terminal-pro/faq](https://docs.rinawarptech.com/terminal-pro/faq)
- **Tutorials**: [https://docs.rinawarptech.com/terminal-pro/tutorials](https://docs.rinawarptech.com/terminal-pro/tutorials)
- **API Reference**: [https://docs.rinawarptech.com/terminal-pro/api](https://docs.rinawarptech.com/terminal-pro/api)

### Professional Services

- **Enterprise Support**: Dedicated support for businesses
- **Custom Development**: Tailored solutions for your needs
- **Training**: On-site or remote training sessions
- **Consulting**: Expert advice for your workflow

### Reporting Issues

1. **Check existing issues** on GitHub
2. **Create a new issue** with detailed information
3. **Include logs** if possible
4. **Describe steps to reproduce**
5. **Provide environment details**

## 🎯 Summary

This comprehensive troubleshooting guide covers the most common issues you might encounter with RinaWarp Terminal Pro. If you can't find a solution here, please contact our support team with:

1. **Descriptive problem statement**
2. **Steps to reproduce**
3. **Log files** (if possible)
4. **Environment details** (OS, version, etc.)

**Happy coding! 🚀**
