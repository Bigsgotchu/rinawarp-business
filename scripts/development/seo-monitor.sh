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
