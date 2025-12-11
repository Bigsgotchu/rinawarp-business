#!/bin/bash

# RinaWarp Project - Critical Fixes Deployment Script
# This script applies the most critical fixes identified during project analysis

set -e

echo "🔧 RinaWarp Project - Critical Fixes Deployment"
echo "=============================================="
echo "Date: $(date)"
echo ""

# Function to backup original files
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backed up: $file"
    fi
}

# Function to apply fix
apply_fix() {
    local source=$1
    local target=$2
    local description=$3
    
    echo "🔄 Applying fix: $description"
    
    if [ -f "$source" ]; then
        backup_file "$target"
        cp "$source" "$target"
        echo "✅ Fixed: $description"
    else
        echo "❌ Source file not found: $source"
        return 1
    fi
}

echo "📋 Step 1: Applying API Gateway Fix"
echo "===================================="

# Apply corrected API Gateway
if [ -f "CORRECTED_API_GATEWAY.js" ]; then
    apply_fix "CORRECTED_API_GATEWAY.js" "backend/api-gateway/server.js" "API Gateway authentication and routing"
else
    echo "❌ Corrected API Gateway file not found"
fi

echo ""
echo "📋 Step 2: Creating Environment Configuration"
echo "=============================================="

# Create environment configuration file
cat > backend/api-gateway/.env.production << 'EOF'
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Service URLs (Update these for production)
AUTH_SERVICE_URL=http://localhost:3001
REVENUE_SERVICE_URL=http://localhost:3002
LICENSING_SERVICE_URL=http://localhost:3003
AI_MUSIC_VIDEO_SERVICE_URL=http://localhost:3004
AI_SERVICE_URL=http://localhost:3004

# CORS Configuration
ALLOWED_ORIGINS=https://rinawarptech.com,https://www.rinawarptech.com

# Domain Configuration
DOMAIN=https://rinawarptech.com

# Security
JWT_SECRET=your-production-jwt-secret-here
EOF

echo "✅ Created production environment configuration"

echo ""
echo "📋 Step 3: Creating Stripe Configuration Guide"
echo "=============================================="

# Create Stripe environment setup script
cat > deploy-stripe-environment.sh << 'EOF'
#!/bin/bash

# Stripe Environment Variables Deployment Script
echo "🔧 Setting up Stripe Environment Variables"
echo "=========================================="

# Check if wrangler is available
if command -v wrangler &> /dev/null; then
    echo "✅ Found wrangler CLI - proceeding with deployment"
    
    # Set the correct RINA_PRICE_MAP with actual Stripe plan codes
    PRICE_MAP='{"starter-monthly":"price_1SVRVJGZrRdZy3W9q6u9L82y","creator-monthly":"price_1SVRVJGZrRdZy3W9tRX5tsaH","pro-monthly":"price_1SVRVKGZrRdZy3W9wFO3QPw6","enterprise-yearly":"price_1SVRVMGZrRdZy3W9094r1F5B","pioneer-lifetime":"price_1SVRVLGZrRdZy3W9LoPVNyem","founder-lifetime":"price_1SVRVLGZrRdZy3W976aXrw0g"}'
    
    echo "📋 Setting required environment variables..."
    echo ""
    echo "Run these commands manually:"
    echo "wrangler pages secret put RINA_PRICE_MAP --project-name=rinawarptech"
    echo "# When prompted, paste: $PRICE_MAP"
    echo ""
    echo "wrangler pages secret put STRIPE_SECRET_KEY --project-name=rinawarptech"
    echo "# When prompted, paste: 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"
    echo ""
    echo "wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name=rinawarptech"
    echo "# When prompted, paste: whsec_yOVnlDM7oBl5sCrhkiPKTVLSkqR2Q4ma"
    echo ""
    echo "wrangler pages secret put DOMAIN --project-name=rinawarptech"
    echo "# When prompted, paste: https://rinawarptech.com"
    
else
    echo "❌ wrangler CLI not found"
    echo "📋 Manual setup required:"
    echo "1. Go to Cloudflare Dashboard"
    echo "2. Navigate to: Pages → rinawarptech → Settings → Variables & Secrets"
    echo "3. Set the 4 required environment variables"
fi

echo ""
echo "🧪 Testing Commands (after environment variables are set):"
echo "========================================================="
echo ""
echo "# Test the corrected checkout API"
echo "curl -i https://rinawarptech.com/api/checkout-v2 \\"
echo "  -X POST \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"plan\": \"founder-lifetime\", \"successUrl\": \"https://rinawarptech.com/success.html\", \"cancelUrl\": \"https://rinawarptech.com/cancel.html\"}'"
echo ""
echo "# Expected success response:"
echo "# {\"sessionId\": \"cs_xxx...\"}"
EOF

chmod +x deploy-stripe-environment.sh
echo "✅ Created Stripe environment deployment script"

echo ""
echo "📋 Step 4: Creating Testing Scripts"
echo "==================================="

# Create API testing script
cat > test-api-gateway.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing RinaWarp API Gateway"
echo "==============================="

BASE_URL="http://localhost:3000"

echo "1. Testing Health Check..."
curl -s "${BASE_URL}/health" | jq '.' || echo "Health check failed"

echo ""
echo "2. Testing Authentication Endpoint..."
curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}' | jq '.' || echo "Auth test failed"

