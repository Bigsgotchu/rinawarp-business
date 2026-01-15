# VS Code Marketplace Authentication Fix Summary

## Problem Identified

The previous deployment configuration was using a **GitHub Personal Access Token (PAT)** for publishing to the VS Code Marketplace, which is **incorrect** and causes authorization failures.

**GitHub PATs cannot publish VS Code extensions** - they only work for GitHub Packages, GitHub Releases, and GitHub Actions.

## Solution Implemented

Updated all deployment scripts to use **Microsoft Azure DevOps Personal Access Token (PAT)** instead, which is the correct authentication method for VS Code Marketplace publishing.

## Files Modified

### 1. `.env`
- **Changed**: `GITHUB_PAT` → `AZURE_PAT`
- **Updated comments** to reflect Azure DevOps PAT requirements
- **Scope requirement**: Packaging (Read & Write) instead of `write:packages`

### 2. `deploy.sh`
- **Changed**: `GITHUB_PAT` variable check → `AZURE_PAT`
- **Updated**: `vsce publish --pat $GITHUB_PAT` → `vsce publish --pat $AZURE_PAT`

### 3. `scripts/build-and-publish.sh`
- **Changed**: `GITHUB_TOKEN` variable check → `AZURE_PAT`
- **Updated**: `npx vsce publish --pat $GITHUB_TOKEN` → `npx vsce publish --pat $AZURE_PAT`
- **Fixed publisher name**: 'rinawarp' → 'KarinaGilley' (matches package.json)

### 4. `PUBLISHING_GUIDE.md`
- **Comprehensive updates** throughout the document:
  - Changed all references from GitHub PAT to Azure DevOps PAT
  - Added **new section**: "Creating an Azure DevOps PAT" with step-by-step instructions
  - Updated troubleshooting section
  - Updated security best practices
  - Updated resources section with correct documentation links

## Correct Authentication Flow

```
Microsoft Account → Azure DevOps → VS Code Publisher → vsce PAT
```

## How to Create the Correct PAT

1. Go to: https://dev.azure.com/
2. Sign in with your Microsoft account (same as VS Code Marketplace publisher)
3. Click on your profile picture → **Personal Access Tokens**
4. Click **New Token**
5. Configure:
   - **Name**: VS Code Marketplace Publishing
   - **Scope**: **Packaging (Read & Write)**
   - **Expiration**: Set appropriate (e.g., 6 months)
6. Copy the generated token
7. Add to `.env` file as `AZURE_PAT`

## Important Security Notes

- **Never commit `.env`** - It's already in `.gitignore`
- **Never share your PAT**
- **Rotate tokens regularly** (every 6 months recommended)
- **Use least privilege** - Only grant `Packaging (Read & Write)` scope
- **Store securely** - Use a password manager

## Testing the Configuration

To verify the setup works:

```bash
cd rinawarp/apps/vscode-extension
# Test login
vsce login KarinaGilley
# Test publish (dry run)
./deploy.sh
```

## References

- **Azure DevOps PAT Documentation**: https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate
- **VS Code Publishing Guide**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **Marketplace Publisher Dashboard**: https://marketplace.visualstudio.com/manage

## Status

✅ **Fixed**: Authentication method updated from GitHub PAT to Azure DevOps PAT
✅ **Documented**: Comprehensive guide added for creating correct PAT
✅ **Updated**: All deployment scripts modified
✅ **Ready**: Configuration is now correct for VS Code Marketplace publishing
