#!/bin/bash

# Cloudflare Legal Hub Validation Script
# Validates that the Legal Hub is properly deployed and accessible

# Configuration
BASE_URL="https://rinawarptech.com"
LEGAL_HUB_PATH="/legal"
STRIPE_TOS_URL="$BASE_URL$LEGAL_HUB_PATH/terms-of-service.html"
STRIPE_PRIVACY_URL="$BASE_URL$LEGAL_HUB_PATH/privacy-policy.html"

# Required documents for validation
REQUIRED_DOCUMENTS=(
    "terms-of-service.html"
    "privacy-policy.html"
    "refund-policy.html"
    "cookie-policy.html"
    "gdpr-ccpa-policy.html"
    "acceptable-use-policy.html"
    "ai-ethical-policy.html"
    "accessibility-policy.html"
    "data-subject-request-policy.html"
    "dmca-policy.html"
    "security-policy.html"
    "vendor-third-party-policy.html"
    "terminal-pro-eula.html"
    "ai-music-video-creator-eula.html"
    "commercial-license-agreement.html"
    "data-processing-agreement.html"
    "subscription-billing-agreement.html"
)

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check URL status
check_url_status() {
    local url=$1
    local expected_status=${2:-200}

    # Use curl to check the URL
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [[ "$status_code" == "$expected_status" ]]; then
        echo -e "${GREEN}✓${NC} $url - HTTP $status_code"
        return 0
    else
        echo -e "${RED}✗${NC} $url - HTTP $status_code (expected $expected_status)"
        return 1
    fi
}

