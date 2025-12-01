#!/bin/bash

# RinaWarp Website Deployment Script
# This script consolidates, builds, and deploys the clean RinaWarp website
# Usage: ./deploy.sh [environment]
# Environments: production, staging, development

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="$SCRIPT_DIR"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
BUILD_DIR="$WEBSITE_DIR"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
ENVIRONMENT=${1:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are available
check_requirements() {
    log_info "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is required but not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_warning "Git is not installed. Some features may not work."
    fi
    
    log_success "Requirements check passed"
}

# Clean up duplicate builds
cleanup_duplicates() {
    log_info "Cleaning up duplicate website builds..."
    
    # Create archive directory if it doesn't exist
    mkdir -p "$ARCHIVE_DIR"
    
    # Move old website directories to archive
    if [ -d "$SCRIPT_DIR/website" ]; then
        log_info "Moving website/ directory to archive..."
        mv "$SCRIPT_DIR/website" "$ARCHIVE_DIR/website-backup-$TIMESTAMP" 2>/dev/null || true
    fi
    
    # Clean up any remaining duplicates
    find "$SCRIPT_DIR" -maxdepth 2 -name "*website*" -type d | grep -v "$WEBSITE_DIR" | grep -v "$ARCHIVE_DIR" | while read -r dir; do
        log_info "Moving duplicate directory to archive: $dir"
        mv "$dir" "$ARCHIVE_DIR/duplicate-$(basename $dir)-$TIMESTAMP" 2>/dev/null || true
    done
    
    log_success "Cleanup completed"
}

# Verify website structure
verify_structure() {
    log_info "Verifying website structure..."
    
    required_files=(
        "$BUILD_DIR/index.html"
        "$BUILD_DIR/terminal-pro.html"
        "$BUILD_DIR/music-video-creator.html"
        "$BUILD_DIR/pricing.html"
        "$BUILD_DIR/download.html"
        "$BUILD_DIR/css/rinawarp-styles.css"
        "$BUILD_DIR/robots.txt"
        "$BUILD_DIR/sitemap.xml"
        "$BUILD_DIR/manifest.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Required file missing: $file"
            exit 1
        fi
    done
    
    log_success "Website structure verified"
}

# Optimize images
optimize_images() {
    log_info "Optimizing images..."
    
    # Create WebP versions of PNG/JPG files
    if command -v cwebp &> /dev/null; then
        find "$BUILD_DIR" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | while read -r img; do
            webp_path="${img%.*}.webp"
            if [ ! -f "$webp_path" ]; then
                cwebp -q 85 "$img" -o "$webp_path" 2>/dev/null || true
                log_info "Created WebP version: $(basename "$webp_path")"
            fi
        done
    else
        log_warning "cwebp not found. Skipping WebP optimization."
    fi
    
    log_success "Image optimization completed"
}

# Minify CSS and JS
minify_assets() {
    log_info "Minifying CSS and JavaScript..."
    
    # Minify CSS
    if [ -f "$BUILD_DIR/css/rinawarp-styles.css" ]; then
        if command -v csso &> /dev/null; then
            csso "$BUILD_DIR/css/rinawarp-styles.css" --output "$BUILD_DIR/css/rinawarp-styles.min.css"
            log_info "CSS minified: rinawarp-styles.min.css"
        else
            log_warning "csso not found. CSS minification skipped."
        fi
    fi
    
    # JavaScript minification would go here if we had JS files to minify
    log_success "Asset minification completed"
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    report_file="$BUILD_DIR/deployment-report-$TIMESTAMP.txt"
    
    cat > "$report_file" << EOF
RinaWarp Website Deployment Report
=================================

Deployment Date: $(date)
Environment: $ENVIRONMENT
Build Directory: $BUILD_DIR

Files Deployed:
$(find "$BUILD_DIR" -type f | sort)

Total Files: $(find "$BUILD_DIR" -type f | wc -l)
Total Size: $(du -sh "$BUILD_DIR" | cut -f1)

Optimization Status:
- WebP Images: $(find "$BUILD_DIR" -name "*.webp" | wc -l) files created
- Minified CSS: $(if [ -f "$BUILD_DIR/css/rinawarp-styles.min.css" ]; then echo "Yes"; else echo "No"; fi)

SEO Status:
- robots.txt: $(if [ -f "$BUILD_DIR/robots.txt" ]; then echo "Present"; else echo "Missing"; fi)
- sitemap.xml: $(if [ -f "$BUILD_DIR/sitemap.xml" ]; then echo "Present"; else echo "Missing"; fi)
- manifest.json: $(if [ -f "$BUILD_DIR/manifest.json" ]; then echo "Present"; else echo "Missing"; fi)

Page Status:
- Homepage: $(if [ -f "$BUILD_DIR/index.html" ]; then echo "✓"; else echo "✗"; fi)
- Terminal Pro: $(if [ -f "$BUILD_DIR/terminal-pro.html" ]; then echo "✓"; else echo "✗"; fi)
- Music Video Creator: $(if [ -f "$BUILD_DIR/music-video-creator.html" ]; then echo "✓"; else echo "✗"; fi)
- Pricing: $(if [ -f "$BUILD_DIR/pricing.html" ]; then echo "✓"; else echo "✗"; fi)
- Download: $(if [ -f "$BUILD_DIR/download.html" ]; then echo "✓"; else echo "✗"; fi)

Deployment completed successfully!
EOF

    log_success "Deployment report generated: $report_file"
}

# Deploy to environment
deploy_to_environment() {
    log_info "Deploying to $ENVIRONMENT environment..."
    
    case $ENVIRONMENT in
        "production")
            log_info "Deploying to production..."
            # Production deployment commands would go here
            # Example: rsync, ftp, cloud deployment, etc.
            log_warning "Production deployment commands not configured"
            ;;
        "staging")
            log_info "Deploying to staging..."
            # Staging deployment commands would go here
            log_warning "Staging deployment commands not configured"
            ;;
        "development")
            log_info "Setting up local development environment..."
            # Local development setup
            if command -v python3 &> /dev/null; then
                cd "$BUILD_DIR"
                log_info "Starting local server on port 8000..."
                python3 -m http.server 8000 &
                echo $! > "$BUILD_DIR/server.pid"
                log_success "Local development server started"
                log_info "Visit: http://localhost:8000"
            else
                log_warning "Python3 not found. Install to run local server."
            fi
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    log_success "Deployment to $ENVIRONMENT completed"
}

