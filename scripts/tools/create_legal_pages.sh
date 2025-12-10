#!/bin/bash

# Legal Document Page Creator
# Creates HTML pages for all legal documents using simple wrapping

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

echo "🚀 Creating Legal Document Pages..."

# Create HTML wrapper template
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
converted_count=0
for md_file in "${!DOCUMENT_MAP[@]}"; do
    html_file="${DOCUMENT_MAP[$md_file]}"
    output_path="${PUBLIC_LEGAL_DIR}/${html_file}"

    if [[ -f "${LEGAL_DOCS_SOURCE}/${md_file}" ]]; then
        echo "📄 Creating ${html_file}..."

        # Read markdown content
        markdown_content=$(cat "${LEGAL_DOCS_SOURCE}/${md_file}")

        # Extract title from first line
        doc_title=$(echo "$markdown_content" | head -1 | sed 's/^# //')
        doc_description="Legal document: ${doc_title} for RinaWarp Technologies LLC"

        # Simple HTML conversion - wrap markdown content in pre tags for now
        # This will be properly converted by the browser or can be enhanced later
        html_content="<h1>${doc_title}</h1>"
        html_content+=$'\n<pre class="markdown-content">'
        html_content+=$'\n'"${markdown_content}"
        html_content+=$'\n</pre>'

        # Create HTML file
        final_html=$(echo "$HTML_TEMPLATE" | sed \
            -e "s/DOC_TITLE/${doc_title}/g" \
            -e "s/DOC_DESCRIPTION/${doc_description}/g" \
            -e 's|DOC_CONTENT|'"${html_content}"'|g')

        echo "$final_html" > "$output_path"
        echo "✅ Created: ${output_path}"
        ((converted_count++))
    else
        echo "⚠️  File not found: ${LEGAL_DOCS_SOURCE}/${md_file}"
    fi
done

echo "✅ Legal document page creation completed!"
echo ""
echo "📊 Summary:"
echo "   - Processed ${#DOCUMENT_MAP[@]} document mappings"
echo "   - Successfully created ${converted_count} HTML pages"
echo "   - Created HTML files in: ${PUBLIC_LEGAL_DIR}/"
echo "   - Ready for deployment to Cloudflare Pages"
echo ""
echo "💡 Note: Markdown content is wrapped in <pre> tags for simplicity."
echo "   For full markdown rendering, consider using a markdown-to-HTML library"
echo "   or browser-based markdown processor."