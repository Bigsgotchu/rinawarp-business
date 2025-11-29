#!/usr/bin/env bash
set -e

# RinaWarp Enterprise Manual v2.0 - PDF Build Script
# This script creates a comprehensive PDF manual from all documentation

OUTPUT_DIR="manual"
OUTPUT_FILE="${OUTPUT_DIR}/RinaWarp-Enterprise-Manual-v2.0.pdf"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}📖 $1${NC}"
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

# Create output directory
print_header "Creating output directory..."
mkdir -p "$OUTPUT_DIR"

# Check if required files exist
print_header "Checking documentation files..."

REQUIRED_FILES=(
    "README.md"
    "docs/01-Architecture-Overview.md"
    "docs/02-Infrastructure-Map.md"
    "docs/03-Backend-Design.md"
    "docs/04-Frontend-Design.md"
    "docs/05-API-Reference.md"
    "docs/06-Licensing-Engine.md"
    "docs/07-Security-Stack.md"
    "docs/08-Deployment-Guide.md"
    "docs/09-DevOps-Pipeline.md"
    "docs/10-SSL-Configuration.md"
    "docs/11-NGINX-Routing.md"
    "docs/12-Oracle-Cloud-Setup.md"
    "docs/13-DNS-Guide.md"
    "docs/14-Brand-Guidelines.md"
    "docs/15-SEO-Guide.md"
    "docs/16-Release-Management.md"
    "docs/17-Known-Issues.md"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    print_error "Missing required documentation files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

print_success "All documentation files found"

# Check for pandoc
print_header "Checking for pandoc..."
if ! command -v pandoc &> /dev/null; then
    print_error "pandoc is not installed"
    print_warning "To install on Ubuntu/Kali:"
    echo "  sudo apt update"
    echo "  sudo apt install pandoc texlive-latex-recommended texlive-fonts-recommended -y"
    exit 1
fi

PANDOC_VERSION=$(pandoc --version | head -n1)
print_success "Found $PANDOC_VERSION"

# Build the PDF
print_header "Building RinaWarp Enterprise Manual v2.0..."
echo "Output: $OUTPUT_FILE"

pandoc \
  README.md \
  docs/01-Architecture-Overview.md \
  docs/02-Infrastructure-Map.md \
  docs/03-Backend-Design.md \
  docs/04-Frontend-Design.md \
  docs/05-API-Reference.md \
  docs/06-Licensing-Engine.md \
  docs/07-Security-Stack.md \
  docs/08-Deployment-Guide.md \
  docs/09-DevOps-Pipeline.md \
  docs/10-SSL-Configuration.md \
  docs/11-NGINX-Routing.md \
  docs/12-Oracle-Cloud-Setup.md \
  docs/13-DNS-Guide.md \
  docs/14-Brand-Guidelines.md \
  docs/15-SEO-Guide.md \
  docs/16-Release-Management.md \
  docs/17-Known-Issues.md \
  -o "$OUTPUT_FILE" \
  --from markdown \
  --toc \
  --toc-depth=3 \
  --metadata title:"RinaWarp Enterprise Manual v2.0" \
  --metadata author:"RinaWarp Technologies, LLC" \
  --metadata subtitle:"Infrastructure, Security, Deployment & Brand Operations" \
  --metadata date:"$(date +%Y-%m-%d)" \
  --pdf-engine=xelatex \
  --variable mainfont="DejaVu Sans" \
  --variable monofont="DejaVu Sans Mono" \
  --variable fontsize=11pt \
  --variable geometry:margin=1in \
  --variable colorlinks=true \
  --variable linkcolor=blue \
  --variable urlcolor=blue \
  --variable toccolor=gray \
  --highlight-style=github

# Check if build was successful
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    print_success "Manual generated successfully!"
    echo ""
    echo "📄 File: $OUTPUT_FILE"
    echo "📏 Size: $FILE_SIZE"
    echo "📅 Date: $(date)"
    echo ""
    
    # Generate additional formats
    print_header "Generating additional formats..."
    
    # HTML version
    HTML_FILE="${OUTPUT_DIR}/RinaWarp-Enterprise-Manual-v2.0.html"
    pandoc \
      README.md \
      docs/01-Architecture-Overview.md \
      docs/02-Infrastructure-Map.md \
      docs/03-Backend-Design.md \
      docs/04-Frontend-Design.md \
      docs/05-API-Reference.md \
      docs/06-Licensing-Engine.md \
      docs/07-Security-Stack.md \
      docs/08-Deployment-Guide.md \
      docs/09-DevOps-Pipeline.md \
      docs/10-SSL-Configuration.md \
      docs/11-NGINX-Routing.md \
      docs/12-Oracle-Cloud-Setup.md \
      docs/13-DNS-Guide.md \
      docs/14-Brand-Guidelines.md \
      docs/15-SEO-Guide.md \
      docs/16-Release-Management.md \
      docs/17-Known-Issues.md \
      -o "$HTML_FILE" \
      --from markdown \
      --toc \
      --toc-depth=3 \
      --metadata title:"RinaWarp Enterprise Manual v2.0" \
      --metadata author:"RinaWarp Technologies, LLC" \
      --standalone \
      --css=manual/manual-styles.css 2>/dev/null || true
    
    if [ -f "$HTML_FILE" ]; then
        print_success "HTML version created: $HTML_FILE"
    fi
    
    # Summary
    echo ""
    print_header "Build Summary"
    echo "PDF:  $OUTPUT_FILE ($(du -h "$OUTPUT_FILE" | cut -f1))"
    if [ -f "$HTML_FILE" ]; then
        echo "HTML: $HTML_FILE ($(du -h "$HTML_FILE" | cut -f1))"
    fi
    
    echo ""
    echo "🎯 Ready for:"
    echo "  • Investor presentations"
    echo "  • Client documentation"
    echo "  • Team onboarding"
    echo "  • Technical reference"
    echo ""
    
else
    print_error "Failed to generate manual"
    exit 1
fi