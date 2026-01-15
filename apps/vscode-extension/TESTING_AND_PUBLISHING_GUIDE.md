# RinaWarp Brain Pro - Testing & Publishing Guide

## 🎯 Overview
This guide provides step-by-step instructions for testing the Pro features locally and publishing to the VS Code Marketplace.

## 🧪 Local Testing

### Prerequisites
- Node.js (v18+ recommended)
- VS Code with Extension Development Host
- npm or yarn

### Step 1: Start the License Server
The license server provides mock license validation for testing:

```bash
node licenseServer.js
```

This will start the server on `http://localhost:3000` with the following test licenses:
- `PRO-1234-5678-9012` (expires 2026-12-31)
- `PRO-ABCD-EFGH-IJKL` (expires 2027-06-30)

### Step 2: Launch VS Code with Extension
Open VS Code and load the extension in development mode:

```bash
code --extensionDevelopmentPath=. .
```

### Step 3: Test Free Features
Before activation, test that these commands work:
- All existing RinaWarp commands should be available
- Pro commands should NOT be visible in the command palette

### Step 4: Activate Pro License
1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Run: `Activate RinaWarp Pro License`
3. Enter one of the test license keys:
   - `PRO-1234-5678-9012`
   - `PRO-ABCD-EFGH-IJKL`
4. You should see: `✅ RinaWarp Pro Activated!`

### Step 5: Test Pro Features
After activation, test these Pro-only commands:

#### Approval Flow
1. Run: `Approval Flow`
2. A webview panel should open with:
   - Change request #42 (src/extension.ts)
   - Change request #43 (src/rinawarpClient.ts)
   - Approve/Reject buttons for each
3. Test both approve and reject actions

#### Cryptographic Verification
1. Run: `Cryptographic Verification`
2. Should show: `🔐 Performing cryptographic verification...`
3. After 2 seconds: `✅ Verification complete. All files are cryptographically secure.`

#### Cloud Sync
1. Run: `Cloud Sync`
2. Should show: `☁️ Syncing with RinaWarp Cloud...`
3. After 3 seconds: `✅ Cloud sync complete. All data synchronized.`

### Step 6: Test License Removal
1. Delete the license file (location shown in licenseManager.ts)
2. Restart VS Code
3. Pro commands should no longer be available
4. Activate again to verify the flow works

## 📦 Publishing Preparation

### Step 1: Verify Package
Ensure the extension package is ready:

```bash
npm run package
```

This creates: `rinawarp-brain-pro-1.0.0.vsix` (2MB)

### Step 2: Check Git Status
Verify secrets are NOT committed:

```bash
git status --short
```

✅ Expected: `.env` should NOT appear in the output
✅ Expected: All secrets are gitignored

### Step 3: Update Version (Optional)
If releasing after previous versions, update `package.json`:

```json
"version": "1.0.1"  // Patch
"version": "1.1.0"  // Minor
"version": "2.0.0"  // Major
```

Then run:
```bash
npm run package
```

### Step 4: Remove Test Licenses (Optional)
Before public release, you may want to remove test licenses from `licenseServer.js`:

```javascript
// Remove or comment out test licenses
const validLicenses = {
    // PRO-1234-5678-9012: { valid: true, expires: '2026-12-31' },
    // PRO-ABCD-EFGH-IJKL: { valid: true, expires: '2027-06-30' }
};
```

## 🚀 Publishing Options

### Option 1: Manual Upload to Marketplace
1. Go to: https://marketplace.visualstudio.com/manage
2. Click: "New extension"
3. Upload: `rinawarp-brain-pro-1.0.0.vsix`
4. Fill in extension details
5. Submit for review

### Option 2: Command Line Publishing

#### Prerequisites
Install VS Code Extension Manager:
```bash
npm install -g @vscode/vsce
```

#### Login to Publisher Account
```bash
vsce login KarinaGilley
```

#### Publish
```bash
# For version bump (1.0.0 → 1.0.1)
vsce publish patch

# For minor release (1.0.0 → 1.1.0)
vsce publish minor

# For major release (1.0.0 → 2.0.0)
vsce publish major

# For new extension (creates new listing)
vsce publish
```

#### GitHub PAT Requirements
Your GitHub Personal Access Token (PAT) needs:
- `write:packages` scope
- `repo` scope (for private repositories)

### Option 3: Using publish-safe.sh
The `publish-safe.sh` script automates publishing:

```bash
./publish-safe.sh patch
```

This script:
1. Compiles the extension
2. Packages the .vsix file
3. Removes secrets
4. Publishes to Marketplace
5. Creates git tag
6. Pushes to GitHub

## 💰 Monetization Strategy

### License-Gated Features
- **Free Tier**: All existing RinaWarp features
- **Pro Tier**: Approval Flow, Cryptographic Verification, Cloud Sync

### License Distribution
1. User purchases license via Stripe (or other payment processor)
2. Payment processor generates license key
3. Store mapping in `licenseServer.js` or cloud-hosted API
4. User enters key in VS Code via `Activate RinaWarp Pro License`
5. Extension validates with your license server
6. Pro features unlock

### Marketplace Listing Options

#### Option A: Free Base Extension + Pro Upgrade
1. Publish `rinawarp-brain` (free) on Marketplace
2. Provide link to purchase Pro license
3. Users activate Pro within the extension

#### Option B: Pro-Only Listing
1. Publish `rinawarp-brain-pro` as paid extension
2. Require license activation on first launch
3. All features gated behind license

## 🔒 Security Checklist

### Before Publishing
- [x] `.env` file is gitignored
- [x] No secrets in source code
- [x] No API keys in package.json
- [x] No hardcoded credentials
- [x] License validation uses external API
- [x] Test licenses can be removed before release

### Best Practices
- Use environment variables for all secrets
- Never commit `.env` to version control
- Use different keys for development vs production
- Rotate API keys regularly
- Monitor license validation endpoint

## 📊 Post-Publishing

### Version Management
After publishing, create a git tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Update Documentation
Update `CHANGELOG.md` with:
- New features
- Bug fixes
- Breaking changes
- Version number

### Marketplace Listing
Update Marketplace listing with:
- Screenshots of Pro features
- Clear feature comparison (Free vs Pro)
- Pricing information
- Support contact

## 🆘 Troubleshooting

### Extension Not Loading
1. Check VS Code developer console (Help > Toggle Developer Tools)
2. Verify `out/extension.js` exists
3. Check for TypeScript compilation errors
4. Restart VS Code

### License Validation Failing
1. Ensure license server is running (`node licenseServer.js`)
2. Check network connectivity
3. Verify license key format
4. Check server logs for errors

### Pro Commands Not Available
1. Verify license is activated
2. Check `isProActive()` returns true
3. Restart VS Code
4. Check extension logs

### Publishing Fails
1. Verify `vsce` is installed globally
2. Check you're logged in (`vsce login KarinaGilley`)
3. Ensure version number is unique
4. Check package.json is valid JSON

## 📞 Support

### For Users
- GitHub Issues: https://github.com/Bigsgotchu/rinawarp-business/issues
- Marketplace Reviews: Respond to user feedback
- Email: support@rinawarptech.com

### For Developers
- Review the code in `src/` directory
- Check `PRO_FEATURES_SUMMARY.md` for implementation details
- Consult `licenseManager.ts` for license validation logic

## ✅ Next Steps

1. **Test locally** with the license server
2. **Verify all Pro features** work correctly
3. **Update version** in package.json if needed
4. **Package the extension** (`npm run package`)
5. **Publish** using your preferred method
6. **Monitor** Marketplace for user feedback
7. **Iterate** based on user needs

---

**Last Updated**: 2026-01-15
**Publisher**: KarinaGilley
**Extension**: RinaWarp Brain Pro