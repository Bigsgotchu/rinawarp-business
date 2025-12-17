# GitHub Repository Secrets Management

This directory contains scripts and utilities for securely managing GitHub repository secrets for your CI/CD pipeline.

## 🚨 Security Warning

**NEVER commit actual secrets to version control!** These scripts are designed to help you add secrets securely without exposing them in your git history.

## 📁 Files Overview

- `add-secrets-comprehensive.sh` - Main script for adding secrets (bash/Linux/macOS)
- `setup-secrets.ps1` - PowerShell version for Windows
- `secrets-template.txt` - Template for batch secret setup
- `add-github-secrets.sh` - Original script
- `setup-secrets-local.sh` - Alternative bash script
- `SECURITY-GUIDE.md` - Security best practices

## 🚀 Quick Start

### Option 1: Interactive Setup (Recommended)

**On Linux/macOS:**

```bash
chmod +x add-secrets-comprehensive.sh
./add-secrets-comprehensive.sh
```

**On Windows:**

```powershell
.\setup-secrets.ps1
```

### Option 2: Automated Setup

**Using command line arguments:**

```bash
./add-secrets-comprehensive.sh --auto \
  --secret CF_ACCOUNT_ID=ba2f14cefa19dbdc42ff88d772410689 \
  --secret CF_PAGES_PROJECT=your-project-name \
  --secret CLOUDFLARE_API_TOKEN=your_token_here
```

**Using a batch file:**

```bash
# 1. Copy and customize secrets-template.txt
cp secrets-template.txt my-secrets.txt
# Edit my-secrets.txt with your actual values

# 2. Run the script
./add-secrets-comprehensive.sh --batch my-secrets.txt
```

## 📋 Required Secrets

Based on your CI workflow (`.github/workflows/ci.yml`), add these secrets to your repository:

| Secret Name            | Description                                    | Required    |
| ---------------------- | ---------------------------------------------- | ----------- |
| `CF_ACCOUNT_ID`        | Cloudflare Account ID                          | ✅ Required |
| `CF_PAGES_PROJECT`     | Cloudflare Pages project name                  | ✅ Required |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages permissions    | ✅ Required |
| `SLACK_WEBHOOK_URL`    | Slack webhook for deployment notifications     | Optional    |
| `SENTRY_DSN`           | Sentry DSN for error tracking                  | Optional    |
| `GITHUB_TOKEN`         | GitHub token (auto-provided by GitHub Actions) | Auto        |

## 🔧 Prerequisites

1. **GitHub CLI installed and authenticated:**

   ```bash
   # Install
   brew install gh          # macOS
   sudo apt install gh      # Ubuntu/Debian
   winget install GitHub.cli # Windows

   # Authenticate
   gh auth login
   ```

2. **SSH setup (recommended for password-less git operations):**

   ```bash
   # For Windows
   .\setup-github-ssh.ps1

   # For Linux/macOS
   ssh-keygen -t ed25519 -C "your-email@example.com"
   # Add the public key to GitHub: https://github.com/settings/keys
   ```

3. **Run from git repository root:**
   ```bash
   # Verify you're in a git repository
   git status
   ```

## 🎯 Usage Examples

### Interactive Mode

```bash
# Basic interactive setup
./add-secrets-comprehensive.sh

# Verbose output
./add-secrets-comprehensive.sh --verbose

# Skip SSH setup check
./add-secrets-comprehensive.sh --skip-ssh
```

### Automated Mode

```bash
# Dry run (show what would be done)
./add-secrets-comprehensive.sh --auto --dry-run

# Set specific secrets
./add-secrets-comprehensive.sh --auto \
  --secret CF_ACCOUNT_ID=your_account_id \
  --secret CF_PAGES_PROJECT=your_project

# Load from file
./add-secrets-comprehensive.sh --batch secrets.txt --verbose
```

### Batch File Format

```text
# Comments start with #
CF_ACCOUNT_ID=ba2f14cefa19dbdc42ff88d772410689
CF_PAGES_PROJECT=your-project-name
CLOUDFLARE_API_TOKEN=your_api_token
# Empty lines are ignored
```

## ✅ Verification

After adding secrets, verify they're set correctly:

```bash
# List all secrets (names only)
gh secret list --repo your-org/your-repo

# Test GitHub Actions workflow
git push origin main

# Check workflow runs
gh run list --limit 5
```

## 🔒 Security Best Practices

1. **Never commit secrets to git**
2. **Use environment variables for local development**
3. **Rotate secrets regularly**
4. **Use least privilege access**
5. **Monitor secret usage in logs**
6. **Use different secrets for different environments**

## 🆘 Troubleshooting

### GitHub CLI not found

```bash
# Install GitHub CLI first
# See: https://cli.github.com/
```

### Authentication issues

```bash
# Re-authenticate with GitHub
gh auth login

# Check authentication status
gh auth status
```

### Permission denied errors

```bash
# Ensure you have admin access to the repository
# Repository owners can manage secrets
```

### SSH connection issues

```bash
# Test SSH connection
ssh -T git@github.com

# If it fails, set up SSH keys
ssh-keygen -t ed25519 -C "your-email@example.com"
```

## 📞 Support

If you encounter issues:

1. Check the script output for specific error messages
2. Verify GitHub CLI authentication: `gh auth status`
3. Ensure you're in the correct git repository
4. Review the SECURITY-GUIDE.md for additional help

## 🔄 Updating Secrets

To update existing secrets:

1. **Interactive:**

   ```bash
   ./add-secrets-comprehensive.sh
   # Re-enter the values when prompted
   ```

2. **Programmatic:**
   ```bash
   # The script will overwrite existing secrets with the same name
   ./add-secrets-comprehensive.sh --auto --secret SECRET_NAME=new_value
   ```

## 📊 Script Features

- ✅ Interactive and automated modes
- ✅ Batch file support
- ✅ Dry-run capability
- ✅ Prerequisites checking
- ✅ SSH setup validation
- ✅ Colored output for better UX
- ✅ Error handling and recovery
- ✅ Verification of secret installation
- ✅ Security warnings and guidance

---

**Remember: Security is not optional - it's essential!** 🛡️
