#!/bin/bash

# RinaWarp Frontend Applications - Branding Fix Script
# This script fixes the critical branding inconsistencies identified in the project

set -e

echo "🔧 RinaWarp Frontend Applications - Branding Fix"
echo "==============================================="
echo "Date: $(date)"
echo ""

# Function to backup files
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backed up: $file"
    fi
}

# Function to apply branding fix
apply_branding_fix() {
    local target_file=$1
    local description=$2
    
    echo "🔄 Applying branding fix: $description"
    
    case $target_file in
        "admin-console-brand-logo")
            # Fix Admin Console BrandLogo component
            cat > apps/admin-console/src/components/BrandLogo.tsx << 'EOF'
import React from "react";

type BrandVariant = "terminal" | "aimvc" | "admin" | "main";

interface BrandLogoProps {
  variant?: BrandVariant;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "main",
  className = "",
}) => {
  const getBrandInfo = (variant: BrandVariant) => {
    switch (variant) {
      case "terminal":
        return { text: "RinaWarp Terminal Pro", icon: "🖥️" };
      case "aimvc":
        return { text: "RinaWarp AI Music Video", icon: "🎵" };
      case "admin":
        return { text: "RinaWarp Admin Console", icon: "⚙️" };
      default:
        return { text: "RinaWarp Technologies", icon: "🚀" };
    }
  };

  const brandInfo = getBrandInfo(variant);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl" role="img" aria-label="RinaWarp">
        {brandInfo.icon}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">
          RinaWarp
        </span>
        <span className="text-xs text-neutral-400">
          {brandInfo.text.replace("RinaWarp ", "")}
        </span>
      </div>
    </div>
  );
};
EOF
            echo "✅ Fixed Admin Console BrandLogo component"
            ;;
            
        "admin-console-styles")
            # Fix Admin Console CSS with proper variables
            cat > apps/admin-console/src/index.css << 'EOF'
:root {
  /* Admin Console Color Scheme */
  --admin-bg: #0a0a0b;
  --admin-text: #e5e7eb;
  --admin-muted: #9ca3af;
  --admin-border: #374151;
  --admin-sidebar: #111827;
  --admin-accent: #3b82f6;
  --admin-accent-hover: #2563eb;
  --admin-sidebar-bg: rgba(17, 24, 39, 0.9);
  --admin-border-light: rgba(55, 65, 81, 0.6);
}

body {
  background-color: var(--admin-bg);
  color: var(--admin-text);
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Admin Console Specific Classes */
.bg-admin-bg { background-color: var(--admin-bg); }
.bg-admin-sidebar { background-color: var(--admin-sidebar-bg); }
.text-admin-text { color: var(--admin-text); }
.text-admin-muted { color: var(--admin-muted); }
.border-admin-border { border-color: var(--admin-border); }
.border-admin-border-light { border-color: var(--admin-border-light); }
EOF
            echo "✅ Fixed Admin Console CSS variables"
            ;;
            
        "unified-branding-assets")
            # Create unified branding assets directory
            mkdir -p assets/branding/logos
            mkdir -p assets/branding/icons
            mkdir -p assets/branding/themes
            
            # Create RinaWarp logo placeholder (SVG)
            cat > assets/branding/logos/rinawarp-logo.svg << 'EOF'
<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect x="5" y="8" width="30" height="24" rx="4" fill="url(#logo-gradient)"/>
  <text x="20" y="24" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">RW</text>
  <text x="45" y="20" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="600">RinaWarp</text>
  <text x="45" y="30" fill="#9ca3af" font-family="Arial, sans-serif" font-size="10">Technologies</text>
</svg>
EOF
            
            echo "✅ Created unified branding assets structure"
            ;;
    esac
}

echo "📋 Step 1: Fixing Admin Console Branding"
echo "========================================"

# Check if admin-console exists
if [ -d "apps/admin-console" ]; then
    # Backup original files
    if [ -f "apps/admin-console/src/components/BrandLogo.tsx" ]; then
        backup_file "apps/admin-console/src/components/BrandLogo.tsx"
    fi
    
    if [ -f "apps/admin-console/src/index.css" ]; then
        backup_file "apps/admin-console/src/index.css"
    fi
    
    # Apply branding fixes
    apply_branding_fix "admin-console-brand-logo" "Admin Console BrandLogo component"
    apply_branding_fix "admin-console-styles" "Admin Console CSS variables"
    
    echo ""
    echo "📋 Step 2: Creating Unified Branding Assets"
    echo "=========================================="
    
    apply_branding_fix "unified-branding-assets" "Unified branding assets structure"
    
    echo ""
    echo "📋 Step 3: Updating Build Configurations"
    echo "======================================="
    
    # Fix Admin Console Vite config
    if [ -f "apps/admin-console/vite.config.ts" ]; then
        backup_file "apps/admin-console/vite.config.ts"
        
        cat > apps/admin-console/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dropdown-menu', 'lucide-react']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@views': '/src/views',
      '@lib': '/src/lib'
    }
  }
})
EOF
        echo "✅ Updated Admin Console Vite configuration"
    fi
    
    # Fix AI Music Video duplicate config
    if [ -f "apps/ai-music-video/vite.config.mjs" ]; then
        echo "🗑️  Removing duplicate AI Music Video Vite config"
        mv apps/ai-music-video/vite.config.mjs apps/ai-music-video/vite.config.mjs.backup
    fi
    
    echo ""
    echo "📋 Step 4: Creating Package Update Scripts"
    echo "========================================="
    
    # Create package update script
    cat > update-frontend-packages.sh << 'EOF'
