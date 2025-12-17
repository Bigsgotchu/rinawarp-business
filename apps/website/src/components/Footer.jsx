import React from 'react';
import { Terminal, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Downloads', href: '#downloads' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Testimonials', href: '#testimonials' },
    ],
    support: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Community', href: '/community' },
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    developers: [
      { name: 'GitHub', href: 'https://github.com/rinawarp/terminal-pro' },
      { name: 'API Docs', href: '/api' },
      { name: 'Changelog', href: '/changelog' },
      { name: 'Status', href: '/status' },
    ],
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="card"
      style={{
        margin: '48px auto',
        maxWidth: '1100px',
        background: 'var(--rw-surface)',
        border: '1px solid #222833',
        borderRadius: 'var(--rw-radius)',
        boxShadow: 'var(--rw-shadow)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: '18px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        <section>
          <h4
            className="header-bar"
            style={{
              fontSize: '18px',
              background:
                'linear-gradient(90deg, var(--rw-accent) 0%, var(--rw-coral) 40%, var(--rw-babyblue) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RinaWarp
          </h4>
          <p>AI tools for professionals. Built with privacy and clarity.</p>
          <p>
            <strong>Support:</strong>{' '}
            <a href="mailto:support@rinawarptech.com">support@rinawarptech.com</a>
          </p>
        </section>
        <section>
          <h4 style={{ color: 'var(--rw-text)', marginBottom: '12px' }}>Company</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <a href="/about" style={{ color: 'var(--rw-link)' }}>
                About
              </a>
            </li>
            <li>
              <a href="/contact" style={{ color: 'var(--rw-link)' }}>
                Contact
              </a>
            </li>
            <li>
              <a href="/status" style={{ color: 'var(--rw-link)' }}>
                Status
              </a>
            </li>
          </ul>
        </section>
        <section>
          <h4 style={{ color: 'var(--rw-text)', marginBottom: '12px' }}>Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <a href="/terms" style={{ color: 'var(--rw-link)' }}>
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/privacy" style={{ color: 'var(--rw-link)' }}>
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/refunds" style={{ color: 'var(--rw-link)' }}>
                Refund & Cancellation Policy
              </a>
            </li>
            <li>
              <a href="/acceptable-use" style={{ color: 'var(--rw-link)' }}>
                Acceptable Use
              </a>
            </li>
            <li>
              <a href="/cookies" style={{ color: 'var(--rw-link)' }}>
                Cookie Policy
              </a>
            </li>
            <li>
              <a href="/accessibility" style={{ color: 'var(--rw-link)' }}>
                Accessibility
              </a>
            </li>
          </ul>
        </section>
      </div>
      <div style={{ marginTop: '18px', fontSize: '12px', color: 'var(--rw-muted)' }}>
        © <span id="y"></span> RinaWarp Technologies, LLC. All rights reserved. &nbsp; • &nbsp; 123
        Example Ave, Suite 100, Denver, CO 80202, USA
      </div>
      <script>document.getElementById('y').textContent=new Date().getFullYear()</script>
    </footer>
  );
};

export default Footer;
