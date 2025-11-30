# 🚀 NETLIFY DEPLOYMENT CHECKLIST - rinawarptech.com

## ✅ STEP 1 — Deploy Website to Netlify

**Location:** `/home/karina/Documents/RinaWarp/rinawarp-website-final/`

1. **Go to Netlify Drop:** [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. **Drag & Drop:** The entire `rinawarp-website-final/` folder
3. **Note your Netlify URL:** `https://somethingrandom.netlify.app`

---

## ✅ STEP 2 — Add Custom Domain (rinawarptech.com)

**In Netlify Dashboard:**

1. **Site Settings** → **Domain management**
2. **Add custom domain** → Enter: `rinawarptech.com`
3. **Netlify will provide DNS records** - note these for Cloudflare

**You'll get something like:**
```
CNAME rinawarptech.com your-site.netlify.app
CNAME www your-site.netlify.app
```

---

## ✅ STEP 3 — Fix Cloudflare DNS

**In Cloudflare Dashboard:**

### Remove Old Records:
- ❌ Delete: `A rinawarptech.com` → VM IP
- ❌ Delete: `A www` → VM IP

### Add New Records:
```
CNAME rinawarptech.com your-site.netlify.app (Proxied OFF - Gray Cloud)
CNAME www your-site.netlify.app (Proxied OFF - Gray Cloud)
```

**⚠️ IMPORTANT:** Proxy must be OFF (gray cloud) for Netlify SSL to work

---

## ✅ STEP 4 — Fix NGINX on VM

**Run on your VM:**

```bash
# Make script executable
chmod +x /home/karina/Documents/RinaWarp/nginx-domain-removal-commands.sh

# Run the removal script
/home/karina/Documents/RinaWarp/nginx-domain-removal-commands.sh
```

**Or manually:**
```bash
sudo rm -f /etc/nginx/sites-enabled/rinawarptech.com
sudo rm -f /etc/nginx/sites-available/rinawarptech.com
sudo systemctl reload nginx
```

---

## ✅ STEP 5 — Wait & Verify

**Wait 1-3 minutes** for DNS propagation

**Test URLs:**
- ✅ [https://rinawarptech.com](https://rinawarptech.com)
- ✅ [https://rinawarptech.com/pricing.html](https://rinawarptech.com/pricing.html)
- ✅ [https://rinawarptech.com/music-video-creator.html](https://rinawarptech.com/music-video-creator.html)

**Verification:**
- ✅ Site loads from Netlify (not VM)
- ✅ No 404 /qzje/ errors
- ✅ SSL certificate active
- ✅ Fast loading times

---

## 🔧 TROUBLESHOOTING

**If site still shows VM content:**
1. Clear browser cache
2. Wait longer for DNS propagation
3. Check Cloudflare proxy settings (must be OFF)

**If SSL issues:**
1. Wait 5-10 minutes after DNS changes
2. Check Netlify domain verification
3. Ensure Cloudflare proxy is OFF

**If 404 errors:**
1. Check Netlify _redirects file is present
2. Verify all HTML files uploaded correctly

---

## 📞 NEXT STEPS AFTER DEPLOYMENT

Once live, test:
- Homepage loads correctly
- Navigation works
- Pricing shows updated values
- Music Video Creator page accessible
- No console errors
- Mobile responsive design

**🎯 DEPLOYMENT SUCCESS INDICATORS:**
- URL shows Netlify domain in address bar
- Site loads faster than VM version
- SSL certificate active (green lock)
- All pages accessible without errors