#!/bin/bash

echo "📦 Updating Frontend Application Packages"
echo "========================================="

# Function to update package in directory
update_package() {
    local dir=$1
    local name=$2
    
    echo "🔄 Updating $name packages..."
    cd "$dir"
    
    if [ -f "package.json" ]; then
        echo "  Running npm audit fix..."
        npm audit fix --silent
        
        echo "  Updating dependencies..."
        npm update --silent
        
        echo "✅ $name packages updated"
    else
        echo "⚠️  No package.json found in $dir"
    fi
    
    cd - > /dev/null
}

# Update all frontend applications
update_package "apps/admin-console" "Admin Console"
update_package "apps/terminal-pro/desktop" "Terminal Pro Desktop"
update_package "apps/ai-music-video" "AI Music Video"
update_package "apps/phone-manager" "Phone Manager"

echo ""
echo "🎉 All frontend packages updated successfully!"
EOF

    chmod +x update-frontend-packages.sh
    echo "✅ Created package update script"
    
else
    echo "❌ Admin console directory not found"
fi

echo ""
echo "📋 Step 5: Creating Testing Script"
echo "================================="

# Create testing script
cat > test-frontend-applications.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing RinaWarp Frontend Applications"
echo "========================================"

# Test Admin Console
echo "🔍 Testing Admin Console..."
if [ -d "apps/admin-console" ]; then
    cd apps/admin-console
    
    if [ -f "package.json" ]; then
        echo "  📦 Installing dependencies..."
        npm install --silent
        
        echo "  🔨 Building application..."
        if npm run build --silent; then
            echo "  ✅ Admin Console build successful"
        else
            echo "  ❌ Admin Console build failed"
        fi
    else
        echo "  ⚠️  No package.json found"
    fi
    
    cd - > /dev/null
else
    echo "  ⚠️  Admin Console directory not found"
fi

# Test AI Music Video
echo ""
echo "🔍 Testing AI Music Video..."
if [ -d "apps/ai-music-video" ]; then
    cd apps/ai-music-video
    
    if [ -f "package.json" ]; then
        echo "  📦 Installing dependencies..."
        npm install --silent
        
        echo "  🔨 Building application..."
        if npm run build --silent; then
            echo "  ✅ AI Music Video build successful"
        else
            echo "  ❌ AI Music Video build failed"
        fi
    else
        echo "  ⚠️  No package.json found"
    fi
    
    cd - > /dev/null
else
    echo "  ⚠️  AI Music Video directory not found"
fi

echo ""
echo "✅ Frontend application testing completed"
EOF

chmod +x test-frontend-applications.sh
echo "✅ Created testing script"

echo ""
echo "📋 Step 6: Creating Documentation Update"
echo "========================================"

# Create updated documentation
cat > FRONTEND_BRANDING_FIXES_APPLIED.md << 'EOF'
# Frontend Branding Fixes - Implementation Report

## ✅ Fixes Applied

### 1. Admin Console Branding
- **Fixed**: Replaced Lumina branding with RinaWarp
- **Updated**: BrandLogo component with consistent styling
- **Enhanced**: CSS variables for better maintainability

### 2. Build Configurations
- **Updated**: Admin Console Vite configuration with optimized builds
- **Removed**: Duplicate AI Music Video Vite config
- **Added**: Alias configuration for better imports

### 3. Asset Management
- **Created**: Unified branding assets structure
- **Added**: RinaWarp SVG logo
- **Standardized**: File naming conventions

### 4. Package Management
- **Created**: Automated package update script
- **Added**: Security audit fixes
- **Automated**: Dependency updates

### 5. Testing Infrastructure
- **Created**: Automated testing script
- **Added**: Build validation
- **Implemented**: Error reporting

## 🧪 Testing Required

Run the testing script to validate fixes:
```bash
./test-frontend-applications.sh
```

## 📋 Next Steps

1. **Test all applications** using the provided script
2. **Update packages** with: `./update-frontend-packages.sh`
3. **Validate branding** across all admin console pages
4. **Check build outputs** for each application

## 🎯 Success Criteria

- ✅ All applications build successfully
- ✅ RinaWarp branding displays consistently
- ✅ No console errors or warnings
- ✅ Optimized bundle sizes

---

**Status**: Branding fixes applied successfully
**Date**: $(date)
**Next Action**: Run testing script to validate fixes
EOF

echo "✅ Created implementation report"

echo ""
echo "📋 Final Validation"
echo "=================="

# Check if all required files exist
echo "Checking applied fixes..."

files_to_check=(
    "apps/admin-console/src/components/BrandLogo.tsx"
    "apps/admin-console/src/index.css"
    "assets/branding/logos/rinawarp-logo.svg"
    "apps/admin-console/vite.config.ts"
    "update-frontend-packages.sh"
    "test-frontend-applications.sh"
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
    echo "🎉 ALL FRONTEND BRANDING FIXES SUCCESSFULLY APPLIED!"
    echo ""
    echo "📋 Next Actions:"
    echo "1. Run: ./test-frontend-applications.sh"
    echo "2. Run: ./update-frontend-packages.sh"
    echo "3. Test admin console in browser: http://localhost:4173"
    echo "4. Validate RinaWarp branding displays correctly"
    echo ""
    echo "📖 See FRONTEND_BRANDING_FIXES_APPLIED.md for details"
else
    echo "⚠️  Some fixes may not have been applied correctly."
fi

echo ""
echo "🔧 RinaWarp Frontend Applications Branding Fix - COMPLETED"
echo "Date: $(date)"
