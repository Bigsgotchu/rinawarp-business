# Cloudflare DNS Setup Guide

## 🎯 **Quick DNS Fix**

To fix the `api.rinawarptech.com` routing issue, follow these steps:

### 1. **Get Cloudflare API Token**
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Select "Custom token"
4. Configure permissions:
   - **Zone - DNS:Edit** - Include `rinawarptech.com`
   - **Zone - Zone:Read** - Include `rinawarptech.com`
5. Copy the generated token

### 2. **Run the DNS Fix Script**
```bash
# Set the API token
export CLOUDFLARE_API_TOKEN='your_token_here'

# Run the fix
bash fix-cloudflare-dns.sh
```

### 3. **Manual Alternative**
If you prefer manual setup:
1. Go to: https://dash.cloudflare.com/
2. Select `rinawarptech.com` domain
3. Go to DNS tab
4. Add/Edit record:
   - **Type**: A
   - **Name**: api
   - **Content**: 137.131.48.124
   - **Proxy status**: DNS only (gray cloud)

### 4. **Verify Fix**
Wait 2-5 minutes, then test:
```bash
curl -I http://api.rinawarptech.com/api/license-count
```

## 🔧 **What This Fixes**
- Routes `api.rinawarptech.com` directly to Oracle Cloud instance
- Bypasses Cloudflare proxy for API traffic
- Allows direct connectivity to your backend services

## ⚠️ **Note**
This fixes the DNS routing. Oracle Cloud networking must be properly configured (already completed).