# Function to validate URL format for Stripe
validate_stripe_url() {
    local url=$1
    local url_name=$2

    # Check if URL starts with https://
    if [[ ! "$url" =~ ^https:// ]]; then
        echo -e "${RED}✗${NC} $url_name URL must start with https://"
        return 1
    fi

    # Check if URL contains the domain
    if [[ ! "$url" =~ rinawarptech\.com ]]; then
        echo -e "${RED}✗${NC} $url_name URL must contain rinawarptech.com domain"
        return 1
    fi

    # Check if URL is accessible
    check_url_status "$url" 200
    return $?
}

# Function to check for broken links in HTML
check_broken_links() {
    local url=$1

    echo -e "${BLUE}Checking for broken links in $url...${NC}"

    # Download the page and extract all links
    local temp_file="/tmp/legal_hub_links_$$"
    curl -s "$url" | grep -o 'href="[^"]*"' | sed 's/href="//;s/"$//' | grep -v '^#' | grep -v 'javascript:' | grep -v 'mailto:' | sort | uniq > "$temp_file"

    local broken_links=0
    local total_links=0

    while read -r link; do
        # Skip empty links and anchors
        if [[ -n "$link" && ! "$link" =~ ^# ]]; then
            total_links=$((total_links + 1))

            # Handle relative URLs
            local full_link="$link"
            if [[ "$link" =~ ^/ ]]; then
                full_link="$BASE_URL$link"
            elif [[ ! "$link" =~ ^https?:// ]]; then
                full_link="$url/$link"
            fi

            # Check if link is accessible (only check same-domain links)
            if [[ "$full_link" =~ rinawarptech\.com ]]; then
                local status_code
                status_code=$(curl -s -o /dev/null -w "%{http_code}" "$full_link" 2>/dev/null)

                if [[ "$status_code" -ge 400 ]]; then
                    echo -e "${RED}✗${NC} Broken link: $link (HTTP $status_code)"
                    broken_links=$((broken_links + 1))
                fi
            fi
        fi
    done < "$temp_file"

    rm -f "$temp_file"

    if [[ $broken_links -eq 0 ]]; then
        echo -e "${GREEN}✓${NC} No broken links found in $url ($total_links links checked)"
        return 0
    else
        echo -e "${RED}✗${NC} Found $broken_links broken links in $url"
        return 1
    fi
}

# Function to check for broken anchors
check_broken_anchors() {
    local url=$1

    echo -e "${BLUE}Checking for broken anchors in $url...${NC}"

    # Download the page and extract all anchor links
    local temp_file="/tmp/legal_hub_anchors_$$"
    curl -s "$url" | grep -o 'href="#[^"]*"' | sed 's/href="//;s/"$//' > "$temp_file"

    local broken_anchors=0
    local total_anchors=0

    while read -r anchor; do
        if [[ -n "$anchor" && "$anchor" =~ ^# ]]; then
            total_anchors=$((total_anchors + 1))

            # Extract anchor name (remove #)
            local anchor_name="${anchor##}"

            # Check if anchor exists in the page
            if ! curl -s "$url" | grep -q "id=\"$anchor_name\""; then
                echo -e "${YELLOW}⚠${NC}  Potential broken anchor: $anchor"
                broken_anchors=$((broken_anchors + 1))
            fi
        fi
    done < "$temp_file"

    rm -f "$temp_file"

    if [[ $broken_anchors -eq 0 ]]; then
        echo -e "${GREEN}✓${NC} No broken anchors found in $url ($total_anchors anchors checked)"
        return 0
    else
        echo -e "${YELLOW}⚠${NC}  Found $broken_anchors potential broken anchors in $url"
        return 0  # Not a critical failure
    fi
}

# Main validation function
validate_legal_hub() {
    echo -e "${BLUE}=== RinaWarp Legal Hub Validation ===${NC}"
    echo -e "Base URL: $BASE_URL"
    echo -e "Legal Hub Path: $LEGAL_HUB_PATH"
    echo -e "Validation Time: $(date)"
    echo ""

    local all_passed=true

    # 1. Check if legal hub index is accessible
    echo -e "${BLUE}1. Checking Legal Hub Index...${NC}"
    local legal_hub_index="$BASE_URL$LEGAL_HUB_PATH/"
    check_url_status "$legal_hub_index"
    if [[ $? -ne 0 ]]; then
        all_passed=false
    fi
    echo ""

    # 2. Check all required documents
    echo -e "${BLUE}2. Checking Required Documents...${NC}"
    for doc in "${REQUIRED_DOCUMENTS[@]}"; do
        local doc_url="$BASE_URL$LEGAL_HUB_PATH/$doc"
        check_url_status "$doc_url"
        if [[ $? -ne 0 ]]; then
            all_passed=false
        fi
    done
    echo ""

    # 3. Validate Stripe URLs
    echo -e "${BLUE}3. Validating Stripe Compliance URLs...${NC}"
    echo -e "Stripe Terms of Service URL: $STRIPE_TOS_URL"
    validate_stripe_url "$STRIPE_TOS_URL" "Terms of Service"
    if [[ $? -ne 0 ]]; then
        all_passed=false
    fi

    echo -e "Stripe Privacy Policy URL: $STRIPE_PRIVACY_URL"
    validate_stripe_url "$STRIPE_PRIVACY_URL" "Privacy Policy"
    if [[ $? -ne 0 ]]; then
        all_passed=false
    fi
    echo ""

    # 4. Check for broken links in key documents
    echo -e "${BLUE}4. Checking for Broken Links...${NC}"
    check_broken_links "$legal_hub_index"
    check_broken_links "$STRIPE_TOS_URL"
    check_broken_links "$STRIPE_PRIVACY_URL"
    echo ""

    # 5. Check for broken anchors in key documents
    echo -e "${BLUE}5. Checking for Broken Anchors...${NC}"
    check_broken_anchors "$STRIPE_TOS_URL"
    check_broken_anchors "$STRIPE_PRIVACY_URL"
    echo ""

    # 6. Check Cloudflare rewrite rules
    echo -e "${BLUE}6. Checking Cloudflare Rewrite Rules...${NC}"
    # Test if /legal/* paths are properly rewriting
    local test_rewrite_url="$BASE_URL/legal/terms-of-service.html"
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$test_rewrite_url" 2>/dev/null)

    if [[ "$status_code" -eq 200 ]]; then
        echo -e "${GREEN}✓${NC} Cloudflare rewrite rules appear to be working correctly"
    else
        echo -e "${RED}✗${NC} Cloudflare rewrite rules may not be working (HTTP $status_code)"
        all_passed=false
    fi
    echo ""

    # 7. Check SEO metadata
    echo -e "${BLUE}7. Checking SEO Metadata...${NC}"
    local seo_check_url="$BASE_URL$LEGAL_HUB_PATH/terms-of-service.html"
    local has_title=$(curl -s "$seo_check_url" | grep -c "<title>")
    local has_description=$(curl -s "$seo_check_url" | grep -c "name=\"description\"")

    if [[ $has_title -gt 0 && $has_description -gt 0 ]]; then
        echo -e "${GREEN}✓${NC} SEO metadata (title and description) found"
    else
        echo -e "${YELLOW}⚠${NC}  SEO metadata may be incomplete"
    fi
    echo ""

    # Final summary
    echo -e "${BLUE}=== Validation Summary ===${NC}"
    if [[ "$all_passed" = true ]]; then
        echo -e "${GREEN}✓ All validation checks passed!${NC}"
        echo -e "The Legal Hub is ready for production use."
        echo ""
        echo -e "${BLUE}Stripe Dashboard URLs:${NC}"
        echo -e "Terms of Service URL: $STRIPE_TOS_URL"
        echo -e "Privacy Policy URL: $STRIPE_PRIVACY_URL"
        return 0
    else
        echo -e "${RED}✗ Some validation checks failed.${NC}"
        echo -e "Please review the issues above before deploying to production."
        return 1
    fi
}

# Run validation
validate_legal_hub
exit $?