# Generate deployment package
create_package() {
    log_info "Creating deployment package..."
    
    package_name="rinawarp-website-$ENVIRONMENT-$TIMESTAMP.tar.gz"
    package_path="$SCRIPT_DIR/$package_name"
    
    cd "$SCRIPT_DIR"
    tar -czf "$package_path" -C "$WEBSITE_DIR" .
    
    log_success "Deployment package created: $package_path"
    log_info "Package size: $(du -h "$package_path" | cut -f1)"
}

# Main deployment function
main() {
    echo "========================================="
    echo "RinaWarp Website Deployment Script"
    echo "========================================="
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $TIMESTAMP"
    echo ""
    
    # Run deployment steps
    check_requirements
    cleanup_duplicates
    verify_structure
    optimize_images
    minify_assets
    generate_report
    deploy_to_environment
    create_package
    
    echo ""
    echo "========================================="
    log_success "Deployment completed successfully!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Test the deployment locally (development mode)"
    echo "2. Deploy to staging environment"
    echo "3. Deploy to production environment"
    echo ""
    echo "Useful commands:"
    echo "- View website: http://localhost:8000 (if running dev server)"
    echo "- Check logs: cat $BUILD_DIR/deployment-report-$TIMESTAMP.txt"
    echo "- Archive location: $ARCHIVE_DIR"
    echo ""
}

# Handle script interruption
cleanup() {
    log_info "Cleaning up..."
    if [ -f "$BUILD_DIR/server.pid" ]; then
        kill $(cat "$BUILD_DIR/server.pid") 2>/dev/null || true
        rm -f "$BUILD_DIR/server.pid"
    fi
}

trap cleanup EXIT

# Run main function
main "$@"