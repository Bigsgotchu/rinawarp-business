# Corrected DNS Configuration

## ✅ Proper Architecture

```
rinawarptech.com (Main Website) → Netlify
api.rinawarptech.com (API) → Oracle VM (158.101.1.38)
```

## 📋 Correct DNS Records

### For Main Website (Netlify)
```
Type: CNAME
Name: www
Content: rinawarp-tech-website.netlify.app
TTL: Auto
Proxy: ON (orange cloud)
```

```
Type: CNAME  
Name: rinawarptech.com
Content: rinawarp-tech-website.netlify.app
TTL: Auto
Proxy: ON (orange cloud)
```

### For API (Oracle VM)
```
Type: A
Name: api
Content: 158.101.1.38
TTL: Auto
Proxy: OFF (灰色云朵)
```

### For Downloads (Oracle VM)
```
Type: A
Name: downloads
Content: 158.101.1.38
TTL: Auto
Proxy: OFF (灰色云朵)
```

## 🔧 Steps to Fix DNS

### 1. Reset Main Domain DNS
**Delete these incorrect records:**
- `A rinawarptech.com` → `158.101.1.38`
- `A www.rinawarptech.com` → `158.101.1.38`

**Replace with Netlify CNAME records:**
- `CNAME rinawarptech.com` → `rinawarp-tech-website.netlify.app`
- `CNAME www` → `rinawarp-tech-website.netlify.app`

### 2. Keep API DNS Correct
**Ensure this record exists:**
- `A api.rinawarptech.com` → `158.101.1.38` ✅ (Keep this one)

### 3. Downloads DNS (Optional)
**Optional - for serving downloads from your server:**
- `A downloads.rinawarptech.com` → `158.101.1.38`

## 🧪 DNS Verification

After making DNS changes, test with:

```bash
# Should point to Netlify
dig rinawarptech.com
dig www.rinawarptech.com

# Should point to Oracle VM
dig api.rinawarptech.com
dig downloads.rinawarptech.com

# Test HTTP connectivity
curl -I https://rinawarptech.com
curl -I https://www.rinawarptech.com
curl -I https://api.rinawarptech.com/health
```

## ✅ Expected Results

After DNS fix:
- `https://rinawarptech.com` → Netlify website
- `https://www.rinawarptech.com` → Netlify website  
- `https://api.rinawarptech.com` → Oracle VM API
- `https://downloads.rinawarptech.com` → Oracle VM (if configured)

## 🚀 Next Steps

1. Update DNS records in your DNS provider (Cloudflare/GoDaddy/etc.)
2. Wait 5-15 minutes for DNS propagation
3. Test that main website loads from Netlify
4. Test that API responds from Oracle VM
5. Verify Stripe webhooks point to `https://api.rinawarptech.com/api/stripe/webhook`

**This ensures your main website gets Netlify's CDN speed while your API gets the performance and control of your Oracle VM.**