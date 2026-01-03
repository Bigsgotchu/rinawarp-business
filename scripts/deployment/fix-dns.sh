#!/bin/bash

# DNS Fix for api.rinawarptech.com
# Updates DNS record to point to correct server IP

echo "🌐 DNS Fix for api.rinawarptech.com"
echo "==================================="
echo ""
echo "Current issue: api.rinawarptech.com points to 158.101.1.38"
echo "Should point to: 137.131.48.124"
echo ""

# Check current DNS
echo "🔍 Current DNS resolution:"
nslookup api.rinawarptech.com

echo ""
echo "⚠️  DNS needs to be updated to point to your server IP"
echo ""
echo "Please update Cloudflare DNS record:"
echo "1. Go to Cloudflare Dashboard"
echo "2. Select rinawarptech.com domain"
echo "3. Navigate to DNS settings"
echo "4. Find 'api' record"
echo "5. Change IP from 158.101.1.38 to 137.131.48.124"
echo ""
echo "Once updated, DNS will propagate in 5-15 minutes"
echo ""
echo "After DNS update, you can test with:"
echo "nslookup api.rinawarptech.com"