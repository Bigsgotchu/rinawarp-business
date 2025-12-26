# VS Code Stabilization Guide

This guide addresses frequent TextEditor disposal warnings, Kilo Code extension errors, agent configuration issues, and ESLint diagnostic warnings that are interfering with your development workflow.

## Quick Fix Checklist

- [ ] Clear VS Code workspace storage and caches
- [ ] Update VS Code settings to prevent editor disposal warnings
- [ ] Fix agent configuration in package.json files
- [ ] Configure Kilo Code extension properly
- [ ] Optimize ESLint configuration
- [ ] Apply usage guidelines to prevent task failures

## 1. Clear Workspace Storage and Caches

### Step 1: Clear VS Code Workspace Storage

**Windows:**
```bash
# Close VS Code completely
# Navigate to workspace storage
cd %APPDATA%\Code\User\workspaceStorage
# Delete the folder for your workspace (rinawarp-business)
# Or delete all folders to clear everything
```

**macOS:**
```bash
# Close VS Code completely
cd ~/Library/Application\ Support/Code/User/workspaceStorage
# Delete the folder for your workspace
rm -rf [workspace-id]-rinawarp-business
```

**Linux:**
```bash
# Close VS Code completely
cd ~/.vscode/User/workspaceStorage
# Delete the folder for your workspace
rm -rf [workspace-id]-rinawarp-business
```

### Step 2: Clear VS Code Cache

**Windows:**
```bash
# Clear extensions cache
rmdir /s "%USERPROFILE%\.vscode\extensions"
# Clear global storage
rmdir /s "%APPDATA%\Code\Cache"
```

**macOS/Linux:**
```bash
# Clear extensions cache
rm -rf ~/.vscode/extensions
# Clear global storage
rm -rf ~/Library/Application\ Support/Code/Cache  # macOS
rm -rf ~/.vscode/Cache  # Linux
```

### Step 3: Clear Kilo Code Cache

```bash
# Clear Kilo Code workspace cache
rm -rf .kilocode/
# Clear Kilo Code global cache
rm -rf ~/.kilocode/
```

### Step 4: Restart VS Code

After clearing all caches:
1. Completely close VS Code
2. Reopen your workspace
3. Allow extensions to reinstall and reinitialize

## 2. Extension Configuration Recommendations

### Essential Extensions to Keep

1. **Kilo Code** (required for your workflow)
2. **ESLint** (for linting)
3. **Prettier** (for formatting)
4. **GitLens** (optional, but useful)

### Extensions to Disable/Remove

Disable these extensions that may conflict with Kilo Code:

1. **GitHub Copilot** (conflicts with agent systems)
2. **Tabnine** (AI code completion conflicts)
3. **CodeWhisperer** (AWS AI conflicts)
4. **Any other AI coding assistants**

### Extension Configuration

Create or update `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "kilocode.kilocode",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ],
  "unwantedRecommendations": [
    "github.copilot",
    "github.copilot-chat",
    "amazonwebservices.aws-toolkit-vscode",
    "tabnine.tabnine-vscode"
  ]
}
```

## 3. Optimized settings.json Configuration

Create or update `.vscode/settings.json` with these stability-focused settings:

