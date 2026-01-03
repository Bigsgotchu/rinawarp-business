# GitHub Actions Variables & Secrets Setup Guide

## 🚨 URGENT: Fix Missing R2 Variables/Secrets

Your Windows workflow is failing because GitHub Actions variables and secrets are missing. This prevents the R2 upload and causes the 404 error.

## ✅ Step 1: Add GitHub Actions Variables (Repo-Level)

**Navigate to:** GitHub repo → Settings → Secrets and variables → Actions → Variables → New repository variable

Add these two variables:

| Variable Name   | Value                              |
| --------------- | ---------------------------------- |
| `R2_BUCKET`     | `rinawarp-downloads`               |
| `R2_ACCOUNT_ID` | `ba2f14cefa19dbdc42ff88d772410689` |

## ✅ Step 2: Add GitHub Actions Secrets (Repo-Level)

**Navigate to:** Same page → Secrets → New repository secret

Add these two secrets:

| Secret Name            | Value                                    |
| ---------------------- | ---------------------------------------- |
| `R2_ACCESS_KEY_ID`     | `[your Cloudflare R2 access key id]`     |
| `R2_SECRET_ACCESS_KEY` | `[your Cloudflare R2 secret access key]` |

**⚠️ Important:** You need to get your actual R2 credentials from Cloudflare dashboard.

## ✅ Step 3: Run Windows Workflow

### A) Dry Run (Safe Validation)

1. Go to GitHub → Actions
2. Select "Release (R2) - Windows"
3. Click "Run workflow"
4. Set parameters:
   - `channel`: `stable`
   - `dry_run`: `true`

### B) Real Upload (Fixes 404)

After dry run succeeds:

1. Run workflow again
2. Set parameters:
   - `channel`: `stable`
   - `dry_run`: `false`

## ✅ Step 4: Verify Fix

Run these verification commands:

### A) Check Public Endpoint

```bash
curl -fsSL https://download.rinawarptech.com/terminal-pro/stable/latest.yml | sed -n '1,80p'
```

**Expected Result:** Should see `.exe` in the url/path fields, NOT `.AppImage`

### B) Check R2 Storage (Optional)

```bash
export R2_BUCKET="rinawarp-downloads"
export R2_ACCOUNT_ID="ba2f14cefa19dbdc42ff88d772410689"
export R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

aws s3 ls "s3://${R2_BUCKET}/terminal-pro/stable/" --endpoint-url "$R2_ENDPOINT" | sed -n '1,200p'
```

**Expected Result:** Should see:

- `latest.yml`
- Windows installer like `RinaWarp-Terminal-Pro-Setup-...exe`
- Possibly `*.blockmap`

## 🔧 Quick Commands Reference

### Using the Helper Scripts

```bash
# Make scripts executable
chmod +x apps/terminal-pro/desktop/*.sh

# Check current status
./apps/terminal-pro/desktop/run-windows-release.sh status

# Run dry run
./apps/terminal-pro/desktop/run-windows-release.sh dry-run

# Run real deployment
./apps/terminal-pro/desktop/run-windows-release.sh deploy

# Verify deployment
./apps/terminal-pro/desktop/verify-windows-deployment.sh stable
```

### Manual Verification

```bash
# Quick check if latest.yml exists and has correct content
curl -fsSL https://download.rinawarptech.com/terminal-pro/stable/latest.yml | grep -Ei '\.exe|AppImage'

# Should show .exe references and NO AppImage references
```

## 🛠 Troubleshooting

### If Variables/Secrets Still Show [EMPTY]

1. Double-check you added them to the correct repository
2. Ensure you're adding to "Variables" not "Secrets" for the R2\_\* vars
3. Ensure you're adding to "Secrets" not "Variables" for the R2\_\* keys
4. Wait a few minutes for propagation

### If Workflow Still Fails

Run the workflow and check these three specific step outputs:

1. **Preflight secrets/vars check** - Should show ✅ Preflight OK
2. **Debug dist output** - Should show Windows build artifacts
3. **Upload step failure** (if any) - Will show the exact error

### If 404 Persists

1. Confirm the real deployment (dry_run=false) completed successfully
2. Check that latest.yml was uploaded to the correct R2 path
3. Verify the public endpoint is working

## 📞 What to Do Next

1. **Add the variables and secrets** (Steps 1-2 above)
2. **Run dry run workflow** (Step 3A)
3. **Run real deployment** (Step 3B)
4. **Verify with commands** (Step 4)

Once these variables and secrets are added, the workflow will stop showing `[EMPTY]` and the Windows 404 error will be resolved.

## 🎯 Success Criteria

- ✅ GitHub Actions variables show actual values (not [EMPTY])
- ✅ Dry run workflow completes successfully
- ✅ Real deployment uploads files to R2
- ✅ `curl https://download.rinawarptech.com/terminal-pro/stable/latest.yml` returns 200 OK
- ✅ latest.yml contains `.exe` references and NO `AppImage` references
