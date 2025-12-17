#!/bin/bash

# Global Footer Injection Script for RinaWarp Technologies LLC
# This script injects a consistent footer across all products

# Configuration
GLOBAL_FOOTER_HTML='<!-- RinaWarp Global Footer - Auto-Injected -->
<footer class="rinawarp-global-footer">
    <div class="footer-container">
        <div class="footer-legal-links">
            <a href="/legal/terms-of-service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            <a href="/legal/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            <a href="/legal/refund-policy.html" target="_blank" rel="noopener noreferrer">Refund Policy</a>
            <a href="/legal/cookie-policy.html" target="_blank" rel="noopener noreferrer">Cookie Policy</a>
            <a href="/legal/security-policy.html" target="_blank" rel="noopener noreferrer">Security</a>
            <a href="/legal/data-processing-agreement.html" target="_blank" rel="noopener noreferrer">Data Processing Agreement</a>
            <a href="/legal/ai-ethical-policy.html" target="_blank" rel="noopener noreferrer">AI Ethics</a>
            <a href="/legal/dmca-policy.html" target="_blank" rel="noopener noreferrer">DMCA</a>
            <a href="/contact.html" target="_blank" rel="noopener noreferrer">Contact Support</a>
        </div>
        <div class="footer-copyright">
            <p>© 2025 RinaWarp Technologies LLC. All rights reserved.</p>
            <p>RinaWarp Technologies LLC is a registered company in Utah, USA.</p>
        </div>
    </div>
</footer>

<!-- Global Footer CSS -->
<style>
.rinawarp-global-footer {
    background-color: #1a1a1a;
    color: white;
    padding: 20px 0;
    margin-top: 50px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.footer-legal-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    margin-bottom: 15px;
}

.footer-legal-links a {
    color: #ccc;
    text-decoration: none;
    font-size: 0.9rem;
    padding: 5px 10px;
    border-radius: 3px;
    transition: all 0.2s;
}

.footer-legal-links a:hover {
    color: white;
    background-color: #4a6bff;
    text-decoration: none;
}

.footer-copyright {
    text-align: center;
    font-size: 0.8rem;
    color: #999;
    line-height: 1.4;
}

.footer-copyright p {
    margin: 5px 0;
}

@media (max-width: 768px) {
    .footer-legal-links {
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .footer-legal-links a {
        display: block;
        text-align: center;
    }
}
</style>'

# Function to inject footer into HTML files
inject_footer() {
    local file_path=$1
    local temp_file="${file_path}.tmp"

    echo "Processing: $file_path"

    # Check if file exists and is HTML
    if [[ ! -f "$file_path" || ! "$file_path" =~ \.html$ ]]; then
        echo "Skipping non-HTML file or non-existent file: $file_path"
        return 1
    fi

    # Create backup
    cp "$file_path" "${file_path}.bak"

    # Check if footer already exists
    if grep -q "rinawarp-global-footer" "$file_path"; then
        echo "Footer already exists in $file_path, skipping..."
        return 0
    fi

    # Find the closing </body> tag and insert footer before it
    awk -v footer="$GLOBAL_FOOTER_HTML" '
    {
        if ($0 ~ /<\/body>/) {
            print footer
        }
        print
    }' "$file_path" > "$temp_file"

    # Replace original file with modified version
    mv "$temp_file" "$file_path"

    echo "Footer injected into $file_path"
}

# Function to process directory recursively
process_directory() {
    local dir_path=$1

    echo "Processing directory: $dir_path"

    # Find all HTML files in directory and subdirectories
    find "$dir_path" -type f -name "*.html" | while read -r html_file; do
        inject_footer "$html_file"
    done
}

# Main execution
echo "Starting RinaWarp Global Footer Injection..."

# Process all products as specified in the requirements

# 1. Main Website (Cloudflare Pages)
echo "Processing Main Website..."
if [[ -d "apps/website/public" ]]; then
    process_directory "apps/website/public"
else
    echo "Main website directory not found: apps/website/public"
fi

if [[ -d "apps/website/dist-website" ]]; then
    process_directory "apps/website/dist-website"
else
    echo "Main website dist directory not found: apps/website/dist-website"
fi

# 2. Admin Console
echo "Processing Admin Console..."
if [[ -d "apps/admin-console" ]]; then
    process_directory "apps/admin-console"
else
    echo "Admin console directory not found: apps/admin-console"
fi

# 3. AI Music Video Creator Web UI
echo "Processing AI Music Video Creator..."
if [[ -d "apps/terminal-pro/apps/ai-music-video" ]]; then
    process_directory "apps/terminal-pro/apps/ai-music-video"
else
    echo "AI Music Video Creator directory not found: apps/terminal-pro/apps/ai-music-video"
fi

# 4. Terminal Pro App (EULA link inside Help menu)
echo "Processing Terminal Pro..."
if [[ -d "apps/terminal-pro/desktop/src/renderer" ]]; then
    process_directory "apps/terminal-pro/desktop/src/renderer"
    # Also update the Help menu specifically for EULA link
    help_menu_file="apps/terminal-pro/desktop/src/renderer/index.html"
    if [[ -f "$help_menu_file" ]]; then
        echo "Updating Terminal Pro Help menu with EULA link..."
        # Add EULA link to help menu if not present
        if ! grep -q "legal/terminal-pro-eula.html" "$help_menu_file"; then
            sed -i '/<div class="help-menu">/a\
                <a href="/legal/terminal-pro-eula.html" target="_blank">End User License Agreement</a>' "$help_menu_file"
            echo "EULA link added to Terminal Pro Help menu"
        fi
    fi
else
    echo "Terminal Pro directory not found: apps/terminal-pro/desktop/src/renderer"
fi

echo "Global footer injection completed!"

# Cleanup backup files after successful injection
find . -name "*.html.bak" -type f -delete
echo "Cleanup completed. Backup files removed."