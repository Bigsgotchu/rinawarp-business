#!/bin/bash

# =====================================================
# RinaWarp Terminal Pro - Professional Bootstrapper
# Enterprise-grade one-line installer for Kali Linux
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
INSTALLER_URL="https://raw.githubusercontent.com/your-repo/rinawarp/main"

# Professional XDG Path Resolution
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
BIN_DIR="${HOME}/.local/bin"
SCRIPT_DIR="${DATA_HOME}/rinawarp"
INSTALL_DIR="$HOME/Applications"

# Function to log messages
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        "STEP") echo -e "${PURPLE}[STEP]${NC} $message" ;;
    esac
}

# Function to show banner
show_banner() {
    echo "================================================"
    echo "🚀 RinaWarp Terminal Pro - Professional Suite"
    echo "================================================"
    echo "Enterprise-grade deployment for Kali Linux"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    log "STEP" "Checking system prerequisites..."
    
    # Check for wget/curl
    local downloader=""
    if command -v curl &> /dev/null; then
        downloader="curl"
        log "INFO" "Using curl for downloads"
    elif command -v wget &> /dev/null; then
        downloader="wget"
        log "INFO" "Using wget for downloads"
    else
        log "WARN" "No downloader found. Installing curl..."
        sudo apt update && sudo apt install -y curl
        downloader="curl"
        log "SUCCESS" "curl installed successfully"
    fi
    
    # Check architecture
    local arch=$(uname -m)
    if [[ "$arch" != "x86_64" ]]; then
        log "WARN" "Architecture is $arch, but x86_64 is recommended"
        log "INFO" "Some features may not work correctly"
    fi
    
    # Check disk space
    local available_space=$(df . | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 1048576 ]; then  # 1GB in KB
        log "WARN" "Low disk space. At least 1GB recommended"
    fi
    
    return 0
}

# Function to create directories
create_directories() {
    log "STEP" "Creating installation directories..."
    
    mkdir -p "$SCRIPT_DIR"
    mkdir -p "$BIN_DIR"
    mkdir -p "$INSTALL_DIR"
    
    log "SUCCESS" "Installation directories created"
}

# Function to download core installer
download_installer() {
    log "STEP" "Setting up RinaWarp deployment suite..."
    
    # Check if we're running from the source directory
    local source_dir="$(dirname "$(dirname "$(realpath "$0")")")/desktop"
    
    if [ -f "$source_dir/first-run-setup.sh" ]; then
        log "INFO" "Copying scripts from local source directory: $source_dir"
        
        # Copy scripts from source directory
        local scripts=(
            "first-run-setup.sh"
            "final-rinawarp-test.sh"
            "install-rinawarp-desktop-entry.sh"
            "extract-rinawarp-icon.sh"
            "rinawarp-chunk-upload.sh"
            "LAUNCH_RINAWARP.sh"
            "LAUNCH_RINAWARP_GUI.sh"
        )
        
        for script in "${scripts[@]}"; do
            if [ -f "$source_dir/$script" ]; then
                cp "$source_dir/$script" "$SCRIPT_DIR/"
                log "SUCCESS" "Copied: $script"
            else
                log "WARN" "Script not found: $script"
            fi
        done
    else
        log "INFO" "Local source not found, attempting to download from $INSTALLER_URL"
        
        # Fallback to download method
        local temp_dir=$(mktemp -d)
        cd "$temp_dir"
        
        # Download first-run-setup.sh
        local downloader_cmd=""
        if command -v curl &> /dev/null; then
            downloader_cmd="curl -L -o"
        else
            downloader_cmd="wget -O"
        fi
        
        if $downloader_cmd "first-run-setup.sh" "$INSTALLER_URL/first-run-setup.sh" 2>/dev/null; then
            log "SUCCESS" "Core installer downloaded successfully"
        else
            log "WARN" "Failed to download from remote URL, using local scripts"
            cd - > /dev/null
            rm -rf "$temp_dir"
            return 1
        fi
        
        # Download supporting scripts
        local scripts=(
            "final-rinawarp-test.sh"
            "install-rinawarp-desktop-entry.sh"
            "extract-rinawarp-icon.sh"
            "rinawarp-chunk-upload.sh"
            "LAUNCH_RINAWARP.sh"
            "LAUNCH_RINAWARP_GUI.sh"
        )
        
        for script in "${scripts[@]}"; do
            if $downloader_cmd "$script" "$INSTALLER_URL/$script" 2>/dev/null; then
                log "SUCCESS" "Downloaded: $script"
            else
                log "WARN" "Failed to download: $script (may not be available)"
            fi
        done
        
        # Move to installation directory
        mv *.sh "$SCRIPT_DIR/" 2>/dev/null || true
        
        cd - > /dev/null
        rm -rf "$temp_dir"
    fi
    
    # Make scripts executable
    chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true
    
    return 0
}