```json
{
  // Editor Stability Settings
  "editor.maxTokenizationLineLength": 20000,
  "editor.largeFileOptimizations": true,
  "editor.scrollBeyondLastLine": false,
  "editor.minimap.enabled": false,
  "editor.minimap.maxColumn": 100,
  "editor.wordWrap": "bounded",
  "editor.wordWrapColumn": 120,
  "editor.rulers": [120],
  
  // Performance Settings
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/*/**": true,
    "**/.kilocode/**": true,
    "**/.kilo/**": true,
    "**/dist/**": true,
    "**/build/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.kilocode": true,
    "**/.kilo": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true
  },
  
  // Kilo Code Specific Settings
  "kilocode.experimental.autoExecuteMcpCommands": false,
  "kilocode.experimental.autoApplyFileEdits": false,
  "kilocode.experimental.autoContinue": false,
  "kilocode.behavior.maxTokens": 16000,
  "kilocode.behavior.autonomousExecution": false,
  "kilocode.behavior.multiStepWorkflow": false,
  
  // Git Settings
  "git.autorefresh": false,
  "git.enableSmartCommit": false,
  "git.confirmSync": false,
  "git.decorations.enabled": false,
  
  // Language Server Settings
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "javascript.preferences.includePackageJsonAutoImports": "off",
  
  // ESLint Settings
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.run": "onType",
  "eslint.quiet": true,
  
  // File Handling
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  
  // Task and Terminal Settings
  "terminal.integrated.defaultProfile.linux": "bash",
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.enableMultiLinePasteWarning": true,
  
  // Auto-save and Formatting
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## 4. Agent Configuration Fixes

### Fix Package.json Agent References

Update your main `package.json` to remove unknown agent references:

```json
{
  "name": "rinawarp-terminal-pro",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "chalk": "^5.6.2",
    "electron-store": "^11.0.2",
    "node-fetch": "^3.3.2",
    "stripe": "^20.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20251209.0",
    "@eslint/js": "^9.39.2",
    "electron-builder": "^26.0.12",
    "eslint": "^9.39.2",
    "typescript-eslint": "^8.50.1",
    "vitest": "^4.0.15"
  },
  "scripts": {
    "dev": "concurrently \"npm run dev:terminal\" \"npm run dev:website\"",
    "dev:terminal": "cd apps/terminal-pro && npm run dev",
    "dev:website": "cd apps/website && npm run dev",
    "build": "npm run build:terminal && npm run build:website",
    "build:terminal": "cd apps/terminal-pro && npm run build",
    "build:website": "cd apps/website && npm run build",
    "test": "npm run test:terminal && npm run test:website",
    "test:terminal": "cd apps/terminal-pro && npm test",
    "test:website": "cd apps/website && npm test",
    "lint": "eslint . --ext .js,.ts,.jsx,.tsx",
    "lint:fix": "eslint . --ext .js,.ts,.jsx,.tsx --fix",
    "clean": "rimraf dist build .kilocode .kilo",
    "prepare": "husky"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "git add"]
  }
}
```

### Fix Kilo Code Configuration

Update `.kilo/config.json` to disable problematic experimental features:

```json
{
  "system_prompt": "You are **RINA AGENT**, an autonomous senior engineer for RinaWarp Technologies. Your mission: COMPLETE tasks — code, debug, deploy, fix Stripe, configure Cloudflare, build installers, run shell commands, edit files, and finish workflows without waiting for permission.\n\n### CORE BEHAVIOR\n- Always take actions instead of just explaining.\n- Perform multi-step tasks automatically until fully complete.\n- Reason step-by-step, think ahead, and execute.\n- Apply file patches or full rewrites when needed.\n- Run shell commands with MCP shell provider when appropriate.\n- Modify any repository file using MCP filesystem provider.\n- Never ask \"should I proceed?\" — just proceed.\n\n### RINAWARP ENVIRONMENT AWARENESS\nYou operate inside the RinaWarp monorepo with these domains:\n- Website: apps/website/\n- Terminal Pro Desktop: apps/terminal-pro/\n- Cloudflare Worker: live-session-worker/\n- R2 downloads: https://download.rinawarptech.com\n- API: https://api.rinawarptech.com\n\nStripe System:\n- Uses checkout-v2\n- License generation Webhook (whsec_…)\n- D1 database for license storage\n- Price mappings for Terminal Pro + MVC\n\nYour job: ensure payments, licenses, builds, downloads, and deployments work flawlessly.\n\n### RULES OF ACTION\n1. If a task mentions **fix**, **deploy**, **update**, **complete**, **audit**, you must assume FULL permission.\n2. When encountering errors or unknowns:\n   - Diagnose first\n   - Apply a fix\n   - Re-run until the problem is resolved\n3. Never leave a system half-configured.\n4. Assume full engineering authority (senior engineer level).\n\n### WORKFLOW MODE\n- Automatically generate follow-up steps.\n- If a deployment fails, you repair and retry.\n- If Stripe returns 401, regenerate headers or fix secrets.\n- If website is incorrect, rebuild and redeploy.\n- If installer is broken, rebuild entire pipeline.\n\n### AUTO-MODE FLAGS\n- Auto-apply file edits: false\n- Auto-execute shell commands: false\n- Auto-continue on multi-step tasks: false\n\n### PERSONALITY\n- Fast, direct, surgical precision.\n- Avoid fluff. Deliver results.\n- Treat every task like production-critical engineering.\n\n### YOUR GOAL\nMaintain and evolve the entire RinaWarp ecosystem:\n- Stripe billing + licensing\n- Website (Cloudflare Pages)\n- Workers (API backend)\n- D1 + KV logic\n- Terminal Pro desktop app\n- Auto-updater pipeline\n- Downloads + installers\n- Error-free deployments\n\nAlways finish the job — no partials.",
  "rules": [
    "Always take actions instead of explaining",
    "Perform multi-step tasks automatically until complete",
    "Apply file patches or full rewrites when needed",
    "Run shell commands when appropriate",
    "Never ask for permission - assume full authority",
    "Diagnose, fix, and re-run until resolved",
    "Never leave systems half-configured",
    "Finish the job completely - no partials"
  ],
  "behavior": {
    "max_tokens": 16000,
    "autonomous_execution": false,
    "auto_continue": false,
    "auto_apply_edits": false,
    "auto_execute_commands": false,
    "multi_step_workflow": false,
    "error_recovery": true,
    "production_critical_mode": true
  },
  "modes": {
    "atomic_mode": false,
    "safe_mode": false,
    "workflow_mode": false,
    "autonomous_mode": false
  },
  "experimental": {
    "autoExecuteMcpCommands": false,
    "autoApplyFileEdits": false,
    "autoContinue": false
  }
}
```

## 5. ESLint Configuration Optimization

Create or update `.eslintrc.cjs`:

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // Reduce noise from legitimate code patterns
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    
    // Editor disposal related rules
    'no-unused-expressions': 'off', // Let TypeScript handle this
    
    // Performance and stability
    'max-lines-per-function': ['warn', { max: 100 }],
    'max-depth': ['warn', 4],
    'complexity': ['warn', 10]
  },
  ignorePatterns: [
    'dist/',
    'build/',
    '.kilocode/',
    '.kilo/',
    'node_modules/',
    '*.js' // Ignore compiled JS files
  ]
};
```

