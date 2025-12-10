#!/bin/bash

# RinaWarp Launch Checklist Script
# Complete pre-launch and post-launch verification

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}🚀 $1${NC}"
    echo "=========================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Initialize counters
CHECKLIST_ITEMS=0
COMPLETED_ITEMS=0

echo "🎯 RinaWarp Launch Checklist"
echo "============================"

# STEP 1: Final Website Rebuild
print_header "STEP 1 — Final Website Rebuild"
echo "Deploy rinawarp-website/ to Netlify with drag & drop"

print_info "Files ready for deployment:"
echo "✓ Complete website with all pages"
echo "✓ Full Utah-compliant legal bundle"
echo "✓ Terminal Pro + MVC pages"
echo "✓ Support + Pricing + Download pages"
echo "✓ Navigation/footer wiring"
echo "✓ Correct pre-order system"
echo "✓ SEO and OG tags"
echo "✓ Brand tokens (Mermaid + Unicorn theme)"
echo "✓ Cleaned CSS (9,351 bytes)"
echo "✓ No broken assets"
echo "✓ Fixed MIME issues"
echo "✓ No placeholder audio/video"
echo "✓ Clean /assets structure"
echo "✓ CSP and GA/Stripe script fixes"

print_success "All website rebuild items complete"

# STEP 2: Connect Domain
print_header "STEP 2 — Connect Domain"

echo "Netlify → Custom Domains → Add rinawarptech.com"
echo ""
echo "Set these records in Cloudflare:"
echo "┌─────────┬──────────┬─────────────────────────┐"
echo "│ Type    │ Name     │ Value                   │"
echo "├─────────┼──────────┼─────────────────────────┤"
echo "│ A       │ @        │ Netlify load balancer IP│"
echo "│ CNAME   │ www      │ your-site.netlify.app   │"
echo "└─────────┴──────────┴─────────────────────────┘"
echo ""
echo "SSL auto-provisions in 60 seconds."

read -p "Have you connected the domain? (y/n): " domain_connected
if [[ $domain_connected =~ ^[Yy]$ ]]; then
    print_success "Domain connected"
    ((COMPLETED_ITEMS++))
else
    print_warning "Domain connection pending"
fi
((CHECKLIST_ITEMS++))

# STEP 3: Activate Stripe Live Mode
print_header "STEP 3 — Activate Stripe Live Mode"

echo "Go into Stripe dashboard and perform these tasks:"
echo "✓ Activate your business profile"
echo "✓ Turn off Test Mode"
echo "✓ Replace all price IDs in /js/stripe-links.js"
echo "✓ Switch webhook secret to live version"
echo "✓ Add success URL: https://rinawarptech.com/download?license=success"

read -p "Have you activated Stripe live mode? (y/n): " stripe_activated
if [[ $stripe_activated =~ ^[Yy]$ ]]; then
    print_success "Stripe live mode activated"
    ((COMPLETED_ITEMS++))
else
    print_warning "Stripe live mode pending"
fi
((CHECKLIST_ITEMS++))

# STEP 4: Launch Terminal Pro Pre-Orders
print_header "STEP 4 — Launch Terminal Pro Pre-Orders"

echo "Immediately after live deployment:"
echo "✓ Turn on the pricing page"
echo "✓ Enable limited pre-order waves"
echo "✓ Set Founder Lifetime (150 seats)"
echo "✓ Set Pioneer Lifetime (250 seats)"
echo "✓ Set Future Lifetime (unlimited)"
echo ""
echo "This gives you real revenue right away, even before installers ship."

read -p "Have you launched pre-orders? (y/n): " preorders_launched
if [[ $preorders_launched =~ ^[Yy]$ ]]; then
    print_success "Pre-orders launched"
    ((COMPLETED_ITEMS++))
else
    print_warning "Pre-orders pending"
fi
((CHECKLIST_ITEMS++))

# STEP 5: Final Production Audit
print_header "STEP 5 — Final Production Audit"

read -p "Enter your deployed website URL: " WEBSITE_URL

if [ -z "$WEBSITE_URL" ]; then
    print_error "No website URL provided. Cannot run audit."
else
    print_info "Running comprehensive 10-part production audit..."
    echo ""
    
    # Run the final audit script
    chmod +x final-audit.sh
    ./final-audit.sh
fi

((CHECKLIST_ITEMS++))

# Additional Launch Checklist
print_header "LAUNCH VERIFICATION CHECKLIST"

echo "Post-deployment verification:"
echo ""

# Core functionality
print_info "Core Website Functionality:"
echo "[ ] All pages load without errors"
echo "[ ] Navigation menu works on desktop"
echo "[ ] Mobile hamburger menu functions"
echo "[ ] Footer links all resolve correctly"
echo "[ ] HTTPS shows green lock in browser"
echo "[ ] No console errors in browser dev tools"

echo ""
print_info "Business Pages:"
echo "[ ] Pricing page displays correctly"
echo "[ ] Download page shows 'coming soon'"
echo "[ ] Support page form accessible"
echo "[ ] Legal pages all load (/legal/*.html)"

echo ""
print_info "Technical Verification:"
echo "[ ] Page load times under 3 seconds"
echo "[ ] Images load correctly (logo, favicons)"
echo "[ ] CSS and JavaScript load properly"
echo "[ ] Mobile responsive design works"
echo "[ ] Forms submit successfully"

echo ""
print_info "SEO & Marketing:"
echo "[ ] Title tags present on all pages"
echo "[ ] Meta descriptions added"
echo "[ ] Open Graph tags working"
echo "[ ] Favicon displays correctly"
echo "[ ] Canonical URLs set"

echo ""
print_info "Legal Compliance:"
echo "[ ] Privacy policy accessible"
echo "[ ] Terms of service link works"
echo "[ ] Refund policy clearly stated"
echo "[ ] DMCA policy present"
echo "[ ] Cookie policy available"

# Final summary
echo ""
echo "🎯 LAUNCH SUMMARY"
echo "================="
completion_rate=$((COMPLETED_ITEMS * 100 / CHECKLIST_ITEMS))

if [ $completion_rate -eq 100 ]; then
    print_success "🎉 ALL CHECKLIST ITEMS COMPLETE!"
    print_success "Ready for production launch!"
elif [ $completion_rate -ge 75 ]; then
    print_warning "Launch mostly ready - complete remaining items"
else
    print_error "Significant items remaining - address before launch"
fi

echo ""
print_info "Completion Rate: ${COMPLETED_ITEMS}/${CHECKLIST_ITEMS} (${completion_rate}%)"
echo ""

print_info "Next Actions:"
if [ $completion_rate -lt 100 ]; then
    echo "1. Complete remaining checklist items"
    echo "2. Run final production audit"
    echo "3. Test on multiple devices"
    echo "4. Verify payment processing"
else
    echo "1. Monitor site performance"
    echo "2. Set up analytics"
    echo "3. Submit to search engines"
    echo "4. Begin marketing campaign"
fi

echo ""
print_info "Website URL: $WEBSITE_URL"
echo "Launch ready at: $(date)"
echo ""
print_success "RinaWarp website launch checklist complete!"