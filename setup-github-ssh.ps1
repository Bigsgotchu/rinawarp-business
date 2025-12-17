# GitHub SSH Setup Script (PowerShell)
# Automates SSH key generation and GitHub setup

param(
    [string]$Email = "",
    [switch]$SkipKeyGeneration
)

# Colors for PowerShell
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Cyan"

Write-Host "=================================================" -ForegroundColor $BLUE
Write-Host "         GitHub SSH Setup Script (PowerShell)     " -ForegroundColor $BLUE
Write-Host "=================================================" -ForegroundColor $BLUE
Write-Host ""

# Function to check if SSH key already exists
function Test-SSHKeyExists {
    param([string]$KeyPath)
    return (Test-Path $KeyPath)
}

# Function to get user email if not provided
function Get-UserEmail {
    if ($Email) {
        return $Email
    }
    
    # Try to get email from git config
    try {
        $gitEmail = git config --global user.email 2>$null
        if ($gitEmail) {
            Write-Host "Found git email: $gitEmail" -ForegroundColor $GREEN
            return $gitEmail
        }
    } catch {
        Write-Host "Git not configured yet" -ForegroundColor $YELLOW
    }
    
    # Prompt for email
    do {
        $Email = Read-Host "Enter your GitHub email address"
    } while ([string]::IsNullOrWhiteSpace($Email))
    
    return $Email
}

# Function to generate SSH key
function New-SSHKey {
    param([string]$Email)
    
    $sshDir = "$env:USERPROFILE\.ssh"
    $keyPath = "$sshDir\id_ed25519"
    
    # Create .ssh directory if it doesn't exist
    if (-not (Test-Path $sshDir)) {
        New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
        Write-Host "Created .ssh directory: $sshDir" -ForegroundColor $GREEN
    }
    
    # Check if key already exists
    if (Test-SSHKeyExists $keyPath) {
        Write-Host "SSH key already exists at: $keyPath" -ForegroundColor $YELLOW
        $response = Read-Host "Do you want to generate a new key? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            return $keyPath
        }
        
        # Backup existing key
        $backupPath = "$keyPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Move-Item $keyPath $backupPath -Force
        Move-Item "$keyPath.pub" "$backupPath.pub" -Force
        Write-Host "Backed up existing key to: $backupPath" -ForegroundColor $YELLOW
    }
    
    Write-Host "Generating new SSH key..." -ForegroundColor $BLUE
    Write-Host "Key location: $keyPath" -ForegroundColor $YELLOW
    
    # Generate SSH key
    $process = Start-Process -FilePath "ssh-keygen" -ArgumentList "-t", "ed25519", "-C", $Email, "-f", $keyPath -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✓ SSH key generated successfully" -ForegroundColor $GREEN
        return $keyPath
    } else {
        Write-Host "✗ Failed to generate SSH key" -ForegroundColor $RED
        exit 1
    }
}

# Function to start SSH agent
function Start-SSHAgent {
    Write-Host "Starting SSH agent..." -ForegroundColor $BLUE
    
    try {
        # Start SSH agent service
        Start-Service ssh-agent -ErrorAction SilentlyContinue
        
        # Add SSH key to agent
        ssh-add $keyPath 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ SSH key added to agent" -ForegroundColor $GREEN
        } else {
            Write-Host "! SSH agent may not be running. You may need to run manually: ssh-add $keyPath" -ForegroundColor $YELLOW
        }
    } catch {
        Write-Host "! SSH agent service not available. You may need to run manually: ssh-add $keyPath" -ForegroundColor $YELLOW
    }
}

