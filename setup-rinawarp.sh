#!/bin/bash

# --- RinaWarp Terminal Pro - Professional Setup Engine ---
# Version: 1.0.0
# Description: One-Click Install with Icon Extraction and Professional Integration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="RinaWarp Terminal Pro"
APP_EXEC="RinaWarp-Terminal-Pro-Linux.AppImage"
INSTALL_DIR="$HOME/Applications"
ICON_DIR="$HOME/.local/share/icons"
DESKTOP_DIR="$HOME/.local/share/applications"
SOURCE_PATH="/home/karina/Documents/rinawarp-business/$APP_EXEC"

# Function to display banner
display_banner() {
    echo -e "${PURPLE}"
    echo "  ██████╗ ██╗███╗   ██╗██████╗ ██╗    ██╗███████╗██████╗ "
    echo "  ██╔══██╗██║████╗  ██║██╔══██╗██║    ██║██╔════╝██╔══██╗"
    echo "  ██████╔╝██║██╔██╗ ██║██████╔╝██║ █╗ ██║█████╗  ██████╔╝"
    echo "  ██╔═══╝ ██║██║╚██╗██║██╔══██╗██║███╗██║██╔══╝  ██╔══██╗"
    echo "  ██║     ██║██║ ╚████║██████╔╝╚███╔███╔╝███████╗██║  ██║"
    echo "  ╚═╝     ╚═╝╚═╝  ╚═══╝╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝"
    echo -e "${NC}"
    echo -e "${BLUE}RinaWarp Terminal Pro - Professional Setup Engine${NC}"
    echo -e "${CYAN}Version 1.0.0 - One-Click Install Experience${NC}"
    echo ""
}

# Function to check if AppImage source exists
check_source_appimage() {
    if [ ! -f "$SOURCE_PATH" ]; then
        echo -e "${RED}❌ Error: Source AppImage not found at $SOURCE_PATH${NC}"
        echo -e "${YELLOW}Please ensure the AppImage is in the correct location${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Source AppImage found${NC}"
    return 0
}

# Function to setup directories
setup_directories() {
    echo -e "${BLUE}📁 Creating installation directories...${NC}"
    
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$ICON_DIR"
    mkdir -p "$DESKTOP_DIR"
    
    echo -e "${GREEN}✅ Directories created successfully${NC}"
    return 0
}

# Function to copy and setup AppImage
setup_appimage() {
    echo -e "${BLUE}📦 Setting up AppImage...${NC}"
    
    # Copy AppImage to installation directory
    cp "$SOURCE_PATH" "$INSTALL_DIR/$APP_EXEC"
    
    # Make it executable
    chmod +x "$INSTALL_DIR/$APP_EXEC"
    
    echo -e "${GREEN}✅ AppImage installed and made executable${NC}"
    return 0
}

# Function to extract icon from AppImage
extract_icon() {
    echo -e "${BLUE}🎨 Extracting high-resolution icon...${NC}"
    
    cd "$INSTALL_DIR"
    
    # Extract AppImage contents
    if ./"$APP_EXEC" --appimage-extract > /dev/null 2>&1; then
        echo -e "${YELLOW}🔍 Searching for icon files...${NC}"
        
        # Find the largest PNG or SVG icon
        ICON_PATH=$(find squashfs-root -maxdepth 3 \( -name "*.png" -o -name "*.svg" \) -exec ls -la {} \; | sort -k5 -nr | head -n1 | awk '{print $NF}')
        
        if [ -n "$ICON_PATH" ] && [ -f "$ICON_PATH" ]; then
            # Convert SVG to PNG if needed, or just copy PNG
            if [[ "$ICON_PATH" == *.svg ]]; then
                # Try to convert SVG to PNG
                if command -v convert >/dev/null 2>&1; then
                    convert "$ICON_PATH" -background none "$ICON_DIR/rinawarp_icon.png"
                    echo -e "${GREEN}🎨 SVG icon converted and saved${NC}"
                else
                    # Fallback: copy SVG as PNG (some systems can handle this)
                    cp "$ICON_PATH" "$ICON_DIR/rinawarp_icon.png"
                    echo -e "${GREEN}🎨 SVG icon saved (conversion not available)${NC}"
                fi
            else
                # Copy PNG directly
                cp "$ICON_PATH" "$ICON_DIR/rinawarp_icon.png"
                echo -e "${GREEN}🎨 PNG icon extracted and saved${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️ Warning: Could not find internal icon. Using fallback terminal icon.${NC}"
            # Set icon path to use terminal icon as fallback
            ICON_PATH="utilities-terminal"
        fi
        
        # Cleanup extracted files
        rm -rf squashfs-root
    else
        echo -e "${YELLOW}⚠️ Warning: Icon extraction failed. Using fallback terminal icon.${NC}"
        ICON_PATH="utilities-terminal"
    fi
    
    return 0
}