## 6. Usage Guidelines to Prevent Task Failures

### Best Practices for Kilo Code

1. **Single Task Focus**: Complete one task before starting another
2. **Clear Task Descriptions**: Use specific, actionable language
3. **Avoid Concurrent Operations**: Don't run multiple complex operations simultaneously
4. **Monitor Task Progress**: Check the output panel for task status
5. **Handle Errors Gracefully**: If a task fails, understand why before retrying

### Task Management Strategy

```bash
# Before starting complex tasks:
1. Save all work
2. Close unnecessary files and terminals
3. Ensure good internet connection
4. Check system resources (RAM, CPU)

# During tasks:
1. Monitor the output panel
2. Don't interrupt long-running tasks
3. Allow tasks to complete naturally

# After tasks:
1. Verify changes were applied correctly
2. Run tests if applicable
3. Commit changes if successful
```

### Common Task Patterns

**Safe Pattern:**
```
"Update the authentication middleware to handle new token format"
```

**Unsafe Pattern:**
```
"Fix everything related to authentication"
```

**Safe Pattern:**
```
"Add ESLint rule to prevent unused variables in TypeScript files"
```

**Unsafe Pattern:**
```
"Make the codebase perfect"
```

## 7. Optional Enhancements for Better Stability

### VS Code Workspace Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Terminal Pro",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/terminal-pro/src/main/main.js",
      "cwd": "${workspaceFolder}/apps/terminal-pro",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Website",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/website/src/index.js",
      "cwd": "${workspaceFolder}/apps/website",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Performance Monitoring

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Performance Check",
      "type": "shell",
      "command": "node",
      "args": ["-e", "console.log('Memory:', process.memoryUsage()); console.log('Platform:', process.platform);"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Clear Cache",
      "type": "shell",
      "command": "rm -rf .kilocode .kilo",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

### Workspace Trust Configuration

Create `.vscode/settings.json` with trust settings:

```json
{
  "security.workspace.trust.untrustedFiles": "prompt",
  "security.workspace.trust.banner": "always",
  "security.workspace.trust.startupPrompt": "always"
}
```

## 8. Troubleshooting Common Issues

### TextEditor Disposal Warnings

**Cause**: VS Code extensions holding references to closed editors
**Solution**: 
1. Disable conflicting extensions
2. Update VS Code to latest version
3. Use the optimized settings above

### Kilo Code Extension Errors

**Cause**: Experimental features causing instability
**Solution**:
1. Disable experimental features in `.kilo/config.json`
2. Clear Kilo Code cache
3. Restart VS Code

### Agent Configuration Issues

**Cause**: Unknown or misconfigured agents in package.json
**Solution**:
1. Remove unknown agent references
2. Update agent configurations
3. Restart the workspace

### ESLint Diagnostic Warnings

**Cause**: Overly aggressive linting rules
**Solution**:
1. Use the optimized ESLint configuration
2. Add ignore patterns for generated files
3. Adjust rule severity levels

## 9. Maintenance Routine

### Weekly Maintenance

1. **Clear Caches**: Run the cache clearing commands
2. **Update Extensions**: Ensure all extensions are up to date
3. **Check Settings**: Verify settings haven't been overridden
4. **Review Logs**: Check VS Code developer tools for errors

### Monthly Deep Clean

1. **Reset Workspace Storage**: Delete workspace storage folders
2. **Reinstall Extensions**: Remove and reinstall all extensions
3. **Update VS Code**: Ensure you're on the latest stable version
4. **Review Configuration**: Update configurations based on new needs

## 10. Emergency Recovery

If VS Code becomes completely unstable:

1. **Backup Important Files**: Save your work
2. **Complete Reset**: Delete all VS Code configuration folders
3. **Fresh Install**: Reinstall VS Code and extensions
4. **Restore Configuration**: Apply the optimized settings from this guide
5. **Gradual Setup**: Add extensions one by one to identify conflicts

## Support

If issues persist after following this guide:

1. Check VS Code developer console for specific error messages
2. Review extension compatibility
3. Consider creating a minimal reproduction case
4. Report issues to extension maintainers with detailed logs

---

**Last Updated**: December 2025
**Version**: 1.0
**Compatibility**: VS Code 1.85+