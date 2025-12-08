# Apple Developer Certificates Setup

## Overview
This directory contains certificate files for macOS app signing and distribution.

## Required Certificates

### 1. Developer ID Application Certificate
**Purpose:** Code signing for distribution outside Mac App Store
**File:** `developer-id.p12`
**Password:** Set via environment variable `MACOS_CERT_PASSWORD`

### 2. Developer ID Installer Certificate  
**Purpose:** Code signing for installer packages
**File:** `developer-id-installer.p12`
**Password:** Same as above

### 3. Provisioning Profile
**Purpose:** Entitlements and app identification
**File:** `embedded.provisionprofile`

## Setup Instructions

### Step 1: Obtain Apple Developer Account
1. Enroll in Apple Developer Program ($99/year)
2. Access Developer Portal at https://developer.apple.com

### Step 2: Create Certificates
1. Go to Certificates, Identifiers & Profiles
2. Create Developer ID Application certificate
3. Create Developer ID Installer certificate
4. Download and install in Keychain Access

### Step 3: Export Certificates
1. Open Keychain Access
2. Find your Developer ID certificates
3. Right-click → Export
4. Save as .p12 files in this directory
5. Set strong passwords

### Step 4: Create Provisioning Profile
1. Go to Profiles section
2. Create new Profile for Distribution
3. Include required entitlements
4. Download and place as `embedded.provisionprofile`

### Step 5: Configure Environment Variables
```bash
export MACOS_CERT_PASSWORD="your-certificate-password"
export APPLE_ID="your-apple-id@email.com"
export APPLE_APP_PASSWORD="your-app-specific-password"
export TEAM_ID="your-team-id"
```

## Security Notes
- Never commit certificate files to version control
- Use environment variables for passwords
- Regularly rotate certificates
- Use separate certificates for development/testing

## Troubleshooting
- Certificate expired? Renew in Developer Portal
- Code signing errors? Check certificate validity
- Notarization fails? Verify Apple ID and team ID
- Gatekeeper issues? Check entitlements