# Function to integrate CLI tools
integrate_cli_tools() {
    log "STEP" "Integrating CLI tools..."
    
    # Define paths
    local chunk_upload_script="$SCRIPT_DIR/rinawarp-chunk-upload.sh"
    local test_script="$SCRIPT_DIR/final-rinawarp-test.sh"
    
    # Create symlinks (for the system PATH)
    # This makes 'rinawarp-upload' globally accessible
    if [ -f "$chunk_upload_script" ]; then
        ln -sf "$chunk_upload_script" "$BIN_DIR/rinawarp-upload"
        log "SUCCESS" "Created symlink: rinawarp-upload"
    fi
    
    if [ -f "$test_script" ]; then
        ln -sf "$test_script" "$BIN_DIR/rinawarp-test"
        log "SUCCESS" "Created symlink: rinawarp-test"
    fi
    
    # Add to PATH
    if ! echo "$PATH" | grep -q "$BIN_DIR"; then
        log "INFO" "Adding $BIN_DIR to PATH in ~/.bashrc"
        
        # Detect shell and add to appropriate rc file
        local rc_file=""
        if [[ "$SHELL" == *"zsh"* ]]; then
            rc_file="$HOME/.zshrc"
        elif [[ "$SHELL" == *"bash"* ]]; then
            rc_file="$HOME/.bashrc"
        fi
        
        if [ -n "$rc_file" ]; then
            if ! grep -q "$BIN_DIR" "$rc_file"; then
                echo "" >> "$rc_file"
                echo "# RinaWarp CLI tools" >> "$rc_file"
                echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$rc_file"
                log "SUCCESS" "PATH updated in $rc_file"
            fi
        fi
    fi
    
    # Persistent Alias (Backup for non-standard shells)
    local rc_file=""
    if [[ "$SHELL" == *"zsh"* ]]; then
        rc_file="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        rc_file="$HOME/.bashrc"
    fi
    
    if [ -n "$rc_file" ] && [ -f "$chunk_upload_script" ]; then
        if ! grep -q "rinawarp-upload" "$rc_file"; then
            echo "" >> "$rc_file"
            echo "# RinaWarp aliases" >> "$rc_file"
            echo "alias rinawarp-upload='$BIN_DIR/rinawarp-upload'" >> "$rc_file"
            echo "alias rinawarp-test='$BIN_DIR/rinawarp-test'" >> "$rc_file"
            log "SUCCESS" "CLI aliases added to $rc_file"
        fi
    fi
    
    return 0
}

# Function to verify installation
verify_installation() {
    log "STEP" "Verifying bootstrap installation..."
    
    local errors=0
    
    # Check if scripts directory exists
    if [ ! -d "$SCRIPT_DIR" ]; then
        log "ERROR" "Scripts directory not created"
        errors=$((errors + 1))
    else
        log "SUCCESS" "Scripts directory exists"
    fi
    
    # Check if bin directory exists
    if [ ! -d "$BIN_DIR" ]; then
        log "ERROR" "Bin directory not created"
        errors=$((errors + 1))
    else
        log "SUCCESS" "Bin directory exists"
    fi
    
    # Check if CLI tools are accessible
    if command -v rinawarp-upload &> /dev/null; then
        log "SUCCESS" "rinawarp-upload command is available"
    else
        log "WARN" "rinawarp-upload command not found (may need shell restart)"
    fi
    
    if command -v rinawarp-test &> /dev/null; then
        log "SUCCESS" "rinawarp-test command is available"
    else
        log "WARN" "rinawarp-test command not found (may need shell restart)"
    fi
    
    return $errors
}

# Function to show completion screen
show_completion_screen() {
    echo ""
    echo "🎉 RinaWarp Bootstrap Complete!"
    echo "==============================="
    echo ""
    echo "✅ Bootstrap Summary:"
    echo "   Scripts Directory: $SCRIPT_DIR"
    echo "   Binary Directory: $BIN_DIR"
    echo "   Installation Directory: $INSTALL_DIR"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Download the AppImage from:"
    echo "      https://github.com/your-repo/rinawarp/releases"
    echo ""
    echo "   2. Run the first-run setup:"
    echo "      $SCRIPT_DIR/first-run-setup.sh --auto"
    echo ""
    echo "   3. Or use the manual approach:"
    echo "      cd $SCRIPT_DIR"
    echo "      ./first-run-setup.sh"
    echo ""
    echo "🔧 Available Commands:"
    echo "   rinawarp-upload -f file.bin -u https://api...   # Upload with chunking"
    echo "   rinawarp-test --appimage /path/to/AppImage      # Test AppImage compatibility"
    echo ""
    echo "🛠️ Troubleshooting:"
    echo "   • If commands not found: source ~/.bashrc"
    echo "   • For GUI issues: Check DISPLAY variable"
    echo "   • For sandbox issues: Always use --no-sandbox"
    echo ""
    echo "📚 Documentation:"
    echo "   • User Guide: $SCRIPT_DIR/README.md"
    echo "   • Support: Check /tmp/rinawarp-install.log"
    echo ""
}

# Main execution
main() {
    show_banner
    
    log "INFO" "Initializing RinaWarp Professional Suite bootstrap..."
    
    # Step 1: Check prerequisites
    if ! check_prerequisites; then
        log "ERROR" "Prerequisites check failed"
        exit 1
    fi
    
    # Step 2: Create directories
    create_directories
    
    # Step 3: Download installer
    if ! download_installer; then
        log "ERROR" "Failed to download installer"
        exit 1
    fi
    
    # Step 4: Integrate CLI tools
    integrate_cli_tools
    
    # Step 5: Verify installation
    if ! verify_installation; then
        log "WARN" "Bootstrap completed with warnings"
    fi
    
    # Show completion screen
    show_completion_screen
    
    log "SUCCESS" "Bootstrap completed successfully!"
    log "INFO" "You can now run the first-run setup with: $SCRIPT_DIR/first-run-setup.sh --auto"
}

# Handle script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi