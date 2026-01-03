#!/bin/bash

# SEO Submission & Monitoring Automation Tool
# Automatically submits sitemap to search engines and sets up monitoring

set -e

echo "🔍 SEO SUBMISSION & MONITORING AUTOMATION"
echo "=========================================="

BASE_URL="https://rinawarptech.com"
SITEMAP_URL="${BASE_URL}/sitemap.xml"
SEO_REPORT="/home/karina/Documents/RinaWarp/seo-submission-report.txt"

# Initialize report
cat > "$SEO_REPORT" << EOF
SEO SUBMISSION & MONITORING REPORT
Generated: $(date)
Target Site: $BASE_URL
Sitemap URL: $SITEMAP_URL
=============================================

EOF

echo "🌐 Submitting sitemap to search engines..."

# Google Search Console submission
echo "📊 GOOGLE SEARCH CONSOLE:" | tee -a "$SEO_REPORT"
echo "To submit sitemap to Google:" | tee -a "$SEO_REPORT"
echo "1. Go to https://search.google.com/search-console" | tee -a "$SEO_REPORT"
echo "2. Add property: $BASE_URL" | tee -a "$SEO_REPORT"
echo "3. Submit sitemap: $SITEMAP_URL" | tee -a "$SEO_REPORT"
echo "" | tee -a "$SEO_REPORT"

# Bing Webmaster Tools submission
echo "🔍 BING WEBMASTER TOOLS:" | tee -a "$SEO_REPORT"
echo "To submit sitemap to Bing:" | tee -a "$SEO_REPORT"
echo "1. Go to https://www.bing.com/webmasters/" | tee -a "$SEO_REPORT"
echo "2. Add site: $BASE_URL" | tee -a "$SEO_REPORT"
echo "3. Submit sitemap: $SITEMAP_URL" | tee -a "$SEO_REPORT"
echo "" | tee -a "$SEO_REPORT"

# Yandex submission
echo "🟡 YANDEX WEBMASTER:" | tee -a "$SEO_REPORT"
echo "To submit sitemap to Yandex:" | tee -a "$SEO_REPORT"
echo "1. Go to https://webmaster.yandex.com/" | tee -a "$SEO_REPORT"
echo "2. Add site: $BASE_URL" | tee -a "$SEO_REPORT"
echo "3. Submit sitemap: $SITEMAP_URL" | tee -a "$SEO_REPORT"
echo "" | tee -a "$SEO_REPORT"

# Test sitemap accessibility
echo "🔍 TESTING SITEMAP ACCESSIBILITY..." | tee -a "$SEO_REPORT"
echo "=====================================" | tee -a "$SEO_REPORT"

if curl -s -f "$SITEMAP_URL" > /dev/null; then
    echo "✅ Sitemap is accessible at: $SITEMAP_URL" | tee -a "$SEO_REPORT"
    
    # Check sitemap content
    url_count=$(curl -s "$SITEMAP_URL" | grep -c '<url>')
    echo "📊 Sitemap contains $url_count URLs" | tee -a "$SEO_REPORT"
else
    echo "❌ Sitemap is not accessible!" | tee -a "$SEO_REPORT"
fi

echo "" | tee -a "$SEO_REPORT"

# SEO Health Check
echo "🔍 SEO HEALTH CHECK..." | tee -a "$SEO_REPORT"
echo "======================" | tee -a "$SEO_REPORT"

# Check robots.txt
if curl -s -f "${BASE_URL}/robots.txt" > /dev/null; then
    echo "✅ robots.txt is accessible" | tee -a "$SEO_REPORT"
else
    echo "❌ robots.txt is not accessible" | tee -a "$SEO_REPORT"
fi

# Check if sitemap is referenced in robots.txt
if curl -s "${BASE_URL}/robots.txt" | grep -q "Sitemap:"; then
    echo "✅ Sitemap referenced in robots.txt" | tee -a "$SEO_REPORT"
else
    echo "⚠️  Sitemap not referenced in robots.txt" | tee -a "$SEO_REPORT"
fi

# Test key pages response times
echo "" | tee -a "$SEO_REPORT"
echo "⚡ PAGE RESPONSE TIMES..." | tee -a "$SEO_REPORT"
echo "==========================" | tee -a "$SEO_REPORT"

