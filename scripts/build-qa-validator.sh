#!/bin/bash

# Automated Build Validation & Quality Assurance Tool
# Validates website build for missing assets, broken links, and console errors

set -e

echo "🔍 BUILD VALIDATION & QA AUTOMATION TOOL"
echo "======================================"

# Configuration
DIST_DIR="/home/karina/Documents/RinaWarp/rinawarp-website/dist"
BASE_URL="https://rinawarptech.com"
QA_REPORT="/home/karina/Documents/RinaWarp/build-qa-report.txt"
ERRORS_FOUND=false

# Initialize report
cat > "$QA_REPORT" << EOF
BUILD VALIDATION & QA REPORT
Generated: $(date)
Build Directory: $DIST_DIR
Base URL: $BASE_URL
================================================

EOF

echo "📂 Analyzing build directory: $DIST_DIR"

if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Error: Build directory not found!" | tee -a "$QA_REPORT"
    exit 1
fi

echo "📊 Files in build directory:" | tee -a "$QA_REPORT"
ls -la "$DIST_DIR" | tee -a "$QA_REPORT"

# Function to check for missing assets
check_missing_assets() {
    echo "" | tee -a "$QA_REPORT"
    echo "🖼️  CHECKING FOR MISSING ASSETS..." | tee -a "$QA_REPORT"
    echo "===================================" | tee -a "$QA_REPORT"
    
    # Check for images referenced in HTML files
    find "$DIST_DIR" -name "*.html" -exec grep -ho 'src="[^"]*"' {} \; | \
    sed 's/src="//g; s/"//g' | grep -v '^http' | while read -r img; do
        if [ ! -f "$DIST_DIR/$img" ] && [ ! -f "$DIST_DIR${img#/}" ]; then
            echo "❌ Missing image: $img" | tee -a "$QA_REPORT"
            ERRORS_FOUND=true
        fi
    done
    
    # Check for CSS files
    find "$DIST_DIR" -name "*.html" -exec grep -ho 'href="[^"]*\.css[^"]*"' {} \; | \
    sed 's/href="//g; s/"//g' | grep -v '^http' | while read -r css; do
        if [ ! -f "$DIST_DIR/$css" ] && [ ! -f "$DIST_DIR${css#/}" ]; then
            echo "❌ Missing CSS: $css" | tee -a "$QA_REPORT"
            ERRORS_FOUND=true
        fi
    done
    
    # Check for JS files
    find "$DIST_DIR" -name "*.html" -exec grep -ho 'src="[^"]*\.js[^"]*"' {} \; | \
    sed 's/src="//g; s/"//g' | grep -v '^http' | while read -r js; do
        if [ ! -f "$DIST_DIR/$js" ] && [ ! -f "$DIST_DIR${js#/}" ]; then
            echo "❌ Missing JS: $js" | tee -a "$QA_REPORT"
            ERRORS_FOUND=true
        fi
    done
}

