# GitHub Actions Release Pipeline Setup Guide

## RinaWarp Terminal Pro - Windows Release Configuration

This guide provides step-by-step instructions for setting up GitHub Actions for RinaWarp Terminal Pro release pipeline, specifically focusing on Windows releases.

## 🎯 Overview

The setup ensures that:

- Windows releases are properly built and uploaded to R2
- Only Windows-specific files are uploaded (prevents cross-platform poisoning)
- GitHub Actions secrets and variables are properly configured
- Dry-run testing is available for safe validation

## 📋 Prerequisites

- GitHub repository access with admin permissions
- R2 bucket: `rinawarp-downloads`
- R2 account ID: `ba2f14cefa19dbdc42ff88d772410689`
- R2 access credentials (access key and secret)

## 🔧 Step 1: Configure GitHub Repository Settings

### Set GitHub Variables

Navigate to: **GitHub → Settings → Secrets and variables → Actions**

**Variables (not secrets):**

```
R2_BUCKET = rinawarp-downloads
R2_ACCOUNT_ID = ba2f14cefa19dbdc42ff88d772410689
```

### Set GitHub Secrets

**Secrets:**

```
R2_ACCESS_KEY_ID = [your-r2-access-key-id]
R2_SECRET_ACCESS_KEY = [your-r2-secret-access-key]
```

## 📁 Step 2: Workflow File Verification

The workflow file is located at: `apps/terminal-pro/desktop/.github/workflows/release-r2-win.yml`

### Key Features

- **Dry-run support**: Safe testing without uploads
- **Windows-only focus**: Prevents cross-platform contamination
- **Validation checks**: Ensures proper Windows outputs
- **R2 upload**: Automated deployment to R2 storage
- **Public endpoint verification**: Confirms accessibility

## 🚀 Step 3: Running the Workflow

### Option A: GitHub UI (Recommended)

1. **Navigate to Actions tab**
2. **Select "Release (R2) — Windows" workflow**
3. **Click "Run workflow"**
4. **Configure parameters:**
   - `channel`: `stable` (or `canary`/`nightly`)
   - `dry_run`: `true` (for first run)

### Option B: GitHub CLI (gh)

#### Install GitHub CLI (if needed)

```bash
# Install gh CLI
curl -s https://api.github.com/repos/cli/cli/releases/latest | jq -r '.assets[] | select(.name | contains("linux_amd64.tar.gz")) | .browser_download_url' | xargs wget -O gh.tar.gz
tar -xf gh.tar.gz
sudo cp gh*/bin/gh /usr/local/bin/
```

#### Authenticate

```bash
gh auth login
```

#### Run Dry Run (Safe Validation)

```bash
gh workflow run "Release (R2) — Windows" \
  -f channel=stable \
  -f dry_run=true
```

#### Monitor Workflow Execution

```bash
# List recent runs
gh run list --workflow="Release (R2) — Windows" --limit 5

# Watch specific run until completion
RUN_ID=$(gh run list --workflow="Release (R2) — Windows" --limit 1 --json databaseId -q '.[0].databaseId')
gh run watch $RUN_ID --exit-status
```

#### Run Real Deployment (After Dry Run Success)

```bash
gh workflow run "Release (R2) — Windows" \
  -f channel=stable \
  -f dry_run=false
```

## ✅ Step 4: Verification Commands

### Check Windows Updater is Fixed

#### Verify latest.yml content

```bash
# Check latest.yml exists and references .exe (not AppImage)
curl -fsSL https://download.rinawarptech.com/terminal-pro/stable/latest.yml | sed -n '1,120p'

# Sanity check for file types
curl -fsSL https://download.rinawarptech.com/terminal-pro/stable/latest.yml | grep -Ei '\.exe|\.msi|AppImage' || true
```

**Expected Results:**

- ✅ Contains `.exe` (NSIS installer)
- ❌ Must NOT contain `AppImage`
- ✅ Valid Windows-specific metadata

#### Verify installer accessibility