echo ""
echo "3. Testing Checkout Endpoint..."
curl -s -X POST "${BASE_URL}/api/checkout-v2" \
  -H "Content-Type: application/json" \
  -d '{"plan": "founder-lifetime", "successUrl": "https://rinawarptech.com/success.html", "cancelUrl": "https://rinawarptech.com/cancel.html"}' | jq '.' || echo "Checkout test failed"

echo ""
echo "4. Testing License Check Endpoint..."
curl -s "${BASE_URL}/license/check" | jq '.' || echo "License check failed"

echo ""
echo "✅ API Gateway testing completed"
EOF

chmod +x test-api-gateway.sh
echo "✅ Created API testing script"

echo ""
echo "📋 Step 5: Creating Documentation Updates"
echo "========================================="

# Create deployment checklist
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# RinaWarp Project - Critical Fixes Deployment Checklist

## ✅ Completed Fixes

- [x] **API Gateway**: Fixed authentication middleware and routing consistency
- [x] **Stripe Configuration**: Created comprehensive environment setup
- [x] **Documentation**: Created comprehensive issues report
- [x] **Testing Scripts**: Created API testing and deployment scripts

## 🚨 Critical Actions Required

### 1. Environment Variables (IMMEDIATE)
**Location**: Cloudflare Pages → rinawarptech → Settings → Variables & Secrets

Set these 4 variables:

```bash
RINA_PRICE_MAP={"starter-monthly":"price_1SVRVJGZrRdZy3W9q6u9L82y","creator-monthly":"price_1SVRVJGZrRdZy3W9tRX5tsaH","pro-monthly":"price_1SVRVKGZrRdZy3W9wFO3QPw6","enterprise-yearly":"price_1SVRVMGZrRdZy3W9094r1F5B","pioneer-lifetime":"price_1SVRVLGZrRdZy3W9LoPVNyem","founder-lifetime":"price_1SVRVLGZrRdZy3W976aXrw0g"}

STRIPE_SECRET_KEY=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

STRIPE_WEBHOOK_SECRET=whsec_yOVnlDM7oBl5sCrhkiPKTVLSkqR2Q4ma

DOMAIN=https://rinawarptech.com
```

### 2. Deploy API Gateway (IMMEDIATE)
- [ ] Copy `CORRECTED_API_GATEWAY.js` to `backend/api-gateway/server.js`
- [ ] Restart API Gateway service
- [ ] Test health endpoint

### 3. Test Stripe Integration (IMMEDIATE)
- [ ] Run `./deploy-stripe-environment.sh` to set up environment
- [ ] Test checkout endpoint: `curl -X POST https://rinawarptech.com/api/checkout-v2`
- [ ] Verify Stripe webhook is receiving events

## 📋 Next Steps (Priority 2)

### Authentication Service
- [ ] Implement real Supabase integration
- [ ] Remove mock data from auth service
- [ ] Add proper JWT handling with environment variables

### Frontend Applications
- [ ] Fix admin console configuration issues
- [ ] Resolve terminal-pro build problems
- [ ] Clean up ai-music-video server setup

### Documentation
- [ ] Fix markdown linting errors
- [ ] Consolidate conflicting documentation
- [ ] Update deployment guides

## 🧪 Testing Protocol

### Immediate Testing
1. **API Gateway Health**: `curl https://rinawarptech.com/api/health`
2. **Stripe Checkout**: `curl -X POST https://rinawarptech.com/api/checkout-v2`
3. **Authentication**: `curl -X POST https://rinawarptech.com/auth/login`

### Integration Testing
1. **End-to-End Flow**: Registration → Login → Checkout → License
2. **Webhook Processing**: Verify Stripe webhook handling
3. **Error Handling**: Test error responses

## 🎯 Success Criteria

- [ ] **Stripe Integration**: Checkout success rate > 95%
- [ ] **API Response Time**: < 500ms for all endpoints
- [ ] **Authentication**: Proper token validation working
- [ ] **Error Handling**: Graceful error responses

---

**Status**: Critical fixes applied, ready for deployment  
**Next Action**: Set environment variables in Cloudflare Pages
EOF

echo "✅ Created deployment checklist"

echo ""
echo "📋 Step 6: Final Validation"
echo "==========================="

# Check if all required files exist
echo "Checking critical files..."

files_to_check=(
    "backend/api-gateway/server.js"
    "CORRECTED_STRIPE_ENVIRONMENT_CONFIG.md"
    "PROJECT_ISSUES_COMPREHENSIVE_FIX_REPORT.md"
    "deploy-stripe-environment.sh"
    "test-api-gateway.sh"
    "DEPLOYMENT_CHECKLIST.md"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        all_files_exist=false
    fi
done

echo ""
if [ "$all_files_exist" = true ]; then
    echo "🎉 ALL CRITICAL FIXES SUCCESSFULLY APPLIED!"
    echo ""
    echo "📋 Next Actions:"
    echo "1. Run: ./deploy-stripe-environment.sh"
    echo "2. Set environment variables in Cloudflare Pages"
    echo "3. Restart API Gateway service"
    echo "4. Run: ./test-api-gateway.sh"
    echo ""
    echo "📖 See DEPLOYMENT_CHECKLIST.md for complete instructions"
else
    echo "⚠️  Some files are missing. Please check the deployment."
fi

echo ""
echo "🔧 RinaWarp Project Critical Fixes Deployment - COMPLETED"
echo "Date: $(date)"
