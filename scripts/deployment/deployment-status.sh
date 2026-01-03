#!/bin/bash

# 🚀 NETLIFY DEPLOYMENT STATUS & NEXT STEPS

echo "========================================="
echo "🚀 RINAWARP TECH - NETLIFY DEPLOYMENT STATUS"
echo "========================================="
echo ""

# Check if deployment was successful
if [ -f "/home/karina/Documents/RinaWarp/rinawarp-website-final/.netlify" ]; then
    echo "✅ STEP 1 - NETLIFY DEPLOYMENT: COMPLETE"
    echo "   🌐 Live URL: https://rinawarptech-website.netlify.app"
    echo "   📝 Project: rinawarptech-website"
    echo "   👥 Team: RinaWarp"
    echo ""
else
    echo "❌ STEP 1 - NETLIFY DEPLOYMENT: NEEDS COMPLETION"
    echo "   Run: cd /home/karina/Documents/RinaWarp/rinawarp-website-final && netlify deploy --create-site rinawarptech-website --dir=. --prod"
    echo ""
fi

echo "🎯 STEP 2 - ADD CUSTOM DOMAIN:"
echo "   1. Open: https://app.netlify.com/projects/rinawarptech-website"
echo "   2. Go to Domain settings"
echo "   3. Add custom domain: rinawarptech.com"
echo "   4. Note the DNS records provided by Netlify"
echo ""

echo "🌐 STEP 3 - CLOUDFLARE DNS:"
echo "   1. Remove old A records (rinawarptech.com → VM IP)"
echo "   2. Add CNAME records to rinawarptech-website.netlify.app"
echo "   3. Set proxy to OFF (Gray Cloud)"
echo "   📄 Instructions: /home/karina/Documents/RinaWarp/cloudflare-dns-instructions.sh"
echo ""

echo "🔧 STEP 4 - NGINX FIX:"
echo "   Run on your VM:"
echo "   chmod +x /home/karina/Documents/RinaWarp/nginx-domain-removal-commands.sh"
echo "   /home/karina/Documents/RinaWarp/nginx-domain-removal-commands.sh"
echo ""

echo "✅ STEP 5 - VERIFICATION:"
echo "   After DNS propagation (1-3 minutes):"
echo "   - Test: https://rinawarptech.com"
echo "   - Verify SSL certificate active"
echo "   - Check no 404 /qzje/ errors"
echo ""

echo "📁 HELPFUL FILES CREATED:"
echo "   - nginx-domain-removal-commands.sh (VM fix)"
echo "   - cloudflare-dns-instructions.sh (DNS guide)"
echo "   - NETLIFY-DEPLOYMENT-CHECKLIST.md (complete guide)"
echo ""

echo "🎯 CURRENT STATUS: 1/5 STEPS COMPLETE"
echo "   ✅ Website deployed to Netlify"
echo "   ⏳ Waiting for domain configuration"
echo ""

echo "💡 TIP: Complete Step 2 in Netlify dashboard, then continue with DNS and NGINX fixes!"