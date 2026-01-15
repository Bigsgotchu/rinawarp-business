# Terminal Pro Build Guide

This document explains how Terminal Pro is built and packaged for distribution.

## 🏗️ Build Process Overview

Terminal Pro is built using a combination of:
- **TypeScript** for type-safe development
- **Webpack** for bundling
- **VS Code Extension API** for integration
- **Electron** for the desktop application (future)

## 📦 Current Build Structure

### What's Currently Built

Terminal Pro currently exists as a **VS Code extension** that:
- Provides a terminal interface
- Integrates with the RinaWarp backend
- Offers AI-assisted features
- Manages authentication and licensing

The extension is built using the VS Code extension API and runs in the VS Code context.

## 🔧 Build Requirements

### Prerequisites
- Node.js 18+
- npm or yarn
- VS Code 1.91.0+

### Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^16.18.126",
    "@types/vscode": "^1.106.1",
    "@typescript-eslint/eslint-plugin": "^5.62.0",
    "@typescript-eslint/parser": "^5.62.0",
    "@vscode/test-electron": "^2.5.2",
    "eslint": "^8.57.1",
    "glob": "^8.1.0",
    "mocha": "^10.8.2",
    "rimraf": "^5.0.10",
    "ts-loader": "^9.5.4",
    "typescript": "^5.9.3",
    "vsce": "^2.15.0",
    "webpack": "^5.103.0",
    "webpack-cli": "^5.1.4"
  },
  "dependencies": {
    "axios": "^1.4.0"
  }
}
```

## 🛠️ Build Commands

### Development Build
```bash
# From the terminal-pro directory
cd rinawarp/apps/terminal-pro

# Install dependencies
npm install

# Start development server (watches for changes)
npm run dev

# Or compile once
npm run compile
```

### Production Build
```bash
# Clean previous builds
npm run clean

# Compile for production
npm run build

# This runs: npm run clean && npm run compile
```

### Build Steps
1. **Clean**: Removes `out` and `dist` directories
2. **Compile**: Runs webpack in production mode
3. **Output**: Creates `dist/extension.js`

## 📁 File Structure

```
rinawarp/apps/terminal-pro/
├── package.json          # Extension manifest
├── webpack.config.js     # Webpack configuration
├── build.sh              # Build script
├── tsconfig.json         # TypeScript configuration
├── src/                  # Source code
│   ├── extension.ts      # Main extension entry point
│   └── ...               # Other source files
├── dist/                 # Build output (created by webpack)
│   └── extension.js      # Bundled extension
└── out/                  # TypeScript compilation output
```

## 🔨 Webpack Configuration

The webpack config is optimized for VS Code extensions:

```javascript
module.exports = {
  target: 'node', // VS Code extensions run in Node.js context
  mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // Exclude VS Code API (provided by runtime)
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['ts-loader']
      }
    ]
  },
  devtool: 'nosources-source-map'
};
```

## 📦 Packaging for Distribution

### Create VSIX Package
```bash
# From the terminal-pro directory
npm run package

# This runs: vsce package
# Output: rinawarp-terminal-pro-2.0.0.vsix
```

### Publish to Marketplace
```bash
npm run publish
# This runs: vsce publish
# Requires VS Code Marketplace publisher credentials
```

## 🚀 Running the Extension

### In VS Code
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Click the three dots → "Install from VSIX..."
4. Select the `.vsix` file
5. Reload VS Code

### Development Mode
```bash
# From the terminal-pro directory
npm run watch

# Then in VS Code:
# 1. Press F5 to launch Extension Development Host
# 2. The extension will reload automatically on changes
```

## 🔄 Development Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Run `npm run watch`** to enable live reloading
3. **Test in VS Code** using Extension Development Host (F5)
4. **Build for production** with `npm run build`
5. **Package** with `npm run package`

## 📝 Notes

### Current Architecture
- Terminal Pro is currently a **VS Code extension**, not a standalone Electron app
- It integrates with the RinaWarp backend via HTTP API
- The extension provides UI and delegates execution to the backend

### Future: Standalone Electron App
The long-term plan is to create a standalone Electron app that:
- Runs the RinaWarp engine locally
- Provides a native terminal interface
- Integrates with VS Code via RPC/WebSocket
- Offers better performance and isolation

### Migration Path
When migrating to Electron:
1. Move core logic from extension to main process
2. Create Electron app with similar UI
3. Maintain VS Code extension as a client
4. Use IPC/WebSocket for communication
5. Gradually phase out the extension-only approach

## 🐛 Troubleshooting

### Build Failures
- **Error**: TypeScript compilation errors
  - **Solution**: Run `npm run compile:check` to see errors
  - **Solution**: Fix TypeScript errors in source files

- **Error**: Webpack bundling errors
  - **Solution**: Check webpack config
  - **Solution**: Ensure all dependencies are installed

- **Error**: VS Code extension not loading
  - **Solution**: Check extension logs
  - **Solution**: Verify `dist/extension.js` exists
  - **Solution**: Reload VS Code

### Runtime Issues
- **Error**: API connection failures
  - **Solution**: Check backend URL in settings
  - **Solution**: Ensure backend is running
  - **Solution**: Verify network connectivity

- **Error**: Authentication failures
  - **Solution**: Check credentials
  - **Solution**: Verify license status
  - **Solution**: Check API logs

## 📞 Support

For build-related issues:
- Check the [FAQ.md](FAQ.md) for common problems
- Review the [TERMINAL_PRO_IMPLEMENTATION.md](TERMINAL_PRO_IMPLEMENTATION.md) for architecture details
- Contact support at support@rinawarp.com

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