# Function to create desktop entry
create_desktop_entry() {
    echo -e "${BLUE}🚀 Creating desktop launcher...${NC}"
    
    # Determine icon path
    local icon_ref="utilities-terminal"
    if [ -f "$ICON_DIR/rinawarp_icon.png" ]; then
        icon_ref="$ICON_DIR/rinawarp_icon.png"
    fi
    
    # Create the desktop entry
    cat > "$DESKTOP_DIR/rinawarp-terminal-pro.desktop" <<EOF
[Desktop Entry]
Name=$APP_NAME
Comment=Professional Forensic Terminal Environment
Exec=$INSTALL_DIR/$APP_EXEC --no-sandbox --disable-gpu
Icon=$icon_ref
Type=Application
Categories=Security;Development;System;
Terminal=false
StartupWMClass=RinaWarpTerminalPro
MimeType=application/x-terminal;
Keywords=terminal;forensic;security;development;console;
EOF

    # Make desktop entry executable
    chmod +x "$DESKTOP_DIR/rinawarp-terminal-pro.desktop"
    
    # Update desktop database
    update-desktop-database "$DESKTOP_DIR" > /dev/null 2>&1
    
    echo -e "${GREEN}✅ Desktop entry created successfully${NC}"
    return 0
}

# Function to show success message
show_success() {
    echo ""
    echo -e "${GREEN}🎉 SETUP COMPLETE!${NC}"
    echo "========================="
    echo ""
    echo -e "${BLUE}📍 Installation Details:${NC}"
    echo "  • AppImage: $INSTALL_DIR/$APP_EXEC"
    echo "  • Desktop Entry: $DESKTOP_DIR/rinawarp-terminal-pro.desktop"
    echo "  • Icon: $ICON_DIR/rinawarp_icon.png"
    echo ""
    echo -e "${BLUE}🚀 How to Launch:${NC}"
    echo "  1. Press Super key (Windows key)"
    echo "  2. Search for 'RinaWarp'"
    echo "  3. Click 'RinaWarp Terminal Pro'"
    echo ""
    echo -e "${BLUE}🔧 Security Features:${NC}"
    echo "  • Sandbox bypassed (--no-sandbox)"
    echo "  • GPU drivers disabled (--disable-gpu)"
    echo "  • Forensic environment optimized"
    echo ""
    echo -e "${CYAN}✨ Your professional terminal environment is ready!${NC}"
}

# Main setup function
main() {
    display_banner
    
    echo -e "${YELLOW}🛠️ Starting Professional Setup for $APP_NAME...${NC}"
    echo ""
    
    # Check prerequisites
    if ! check_source_appimage; then
        exit 1
    fi
    
    # Setup process
    setup_directories
    setup_appimage
    extract_icon
    create_desktop_entry
    
    # Show success message
    show_success
    
    return 0
}

# Error handling
set -e
trap 'echo -e "\n${RED}❌ Setup failed. Please check the error messages above.${NC}"' ERR

# Run main function
main

# Exit successfully
exit 0