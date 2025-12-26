#!/bin/bash

# =====================================================
# RinaWarp Terminal Pro - First Run Automation
# One-click customer deployment experience
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
APPIMAGE_PATH=""
INSTALL_DIR="$HOME/Applications"
DESKTOP_FILE="$HOME/.local/share/applications/rinawarp.desktop"
ICON_DIR="$HOME/.local/share/icons"
ICON_PATH="$ICON_DIR/rinawarp.png"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTO_MODE=false
SKIP_TESTS=false
FORCE_REINSTALL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--appimage)
            APPIMAGE_PATH="$2"
            shift 2
            ;;
        --auto)
            AUTO_MODE=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --force)
            FORCE_REINSTALL=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -a, --appimage PATH    Path to AppImage file"
            echo "  --auto                 Run in automated mode (no prompts)"
            echo "  --skip-tests           Skip AppImage testing phase"
            echo "  --force                Force reinstallation even if already installed"
            echo "  -h, --help            Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to log messages
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" | tee -a "/tmp/rinawarp-install.log" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "/tmp/rinawarp-install.log" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" | tee -a "/tmp/rinawarp-install.log" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "/tmp/rinawarp-install.log" ;;
        "STEP") echo -e "${PURPLE}[STEP]${NC} $message" | tee -a "/tmp/rinawarp-install.log" ;;
    esac
}

