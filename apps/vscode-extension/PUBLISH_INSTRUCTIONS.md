# VS Code Extension Publishing Instructions

## ✅ Quick Start (Recommended)

### 1. Verify Publisher
```bash
cd rinawarp/apps/vscode-extension
cat package.json | grep '"publisher"'
```
Should show: `"publisher": "KarinaGilley"`

### 2. Login to Marketplace (One-Time Setup)
```bash
vsce login KarinaGilley
```
When prompted, paste your Azure DevOps PAT:
```
REPLACE_WITH_ACTUAL_PAT
```

**Scope required**: Marketplace → Manage

### 3. Package (Optional but Recommended)
```bash
vsce package
```
Creates: `rinawarp-brain-0.1.2.vsix`

### 4. Publish to Marketplace 🚀
```bash
vsce publish
```
Success looks like:
```
✔ Published KarinaGilley.rinawarp-brain
```

## 📍 Where It Appears

Within 1-5 minutes:
https://marketplace.visualstudio.com/items?itemName=KarinaGilley.rinawarp-brain

Searchable by:
- rinawarp
- cryptographic
- approval flow
- developer tools

## 🔐 Security Notes

✅ **Token stored securely** in system keychain (not in `.env`)
✅ **No token in version control** (`.env` is in `.gitignore`)
✅ **One-time setup** - login only needed once per machine
✅ **Safe** - does not affect VS Code settings or extensions

## 🛠️ Alternative: Using .env (Not Recommended)

If you prefer environment variables:

1. Edit `.env`:
```
AZURE_PAT=your-token-here
```

2. Publish:
```bash
vsce publish --pat $AZURE_PAT
```

## 💰 Monetization Strategy

VS Code Marketplace doesn't support paid extensions directly. Instead, use:

- **Free extension** with premium features
- **License keys** via external payment (Stripe)
- **SaaS backend** for advanced functionality
- **Pro tiers** with additional capabilities

Your extension already has the right foundation:
- Approval flows
- Cryptographic plans
- MCP tooling
- Pro-style UX

## 📚 Next Steps After Publishing

1. **Add license verification** (for monetization)
2. **Create pricing tiers**
3. **Set up Stripe integration**
4. **Add "Pro Mode" toggle**
5. **Optimize Marketplace description** for conversions

## 🔧 Troubleshooting

### "Personal Access Token is required"
```bash
vsce login KarinaGilley
# Paste your PAT when prompted
vsce whoami  # Verify login
```

### "Publisher not found"
- Verify publisher name in `package.json` matches exactly
- Ensure you're logged in with the correct account

### "Extension already exists"
- You're publishing an update - this is normal
- Use `vsce publish patch` for version bumps

## 📖 References

- **Azure DevOps PAT**: https://dev.azure.com/
- **vsce Documentation**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **Marketplace Dashboard**: https://marketplace.visualstudio.com/manage

---

**Ready to publish?** Just run:
```bash
cd rinawarp/apps/vscode-extension
vsce login KarinaGilley
vsce publish
```

That's it! 🎉