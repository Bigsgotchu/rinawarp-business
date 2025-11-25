#!/bin/bash

# Website Health Checker & Link Crawler for RinaWarp Production
# Comprehensive analysis of https://rinawarptech.com

set -e

echo "🔍 RINAWARP WEBSITE HEALTH CHECK & LINK CRAWLER"
echo "=============================================="

# Target website
TARGET_URL="https://rinawarptech.com"
REPORT_FILE="/home/karina/Documents/RinaWarp/website-health-report.txt"
TEMP_DIR="/tmp/rinawarp-crawl"

# Create temp directory
mkdir -p "$TEMP_DIR"

echo "📋 Starting comprehensive analysis..."

# Function to check HTTP status
check_http_status() {
    local url="$1"
    echo "Testing: $url" | tee -a "$REPORT_FILE"
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url")
    
    echo "  Status: $status_code | Time: ${response_time}s" | tee -a "$REPORT_FILE"
    
    if [ "$status_code" != "200" ]; then
        echo "  ⚠️  ERROR: HTTP $status_code" | tee -a "$REPORT_FILE"
        return 1
    else
        echo "  ✅ OK" | tee -a "$REPORT_FILE"
        return 0
    fi
}

# Function to extract links from HTML
extract_links() {
    local html_file="$1"
    local base_url="$2"
    
    # Extract all href links
    grep -oP 'href="[^"]*"' "$html_file" | sed 's/href="//;s/"//g' | \
    grep -v '^javascript:' | grep -v '^mailto:' | \
    while read -r link; do
        # Convert relative URLs to absolute
        if [[ "$link" =~ ^/ ]]; then
            echo "${base_url}${link}"
        elif [[ "$link" =~ ^https?:// ]]; then
            echo "$link"
        else
            echo "${base_url}/${link}"
        fi
    done | sort -u
}

# Function to extract resource URLs (images, CSS, JS)
extract_resources() {
    local html_file="$1"
    local base_url="$2"
    
    # Extract images
    grep -oP 'src="[^"]*"' "$html_file" | sed 's/src="//;s/"//g' | while read -r src; do
        if [[ "$src" =~ ^/ ]]; then
            echo "${base_url}${src}"
        elif [[ "$src" =~ ^https?:// ]]; then
            echo "$src"
        else
            echo "${base_url}/${src}"
        fi
    done
    
    # Extract CSS files
    grep -oP 'href="[^"]*\.css[^"]*"' "$html_file" | sed 's/href="//;s/"//g' | while read -r css; do
        if [[ "$css" =~ ^/ ]]; then
            echo "${base_url}${css}"
        elif [[ "$css" =~ ^https?:// ]]; then
            echo "$css"
        else
            echo "${base_url}/${css}"
        fi
    done
    
    # Extract JS files  
    grep -oP 'src="[^"]*\.js[^"]*"' "$html_file" | sed 's/src="//;s/"//g' | while read -r js; do
        if [[ "$js" =~ ^/ ]]; then
            echo "${base_url}${js}"
        elif [[ "$js" =~ ^https?:// ]]; then
            echo "$js"
        else
            echo "${base_url}/${js}"
        fi
    done
}

# Initialize report
cat > "$REPORT_FILE" << EOF
RINAWARP WEBSITE HEALTH REPORT
Generated: $(date)
Target: $TARGET_URL
===============================================

EOF

echo "🌐 Step 1: Main website analysis..."
check_http_status "$TARGET_URL" || echo "Main site issues detected" | tee -a "$REPORT_FILE"

# Download main page
echo "📥 Downloading main page for analysis..." | tee -a "$REPORT_FILE"
curl -s "$TARGET_URL" > "$TEMP_DIR/index.html"

if [ ! -s "$TEMP_DIR/index.html" ]; then
    echo "❌ Failed to download main page" | tee -a "$REPORT_FILE"
    exit 1
fi

echo "📄 Main page size: $(wc -c < "$TEMP_DIR/index.html") bytes" | tee -a "$REPORT_FILE"

# Extract and test all links from main page
echo "🔗 Step 2: Extracting and testing links..." | tee -a "$REPORT_FILE"
extract_links "$TEMP_DIR/index.html" "$TARGET_URL" | while read -r link; do
    check_http_status "$link" &
done
wait

# Extract and test all resources
echo "🖼️  Step 3: Testing resources (images, CSS, JS)..." | tee -a "$REPORT_FILE"
extract_resources "$TEMP_DIR/index.html" "$TARGET_URL" | while read -r resource; do
    check_http_status "$resource" &
done
wait

# Test specific pages mentioned in requirements
echo "📄 Step 4: Testing specific pages..." | tee -a "$REPORT_FILE"
for page in "/download.html" "/pricing.html" "/terminal-pro.html" "/about.html" "/contact.html" "/terms.html" "/privacy.html"; do
    check_http_status "${TARGET_URL}${page}"
done

echo "" | tee -a "$REPORT_FILE"
echo "📊 HEALTH CHECK SUMMARY:" | tee -a "$REPORT_FILE"
echo "========================" | tee -a "$REPORT_FILE"

# Count issues
http_errors=$(grep -c "ERROR: HTTP" "$REPORT_FILE" || echo "0")
http_warnings=$(grep -c "⚠️" "$REPORT_FILE" || echo "0")
ok_count=$(grep -c "✅ OK" "$REPORT_FILE" || echo "0")

echo "✅ Successful requests: $ok_count" | tee -a "$REPORT_FILE"
echo "❌ HTTP errors: $http_errors" | tee -a "$REPORT_FILE"
echo "⚠️  Warnings: $http_warnings" | tee -a "$REPORT_FILE"

if [ "$http_errors" -gt 0 ]; then
    echo "" | tee -a "$REPORT_FILE"
    echo "🔧 FIXES NEEDED:" | tee -a "$REPORT_FILE"
    grep -A 2 "ERROR: HTTP" "$REPORT_FILE" | tee -a "$REPORT_FILE"
fi

echo "" | tee -a "$REPORT_FILE"
echo "📋 Full report saved to: $REPORT_FILE"
echo "🎉 Website health check complete!"

# Cleanup
rm -rf "$TEMP_DIR"