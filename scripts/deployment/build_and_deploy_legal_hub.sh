#!/bin/bash

# Legal Hub Build & Deploy Script
# RinaWarp Technologies LLC
# This script creates a comprehensive legal hub with all required documents,
# converts markdown to HTML, adds branding, and deploys to Cloudflare Pages

set -e  # Exit on error

# Configuration
LEGAL_DOCS_SOURCE="docs/legal"
PUBLIC_LEGAL_DIR="public/legal"
BRAND_NAME="RinaWarp Technologies LLC"
BASE_URL="https://rinawarptech.com"
CURRENT_YEAR=$(date +%Y)

echo "🚀 Starting Legal Hub Build Process..."
echo "📁 Creating directory structure..."

# Create directories
mkdir -p "${PUBLIC_LEGAL_DIR}"
mkdir -p "${PUBLIC_LEGAL_DIR}/css"

# Create CSS styles
echo "🎨 Creating CSS styles..."
cat > "${PUBLIC_LEGAL_DIR}/css/legal.css" << 'EOF'
:root {
    --primary-color: #4a6bff;
    --secondary-color: #2a43d3;
    --text-color: #333;
    --light-text: #666;
    --bg-color: #f8f9fa;
    --card-bg: #ffffff;
    --border-color: #e0e0e0;
}

[data-theme="dark"] {
    --primary-color: #6a8bff;
    --secondary-color: #4a6bff;
    --text-color: #f8f9fa;
    --light-text: #adb5bd;
    --bg-color: #1a1a2e;
    --card-bg: #16213e;
    --border-color: #2d3748;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--bg-color);
    transition: all 0.3s ease;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

header {
    background-color: var(--card-bg);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid var(--border-color);
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    text-decoration: none;
}

.nav-links {
    display: flex;
    gap: 20px;
}

.nav-links a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: var(--primary-color);
}

.main-content {
    min-height: calc(100vh - 120px);
    padding: 40px 0;
}

.legal-header {
    text-align: center;
    margin-bottom: 40px;
}

.legal-header h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 10px;
}

.legal-header p {
    color: var(--light-text);
    font-size: 1.1rem;
}

.document-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    margin-top: 30px;
}

.category-section {
    margin-bottom: 50px;
}

.category-section h2 {
    font-size: 1.8rem;
    color: var(--primary-color);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--primary-color);
}

.document-card {
    background-color: var(--card-bg);
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid var(--border-color);
}

.document-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.document-card h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
    color: var(--primary-color);
}

.document-card p {
    color: var(--light-text);
    margin-bottom: 15px;
    font-size: 0.95rem;
}

.document-card a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.document-card a:hover {
    text-decoration: underline;
}

.document-content {
    max-width: 800px;
    margin: 0 auto;
    background-color: var(--card-bg);
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-color);
}

.document-content h1 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid var(--primary-color);
}

.document-content h2 {
    font-size: 1.6rem;
    color: var(--primary-color);
    margin: 30px 0 15px 0;
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
}

.document-content h3 {
    font-size: 1.3rem;
    color: var(--primary-color);
    margin: 25px 0 10px 0;
}

.document-content p {
    margin-bottom: 15px;
    line-height: 1.7;
}

.document-content ul, .document-content ol {
    margin: 15px 0;
    padding-left: 30px;
}

.document-content li {
    margin-bottom: 8px;
}

.document-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

.document-content th, .document-content td {
    padding: 12px;
    border: 1px solid var(--border-color);
    text-align: left;
}

.document-content th {
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
}

.document-content code {
    background-color: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
}

.document-content pre {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 6px;
    overflow-x: auto;
    border: 1px solid var(--border-color);
}

.document-content pre code {
    background-color: transparent;
    padding: 0;
}

.document-content blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: 20px;
    margin-left: 0;
    color: var(--light-text);
    font-style: italic;
}

.footer {
    background-color: var(--card-bg);
    padding: 40px 0 20px;
    border-top: 1px solid var(--border-color);
    margin-top: 50px;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.footer-section h3 {
    font-size: 1.2rem;
    color: var(--primary-color);
    margin-bottom: 15px;
}

.footer-section ul {
    list-style: none;
    padding: 0;
}

.footer-section ul li {
    margin-bottom: 8px;
}

.footer-section ul li a {
    color: var(--light-text);
    text-decoration: none;
    transition: color 0.3s;
}

.footer-section ul li a:hover {
    color: var(--primary-color);
}

.copyright {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
    color: var(--light-text);
    font-size: 0.9rem;
}

.theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 8px;
}

.theme-toggle:hover {
    color: var(--primary-color);
}

.back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: var(--primary-color);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1000;
}

.back-to-top.visible {
    opacity: 1;
}