# Function to copy public key
function Copy-SSHKey {
    param([string]$KeyPath)
    
    $publicKeyPath = "$KeyPath.pub"
    
    if (-not (Test-Path $publicKeyPath)) {
        Write-Host "✗ Public key not found: $publicKeyPath" -ForegroundColor $RED
        return $null
    }
    
    try {
        $publicKey = Get-Content $publicKeyPath -Raw
        
        # Try to copy to clipboard
        $publicKey | Set-Clipboard
        
        Write-Host "✓ Public key copied to clipboard" -ForegroundColor $GREEN
        Write-Host ""
        Write-Host "NEXT STEPS:" -ForegroundColor $YELLOW
        Write-Host "1. Go to: https://github.com/settings/keys" -ForegroundColor $BLUE
        Write-Host "2. Click 'New SSH key'" -ForegroundColor $BLUE
        Write-Host "3. Give it a title (e.g., 'My Windows PC')" -ForegroundColor $BLUE
        Write-Host "4. Paste the key from your clipboard" -ForegroundColor $BLUE
        Write-Host "5. Click 'Add SSH key'" -ForegroundColor $BLUE
        Write-Host ""
        
        return $publicKey
    } catch {
        Write-Host "! Could not copy to clipboard automatically" -ForegroundColor $YELLOW
        Write-Host "Please copy the public key manually:" -ForegroundColor $YELLOW
        Write-Host ""
        Write-Host $publicKey -ForegroundColor $GREEN
        Write-Host ""
        return $publicKey
    }
}

# Function to test SSH connection
function Test-SSHConnection {
    Write-Host "Testing SSH connection to GitHub..." -ForegroundColor $BLUE
    
    try {
        $result = ssh -T git@github.com 2>&1
        Write-Host $result
        
        if ($result -match "successfully authenticated") {
            Write-Host "✓ SSH connection successful!" -ForegroundColor $GREEN
            return $true
        } elseif ($result -match "Permission denied") {
            Write-Host "! SSH key not yet added to GitHub or needs verification" -ForegroundColor $YELLOW
            return $false
        } else {
            Write-Host "! SSH test failed. Please check your setup." -ForegroundColor $YELLOW
            return $false
        }
    } catch {
        Write-Host "! SSH test failed. Please check your setup." -ForegroundColor $YELLOW
        return $false
    }
}

# Main setup process
Write-Host "This script will set up SSH authentication for GitHub." -ForegroundColor $BLUE
Write-Host ""

# Get user email
$Email = Get-UserEmail

# Generate SSH key (unless skipped)
if (-not $SkipKeyGeneration) {
    $keyPath = New-SSHKey $Email
} else {
    $keyPath = "$env:USERPROFILE\.ssh\id_ed25519"
    if (-not (Test-Path $keyPath)) {
        Write-Host "SSH key not found. Generating new key..." -ForegroundColor $YELLOW
        $keyPath = New-SSHKey $Email
    }
}

# Start SSH agent
Start-SSHAgent

# Copy public key
$publicKey = Copy-SSHKey $keyPath

if ($publicKey) {
    Write-Host "Press any key after adding the SSH key to GitHub to test the connection..." -ForegroundColor $YELLOW
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Test SSH connection
    $connectionSuccess = Test-SSHConnection
    
    if ($connectionSuccess) {
        Write-Host ""
        Write-Host "🎉 SSH setup completed successfully!" -ForegroundColor $GREEN
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor $YELLOW
        Write-Host "1. Authenticate GitHub CLI: gh auth login --with-token" -ForegroundColor $BLUE
        Write-Host "2. Run secrets setup: .\setup-secrets.ps1" -ForegroundColor $BLUE
        Write-Host "3. Test repository access: git ls-remote origin" -ForegroundColor $BLUE
    } else {
        Write-Host ""
        Write-Host "SSH key setup completed. Please verify the key was added to GitHub." -ForegroundColor $YELLOW
        Write-Host "You can test the connection manually with: ssh -T git@github.com" -ForegroundColor $YELLOW
    }
} else {
    Write-Host "SSH key setup completed manually. Please add the key to GitHub and test." -ForegroundColor $YELLOW
}

Write-Host ""
Write-Host "For detailed instructions, see: setup-github-ssh.md" -ForegroundColor $BLUE