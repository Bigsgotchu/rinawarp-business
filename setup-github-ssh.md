# GitHub SSH Setup Guide

This guide will help you set up SSH authentication for GitHub, which is required for Git operations and GitHub CLI authentication.

## 🚀 Quick Setup Commands

### 1. Generate SSH Key Pair

```bash
# Generate new SSH key (use your GitHub email)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Or for older systems:
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

When prompted:
- **Enter file location**: Press Enter (use default `~/.ssh/id_ed25519`)
- **Enter passphrase**: Create a secure passphrase (recommended)

### 2. Add SSH Key to SSH Agent

```bash
# Start SSH agent
eval "$(ssh-agent -s)"

# Add your SSH key to the agent
ssh-add ~/.ssh/id_ed25519
```

### 3. Add SSH Key to GitHub

```bash
# Copy your public key to clipboard (Windows PowerShell)
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard

# Or for macOS:
pbcopy < ~/.ssh/id_ed25519.pub

# Or for Linux:
xclip -sel clip < ~/.ssh/id_ed25519.pub
```

### 4. Add to GitHub Account

1. Go to [GitHub SSH Settings](https://github.com/settings/keys)
2. Click "New SSH key"
3. Give it a title (e.g., "My Windows PC")
4. Paste your public key in the "Key" field
5. Click "Add SSH key"

### 5. Test SSH Connection

```bash
ssh -T git@github.com
```

You should see: `Hi username! You've successfully authenticated...`

## 🛠️ PowerShell Setup Script

I've created a PowerShell script to automate SSH setup:

```powershell
.\setup-github-ssh.ps1
```

## 🔧 Manual Setup (Detailed)

### Step 1: Generate SSH Key

**Windows (PowerShell/Command Prompt):**
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

**Linux/macOS (Terminal):**
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### Step 2: Start SSH Agent

**Windows:**
```powershell
# Start SSH agent service
Start-Service ssh-agent

# Add your key
ssh-add ~/.ssh/id_ed25519
```

**Linux/macOS:**
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Step 3: Copy Public Key

**Windows PowerShell:**
```powershell
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
```

**Windows Command Prompt:**
```bash
type %USERPROFILE%\.ssh\id_ed25519.pub
```

**macOS:**
```bash
pbcopy < ~/.ssh/id_ed25519.pub
```

**Linux:**
```bash
xclip -sel clip < ~/.ssh/id_ed25519.pub
```

### Step 4: Add to GitHub

1. Go to [GitHub SSH Settings](https://github.com/settings/keys)
2. Click "New SSH key"
3. Paste your key and save

### Step 5: Test Connection

```bash
ssh -T git@github.com
```

## 🔍 Troubleshooting

### SSH Agent Not Running
```powershell
# Windows - Start SSH agent
Start-Service ssh-agent

# Add key to agent
ssh-add ~/.ssh/id_ed25519
```

### Permission Denied
```bash
# Fix SSH key permissions (Linux/macOS)
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### Key Already Exists
```bash
# Backup existing key if needed
mv ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.backup
mv ~/.ssh/id_ed25519.pub ~/.ssh/id_ed25519.pub.backup

# Generate new key
ssh-keygen -t ed25519 -C "your-email@example.com"
```

## 🔒 Security Best Practices

1. **Use passphrase**: Always protect your SSH key with a passphrase
2. **Unique keys**: Use different keys for different machines
3. **Regular rotation**: Rotate SSH keys periodically
4. **Monitor usage**: Check GitHub for SSH key activity
5. **Remove unused keys**: Delete old/unused SSH keys from GitHub

## ✅ Verification

After setup, verify everything works:

```bash
# Test SSH connection
ssh -T git@github.com

# Should see: "Hi username! You've successfully authenticated..."

# Test git operations
git ls-remote origin
```

## 🚀 Next Steps

Once SSH is set up:

1. **Authenticate GitHub CLI**: `gh auth login --with-token`
2. **Run secrets setup**: `.\setup-secrets.ps1`
3. **Test repository access**: `git clone git@github.com:username/repository.git`

Your SSH setup is complete! You can now proceed with the GitHub secrets setup.