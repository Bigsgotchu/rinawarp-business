# GitHub Repository Secrets Setup Script (PowerShell)
# 
# ⚠️  SECURITY WARNING ⚠️
# This script should ONLY be run in YOUR local environment
# with YOUR GitHub authentication and credentials
#
# NEVER commit this script with actual secrets to version control!

param(
    [switch]$UseDefaultValues
)

# Colors for PowerShell
$RED = "Red"
$GREEN = "Green" 
$YELLOW = "Yellow"
$BLUE = "Cyan"
$NC = "White"

Write-Host "=================================================" -ForegroundColor $BLUE
Write-Host "     GitHub Repository Secrets Setup (PowerShell)     " -ForegroundColor $BLUE
Write-Host "=================================================" -ForegroundColor $BLUE
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not in a git repository" -ForegroundColor $RED
    Write-Host "Please run this script from the root of your GitHub repository" -ForegroundColor $RED
    exit 1
}

# Get repository information
try {
    $REPO = gh repo view --json nameWithOwner -q .nameWithOwner 2>$null
} catch {
    Write-Host "Error: Cannot access repository information" -ForegroundColor $RED
    Write-Host "Please ensure you have proper GitHub CLI authentication" -ForegroundColor $RED
    exit 1
}

Write-Host "Repository: $REPO" -ForegroundColor $YELLOW
Write-Host ""

# Check if GitHub CLI is installed
try {
    $ghVersion = gh --version 2>$null
    Write-Host "✓ GitHub CLI is installed: $ghVersion" -ForegroundColor $GREEN
} catch {
    Write-Host "Error: GitHub CLI (gh) is not installed" -ForegroundColor $RED
    Write-Host "Please install it first: https://cli.github.com/"
    Write-Host ""
    Write-Host "Installation commands:" -ForegroundColor $YELLOW
    Write-Host "  Windows: winget install GitHub.cli"
    Write-Host "  Chocolatey: choco install gh"
    Write-Host "  Scoop: scoop install gh"
    exit 1
}

# Check if user is authenticated with GitHub CLI
try {
    $authStatus = gh auth status 2>$null
    Write-Host "✓ GitHub CLI is authenticated" -ForegroundColor $GREEN
} catch {
    Write-Host "Error: Not authenticated with GitHub CLI" -ForegroundColor $RED
    Write-Host "Please run: gh auth login" -ForegroundColor $YELLOW
    Write-Host ""
    Write-Host "The script will exit now. Run 'gh auth login' and then re-run this script." -ForegroundColor $YELLOW
    exit 1
}

Write-Host ""

# Function to add a secret
function Add-Secret {
    param(
        [string]$SecretName,
        [string]$Description,
        [string]$DefaultValue = ""
    )
    
    Write-Host "Setting up $SecretName" -ForegroundColor $YELLOW
    Write-Host $Description
    Write-Host ""
    
    if ($UseDefaultValues -and $DefaultValue) {
        $secretValue = $DefaultValue
        Write-Host "Using provided default value for $SecretName" -ForegroundColor $GREEN
    } else {
        $secureInput = Read-Host "Enter $SecretName value" -AsSecureString
        $secretValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureInput))
    }
    
    if ([string]::IsNullOrWhiteSpace($secretValue)) {
        Write-Host "Skipping $SecretName (empty value)" -ForegroundColor $YELLOW
        Write-Host ""
        return
    }
    
    # Add secret using GitHub CLI
    try {
        $secureInput | gh secret set $SecretName --repo $REPO --stdin
        Write-Host "✓ $SecretName added successfully" -ForegroundColor $GREEN
    } catch {
        Write-Host "✗ Failed to add $SecretName" -ForegroundColor $RED
        Write-Host $_.Exception.Message
    }
    Write-Host ""
}

Write-Host "This script will help you add secrets to your GitHub repository." -ForegroundColor $BLUE
Write-Host "You'll be prompted for each secret value." -ForegroundColor $BLUE
Write-Host ""

# Add all required secrets
Add-Secret -SecretName "CF_ACCOUNT_ID" -Description "Cloudflare Account ID for deployments"
Add-Secret -SecretName "CF_PAGES_PROJECT" -Description "Cloudflare Pages project name"
Add-Secret -SecretName "CLOUDFLARE_API_TOKEN" -Description "Cloudflare API token with Pages write permissions"
Add-Secret -SecretName "SLACK_WEBHOOK_URL" -Description "Slack webhook URL for deployment notifications (optional)"
Add-Secret -SecretName "SENTRY_DSN" -Description "Sentry DSN for error tracking (optional)"

Write-Host "GitHub secrets setup complete!" -ForegroundColor $GREEN
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Verify secrets were added:"
Write-Host "   gh secret list --repo $REPO" -ForegroundColor $YELLOW
Write-Host ""
Write-Host "2. Your GitHub Actions workflow will now have access to these secrets"
Write-Host "3. Deployments and integrations will work when the workflow runs"
Write-Host ""
Write-Host "Security reminder: Never commit actual secrets to version control!" -ForegroundColor $YELLOW
Write-Host "These secrets are now securely stored in GitHub's secret management system." -ForegroundColor $YELLOW