```bash
# Check if installer file exists (replace filename as needed)
curl -I https://download.rinawarptech.com/terminal-pro/stable/RinaWarp-Terminal-Pro-Setup-1.0.1-x64.exe
```

## 🛠 Step 5: Troubleshooting

### Get Workflow Logs

```bash
# List recent failed runs
gh run list --workflow="Release (R2) — Windows" --limit 3

# Get logs for latest run
RUN_ID=$(gh run list --workflow="Release (R2) — Windows" --limit 1 --json databaseId -q '.[0].databaseId')
gh run view --log $RUN_ID
```

### Common Issues and Solutions

#### 1. Missing R2 Secrets

**Error**: "Missing R2_ACCESS_KEY_ID (Actions Secrets)"
**Solution**: Ensure secrets are set in GitHub repository settings

#### 2. No .exe Produced

**Error**: "No .exe produced in dist-terminal-pro/"
**Solution**: Check electron-builder configuration and Windows build scripts

#### 3. AppImage References in latest.yml

**Error**: "latest.yml references .AppImage (poisoned metadata)"
**Solution**: Verify workflow is using correct configuration file

#### 4. Upload Failures

**Error**: R2 upload authentication failures
**Solution**: Verify R2 credentials and bucket permissions

## 🗑 Step 6: Optional Cleanup

### Remove Poisoned Windows Metadata (if present)

```bash
# Set environment variables
export R2_BUCKET="rinawarp-downloads"
export R2_ACCOUNT_ID="ba2f14cefa19dbdc42ff88d772410689"
export R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

# Set AWS credentials (if using AWS CLI)
export AWS_ACCESS_KEY_ID="...your R2 key..."
export AWS_SECRET_ACCESS_KEY="...your R2 secret..."
export AWS_DEFAULT_REGION="auto"

# Delete poisoned metadata
aws s3 rm "s3://${R2_BUCKET}/terminal-pro/stable/latest.yml" --endpoint-url "$R2_ENDPOINT"
```

### Local Linux Cleanup (Optional)

```bash
# Remove old .deb packages
sudo dpkg -r rinawarp-terminal-pro || true
sudo dpkg -P rinawarp-terminal-pro || true

# Remove AppImage installations
rm -f ~/rinawarp-terminal-pro
rm -f ~/Apps/RinaWarp/RinaWarp-Terminal-Pro-*.AppImage
rm -f ~/Downloads/RinaWarp-Terminal-Pro-*.AppImage

# Remove desktop entries and config
rm -f ~/.local/share/applications/*rinawarp*terminal*pro*.desktop
rm -rf ~/.config/RinaWarp\ Terminal\ Pro ~/.config/rinawarp-terminal-pro
rm -rf ~/.local/share/RinaWarp\ Terminal\ Pro ~/.local/share/rinawarp-terminal-pro
rm -rf ~/.cache/RinaWarp\ Terminal\ Pro ~/.cache/rinawarp-terminal-pro
update-desktop-database ~/.local/share/applications 2>/dev/null || true
```

## 📊 Step 7: Deployment Verification Checklist

- [ ] GitHub Variables set correctly
- [ ] GitHub Secrets configured
- [ ] Workflow file exists and is correct
- [ ] Dry run completes successfully
- [ ] Real deployment uploads correctly
- [ ] latest.yml contains .exe references
- [ ] latest.yml does NOT contain AppImage references
- [ ] Public endpoint returns 200 OK
- [ ] Windows installer file is accessible
- [ ] Cross-platform contamination prevented

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **GitHub Actions**: Successful workflow runs
2. **R2 Storage**: Windows files uploaded to correct paths
3. **Public Endpoint**: latest.yml accessible with Windows metadata
4. **No Cross-Contamination**: Windows latest.yml contains only Windows references

## 📞 Support

If issues arise:

1. Check workflow logs for specific error messages
2. Verify R2 bucket permissions and credentials
3. Ensure correct configuration files are being used
4. Test with dry_run=true before real deployments

---

**Note**: This setup specifically targets Windows releases. For other platforms (Linux/macOS), separate workflows should be configured to prevent cross-platform contamination.