# Function to scan for 404 patterns
check_404_patterns() {
    echo "" | tee -a "$QA_REPORT"
    echo "🔍 SCANNING FOR 404 PATTERNS..." | tee -a "$QA_REPORT"
    echo "================================" | tee -a "$QA_REPORT"
    
    # Look for common 404 patterns in HTML files
    if grep -r "404" "$DIST_DIR"/*.html 2>/dev/null; then
        echo "⚠️  Found '404' references in HTML files" | tee -a "$QA_REPORT"
    fi
    
    if grep -r "not found" "$DIST_DIR"/*.html 2>/dev/null; then
        echo "⚠️  Found 'not found' references in HTML files" | tee -a "$QA_REPORT"
    fi
    
    # Check for broken internal links
    find "$DIST_DIR" -name "*.html" -exec grep -ho 'href="[^"]*"' {} \; | \
    sed 's/href="//g; s/"//g' | grep -v '^http' | grep -v '^#' | grep -v '^mailto:' | while read -r link; do
        if [ ! -f "$DIST_DIR/$link" ] && [ ! -f "$DIST_DIR${link#/}" ]; then
            echo "❌ Broken internal link: $link" | tee -a "$QA_REPORT"
            ERRORS_FOUND=true
        fi
    done
}

# Function to validate HTML structure
validate_html() {
    echo "" | tee -a "$QA_REPORT"
    echo "📄 VALIDATING HTML STRUCTURE..." | tee -a "$QA_REPORT"
    echo "=================================" | tee -a "$QA_REPORT"
    
    # Check for common HTML issues
    for html_file in "$DIST_DIR"/*.html; do
        if [ -f "$html_file" ]; then
            filename=$(basename "$html_file")
            
            # Check for empty href attributes
            if grep -q 'href=""' "$html_file"; then
                echo "⚠️  Empty href found in $filename" | tee -a "$QA_REPORT"
            fi
            
            # Check for empty src attributes
            if grep -q 'src=""' "$html_file"; then
                echo "⚠️  Empty src found in $filename" | tee -a "$QA_REPORT"
            fi
            
            # Check for missing closing tags
            if grep -q '<[^/>][^>]*[^/]>' "$html_file" | grep -v '<img\|<br\|<hr\|<input'; then
                echo "⚠️  Potential unclosed tags in $filename" | tee -a "$QA_REPORT"
            fi
            
            echo "✅ Checked: $filename" | tee -a "$QA_REPORT"
        fi
    done
}

# Function to test live website
test_live_website() {
    echo "" | tee -a "$QA_REPORT"
    echo "🌐 TESTING LIVE WEBSITE..." | tee -a "$QA_REPORT"
    echo "============================" | tee -a "$QA_REPORT"
    
    # Test main page
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
    if [ "$status_code" = "200" ]; then
        echo "✅ Main page: HTTP $status_code" | tee -a "$QA_REPORT"
    else
        echo "❌ Main page: HTTP $status_code" | tee -a "$QA_REPORT"
        ERRORS_FOUND=true
    fi
    
    # Test key pages
    for page in "index.html" "download.html" "pricing.html"; do
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/${page}")
        if [ "$status_code" = "200" ]; then
            echo "✅ $page: HTTP $status_code" | tee -a "$QA_REPORT"
        else
            echo "❌ $page: HTTP $status_code" | tee -a "$QA_REPORT"
            ERRORS_FOUND=true
        fi
    done
}

# Function to generate SEO checklist
seo_checklist() {
    echo "" | tee -a "$QA_REPORT"
    echo "🔍 SEO VALIDATION CHECKLIST..." | tee -a "$QA_REPORT"
    echo "===============================" | tee -a "$QA_REPORT"
    
    # Check for robots.txt
    if [ -f "$DIST_DIR/robots.txt" ]; then
        echo "✅ robots.txt present" | tee -a "$QA_REPORT"
    else
        echo "❌ robots.txt missing" | tee -a "$QA_REPORT"
        ERRORS_FOUND=true
    fi
    
    # Check for sitemap.xml
    if [ -f "$DIST_DIR/sitemap.xml" ]; then
        echo "✅ sitemap.xml present" | tee -a "$QA_REPORT"
    else
        echo "❌ sitemap.xml missing" | tee -a "$QA_REPORT"
        ERRORS_FOUND=true
    fi
    
    # Check meta tags in index.html
    if [ -f "$DIST_DIR/index.html" ]; then
        if grep -q '<title>' "$DIST_DIR/index.html"; then
            echo "✅ Title tag found" | tee -a "$QA_REPORT"
        else
            echo "❌ Title tag missing" | tee -a "$QA_REPORT"
            ERRORS_FOUND=true
        fi
        
        if grep -q 'meta.*description' "$DIST_DIR/index.html"; then
            echo "✅ Meta description found" | tee -a "$QA_REPORT"
        else
            echo "⚠️  Meta description missing" | tee -a "$QA_REPORT"
        fi
    fi
}

# Run all checks
check_missing_assets
check_404_patterns
validate_html
test_live_website
seo_checklist

# Final summary
echo "" | tee -a "$QA_REPORT"
echo "📊 FINAL QA SUMMARY:" | tee -a "$QA_REPORT"
echo "====================" | tee -a "$QA_REPORT"

if [ "$ERRORS_FOUND" = true ]; then
    echo "❌ ISSUES FOUND - Build needs fixes!" | tee -a "$QA_REPORT"
    echo "🔧 Review the issues above and fix before deployment" | tee -a "$QA_REPORT"
    exit 1
else
    echo "✅ ALL CHECKS PASSED - Build is ready for deployment!" | tee -a "$QA_REPORT"
    echo "🎉 Website quality assurance completed successfully!" | tee -a "$QA_REPORT"
fi

echo "" | tee -a "$QA_REPORT"
echo "📋 Full QA report saved to: $QA_REPORT"