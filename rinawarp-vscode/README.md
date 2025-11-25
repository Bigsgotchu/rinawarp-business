# <span style="color:#e9007f">RinaWarp Terminal Pro</span>

**AI-Powered Terminal, Code Assistant, and Automation Cockpit — inside VS Code**

The RinaWarp VS Code Extension turns your editor into a full AI terminal environment with:

💬 AI Autocomplete (Copilot-style inline completions)  
🧠 Fix Mode (full-file or selection refactor)  
🎤 Voice Commands  
🔌 Plugin System (JSON manifest plugins like Git Helper, Lint Pro, Deploy Bot)  
📁 File Tree Panel (RinaWarp workspace explorer)  
🖥️ Embedded Terminal with live AI assistance  
🚀 One-Click Deploy (build + deploy + health checks)  
💳 Secure Login with RinaWarp account  
🧰 Dev Tools Panel (owners get advanced debugging & internal tools)

This is the official VS Code companion to  
➡️ [RinaWarp Terminal Pro (Desktop App)](https://rinawarptech.com)  
➡️ [RinaWarp Cloud (api.rinawarptech.com)](https://api.rinawarptech.com)

## ⭐ Features

### ✨ 1. AI Autocomplete (Inline Completions)

Just type — RinaWarp predicts the next code block.  
Works like GitHub Copilot but:

- Multi-model (OpenAI, Claude, Groq, Ollama)
- Faster
- Cheaper
- Private (no data sent to third parties unless you choose a model)

![Autocomplete](media/inline-completion.png)

### 🧹 2. RinaWarp Fix Mode

Two commands:

- **Fix Current File** → full refactor, rewrite, optimize
- **Fix Selected Code** → rewrite only the selection

Perfect for:

- Debugging
- Cleaning ugly code
- Translating syntax
- Adding comments
- Removing dead code
- Enhancing performance

This is powered by your backend's `/api/ai/fix-code`.

![Fix Mode](media/fix-mode.png)

### 🖥️ 3. RinaWarp Control Panel

Integrated sidebar UI with:

- Login screen
- Model switcher
- Plugin manager
- File tree explorer
- Deploy buttons
- Status panel
- "Run Fix Mode" GUI

A full cockpit inside VS Code.

![Control Panel](media/panel.png)

### 🔌 4. Plugin System

Place .json manifests in:

```
~/.rinawarp/plugins/
```

**Example:**

```json
{
  "name": "Git Helper",
  "command": "git status",
  "aiSummary": true,
  "hotkey": "ctrl+alt+g"
}
```

The panel shows them like the VS Code extensions list.

![Plugins](media/plugins.png)

### 📁 5. File Tree Panel

Browse, search, and open files from:

```
~/Documents/RinaWarpWorkspace/
```

Protected sandbox mode ensures security.

![File Tree](media/filetree.png)

### 🚀 6. One-Click Deploy

Use the sidebar button or run:

```
RinaWarp: Deploy Project
```

Automatically runs:

- build
- test
- backend deploy
- website deploy
- health check
- error report
- logs

### 🎤 7. Voice Commands

Start by saying:

- "Rina, deploy this project"
- "Rina, fix this file"
- "Rina, run the test suite"
- "Rina, explain this code"

Hands-free coding.  
Uses your mic safely + locally.

### 🧪 8. Owner Mode

If your license = FOUNDER or OWNER:

You get:

- Debug tab
- Advanced AI models
- File rewriting tools
- Internal API inspector
- Deployment controls
- Plugin dev tools

## 🖥️ Embedded Terminal

Run commands directly in VS Code with live AI assistance:

![Terminal](media/terminal.png)

## ⌨️ Commands + Keybindings (Power User Layout)

### Authentication

| Command              | Default Keybinding |
| -------------------- | ------------------ |
| `RinaWarp: Sign In`  | none               |
| `RinaWarp: Sign Out` | none               |

### AI Autocomplete

| Command                   | Shortcut     |
| ------------------------- | ------------ |
| Request Inline Suggestion | `Ctrl+Alt+\` |
| Accept Inline Suggestion  | `Tab`        |

### Fix Mode

| Command                       | Keybinding   |
| ----------------------------- | ------------ |
| `RinaWarp: Fix Current File`  | `Ctrl+Alt+F` |
| `RinaWarp: Fix Selected Code` | `Ctrl+Alt+S` |

### Panel / Sidebar

| Command                   | Keybinding         |
| ------------------------- | ------------------ |
| `RinaWarp: Open Panel`    | `Ctrl+Alt+R`       |
| `RinaWarp: Open Terminal` | `Ctrl+Alt+T`       |
| `RinaWarp: Refresh Panel` | `Ctrl+Alt+Shift+R` |

### Deployment

| Command                    | Keybinding   |
| -------------------------- | ------------ |
| `RinaWarp: Deploy Project` | `Ctrl+Alt+D` |
| `RinaWarp: Run Build`      | `Ctrl+Alt+B` |

### Plugins

| Command                | Shortcut     |
| ---------------------- | ------------ |
| `RinaWarp: Run Plugin` | `Ctrl+Alt+P` |

### Voice

| Command                         | Shortcut     |
| ------------------------------- | ------------ |
| `RinaWarp: Start Voice Command` | `Ctrl+Alt+V` |

## 🛠️ Backend API Integration

The RinaWarp VS Code Extension integrates seamlessly with your existing RinaWarp backend infrastructure:

### 🔐 Authentication Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/logout` - Session termination
- `GET /auth/me` - Current user information

### 🤖 AI Endpoints

- `POST /api/ai/completions` - Chat completions
- `POST /api/ai/generate` - AI code generation
- `POST /api/ai/inline` - Inline code completion
- `POST /api/ai/fix` - Code fixing and refactoring
- `POST /api/ai/voice` - Voice command processing

### 📁 File Operations

- `GET /api/files/tree` - Directory structure
- `GET /api/files/read` - File content retrieval
- `POST /api/files/write` - File content updates

### 🔌 Plugin System

- `GET /api/plugins` - List available plugins
- `POST /api/plugins/run` - Execute plugin commands

### 🖥️ Shell Operations

- `POST /api/shell/exec` - Secure shell command execution

### 🚀 Deployment

- `POST /api/deploy/run` - Trigger deployment pipeline
- `GET /api/deploy/status` - Deployment status monitoring

### 🧪 System Management

- `GET /api/system/status` - System health checks
- `GET /api/system/logs` - Application logs

## 🚀 Quick Start

1. **Install the Extension**

   ```
   ext install rinawarp.rinawarp-terminal-pro
   ```

2. **Sign In**
   - Open the RinaWarp Control Panel (`Ctrl+Alt+R`)
   - Enter your RinaWarp account credentials
   - Your session is securely stored in VS Code's SecretStorage

3. **Start Coding**
   - Use inline completions as you type
   - Select code and press `Ctrl+Alt+S` for Fix Mode
   - Open the terminal with `Ctrl+Alt+T`

4. **Deploy Projects**
   - Configure your deployment settings
   - Use `Ctrl+Alt+D` for one-click deploy

## 🎯 Use Cases

### For Individual Developers

- **AI-Powered Coding**: Get intelligent suggestions and auto-completion
- **Code Cleanup**: Fix and refactor code with AI assistance
- **Voice Commands**: Hands-free coding and project management
- **Integrated Terminal**: Run commands without leaving your editor

### For Development Teams

- **Consistent Deployment**: One-click deploy with automated checks
- **Plugin Ecosystem**: Extend functionality with custom JSON plugins
- **File Management**: Browse and edit project files through the panel
- **Voice Collaboration**: Hands-free commands for team workflows

### For DevOps Engineers

- **Automated Deployments**: Trigger full build and deploy pipelines
- **System Monitoring**: View deployment status and logs
- **Shell Integration**: Execute commands securely through the backend
- **Plugin Automation**: Run custom scripts and automation tools

## 🔧 Configuration

### Backend URL

Configure your RinaWarp API endpoint in VS Code settings:

```json
{
  "rinawarp.apiBaseUrl": "https://api.rinawarptech.com"
}
```

### Plugin Directory

Place JSON plugin manifests in:

```
~/.rinawarp/plugins/
```

## 🎨 Branding

The extension uses RinaWarp's signature color palette:

- **Hot Pink**: #e9007f
- **Coral**: #ff6f61
- **Teal**: #00ffcc
- **Baby Blue**: #35b5ff
- **Black**: #0a0a0a

## 🔒 Security

- **Secure Authentication**: Tokens stored in VS Code SecretStorage
- **Sandboxed File Access**: Protected workspace browsing
- **Encrypted Communication**: All API calls use HTTPS
- **Local Voice Processing**: Voice commands processed safely

## 🤝 Support

- **Website**: [https://rinawarptech.com](https://rinawarptech.com)
- **Email**: support@rinawarptech.com
- **Documentation**: [docs.rinawarptech.com](https://docs.rinawarptech.com)

## 🏆 License

All Rights Reserved – © 2025 RinaWarp Technologies

---

**RinaWarp Terminal Pro** - Transforming VS Code into your ultimate AI-powered development environment.
