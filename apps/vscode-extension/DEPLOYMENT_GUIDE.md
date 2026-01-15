# VS Code Extension Deployment Guide

## Prerequisites

1. **GitHub Personal Access Token (PAT)**
   - Required for publishing to the VS Code Marketplace
   - Generate one at: https://github.com/settings/tokens
   - Required scopes: `write:packages`
   - The token has already been configured in `.env` file

2. **VS Code Extension Manager (vsce)**
   - Install globally: `npm install -g @vscode/vsce`

3. **Node.js and npm**
   - Node.js 18+ recommended
   - npm 6+

## Deployment Steps

### Option 1: Using the deploy script (recommended)

```bash
cd rinawarp/apps/vscode-extension
./deploy.sh
```

This will:
1. Build the extension
2. Package it into a .vsix file
3. Publish to the VS Code Marketplace using the PAT from .env

### Option 2: Using the build-and-publish script

```bash
cd rinawarp/apps/vscode-extension
./scripts/build-and-publish.sh publish
```

### Option 3: Manual deployment

```bash
cd rinawarp/apps/vscode-extension
npm install
npm run compile
npx vsce package --no-dependencies
npx vsce publish --pat YOUR_GITHUB_TOKEN
```

## Security Notes

- The `.env` file is in `.gitignore` to prevent accidental commitment
- Never share your PAT
- If you suspect your PAT has been compromised, revoke it immediately at https://github.com/settings/tokens
- Consider using a dedicated PAT for this extension only

## Troubleshooting

**Error: "Personal Access Token is required"**
- Ensure `.env` file exists with valid `GITHUB_TOKEN`
- Check that the token has the `write:packages` scope

**Error: "Unable to publish"**
- Verify your token is not expired
- Check that you have publish rights for the `rinawarp` publisher
- Ensure the extension name is available (no conflicts)

## First-time Setup

If this is your first time publishing:
1. Create a publisher account at https://marketplace.visualstudio.com/manage
2. Use the publisher name `rinawarp`
3. Ensure your GitHub account is linked to the publisher
