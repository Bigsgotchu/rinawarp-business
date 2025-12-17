#!/bin/bash

# Markdown to HTML Converter for Legal Documents
# Converts all markdown legal docs to HTML using the template system

set -e

# Configuration
LEGAL_DOCS_SOURCE="docs/legal"
PUBLIC_LEGAL_DIR="public/legal"
CURRENT_YEAR=$(date +%Y)

# Document mapping - markdown file to HTML file
declare -A DOCUMENT_MAP=(
    ["TERMS_OF_SERVICE.md"]="terms-of-service.html"
    ["PRIVACY_POLICY.md"]="privacy-policy.html"
    ["COOKIE_POLICY.md"]="cookie-policy.html"
    ["PAYMENT_REFUND_POLICY.md"]="refund-policy.html"
    ["GDPR_CCPA_COMPLIANCE_POLICY.md"]="gdpr-ccpa-policy.html"
    ["ACCEPTABLE_USE_POLICY.md"]="acceptable-use-policy.html"
    ["AI_ETHICAL_POLICY.md"]="ai-ethical-policy.html"
    ["ACCESSIBILITY_POLICY.md"]="accessibility-policy.html"
    ["DATA_SUBJECT_REQUEST_POLICY.md"]="data-subject-request-policy.html"
    ["DMCA_POLICY.md"]="dmca-policy.html"
    ["SECURITY_POLICY.md"]="security-policy.html"
    ["VENDOR_THIRD_PARTY_POLICY.md"]="vendor-third-party-policy.html"
    ["TERMINAL_PRO_EULA.md"]="terminal-pro-eula.html"
    ["AI_MUSIC_VIDEO_CREATOR_EULA.md"]="ai-music-video-creator-eula.html"
    ["COMMERCIAL_LICENSE_AGREEMENT.md"]="commercial-license-agreement.html"
    ["DATA_PROCESSING_AGREEMENT.md"]="data-processing-agreement.html"
    ["SUBSCRIPTION_BILLING_AGREEMENT.md"]="subscription-billing-agreement.html"
)

echo "🚀 Starting Markdown to HTML Conversion..."

# Create a simple HTML wrapper template
HTML_TEMPLATE='<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="DOC_DESCRIPTION">
    <title>DOC_TITLE | RinaWarp Technologies LLC</title>
    <link rel="stylesheet" href="/legal/css/legal.css">
</head>
<body>
    <header>
        <div class="container">
            <nav class="navbar">
                <a href="/" class="logo">RinaWarp Technologies LLC</a>
                <div class="nav-links">
                    <a href="/legal/">Legal Hub</a>
                    <a href="/">Home</a>
                    <a href="/contact">Contact</a>
                </div>
            </nav>
        </div>
    </header>

    <main class="main-content">
        <div class="container">
            <div class="document-content">
                DOC_CONTENT
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/legal/terms-of-service.html">Terms of Service</a></li>
                        <li><a href="/legal/privacy-policy.html">Privacy Policy</a></li>
                        <li><a href="/legal/refund-policy.html">Refund Policy</a></li>
                        <li><a href="/legal/cookie-policy.html">Cookie Policy</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Compliance</h3>
                    <ul>
                        <li><a href="/legal/security-policy.html">Security</a></li>
                        <li><a href="/legal/data-processing-agreement.html">Data Processing</a></li>
                        <li><a href="/legal/ai-ethical-policy.html">AI Ethics</a></li>
                        <li><a href="/legal/dmca-policy.html">DMCA</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <ul>
                        <li>Support: support@rinawarptech.com</li>
                        <li>Legal: legal@rinawarptech.com</li>
                    </ul>
                </div>
            </div>
            <div class="copyright">
                <p>© '"$CURRENT_YEAR"' RinaWarp Technologies LLC. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>'

# Process each document
for md_file in "${!DOCUMENT_MAP[@]}"; do
    html_file="${DOCUMENT_MAP[$md_file]}"
    output_path="${PUBLIC_LEGAL_DIR}/${html_file}"

    if [[ -f "${LEGAL_DOCS_SOURCE}/${md_file}" ]]; then
        echo "📄 Converting ${md_file} to ${html_file}..."

        # Read markdown content
        markdown_content=$(cat "${LEGAL_DOCS_SOURCE}/${md_file}")

        # Simple markdown to HTML conversion
        html_content=$(echo "$markdown_content" | sed \
            -e 's/^# /<h1>/g' \
            -e 's/^## /<h2>/g' \
            -e 's/^### /<h3>/g' \
            -e 's/^#### /<h4>/g' \
            -e 's/^##### /<h5>/g' \
            -e 's/^###### /<h6>/g' \
            -e 's/^> /<blockquote>/g' \
            -e 's/^\* /<li>/g' \
            -e 's/^- /<li>/g' \
            -e 's/^`\(.*\)`$/<code>\1<\/code>/g' \
            -e 's/\[\([^]]*\)\](\([^)]*\))/<a href="\2">\1<\/a>/g' \
            -e 's/!\[\([^]]*\)\](\([^)]*\))/<img src="\2" alt="\1">/g' \
            -e 's/^\*\*\*\(.*\)\*\*\*$/<strong><em>\1<\/em><\/strong>/g' \
            -e 's/^\*\*\(.*\)\*\*$/<strong>\1<\/strong>/g' \
            -e 's/^\*\(.*\)\*$/<em>\1<\/em>/g' \
            -e 's/^```\([^`]*\)```$/<pre><code>\1<\/code><\/pre>/g' \
            -e 's/^---$/<hr>/g' \
            -e 's/^\[[xX]\] /<input type="checkbox" checked disabled> /g' \
            -e 's/^\[[ ]\] /<input type="checkbox" disabled> /g' \
            -e 's/^\([^<]\)/<p>\1<\/p>/g' \
            -e 's/\([^<]\)$/\1<\/p>/g' \
            -e 's/<\/p><p>/<br><br>/g' \
            -e 's/<\/h[1-6]><p>/<\/h[1-6]>/g' \
            -e 's/<\/blockquote><p>/<\/blockquote>/g' \
            -e 's/<\/li><p>/<\/li>/g' \
            -e 's/<\/ul><p>/<\/ul>/g' \
        )

        # Extract title and description from first lines
        doc_title=$(echo "$markdown_content" | head -1 | sed 's/^# //')
        doc_description="Legal document: ${doc_title} for RinaWarp Technologies LLC"

        # Create HTML file
        final_html=$(echo "$HTML_TEMPLATE" | sed \
            -e "s/DOC_TITLE/${doc_title}/g" \
            -e "s/DOC_DESCRIPTION/${doc_description}/g" \
            -e "s|DOC_CONTENT|${html_content}|g")

        echo "$final_html" > "$output_path"
        echo "✅ Created: ${output_path}"
    else
        echo "⚠️  File not found: ${LEGAL_DOCS_SOURCE}/${md_file}"
    fi
done

echo "✅ Markdown to HTML conversion completed!"
echo ""
echo "📊 Summary:"
echo "   - Processed ${#DOCUMENT_MAP[@]} document mappings"
echo "   - Created HTML files in: ${PUBLIC_LEGAL_DIR}/"
echo "   - Ready for deployment to Cloudflare Pages"