.back-to-top:hover {
    background-color: var(--secondary-color);
}

@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        gap: 15px;
    }

    .nav-links {
        flex-wrap: wrap;
        justify-content: center;
    }

    .document-grid {
        grid-template-columns: 1fr;
    }

    .document-content {
        padding: 25px;
    }
}

@media (max-width: 480px) {
    .legal-header h1 {
        font-size: 2rem;
    }

    .category-section h2 {
        font-size: 1.5rem;
    }

    .document-card h3 {
        font-size: 1.1rem;
    }
}

@media print {
    body {
        background-color: white;
        color: black;
    }

    .navbar, .footer, .theme-toggle, .back-to-top {
        display: none !important;
    }

    .document-content {
        box-shadow: none;
        border: none;
        padding: 0;
    }

    a {
        color: #0000EE;
        text-decoration: underline;
    }
}
EOF

echo "📝 Creating legal hub landing page..."
cat > "${PUBLIC_LEGAL_DIR}/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="RinaWarp Technologies LLC Legal Hub - Comprehensive legal documents including Terms of Service, Privacy Policy, and compliance information">
    <title>Legal Hub | RinaWarp Technologies LLC</title>
    <link rel="stylesheet" href="/legal/css/legal.css">
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const themeToggle = document.getElementById('theme-toggle');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

            document.documentElement.setAttribute('data-theme', currentTheme);
            updateThemeButton(currentTheme);

            themeToggle.addEventListener('click', function() {
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeButton(newTheme);
            });

            function updateThemeButton(theme) {
                const icon = theme === 'light' ? '🌙' : '☀️';
                const text = theme === 'light' ? 'Dark Mode' : 'Light Mode';
                themeToggle.innerHTML = `${icon} ${text}`;
            }

            const backToTop = document.getElementById('back-to-top');
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });

            backToTop.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    </script>
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
                    <button id="theme-toggle" class="theme-toggle">☀️ Light Mode</button>
                </div>
            </nav>
        </div>
    </header>

    <main class="main-content">
        <div class="container">
            <div class="legal-header">
                <h1>RinaWarp Legal Hub</h1>
                <p>Comprehensive legal documents and compliance information</p>
            </div>

            <div class="category-section" id="core-policies">
                <h2>Core Policies</h2>
                <div class="document-grid">
                    <div class="document-card">
                        <h3>Terms of Service</h3>
                        <p>Our comprehensive terms governing the use of all RinaWarp products and services.</p>
                        <a href="terms-of-service.html">Read Terms →</a>
                    </div>
                    <div class="document-card">
                        <h3>Privacy Policy</h3>
                        <p>How we collect, use, and protect your personal information.</p>
                        <a href="privacy-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>Refund Policy</h3>
                        <p>Our policies regarding refunds, cancellations, and billing disputes.</p>
                        <a href="refund-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>Cookie Policy</h3>
                        <p>Information about our use of cookies and tracking technologies.</p>
                        <a href="cookie-policy.html">Read Policy →</a>
                    </div>
                </div>
            </div>

            <div class="category-section" id="data-privacy">
                <h2>Data & Privacy</h2>
                <div class="document-grid">
                    <div class="document-card">
                        <h3>GDPR/CCPA Policy</h3>
                        <p>Our compliance with European and California privacy regulations.</p>
                        <a href="gdpr-ccpa-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>Data Processing Agreement</h3>
                        <p>Legal agreement governing how we process customer data.</p>
                        <a href="data-processing-agreement.html">Read Agreement →</a>
                    </div>
                    <div class="document-card">
                        <h3>Data Subject Request Policy</h3>
                        <p>How to exercise your data privacy rights with RinaWarp.</p>
                        <a href="data-subject-request-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>Accessibility Policy</h3>
                        <p>Our commitment to accessible technology and services.</p>
                        <a href="accessibility-policy.html">Read Policy →</a>
                    </div>
                </div>
            </div>

            <div class="category-section" id="ai-ethics">
                <h2>AI Ethics</h2>
                <div class="document-grid">
                    <div class="document-card">
                        <h3>AI Ethical Policy</h3>
                        <p>Our principles and guidelines for responsible AI development.</p>
                        <a href="ai-ethical-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>Acceptable Use Policy</h3>
                        <p>Rules and guidelines for appropriate use of our AI services.</p>
                        <a href="acceptable-use-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>AI Output Policy</h3>
                        <p>Guidelines for content generated by our AI systems.</p>
                        <a href="ai-output-policy.html">Read Policy →</a>
                    </div>
                </div>
            </div>

            <div class="category-section" id="security-compliance">
                <h2>Security & Compliance</h2>
                <div class="document-grid">
                    <div class="document-card">
                        <h3>Security Policy</h3>
                        <p>Our comprehensive approach to security and data protection.</p>
                        <a href="security-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>DMCA Policy</h3>
                        <p>Our copyright infringement policies and procedures.</p>
                        <a href="dmca-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>Vendor/Third-Party Policy</h3>
                        <p>How we work with third-party vendors and service providers.</p>
                        <a href="vendor-third-party-policy.html">Read Policy →</a>
                    </div>
                </div>
            </div>

            <div class="category-section" id="software-licensing">
                <h2>Software Licensing</h2>
                <div class="document-grid">
                    <div class="document-card">
                        <h3>Terminal Pro EULA</h3>
                        <p>End User License Agreement for Terminal Pro software.</p>
                        <a href="terminal-pro-eula.html">Read EULA →</a>
                    </div>
                    <div class="document-card">
                        <h3>AI Music Video Creator EULA</h3>
                        <p>End User License Agreement for our AI Music Video Creator.</p>
                        <a href="ai-music-video-creator-eula.html">Read EULA →</a>
                    </div>
                    <div class="document-card">
                        <h3>Commercial License Agreement</h3>
                        <p>Licensing terms for commercial use of our software.</p>
                        <a href="commercial-license-agreement.html">Read Agreement →</a>
                    </div>
                    <div class="document-card">
                        <h3>Subscription & Billing Agreement</h3>
                        <p>Terms governing our subscription services and billing.</p>
                        <a href="subscription-billing-agreement.html">Read Agreement →</a>
                    </div>
                </div>
            </div>

            <div class="category-section" id="customer-rights">
                <h2>Customer Rights</h2>
                <div class="document-grid">
                    <div class="document-card">
                        <h3>Payment & Refund Policy</h3>
                        <p>Detailed information about payments, refunds, and billing.</p>
                        <a href="payment-refund-policy.html">Read Policy →</a>
                    </div>
                    <div class="document-card">
                        <h3>Subscription Billing Policy</h3>
                        <p>Terms and conditions for our subscription services.</p>
                        <a href="subscription-billing-policy.html">Read Policy →</a>
                    </div>
                </div>
            </div>

            <div class="category-section" id="developer-policies">
                <h2>Developer Policies</h2>
                <div class="document-grid">
                    <div class="document-card">
                        <h3>Acceptable Use Policy</h3>
                        <p>Rules for developers using our APIs and services.</p>
                        <a href="acceptable-use-policy.html">Read Policy →</a>
                    </div>
                </div>
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
                        <li><a href="/legal/security-policy.html">Security Policy</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Compliance</h3>
                    <ul>
                        <li><a href="/legal/gdpr-ccpa-policy.html">GDPR/CCPA Policy</a></li>
                        <li><a href="/legal/ai-ethical-policy.html">AI Ethics</a></li>
                        <li><a href="/legal/dmca-policy.html">DMCA Policy</a></li>
                        <li><a href="/legal/data-processing-agreement.html">Data Processing</a></li>
                        <li><a href="/legal/accessibility-policy.html">Accessibility</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Licensing</h3>
                    <ul>
                        <li><a href="/legal/terminal-pro-eula.html">Terminal Pro EULA</a></li>
                        <li><a href="/legal/ai-music-video-creator-eula.html">AI MVC EULA</a></li>
                        <li><a href="/legal/commercial-license-agreement.html">Commercial License</a></li>
                        <li><a href="/legal/subscription-billing-agreement.html">Billing Agreement</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <ul>
                        <li>Support: support@rinawarptech.com</li>
                        <li>Legal: legal@rinawarptech.com</li>
                        <li>Privacy: privacy@rinawarptech.com</li>
                        <li>Business: karina@rinawarptech.com</li>
                    </ul>
                </div>
            </div>
            <div class="copyright">
                <p>© 2025 RinaWarp Technologies LLC. All rights reserved.</p>
                <p>Effective Date: [Auto-fill] | Last Updated: [Auto-fill]</p>
            </div>
        </div>
    </footer>

    <a href="#" id="back-to-top" class="back-to-top">↑</a>
</body>
</html>
EOF

echo "✅ Legal Hub build process completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - Created directory structure: $PUBLIC_LEGAL_DIR"
echo "   - Generated CSS styles: $PUBLIC_LEGAL_DIR/css/legal.css"
echo "   - Created landing page: $PUBLIC_LEGAL_DIR/index.html"
echo "   - Ready for markdown document conversion and deployment"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: ./scripts/tools/inject_global_footer.sh"
echo "   2. Run: ./scripts/tools/generate_stripe_urls.sh"
echo "   3. Deploy to Cloudflare Pages"
echo "   4. Validate with: ./scripts/tools/validation/validate_legal_hub_live.sh"
