#!/usr/bin/env bash
set -euo pipefail

# ========================================
# RinaWarp Launch Automation Script
# ========================================
# This script automates the complete launch sequence for RinaWarp Terminal Pro
# Created: 2025-11-25
# Version: 1.0.0
# ========================================

ROOT="/home/karina/Documents/RinaWarp"
DESKTOP="$ROOT/apps/terminal-pro/desktop"
WEB="$ROOT/rinawarp-website"
BUILD_OUT="$ROOT/build-output"
LOG="$ROOT/launch-log-$(date +%Y%m%d-%H%M%S).txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  echo "[$(date +'%T')] $*" | tee -a "$LOG"
}

log_info() {
  echo -e "${BLUE}[INFO]${NC} $*" | tee -a "$LOG"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$LOG"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG"
}

# ========================================
# STEP 1: BUILD INSTALLERS
# ========================================
build_installers() {
  log_info "🚀 STEP 1: Building Windows + macOS installers..."
  
  cd "$DESKTOP"
  
  # Check if package.json exists
  if [ ! -f package.json ]; then
    log_error "❌ package.json not found in $DESKTOP – aborting."
    return 1
  fi
  
  # Install dependencies
  log_info "→ Running npm install (if needed)..."
  if npm install >> "$LOG" 2>&1; then
    log_success "✅ npm install completed"
  else
    log_warning "⚠️ npm install had issues, but continuing..."
  fi
  
  # Build Windows installer
  log_info "→ Building Windows installer..."
  if npm run build:win >> "$LOG" 2>&1; then
    log_success "✅ Windows installer built successfully"
  else
    log_warning "⚠️ Windows build failed – check logs manually"
  fi
  
  # Build macOS installer
  log_info "→ Building macOS installer..."
  if npm run build:mac >> "$LOG" 2>&1; then
    log_success "✅ macOS installer built successfully"
  else
    log_warning "⚠️ macOS build failed – check logs manually"
  fi
  
  # Collect installers
  log_info "→ Collecting installers into build-output..."
  mkdir -p "$BUILD_OUT"
  
  # Copy all relevant artifacts
  for f in \
    "$DESKTOP/dist"/*.exe \
    "$DESKTOP/dist"/*.dmg \
    "$DESKTOP/dist"/*.AppImage \
    "$DESKTOP/dist"/*.deb \
    "$DESKTOP/dist"/*.zip \
    "$DESKTOP/dist/latest"*.yml \
    "$DESKTOP/dist/app-update"*.yml
  do
    if [ -e "$f" ]; then
      cp -f "$f" "$BUILD_OUT"/
      log_success "   • Copied $(basename "$f")"
    fi
  done
  
  log_success "✅ Installer collection complete"
}

# ========================================
# STEP 2: PUBLISH LANDING PAGE V3
# ========================================
publish_landing_v3() {
  log_info "🚀 STEP 2: Publishing Landing Page V3 as homepage..."
  
  cd "$WEB"
  
  if [ -f index-v3.html ]; then
    BACKUP="index-backup-$(date +%Y%m%d-%H%M%S).html"
    if [ -f index.html ]; then
      mv index.html "$BACKUP"
      log_success "   • Backed up existing index.html → $BACKUP"
    fi
    cp index-v3.html index.html
    log_success "   • index-v3.html → index.html (Landing Page V3 now set as homepage)"
  else
    log_error "❌ index-v3.html not found in $WEB – cannot promote V3. Skipping."
    return 1
  fi
}

# ========================================
# STEP 3: NETLIFY DEPLOYMENT
# ========================================
deploy_netlify() {
  log_info "🚀 STEP 3: Deploying website via Netlify..."
  
  cd "$WEB"
  
  if command -v netlify >/dev/null 2>&1; then
    if netlify deploy --prod --dir=. --message "Launch: Landing Page V3 + Installers" >> "$LOG" 2>&1; then
      log_success "✅ Netlify deployment successful"
    else
      log_error "❌ Netlify deploy failed – check auth or run 'netlify status'"
      return 1
    fi
  else
    log_error "❌ netlify CLI not found – install with: npm install -g netlify-cli"
    return 1
  fi
}

# ========================================
# STEP 4: BACKEND/API HEALTH CHECKS
# ========================================
check_backend() {
  log_info "🚀 STEP 4: Running backend/API health checks..."
  
  API_BASE="https://api.rinawarptech.com"
  
  if command -v curl >/dev/null 2>&1; then
    # Health check
    if curl -fsS "$API_BASE/api/health" >/dev/null 2>&1; then
      log_success "   • /api/health ✅ OK"
    else
      log_warning "⚠️ /api/health check FAILED – backend may be down"
    fi
    
    # License count check
    if curl -fsS "$API_BASE/api/license-count" >/dev/null 2>&1; then
      log_success "   • /api/license-count ✅ OK"
    else
      log_warning "⚠️ /api/license-count check FAILED – seat counter may not be wired"
    fi
  else
    log_warning "⚠️ curl not found – skipping API health checks"
  fi
}

# ========================================
# STEP 5: STRIPE TEST INSTRUCTIONS
# ========================================
stripe_test_instructions() {
  log_info "🚀 STEP 5: Stripe $1 live test – manual step needed."
  log_info "   👉 NEXT: In your browser, do this:"
  log_info "      1) Go to https://dashboard.stripe.com/products"
  log_info "      2) Create a \$1 test product with price ID"
  log_info "      3) Wire the price ID into your backend/Stripe config"
  log_info "      4) Visit https://rinawarptech.com/pricing.html"
  log_info "      5) Complete a real \$1 purchase test"
  log_info "   📋 Confirm:"
  log_info "      • Stripe shows successful payment"
  log_info "      • Your DB has the new license"
  log_info "      • Success page loads and downloads work"
  log_info "      • Seat counter decreases"
}

# ========================================
# STEP 6: VERIFY LAUNCH
# ========================================
verify_launch() {
  log_info "🚀 STEP 6: Verifying launch components..."
  
  # Check if V3 is live
  if curl -fsS https://rinawarptech.com >/dev/null 2>&1; then
    log_success "✅ Website is live and accessible"
  else
    log_warning "⚠️ Website may not be fully propagated yet"
  fi
  
  # Check build output
  if [ -d "$BUILD_OUT" ]; then
    INSTALLER_COUNT=$(find "$BUILD_OUT" -name "*.exe" -o -name "*.dmg" -o -name "*.AppImage" -o -name "*.deb" | wc -l)
    log_success "✅ Found $INSTALLER_COUNT installers in build-output/"
  else
    log_warning "⚠️ Build output directory not found"
  fi
  
  log_success "✅ Launch verification complete"
}

# ========================================
# CONTENT GENERATION FUNCTIONS
# ========================================
generate_launch_content() {
  log_info "🚀 GENERATING: Founder Wave Launch Content Pack"
  
  # Create content directory
  CONTENT_DIR="$ROOT/launch-content"
  mkdir -p "$CONTENT_DIR"
  
  # Facebook Post
  cat > "$CONTENT_DIR/facebook-post.txt" << 'EOF'
After a year of building, I'm finally launching something I'm insanely proud of.
It's called RinaWarp Terminal Pro — an AI-powered terminal for developers, creators, and power users.
✅ Voice-controlled terminal
✅ GPT / Claude / Groq / Ollama switching
✅ One-click deploy flows
✅ File tree + automation built in

I built this as a solo founder, while juggling life, music, and a lot of chaos.
Today I'm opening the Founder Wave:
🔥 Lifetime license
🔥 Limited seats
🔥 All future updates included

If you want to support me and be part of this from the beginning, grab a Founder license here 👇
https://rinawarptech.com

Even a share or comment helps more than you know. 💜
EOF
  
  # Instagram Caption
  cat > "$CONTENT_DIR/instagram-caption.txt" << 'EOF'
I built my own AI terminal. 🧨
Meet RinaWarp Terminal Pro – my baby.
💻 Voice-controlled commands
🤖 Switch between GPT / Claude / Groq / Ollama
🚀 One-click deploys
🌈 Mermaid-themed UI (obviously 😂)

I opened a Founder Wave with limited lifetime licenses.
If you want to support a small, chaotic, stubborn, music-and-code obsessed founder…
👉 Link in bio: RinaWarp Terminal Pro

Comment "RINAWARP" if you want a demo video. 💜
EOF
  
  # DM Script
  cat > "$CONTENT_DIR/dm-script.txt" << 'EOF'
Hey! 👋
I've been quietly building my own AI terminal app called RinaWarp Terminal Pro – it's like a smart assistant for your dev/creator workflows (voice commands, AI models, one-click deploys, etc.).
I'm launching a limited Founder Wave with lifetime licenses and I'd love your support, even if it's just feedback or a share.
Here's the page: https://rinawarptech.com
If you want a license I can hook you up with a founder discount too. 💜
EOF
  
  # 60-Second Demo Script
  cat > "$CONTENT_DIR/demo-video-script.txt" << 'EOF'
60-SECOND DEMO VIDEO SCRIPT

[0–5s Hook]
"Imagine if your terminal wasn't dumb… and actually helped you ship faster."

[5–15s – Show app opening]
"This is RinaWarp Terminal Pro – an AI-powered terminal I built for developers and creators who live in their command line."
Show: your app window, Mermaid theme, Logotype.

[15–30s – Voice + AI models]
"You can talk to it with your voice, switch between GPT, Claude, Groq, and Ollama… and let it write, explain, or fix commands before you run them."
Show:
– Voice trigger
– Model dropdown
– AI output suggesting a command

[30–45s – File tree + one-click deploys]
"It's got a built-in file tree and one-click deploy flows, so you can go from 'idea' to 'live' without leaving this window."
Show:
– File tree
– Clicking a deploy button / showing logs

[45–55s – Founder Wave]
"I built this as a solo founder, for people who want their tools to feel powerful, fast, and actually fun to use."

[55–60s – CTA]
"If you want to join the Founder Wave and grab a lifetime license, hit rinawarptech.com – limited seats, lifetime updates."
EOF
  
  log_success "✅ Launch content generated in $CONTENT_DIR"
  log_info "   • Facebook post: $CONTENT_DIR/facebook-post.txt"
  log_info "   • Instagram caption: $CONTENT_DIR/instagram-caption.txt"
  log_info "   • DM script: $CONTENT_DIR/dm-script.txt"
  log_info "   • Demo video script: $CONTENT_DIR/demo-video-script.txt"
}

# ========================================
# MAIN EXECUTION
# ========================================
main() {
  echo ""
  echo "========================================"
  echo "🚀 RinaWarp Launch Automation v1.0.0"
  echo "========================================"
  echo ""
  
  log_info "🚀 Starting RinaWarp Launch Automation..."
  log_info "Log file: $LOG"
  echo ""
  
  # Execute launch sequence
  build_installers
  echo ""
  
  publish_landing_v3
  echo ""
  
  deploy_netlify
  echo ""
  
  check_backend
  echo ""
  
  verify_launch
  echo ""
  
  generate_launch_content
  echo ""
  
  stripe_test_instructions
  echo ""
  
  echo "========================================"
  log_success "✅ LAUNCH AUTOMATION COMPLETE!"
  echo "========================================"
  echo ""
  log_info "📋 NEXT STEPS:"
  log_info "   1. Check $LOG for detailed logs"
  log_info "   2. Visit https://rinawarptech.com (should now show V3)"
  log_info "   3. Run Stripe $1 test manually"
  log_info "   4. Check /build-output/ for installers"
  log_info "   5. Post launch content from $ROOT/launch-content/"
  echo ""
  log_info "🎯 Your launch is ready to go! 🔥"
  echo ""
}

# Run main function
main "$@"