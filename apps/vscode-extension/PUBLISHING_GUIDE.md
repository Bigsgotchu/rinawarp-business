# RinaWarp Brain Pro - Publishing Guide

This guide explains how to publish updates to the RinaWarp Brain Pro VS Code extension.

## Prerequisites

Before publishing, ensure you have:

1. **GitHub Personal Access Token (PAT)** with `write:packages` scope
   - Go to: https://github.com/settings/tokens
   - Create a new token with `write:packages` scope
   - Keep this token secure (it's like a password)

2. **Node.js and npm** installed
3. **vsce** installed globally: `npm install -g vsce`

## Quick Start

The easiest way to publish is using the automated script:

```bash
# Make the script executable (one-time setup)
chmod +x publish-pro.sh

# Publish a patch release (bug fixes)
./publish-pro.sh patch

# Publish a minor release (new features)
./publish-pro.sh minor

# Publish a major release (breaking changes)
./publish-pro.sh major
```

The script will:
1. Prompt for your GitHub PAT
2. Login to VS Code Marketplace
3. Compile TypeScript
4. Package the extension
5. Publish with version bump
6. Show success message

## Manual Publishing

If you prefer to publish manually:

### 1. Compile TypeScript

```bash
npm run compile
```

### 2. Package the Extension

```bash
npm run package
```

This creates a `.vsix` file in the project directory.

### 3. Publish to Marketplace

```bash
# Login (one-time)
echo "YOUR_GITHUB_PAT" | vsce login KarinaGilley

# Publish with version bump
vsce publish patch  # or minor, major
```

## Version Bump Types

- **patch**: `1.0.0` → `1.0.1` (bug fixes, backward compatible)
- **minor**: `1.0.0` → `1.1.0` (new features, backward compatible)
- **major**: `1.0.0` → `2.0.0` (breaking changes)

## Verification

After publishing, verify your extension:

```bash
vsce show KarinaGilley.rinawarp-brain-pro
```

Or visit: https://marketplace.visualstudio.com/items?itemName=KarinaGilley.rinawarp-brain-pro

## Troubleshooting

### Login Failed

If you get "The user is not authorized":
- Verify your GitHub PAT has `write:packages` scope
- Ensure the PAT is not expired
- Check that you're using the correct publisher name: `KarinaGilley`

### Compilation Errors

- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors in the output
- Fix any type or syntax errors before publishing

### Publish Failed

- Check your internet connection
- Verify vsce is installed: `vsce --version`
- Ensure you're logged in: `vsce ls-publishers`

## Security Notes

- Never commit your GitHub PAT to version control
- The `.env` file is gitignored - keep secrets there
- Use `npm run compile` which automatically cleans up `.env` from output

## First-Time Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run compile
   ```

3. Test locally:
   ```bash
   vsce package
   ```

4. Install the `.vsix` file in VS Code to test

## Publishing Workflow

```bash
# 1. Make changes to the code
# 2. Test thoroughly
# 3. Update CHANGELOG.md
# 4. Run the publish script
./publish-pro.sh patch
# 5. Verify on Marketplace
```

## Using the vsce-publish Token

If you have a vsce-publish token (from Azure DevOps), you can use it directly:

```bash
vsce publish patch -p YOUR_VSCE_PUBLISH_TOKEN
```

## Support

For issues with publishing, check:
- [VS Code Extension API Documentation](https://code.visualstudio.com/api)
- [VS Code Marketplace Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce GitHub Repository](https://github.com/microsoft/vscode-vsce)

## License

This extension is published under the MIT License.
