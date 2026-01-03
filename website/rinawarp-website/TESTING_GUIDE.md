# RinaWarp Website Testing Guide

## 🔍 Testing GA4 Events

### Browser Developer Tools Method
1. **Open the website** in Chrome/Firefox
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Enable GA4 Debug Mode** by typing:
   ```javascript
   gtag('config', 'G-SZK23HMCVP', { debug_mode: true });
   ```
5. **Navigate through the site** and trigger events:
   - Visit homepage → Should see `view_homepage`
   - Visit pricing page → Should see `view_pricing`
   - Visit terminal-pro page → Should see `view_terminal_pro`
   - Visit support page → Should see `view_support`
   - Visit rina-vex-music page → Should see `view_rina_vex_music`
   - Visit download page → Should see `view_download`

### Real-time Testing Method
1. **Go to Google Analytics** → Real-time → Events
2. **Perform actions** on the website
3. **Watch for events** appearing in real-time

## 🛒 Testing Conversion Flow

### Download Flow Testing
1. **Navigate to download page**
2. **Click download buttons**:
   - Linux DEB Package → Should trigger `download` event
   - Linux AppImage → Should trigger `download` event
3. **Verify file downloads** work correctly

### Pricing Flow Testing
1. **Navigate to pricing page**
2. **Click pricing buttons**:
   - "Choose Basic" → Should trigger `checkout_start` event with tier: 'Basic'
   - "Choose Starter" → Should trigger `checkout_start` event with tier: 'Starter'
   - "Choose Creator" → Should trigger `checkout_start` event with tier: 'Creator'
   - "Choose Pro" → Should trigger `checkout_start` event with tier: 'Pro'
   - "Lock Founder Wave" → Should trigger `checkout_start` event with tier: 'Founder Lifetime'
   - "Lock Pioneer Wave" → Should trigger `checkout_start` event with tier: 'Pioneer Lifetime'
   - "Choose Lifetime Future" → Should trigger `checkout_start` event with tier: 'Lifetime Future'

### Sticky CTA Testing
1. **Navigate to each page** with new sticky CTAs:
   - terminal-pro.html
   - support.html  
   - rina-vex-music.html
2. **Scroll down** past 400px
3. **Verify sticky CTAs appear**
4. **Click CTA buttons** → Should trigger appropriate tracking

## 🎯 Expected Event Summary

### Page View Events
| Page | Event Name | Parameters |
|------|------------|------------|
| Homepage | `view_homepage` | `{ location: "/" }` |
| Pricing | `view_pricing` | `{ location: "/pricing" }` |
| Download | `view_download` | `{ location: "/download" }` |
| Terminal Pro | `view_terminal_pro` | `{ location: "/terminal-pro" }` |
| Support | `view_support` | `{ location: "/support" }` |
| Rina Vex Music | `view_rina_vex_music` | `{ location: "/rina-vex-music" }` |

### Conversion Events
| Action | Event Name | Parameters |
|--------|------------|------------|
| Download App | `download` | `{ event_category: "app", event_label: "Linux DEB" }` |
| Download App | `download` | `{ event_category: "app", event_label: "Linux AppImage" }` |
| Click Pricing CTA | `click_pricing` | `{ source: "download_license_cta", tier: "pioneer" }` |
| Start Checkout | `checkout_start` | `{ tier: "Basic" }` |
| Start Checkout | `checkout_start` | `{ tier: "Starter" }` |
| Start Checkout | `checkout_start` | `{ tier: "Creator" }` |
| Start Checkout | `checkout_start` | `{ tier: "Pro" }` |
| Start Checkout | `checkout_start` | `{ tier: "Founder Lifetime" }` |
| Start Checkout | `checkout_start` | `{ tier: "Pioneer Lifetime" }` |
| Start Checkout | `checkout_start` | `{ tier: "Lifetime Future" }` |

## 🔧 Troubleshooting

### Events Not Firing
1. **Check GA4 tag** is loaded (Network tab → look for `gtag/js`)
2. **Check for JavaScript errors** in console
3. **Verify GA4 property ID** matches: `G-SZK23HMCVP`

### Links Not Working
1. **Check Stripe test links** are properly formatted
2. **Verify download file paths** are correct
3. **Test in different browsers**

## 📊 Analytics Setup Verification

1. **Check GA4 Property** exists with ID: `G-SZK23HMCVP`
2. **Verify Enhanced Measurement** is enabled
3. **Set up Custom Dimensions** for tier tracking (optional)
4. **Configure Conversion Events** in GA4:
   - `download`
   - `checkout_start`
   - `click_pricing`

## 🚀 Ready for Production

Once testing is complete:
1. **Replace test Stripe links** with live links
2. **Update GA4 property** if needed for production
3. **Deploy website** with all tracking in place
4. **Monitor conversion metrics** in Google Analytics

## 📞 Support

If issues are found during testing, check:
- Console for JavaScript errors
- Network tab for failed requests
- GA4 real-time reports for missing events
- Browser compatibility for older browsers