# Cleanup Guide

This guide explains how to maintain a clean, professional repository structure.

## 🧹 What to Ignore

VS Code and Git should ignore these files:

```
node_modules/  # Dependencies (3600+ files)
dist/         # Build output
*.log         # Log files
package-lock.json  # Auto-generated
.env          # Environment variables
```

## ✅ What to Version Control

Only keep these files in your repository:

```
src/          # TypeScript/JavaScript source code
assets/       # Icons, images, and other static files
package.json  # Project dependencies and metadata
tsconfig.json # TypeScript configuration
*.sh          # Shell scripts
*.md          # Documentation
```

## 🚀 Setup Script

Run `./auto-setup.sh` to:

1. Delete old `node_modules` and `dist`
2. Install all dependencies
3. Auto-detect and install missing TypeScript type definitions
4. Compile TypeScript
5. Launch the Electron app

## 🔍 VS Code Settings

Create `.vscode/settings.json` to exclude files from indexing:

```json
{
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/*.log": true,
    "**/package-lock.json": true,
    "**/.env": true
  }
}
```

## 📦 Git Ignore

The `.gitignore` file already excludes:

```
node_modules/
dist/
*.log
package-lock.json
.env
.vscode/
```

## 💡 Professional Workflow

1. **Treat `node_modules` as invisible infrastructure**
2. **Only version control source code**
3. **Let setup scripts rebuild everything**
4. **Keep your repository small**

## 🔧 Optional: Use pnpm

For even lighter installations, use pnpm instead of npm:

```bash
npm install -g pnpm
pnpm install
```

pnpm stores dependencies in a single global cache instead of duplicating them per project.

## 📊 Repository Size

After cleanup:
- **Before**: 3600+ files
- **After**: ~100-200 essential files

This makes your repository faster to clone, easier to navigate, and more professional.
