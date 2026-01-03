# Windows Release Workflow Setup Guide

## ✅ Current Status

Your Windows release workflow file already exists at:
`desktop/.github/workflows/release-r2-win.yml`

This workflow includes:
- Windows-only build on windows-latest
- Anti-poisoning checks (prevents AppImage references)  
- Proper variable and secret handling
- Dry-run support for safe testing
- R2 upload with validation
- Public endpoint verification

## 🚀 Step 1: Add Workflow to GitHub Repository

### Option A: GitHub Web UI (Recommended - No Git Issues)

1. **Open your repository in GitHub** (the one you want Actions to run in)

2. **Navigate to Actions**
   - Go to the "Actions" tab
   - If Actions are disabled, click "Enable Actions"

3. **Add the workflow file**
   - Go to `Code` → `.github/workflows/`
   - Click "Add file" → "Create new file"
   - Name it: `.github/workflows/release-r2-win.yml`
   - Copy the entire contents from `desktop/.github/workflows/release-r2-win.yml` in your local repo
   - Commit directly to main branch

### Option B: If You Can Push Without Issues

```bash
# Copy the workflow file to the right location
mkdir -p .github/workflows/
cp desktop/.github/workflows/release-r2-win.yml .github/workflows/

# Commit and push
git add .github/workflows/release-r2-win.yml
git commit -m "Add Windows release workflow for R2 deployment"
git push origin main
```

## 🔐 Step 2: Configure GitHub Actions Variables and Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions**

### Variables (Not Secrets)
```
R2_BUCKET = rinawarp-downloads
R2_ACCOUNT_ID = ba2f14cefa19dbdc42ff88d772410689
```

### Secrets
```
R2_ACCESS_KEY_ID = [your-r2-access-key-id]
R2_SECRET_ACCESS_KEY = [your-r2-secret-access-key]
```

## 🧪 Step 3: Test with Dry Run

1. **Go to Actions tab in GitHub**
2. **Select "Release (R2) — Windows" workflow**
3. **Click "Run workflow"**
4. **Configure parameters:**
   - `channel`: `stable`
   - `dry_run`: `true` ✅ (Important for first test)

## ✅ Step 4: Verify Dry Run Success

The dry run should:
- ✅ Build Windows installer successfully
- ✅ Create `latest.yml` with Windows references only
- ✅ NOT upload anything to R2
- ✅ Show "✅ Windows outputs look sane"

## 🚀 Step 5: Real Deployment

After dry run success:
1. **Run workflow again**
2. **Set `dry_run`: `false`**
3. **Monitor the upload process**

## 🔍 Step 6: Verification Commands

### Check Windows Updater Works
```bash
# Verify latest.yml exists and references .exe (not AppImage)
curl -fsSL https://download.rinawarptech.com/terminal-pro/stable/latest.yml | sed -n '1,120p'

# Check for Windows-specific files
curl -fsSL https://download.rinawarptech.com/terminal-pro/stable/latest.yml | grep -Ei '\.exe|\.msi|AppImage'
```

**Expected Results:**
- ✅ Contains `.exe` (NSIS installer)
- ❌ Must NOT contain `AppImage`
- ✅ Valid Windows-specific metadata

### Check Installer Accessibility
```bash
# Replace filename with actual from latest.yml
curl -I https://download.rinawarptech.com/terminal-pro/stable/RinaWarp-Terminal-Pro-Setup-[version]-x64.exe
```

## 🛠 Troubleshooting

### Common Issues

#### 1. Missing Variables/Secrets
**Error**: "❌ Missing: R2_BUCKET (Actions Variables)"
**Solution**: Ensure variables and secrets are set in GitHub repository settings

#### 2. No Windows Installer Produced
**Error**: "❌ No Windows installer produced (.exe/.msi/.zip)"
**Solution**: Check electron-builder configuration and Windows build scripts

#### 3. Poisoned Metadata
**Error**: "❌ Poisoned metadata: latest.yml references Linux artifacts"
**Solution**: This should be prevented by the workflow validation

#### 4. Upload Failures
**Error**: R2 upload authentication failures
**Solution**: Verify R2 credentials and bucket permissions

## 📊 Success Indicators

When working correctly, you should see:

1. **GitHub Actions**: Successful workflow runs
2. **R2 Storage**: Windows files uploaded to `terminal-pro/stable/`
3. **Public Endpoint**: `latest.yml` accessible with Windows metadata
4. **No Cross-Contamination**: Windows `latest.yml` contains only Windows references

## 🎯 What This Fixes

This workflow specifically addresses:
- ✅ Windows auto-updater broken (missing latest.yml)
- ✅ Cross-platform contamination (AppImage references in Windows)
- ✅ GitHub Actions failures (missing secrets/variables)
- ✅ Upload authentication issues
- ✅ No Windows artifacts in R2

## 📞 Next Steps After Setup

Once the workflow is running successfully:

1. **Test Windows auto-updater** in your application
2. **Verify download links** work from the website
3. **Monitor for any issues** in the first few releases
4. **Consider adding similar workflows** for macOS if needed

---

**Note**: This workflow is designed to work alongside your existing Linux uploads without conflicts. It only uploads Windows-specific files to the same R2 bucket but different file types.