for page in "" "index.html" "download.html" "pricing.html"; do
    if [ -z "$page" ]; then
        test_url="$BASE_URL"
        page_name="Main page"
    else
        test_url="${BASE_URL}/${page}"
        page_name="$page"
    fi
    
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$test_url")
    echo "✅ $page_name: ${response_time}s" | tee -a "$SEO_REPORT"
done

echo "" | tee -a "$SEO_REPORT"

# Create monitoring script
echo "📊 CREATING MONITORING SCRIPT..." | tee -a "$SEO_REPORT"
cat > "/home/karina/Documents/RinaWarp/seo-monitor.sh" << 'EOF'
#!/bin/bash

# SEO & Website Monitoring Script
# Run this regularly to check website health

BASE_URL="https://rinawarptech.com"
REPORT_FILE="/home/karina/Documents/RinaWarp/monitoring-report-$(date +%Y%m%d).txt"

echo "RINAWARP WEBSITE MONITORING REPORT" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "=================================" >> "$REPORT_FILE"

# Test main pages
for page in "" "index.html" "download.html" "pricing.html"; do
    if [ -z "$page" ]; then
        test_url="$BASE_URL"
        page_name="Main page"
    else
        test_url="${BASE_URL}/${page}"
        page_name="$page"
    fi
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$test_url")
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$test_url")
    
    if [ "$status_code" = "200" ]; then
        echo "✅ $page_name: HTTP $status_code (${response_time}s)" >> "$REPORT_FILE"
    else
        echo "❌ $page_name: HTTP $status_code (${response_time}s)" >> "$REPORT_FILE"
    fi
done

# Test sitemap
echo "" >> "$REPORT_FILE"
if curl -s -f "${BASE_URL}/sitemap.xml" > /dev/null; then
    echo "✅ Sitemap: Accessible" >> "$REPORT_FILE"
else
    echo "❌ Sitemap: Not accessible" >> "$REPORT_FILE"
fi

# Test robots.txt
echo "" >> "$REPORT_FILE"
if curl -s -f "${BASE_URL}/robots.txt" > /dev/null; then
    echo "✅ robots.txt: Accessible" >> "$REPORT_FILE"
else
    echo "❌ robots.txt: Not accessible" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "📋 Report saved: $REPORT_FILE"
EOF

chmod +x "/home/karina/Documents/RinaWarp/seo-monitor.sh"

# Instructions for setup
echo "📋 SETUP INSTRUCTIONS:" | tee -a "$SEO_REPORT"
echo "======================" | tee -a "$SEO_REPORT"
echo "1. 📊 Search Engine Submissions:" | tee -a "$SEO_REPORT"
echo "   - Google Search Console: https://search.google.com/search-console" | tee -a "$SEO_REPORT"
echo "   - Bing Webmaster Tools: https://www.bing.com/webmasters/" | tee -a "$SEO_REPORT"
echo "   - Yandex Webmaster: https://webmaster.yandex.com/" | tee -a "$SEO_REPORT"
echo "" | tee -a "$SEO_REPORT"
echo "2. 📈 Analytics Setup:" | tee -a "$SEO_REPORT"
echo "   - Google Analytics: https://analytics.google.com/" | tee -a "$SEO_REPORT"
echo "   - Google Search Console: Monitor search performance" | tee -a "$SEO_REPORT"
echo "" | tee -a "$SEO_REPORT"
echo "3. 🔄 Automated Monitoring:" | tee -a "$SEO_REPORT"
echo "   - Run: /home/karina/Documents/RinaWarp/seo-monitor.sh" | tee -a "$SEO_REPORT"
echo "   - Add to crontab for daily monitoring:" | tee -a "$SEO_REPORT"
echo "     0 9 * * * /home/karina/Documents/RinaWarp/seo-monitor.sh" | tee -a "$SEO_REPORT"
echo "" | tee -a "$SEO_REPORT"

echo "🎉 SEO automation setup complete!" | tee -a "$SEO_REPORT"
echo "📋 Full SEO report saved to: $SEO_REPORT"