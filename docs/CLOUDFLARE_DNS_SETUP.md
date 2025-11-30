# Cloudflare DNS Setup Guide for docs.rinawarptech.com

# 🎯 Overview

This guide will help you configure Cloudflare DNS to route `docs.rinawarptech.com` to your Netlify-hosted documentation site.

# 📋 Prerequisites

- Cloudflare account with rinawarptech.com domain
- Netlify site deployed and running (from the GitHub Actions workflow)
- Netlify Site ID and deployment URL

# 🔧 DNS Configuration Steps

# Step 1: Get Your Netlify Site URL

After deploying via GitHub Actions, you'll have a Netlify URL like:

```
rinawarp-docs-12345.netlify.app
```

**Note this URL for the DNS configuration.**

# Step 2: Cloudflare DNS Setup

1. **Login to Cloudflare Dashboard**
    - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
    - Select the `rinawarptech.com` domain

1. **Navigate to DNS Settings**
    - Click on your domain name
    - Go to the **DNS** tab

1. **Add CNAME Record for Docs**

   Click **Add record** and configure:

   ```
   Type: CNAME
   Name: docs
   Target: <your-netlify-url>.netlify.app
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

    **Example:**

   ```
   Type: CNAME
   Name: docs
   Target: rinawarp-docs-12345.netlify.app
   Proxy status: Proxied (orange cloud)
   TTL: Auto
   ```

# Step 3: Verify Configuration

1. **Check DNS Propagation**

   ```bash

# # Check if DNS is resolving

   dig docs.rinawarptech.com

# # Should return Netlify IP

   ```

1. **Test in Browser**
    - Visit: [https://docs.rinawarptech.com](https://docs.rinawarptech.com)
    - Should load your MkDocs documentation site

# Step 4: SSL Certificate

Cloudflare automatically provisions SSL certificates for proxied domains:

1. **Wait for SSL Generation**
    - Usually takes 5-15 minutes
    - Check SSL tab in Cloudflare dashboard

1. **Force HTTPS Redirect**
    - Go to SSL/TLS tab
    - Set encryption mode to "Full" or "Full (strict)"
    - Enable "Always Use HTTPS"

# 🚀 Automation Script

# Update DNS via Cloudflare API

Create a script to automate DNS updates:

```bash

# !/bin/bash

# cloudflare-dns-update.sh

# Configuration

CF_API_TOKEN="your-cloudflare-api-token"
CF_ZONE_ID="your-zone-id"
CF_DOMAIN="rinawarptech.com"
SUBDOMAIN="docs"

# Get current Netlify site info

NETLIFY_SITE_ID="your-netlify-site-id"
NETLIFY_TOKEN="your-netlify-token"

# Get latest deploy URL

DEPLOY_URL=$(curl -s -H "Authorization: Bearer $NETLIFY_TOKEN" \
  "[https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID"](https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID") \
  | jq -r '.ssl_url // .default_domain')

# Update Cloudflare DNS

curl -X POST "[https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records"](https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records") \

  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{

    \"type\": \"CNAME\",
    \"name\": \"$SUBDOMAIN\",
    \"content\": \"$DEPLOY_URL\",
    \"proxied\": true
  }"
```

# 📝 DNS Configuration Summary

| Setting | Value |
|---------|-------|
| Type | CNAME |
| Name | docs |
| Target | [netlify-url].netlify.app |
| Proxy | ✅ Proxied (orange cloud) |
| TTL | Auto |

# 🔍 Troubleshooting

# Common Issues

**1. DNS Not Propagating**
- Wait up to 24 hours for global propagation
- Use DNS checker tools like what's my DNS

**2. SSL Certificate Issues**
- Ensure proxy is enabled (orange cloud)
- Wait 5-15 minutes for certificate generation
- Check SSL/TLS settings in Cloudflare

**3. Netlify URL Changed**
- Update DNS record with new Netlify URL
- Run automation script to update automatically

# Verification Commands

```bash

# Check DNS resolution

dig docs.rinawarptech.com

# Check SSL certificate

openssl s_client -connect docs.rinawarptech.com:443 -servername docs.rinawarptech.com

# Test HTTPS redirect

curl -I [http://docs.rinawarptech.com](http://docs.rinawarptech.com)

# Should return 301 or 302 redirect to HTTPS

```

# 🎉 Success

Once configured, your documentation will be available at:

```
[https://docs.rinawarptech.com](https://docs.rinawarptech.com)
```

With benefits:

- ✅ Professional custom domain
- ✅ SSL certificate via Cloudflare
- ✅ Fast global CDN
- ✅ DDoS protection
- ✅ Automatic HTTPS redirect

# 🔗 Related Documentation

- [Netlify Custom Domain Setup](https://docs.netlify.com/domain-merge/custom-domains/)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare SSL/TLS Settings](https://developers.cloudflare.com/ssl/)

---

**Created:** 2025-11-29
**Status:** Ready for deployment
**Next:** Add this to your deployment automation script
