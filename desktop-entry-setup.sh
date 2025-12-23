#!/bin/bash

# RinaWarp Terminal Pro - Desktop Entry Setup & Verification Script
# Version: 1.0.0
# Description: Professional desktop entry setup for Kali Linux with security flags

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}RinaWarp Terminal Pro - Desktop Entry Setup${NC}"
    echo -e "${CYAN}Version 1.0.0 - Professional Linux Integration${NC}"
    echo ""
}

# Function to check if desktop entry exists
check_desktop_entry() {
    local desktop_file="$HOME/.local/share/applications/rinawarp-terminal-pro.desktop"
    
    if [ -f "$desktop_file" ]; then
        echo -e "${GREEN}✅ Desktop entry found: $desktop_file${NC}"
        return 0
    else
        echo -e "${RED}❌ Desktop entry not found: $desktop_file${NC}"
        return 1
    fi
}

# Function to check if AppImage exists and is executable
check_appimage() {
    local appimage="/home/karina/Documents/rinawarp-business/RinaWarp-Terminal-Pro-Linux.AppImage"
    
    if [ -f "$appimage" ]; then
        echo -e "${GREEN}✅ AppImage found: $appimage${NC}"
        if [ -x "$appimage" ]; then
            echo -e "${GREEN}✅ AppImage is executable${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  AppImage found but not executable${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ AppImage not found: $appimage${NC}"
        return 1
    fi
}

# Function to verify desktop entry content
verify_desktop_content() {
    local desktop_file="$HOME/.local/share/applications/rinawarp-terminal-pro.desktop"
    
    echo -e "${BLUE}📋 Desktop Entry Content:${NC}"
    echo "----------------------------------------"
    cat "$desktop_file"
    echo "----------------------------------------"
    
    # Check for required security flags
    if grep -q "\-\-no-sandbox" "$desktop_file" && grep -q "\-\-disable-gpu" "$desktop_file"; then
        echo -e "${GREEN}✅ Security flags (--no-sandbox --disable-gpu) found${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Security flags missing or incomplete${NC}"
        return 1
    fi
}

# Function to test desktop entry validation
test_desktop_entry() {
    local desktop_file="$HOME/.local/share/applications/rinawarp-terminal-pro.desktop"
    
    echo -e "${BLUE}🧪 Testing Desktop Entry Validation...${NC}"
    
    if command -v desktop-file-validate >/dev/null 2>&1; then
        if desktop-file-validate "$desktop_file"; then
            echo -e "${GREEN}✅ Desktop entry validation passed${NC}"
            return 0
        else
            echo -e "${RED}❌ Desktop entry validation failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  desktop-file-validate not available (install desktop-file-utils)${NC}"
        return 1
    fi
}

# Function to show troubleshooting steps
show_troubleshooting() {
    echo -e "${PURPLE}🔧 TROUBLESHOOTING GUIDE${NC}"
    echo "=================================="
    echo ""
    echo -e "${YELLOW}1. AppImage Path Verification:${NC}"
    echo "   • Ensure the Exec= path points to your AppImage location"
    echo "   • Current path: /home/karina/Documents/rinawarp-business/RinaWarp-Terminal-Pro-Linux.AppImage"
    echo ""
    echo -e "${YELLOW}2. AppImage Permissions:${NC}"
    echo "   • Run: chmod +x /home/karina/Documents/rinawarp-business/RinaWarp-Terminal-Pro-Linux.AppImage"
    echo ""
    echo -e "${YELLOW}3. FUSE Errors (Common with AppImage):${NC}"
    echo "   • Install libfuse2: sudo apt update && sudo apt install libfuse2"
    echo "   • Or test manually: ./RinaWarp-Terminal-Pro-Linux.AppImage --version"
    echo ""
    echo -e "${YELLOW}4. Desktop Database Refresh:${NC}"
    echo "   • Run: update-desktop-database ~/.local/share/applications"
    echo ""
    echo -e "${YELLOW}5. Application Menu Search:${NC}"
    echo "   • Press Super key (Windows key)"
    echo "   • Search for 'RinaWarp'"
    echo ""
    echo -e "${YELLOW}6. Manual Launch Test:${NC}"
    echo "   • Run from terminal: /home/karina/Documents/rinawarp-business/RinaWarp-Terminal-Pro-Linux.AppImage --no-sandbox --disable-gpu"
    echo ""
}

# Function to show next steps
show_next_steps() {
    echo -e "${PURPLE}🚀 NEXT STEPS${NC}"
    echo "=================="
    echo ""
    echo -e "${BLUE}1. Search for RinaWarp in your application menu${NC}"
    echo -e "${BLUE}2. Pin it to your taskbar or favorites for quick access${NC}"
    echo -e "${BLUE}3. Configure keyboard shortcuts if needed${NC}"
    echo -e "${BLUE}4. Test the application functionality${NC}"
    echo ""
    echo -e "${CYAN}For best results, consider moving the AppImage to a permanent location:${NC}"
    echo -e "  mkdir -p ~/Applications"
    echo -e "  cp /home/karina/Documents/rinawarp-business/RinaWarp-Terminal-Pro-Linux.AppImage ~/Applications/"
    echo -e "  # Then update the Exec= path in the .desktop file"
    echo ""
}

# Main verification function
main() {
    display_banner
    
    echo -e "${BLUE}🔍 VERIFICATION RESULTS${NC}"
    echo "========================="
    echo ""
    
    # Check desktop entry
    local desktop_ok=1
    if check_desktop_entry; then
        desktop_ok=0
    fi
    
    # Check AppImage
    local appimage_ok=1
    if check_appimage; then
        appimage_ok=0
    fi
    
    # Verify content if desktop entry exists
    if [ $desktop_ok -eq 0 ]; then
        verify_desktop_content
        echo ""
    fi
    
    # Test validation
    test_desktop_entry
    echo ""
    
    # Final status
    echo -e "${BLUE}📊 INSTALLATION STATUS${NC}"
    echo "========================"
    
    if [ $desktop_ok -eq 0 ] && [ $appimage_ok -eq 0 ]; then
        echo -e "${GREEN}✅ DESKTOP ENTRY SETUP COMPLETE!${NC}"
        echo -e "${GREEN}✅ RinaWarp Terminal Pro is ready to launch from your application menu${NC}"
        echo ""
        show_next_steps
    else
        echo -e "${RED}❌ SETUP INCOMPLETE${NC}"
        echo -e "${YELLOW}Please review the issues above and run this script again${NC}"
        echo ""
        show_troubleshooting
    fi
}

# Run main function
main