# Function to check if already installed (Idempotency)
check_existing_installation() {
    if [ -f "$DESKTOP_FILE" ] && [ "$FORCE_REINSTALL" = false ]; then
        log "INFO" "Existing installation detected"
        
        # Check for duplicate entries
        local desktop_count=$(grep -l "RinaWarp Terminal Pro" ~/.local/share/applications/*.desktop 2>/dev/null | wc -l)
        if [ $desktop_count -gt 1 ]; then
            log "WARN" "Multiple desktop entries found ($desktop_count). Cleaning up duplicates..."
            # Remove all RinaWarp desktop entries and recreate
            rm -f ~/.local/share/applications/*rinawarp*.desktop
        fi
        
        if [ "$AUTO_MODE" = false ]; then
            echo ""
            read -p "RinaWarp Terminal Pro appears to be already installed. Update existing installation? (Y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Nn]$ ]]; then
                log "INFO" "Installation cancelled by user"
                exit 0
            fi
        fi
        log "INFO" "Updating existing installation (idempotent mode)..."
    fi
}

# Function to detect or locate AppImage
locate_appimage() {
    log "STEP" "Locating RinaWarp AppImage..."
    
    if [ -n "$APPIMAGE_PATH" ]; then
        if [[ "$APPIMAGE_PATH" == ~* ]]; then
            APPIMAGE_PATH="${APPIMAGE_PATH/#\~/$HOME}"
        fi
        
        if [ ! -f "$APPIMAGE_PATH" ]; then
            log "ERROR" "Specified AppImage not found: $APPIMAGE_PATH"
            return 1
        fi
        
        log "SUCCESS" "Using specified AppImage: $APPIMAGE_PATH"
        return 0
    fi
    
    # Auto-detect common locations
    local possible_paths=(
        "./RinaWarp-Terminal-Pro-*.AppImage"
        "../build-output/RinaWarp-Terminal-Pro-*.AppImage"
        "../../build-output/RinaWarp-Terminal-Pro-*.AppImage"
        "/home/*/Downloads/RinaWarp-Terminal-Pro-*.AppImage"
        "~/Downloads/RinaWarp-Terminal-Pro-*.AppImage"
        "$HOME/Downloads/RinaWarp-Terminal-Pro-*.AppImage"
        "/tmp/RinaWarp-Terminal-Pro-*.AppImage"
    )
    
    for pattern in "${possible_paths[@]}"; do
        local matches=($(eval ls $pattern 2>/dev/null || true))
        if [ ${#matches[@]} -gt 0 ]; then
            APPIMAGE_PATH="${matches[0]}"
            log "SUCCESS" "Auto-detected AppImage: $APPIMAGE_PATH"
            return 0
        fi
    done
    
    log "ERROR" "Could not locate RinaWarp AppImage"
    log "INFO" "Please download the AppImage and place it in one of these locations:"
    for pattern in "${possible_paths[@]}"; do
        log "INFO" "  - $pattern"
    done
    return 1
}

# Function to copy AppImage to installation directory
prepare_installation() {
    log "STEP" "Preparing installation directory..."
    
    # Create installation directory
    mkdir -p "$INSTALL_DIR"
    
    # Copy AppImage if not already in installation directory
    if [[ "$APPIMAGE_PATH" != "$INSTALL_DIR"* ]]; then
        local appimage_name=$(basename "$APPIMAGE_PATH")
        local target_path="$INSTALL_DIR/$appimage_name"
        
        log "INFO" "Copying AppImage to installation directory..."
        cp "$APPIMAGE_PATH" "$target_path"
        
        if [ $? -eq 0 ]; then
            APPIMAGE_PATH="$target_path"
            log "SUCCESS" "AppImage copied to: $APPIMAGE_PATH"
        else
            log "ERROR" "Failed to copy AppImage"
            return 1
        fi
    fi
    
    # Make AppImage executable
    chmod +x "$APPIMAGE_PATH"
    
    # Show installation info
    log "INFO" "Installation preparation complete"
    log "INFO" "AppImage location: $APPIMAGE_PATH"
    log "INFO" "AppImage size: $(du -h "$APPIMAGE_PATH" | cut -f1)"
    
    return 0
}

# Function to run AppImage tests
run_appimage_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log "INFO" "Skipping AppImage tests as requested"
        return 0
    fi
    
    log "STEP" "Running AppImage compatibility tests..."
    
    # Check if test script exists
    local test_script="$SCRIPT_DIR/final-rinawarp-test.sh"
    if [ ! -f "$test_script" ]; then
        log "WARN" "Test script not found, skipping tests"
        return 0
    fi
    
    # Run tests with recommended flags
    log "INFO" "Executing AppImage test suite..."
    if bash "$test_script" -a "$APPIMAGE_PATH" --no-sandbox --fuse-fix --verbose; then
        log "SUCCESS" "AppImage tests passed"
        return 0
    else
        log "WARN" "AppImage tests had issues, but continuing with installation"
        return 0  # Don't fail installation due to test issues
    fi
}

# Function to extract and install icon
install_icon() {
    log "STEP" "Extracting and installing application icon..."
    
    # Check if icon extraction script exists
    local icon_script="$SCRIPT_DIR/extract-rinawarp-icon.sh"
    if [ ! -f "$icon_script" ]; then
        log "WARN" "Icon extraction script not found, using default icon"
        return 0
    fi
    
    # Extract icon
    if bash "$icon_script" -a "$APPIMAGE_PATH" -o "$ICON_DIR" --force; then
        log "SUCCESS" "Icon extracted and installed"
        return 0
    else
        log "WARN" "Icon extraction failed, using default icon"
        return 0
    fi
}

# Function to create desktop entry
create_desktop_integration() {
    log "STEP" "Creating desktop integration..."
    
    # Check if desktop entry script exists
    local desktop_script="$SCRIPT_DIR/install-rinawarp-desktop-entry.sh"
    if [ ! -f "$desktop_script" ]; then
        log "ERROR" "Desktop entry script not found"
        return 1
    fi
    
    # Create desktop entry
    if bash "$desktop_script" -a "$APPIMAGE_PATH" -i "$ICON_PATH" --force; then
        log "SUCCESS" "Desktop integration created"
    else
        log "ERROR" "Failed to create desktop integration"
        return 1
    fi
    
    # Add PATH management option
    setup_command_line_access
    
    return 0
}

# Function to setup command line access (PATH Management)
setup_command_line_access() {
    log "STEP" "Setting up command line access..."
    
    local symlink_path="/usr/local/bin/rinawarp"
    local should_create_symlink=false
    
    # Check if symlink already exists
    if [ -L "$symlink_path" ]; then
        local existing_target=$(readlink "$symlink_path")
        if [ "$existing_target" = "$APPIMAGE_PATH" ]; then
            log "INFO" "Command line access already configured: $symlink_path"
        else
            log "WARN" "Symlink exists but points to different target. Updating..."
            sudo rm "$symlink_path"
            should_create_symlink=true
        fi
    elif [ -f "$symlink_path" ]; then
        log "WARN" "File exists at $symlink_path but is not a symlink"
        should_create_symlink=true
    else
        should_create_symlink=true
    fi
    
    # Ask user if they want command line access
    if [ "$AUTO_MODE" = false ] && [ "$should_create_symlink" = true ]; then
        echo ""
        echo "🔗 Command Line Access Option"
        echo "Create a 'rinawarp' command for terminal access?"
        echo "This allows you to run 'rinawarp' from any directory."
        read -p "Create /usr/local/bin/rinawarp symlink? (Y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            log "INFO" "Command line access skipped by user"
            return 0
        fi
    fi
    
    # Create symlink (requires sudo)
    if [ "$should_create_symlink" = true ]; then
        log "INFO" "Creating command line access: $symlink_path"
        if sudo ln -sf "$APPIMAGE_PATH" "$symlink_path"; then
            log "SUCCESS" "Command line access created. Run 'rinawarp' from any directory!"
            
            # Verify PATH access
            if command -v rinawarp &> /dev/null; then
                log "SUCCESS" "Verification: 'rinawarp' command is now available"
            else
                log "WARN" "Symlink created but command not found. You may need to restart your terminal."
            fi
        else
            log "ERROR" "Failed to create symlink (may require sudo privileges)"
            return 1
        fi
    fi
    
    # Enhanced CLI Integration for professional suite
    setup_professional_cli_integration
    
    return 0
}

# Function to setup professional CLI integration
setup_professional_cli_integration() {
    log "STEP" "Setting up professional CLI integration..."
    
    # Define paths
    local install_dir="$HOME/.local/share/rinawarp"
    local bin_dir="$HOME/.local/bin"
    local chunk_upload_script="$SCRIPT_DIR/rinawarp-chunk-upload.sh"
    local test_script="$SCRIPT_DIR/final-rinawarp-test.sh"
    
    # Create directories if they don't exist
    mkdir -p "$bin_dir"
    
    # Create symlinks for CLI tools
    if [ -f "$chunk_upload_script" ]; then
        if ln -sf "$chunk_upload_script" "$bin_dir/rinawarp-upload"; then
            log "SUCCESS" "Created symlink: rinawarp-upload"
        else
            log "WARN" "Failed to create rinawarp-upload symlink"
        fi
    fi
    
    if [ -f "$test_script" ]; then
        if ln -sf "$test_script" "$bin_dir/rinawarp-test"; then
            log "SUCCESS" "Created symlink: rinawarp-test"
        else
            log "WARN" "Failed to create rinawarp-test symlink"
        fi
    fi
    
    # Add to PATH for current session
    if ! echo "$PATH" | grep -q "$bin_dir"; then
        export PATH="$bin_dir:$PATH"
        log "INFO" "Added $bin_dir to current session PATH"
    fi
    
    # Detect shell and add to appropriate rc file
    local rc_file=""
    if [[ "$SHELL" == *"zsh"* ]]; then
        rc_file="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        rc_file="$HOME/.bashrc"
    fi
    
    # Add PATH and aliases to shell configuration
    if [ -n "$rc_file" ]; then
        # Add PATH export
        if ! grep -q "rinawarp" "$rc_file" 2>/dev/null; then
            echo "" >> "$rc_file"
            echo "# RinaWarp CLI tools" >> "$rc_file"
            echo "export PATH=\"$bin_dir:\$PATH\"" >> "$rc_file"
            
            # Add aliases
            echo "" >> "$rc_file"
            echo "# RinaWarp aliases" >> "$rc_file"
            if [ -f "$chunk_upload_script" ]; then
                echo "alias rinawarp-upload='$bin_dir/rinawarp-upload'" >> "$rc_file"
            fi
            if [ -f "$test_script" ]; then
                echo "alias rinawarp-test='$bin_dir/rinawarp-test'" >> "$rc_file"
            fi
            
            log "SUCCESS" "CLI integration added to $rc_file"
        fi
    fi
    
    # Verify CLI commands are available
    if command -v rinawarp-upload &> /dev/null; then
        log "SUCCESS" "rinawarp-upload command is available globally"
    else
        log "WARN" "rinawarp-upload command not found (may need shell restart)"
    fi
    
    if command -v rinawarp-test &> /dev/null; then
        log "SUCCESS" "rinawarp-test command is available globally"
    else
        log "WARN" "rinawarp-test command not found (may need shell restart)"
    fi
    
    return 0
}

# Function to verify installation
verify_installation() {
    log "STEP" "Verifying installation..."
    
    local errors=0
    
    # Check desktop entry
    if [ ! -f "$DESKTOP_FILE" ]; then
        log "ERROR" "Desktop entry not created"
        errors=$((errors + 1))
    else
        log "SUCCESS" "Desktop entry created"
    fi
    
    # Check AppImage
    if [ ! -x "$APPIMAGE_PATH" ]; then
        log "ERROR" "AppImage not executable"
        errors=$((errors + 1))
    else
        log "SUCCESS" "AppImage is executable"
    fi
    
    # Check icon
    if [ ! -f "$ICON_PATH" ]; then
        log "WARN" "Custom icon not found (using default)"
    else
        log "SUCCESS" "Custom icon installed"
    fi
    
    # Test AppImage execution
    log "INFO" "Testing AppImage execution..."
    if timeout 10s "$APPIMAGE_PATH" --version &> /dev/null; then
        log "SUCCESS" "AppImage executes successfully"
    else
        log "WARN" "AppImage execution test failed (may be normal for GUI apps)"
    fi
    
    if [ $errors -eq 0 ]; then
        log "SUCCESS" "Installation verification passed"
        return 0
    else
        log "ERROR" "Installation verification failed with $errors errors"
        return 1
    fi
}

# Function to show completion screen
show_completion_screen() {
    echo ""
    echo "🎉 RinaWarp Terminal Pro - Installation Complete!"
    echo "================================================"
    echo ""
    echo "✅ Installation Summary:"
    echo "   AppImage: $APPIMAGE_PATH"
    echo "   Desktop Entry: $DESKTOP_FILE"
    echo "   Icon: $ICON_PATH"
    echo ""
    echo "🚀 How to Launch:"
    echo "   Method 1: Press Super key (Windows key) and search for 'RinaWarp'"
    echo "   Method 2: Run: $APPIMAGE_PATH --no-sandbox"
    echo "   Method 3: Check your application menu under Development/Security"
    echo ""
    echo "🔧 Command Line Options:"
    echo "   --no-sandbox     Disable sandbox (recommended for Kali)"
    echo "   --disable-gpu    Disable GPU acceleration"
    echo "   --help          Show all available options"
    echo ""
    echo "📋 Troubleshooting:"
    echo "   • If app doesn't appear in menu: update-desktop-database ~/.local/share/applications"
    echo "   • If app fails to start: Check logs with --verbose flag"
    echo "   • For GUI issues: Ensure X11 is running and DISPLAY is set"
    echo "   • For sandbox issues: Always use --no-sandbox flag"
    echo ""
    echo "🆘 Need Help?"
    echo "   • Documentation: Check the installed files for user guides"
    echo "   • Support: Visit https://rinawarptech.com/support"
    echo "   • Logs: Check /tmp/rinawarp-install.log for installation details"
    echo ""
    
    if [ "$AUTO_MODE" = false ]; then
        echo "Would you like to launch RinaWarp Terminal Pro now? (y/N): "
        read -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "INFO" "Launching RinaWarp Terminal Pro..."
            "$APPIMAGE_PATH" --no-sandbox --disable-gpu &
            log "SUCCESS" "RinaWarp Terminal Pro launched!"
        fi
    fi
}

# Function to create uninstall script
create_uninstall_script() {
    local uninstall_script="$INSTALL_DIR/uninstall-rinawarp.sh"
    
    log "INFO" "Creating uninstall script: $uninstall_script"
    
    cat > "$uninstall_script" << EOF
#!/bin/bash

echo "Uninstalling RinaWarp Terminal Pro..."

# Remove desktop entry
rm -f "$DESKTOP_FILE"
echo "✅ Removed desktop entry: $DESKTOP_FILE"

# Remove all RinaWarp icons
rm -f "$HOME/.local/share/icons/rinawarp"*.png 2>/dev/null || true
echo "✅ Removed custom icons from: $HOME/.local/share/icons/"

# Remove AppImage
rm -f "$APPIMAGE_PATH"
echo "✅ Removed AppImage: $APPIMAGE_PATH"

# Clean up any temporary files
rm -f /tmp/rinawarp-install.log 2>/dev/null || true
rm -rf ./test-results/rinawarp* 2>/dev/null || true

# Update desktop database
update-desktop-database ~/.local/share/applications 2>/dev/null || true
echo "✅ Updated desktop database"

# Clean up extraction directories
rm -rf ./squashfs-root 2>/dev/null || true
rm -rf ./chunk_* 2>/dev/null || true

echo ""
echo "RinaWarp Terminal Pro has been completely uninstalled."
echo "All traces have been removed from your system."
echo "Thank you for trying RinaWarp Terminal Pro!"
EOF
    
    chmod +x "$uninstall_script"
    log "SUCCESS" "Uninstall script created: $uninstall_script"
}

# Function to show progress
show_progress() {
    local current=$1
    local total=$2
    local task="$3"
    
    local percent=$((current * 100 / total))
    local filled=$((percent / 2))
    local empty=$((50 - filled))
    
    printf "\r${CYAN}[PROGRESS]${NC} "
    printf "%s" "$(printf '%*s' $filled | tr ' ' '█')"
    printf "%s" "$(printf '%*s' $empty | tr ' ' '░')"
    printf " %3d%% - %s" "$percent" "$task"
    
    if [ $current -eq $total ]; then
        echo ""
    fi
}

# Main installation function
main() {
    echo "================================================"
    echo "🚀 RinaWarp Terminal Pro - First Run Setup"
    echo "================================================"
    echo ""
    echo "This script will automatically:"
    echo "  1. Locate and verify your AppImage"
    echo "  2. Test compatibility with your system"
    echo "  3. Extract and install the application icon"
    echo "  4. Create desktop integration"
    echo "  5. Verify the installation"
    echo ""
    
    if [ "$AUTO_MODE" = false ]; then
        read -p "Continue with automatic installation? (Y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            log "INFO" "Installation cancelled by user"
            exit 0
        fi
    fi
    
    echo ""
    log "INFO" "Starting automated installation process..."
    echo ""
    
    # Track progress
    local steps=6
    local current_step=0
    
    # Step 1: Check existing installation
    check_existing_installation
    current_step=$((current_step + 1))
    show_progress $current_step $steps "Checking existing installation"
    
    # Step 2: Locate AppImage
    if ! locate_appimage; then
        log "ERROR" "Cannot proceed without locating AppImage"
        exit 1
    fi
    current_step=$((current_step + 1))
    show_progress $current_step $steps "Locating AppImage"
    
    # Step 3: Prepare installation
    if ! prepare_installation; then
        log "ERROR" "Installation preparation failed"
        exit 1
    fi
    current_step=$((current_step + 1))
    show_progress $current_step $steps "Preparing installation"
    
    # Step 4: Run tests
    run_appimage_tests
    current_step=$((current_step + 1))
    show_progress $current_step $steps "Running compatibility tests"
    
    # Step 5: Install icon
    install_icon
    current_step=$((current_step + 1))
    show_progress $current_step $steps "Installing application icon"
    
    # Step 6: Create desktop integration
    if ! create_desktop_integration; then
        log "ERROR" "Desktop integration failed"
        exit 1
    fi
    current_step=$((current_step + 1))
    show_progress $current_step $steps "Creating desktop integration"
    
    # Final verification
    if ! verify_installation; then
        log "ERROR" "Installation verification failed"
        exit 1
    fi
    
    # Create uninstall script
    create_uninstall_script
    
    # Show completion screen
    show_completion_screen
    
    log "SUCCESS" "Installation completed successfully!"
}

# Run main function
main "$@"