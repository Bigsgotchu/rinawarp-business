#!/bin/bash

# RinaWarp Terminal Pro Installer Script
# Version: 1.0.0
# Description: One-click installation script for RinaWarp Terminal Pro

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
    echo -e "${BLUE}RinaWarp Terminal Pro Installer${NC}"
    echo -e "${CYAN}Version 1.0.0 - The Ultimate Developer Terminal${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "mac"
    elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Function to get architecture
get_arch() {
    case $(uname -m) in
        x86_64|amd64) echo "amd64" ;;
        arm64|aarch64) echo "arm64" ;;
        *) echo "unknown" ;;
    esac
}

# Function to download file
download_file() {
    local url=$1
    local output=$2

    echo -e "${YELLOW}Downloading ${output}...${NC}"

    if command_exists curl; then
        curl -L -o "$output" "$url" --progress-bar
    elif command_exists wget; then
        wget -O "$output" "$url" --progress=bar:force:noscroll
    else
        echo -e "${RED}Error: Neither curl nor wget found. Please install one of them.${NC}"
        return 1
    fi

    if [ $? -ne 0 ]; then
        echo -e "${RED}Download failed. Please check your internet connection.${NC}"
        return 1
    fi

    return 0
}

# Function to install on Linux
install_linux() {
    local arch=$(get_arch)
    local filename="RinaWarp-Terminal-Pro-Linux.AppImage"
    local download_url="https://downloads.rinawarptech.com/terminal-pro/0.9.0/${filename}"

    echo -e "${GREEN}Installing RinaWarp Terminal Pro on Linux...${NC}"

    # Use locally built AppImage if available
    local local_appimage="/home/karina/Documents/rinawarp-business/apps/terminal-pro/desktop/build-output/RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage"
    
    if [ -f "$local_appimage" ]; then
        echo -e "${YELLOW}Using locally built AppImage...${NC}"
        cp "$local_appimage" "$filename"
        chmod +x "$filename"
    else
        # Download the AppImage
        if ! download_file "$download_url" "$filename"; then
            return 1
        fi
    fi

    # Make it executable
    echo -e "${YELLOW}Making ${filename} executable...${NC}"
    chmod +x "$filename"

    # Create desktop entry
    echo -e "${YELLOW}Creating desktop entry...${NC}"
    local desktop_entry="$HOME/.local/share/applications/rinawarp-terminal-pro.desktop"
    mkdir -p "$HOME/.local/share/applications"

    cat > "$desktop_entry" <<EOF
[Desktop Entry]
Name=RinaWarp Terminal Pro
Comment=The Ultimate Developer Terminal
Exec=$(pwd)/$filename
Icon=terminal
Terminal=false
Type=Application
Categories=Development;Utility;TerminalEmulator;
StartupWMClass=RinaWarpTerminalPro
EOF

    echo -e "${GREEN}✅ Installation complete!${NC}"
    echo ""
    echo -e "${BLUE}To run RinaWarp Terminal Pro:${NC}"
    echo -e "  ./$filename"
    echo ""
    echo -e "${BLUE}You can also find it in your application menu as 'RinaWarp Terminal Pro'${NC}"
    echo ""
    echo -e "${YELLOW}Note: For best results, you may want to move the AppImage to a permanent location like /opt/ or ~/Applications/${NC}"

    return 0
}

# Function to install on macOS
install_mac() {
    local arch=$(get_arch)
    local filename="RinaWarp-Terminal-Pro-Mac.dmg"
    local download_url="https://downloads.rinawarptech.com/terminal-pro/0.9.0/${filename}"

    echo -e "${GREEN}Installing RinaWarp Terminal Pro on macOS...${NC}"

    # Download the DMG
    if ! download_file "$download_url" "$filename"; then
        return 1
    fi

    echo -e "${GREEN}✅ Download complete!${NC}"
    echo ""
    echo -e "${BLUE}To install RinaWarp Terminal Pro:${NC}"
    echo -e "  1. Open the downloaded file: $filename"
    echo -e "  2. Drag RinaWarp Terminal Pro to your Applications folder"
    echo -e "  3. Eject the disk image when done"
    echo ""
    echo -e "${YELLOW}Note: You may need to right-click and select 'Open' the first time to bypass macOS security restrictions.${NC}"

    # Try to open the DMG automatically
    if command_exists hdiutil; then
        echo -e "${YELLOW}Attempting to mount the disk image...${NC}"
        hdiutil attach "$filename"
    fi

    return 0
}

# Function to install on Windows (WSL)
install_windows() {
    echo -e "${YELLOW}Windows detected. RinaWarp Terminal Pro is best experienced on Windows through WSL.${NC}"
    echo ""

    # Check if running in WSL
    if grep -q Microsoft /proc/version; then
        echo -e "${GREEN}WSL detected! Installing Linux version...${NC}"
        install_linux
        return $?
    else
        echo -e "${RED}This script is designed for WSL (Windows Subsystem for Linux).${NC}"
        echo -e "${BLUE}Please install WSL or download the Windows version from:${NC}"
        echo -e "${CYAN}https://downloads.rinawarptech.com/terminal-pro/0.9.0/RinaWarp-Terminal-Pro-Windows.exe${NC}"
        return 1
    fi
}

# Main installation function
main() {
    display_banner

    # Check for root (not recommended)
    if [ "$(id -u)" -eq 0 ]; then
        echo -e "${YELLOW}Warning: Running as root is not recommended. Installing as current user instead.${NC}"
    fi

    # Detect OS
    local os=$(detect_os)
    echo -e "${BLUE}Detected OS: ${os}${NC}"
    echo ""

    # Check system requirements
    echo -e "${YELLOW}Checking system requirements...${NC}"

    # Check for curl or wget
    if ! command_exists curl && ! command_exists wget; then
        echo -e "${RED}Error: Neither curl nor wget found. Please install one of them.${NC}"
        return 1
    fi

    # Install based on OS
    case "$os" in
        "linux")
            install_linux
            ;;
        "mac")
            install_mac
            ;;
        "windows")
            install_windows
            ;;
        *)
            echo -e "${RED}Error: Unsupported operating system: $os${NC}"
            return 1
            ;;
    esac

    return $?
}

# Run main function
main

# Exit with appropriate code
exit $?