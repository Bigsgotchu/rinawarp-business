import { useState, useEffect } from 'react';
import './App.css';
import Testimonials from './components/Testimonials';
import FeedbackForm from './components/FeedbackForm';

// Import GA4 tracking functions
import {
  trackPageView,
  trackPlanSelection,
  trackCheckoutStart,
  trackPurchase,
  trackDownload,
  trackEngagement,
  trackPricingPageView,
  trackEarlyBirdPurchase,
  trackProPlanPurchase,
  trackTeamPlanPurchase,
  trackFreeTrialSignup,
} from '../analytics/GoogleAnalytics';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('personal');
  const [email, setEmail] = useState('');

  // Track page view on component mount
  useEffect(() => {
    trackPageView(window.location.pathname, document.title);
  }, []);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic AI terminal',
        '2 themes included',
        'Community support',
        'Limited voice commands',
      ],
      cta: 'Download Free',
      popular: false,
      isFree: true,
    },
    {
      name: 'Professional',
      price: '$29.99',
      period: 'month',
      features: [
        '🤖 Advanced AI with predictive completion',
        '🌊 Enhanced Mermaid theme with animations',
        '⚡ Professional XTerm integration',
        '🎨 Tailwind-powered responsive UI',
        '🎤 ElevenLabs voice synthesis',
        '🧠 Smart memory & learning system',
        '📊 Real-time system monitoring',
        '💻 Cross-platform desktop app',
        '🔒 Secure & private',
        '🚀 Regular updates',
      ],
      cta: 'Subscribe Now',
      popular: true,
      priceId: 'price_professional_2999',
    },
    {
      name: 'Lifetime',
      price: '$299.99',
      period: 'one-time',
      features: [
        'Everything in Professional',
        '🎯 Lifetime access to all features',
        '🎨 Exclusive premium themes',
        '💬 Direct developer support',
        '☁️ Future cloud sync features',
        '🔧 Advanced customization options',
        '📈 Performance analytics',
        '🎁 Best value!',
      ],
      cta: 'Buy Lifetime',
      popular: false,
      limited: true,
      priceId: 'price_lifetime_29999',
    },
  ];

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Intelligence',
      description:
        'Advanced AI integration with predictive command completion, smart suggestions, and contextual explanations powered by OpenAI and Groq.',
      tags: ['Predictive Completion', 'Command Explanation', 'Smart Learning'],
    },
    {
      icon: '🌊',
      title: 'Enhanced Mermaid Theme',
      description:
        'Stunning underwater theme with floating bubbles, glowing effects, shimmer animations, and gradient backgrounds.',
      tags: ['Animated Effects', 'Glowing UI', 'Ocean Vibes'],
    },
    {
      icon: '⚡',
      title: 'Advanced Terminal',
      description:
        'Professional XTerm integration with keyboard shortcuts, command history, tab completion, and cross-platform support.',
      tags: ['XTerm.js', 'Keyboard Shortcuts', 'Command History'],
    },
    {
      icon: '🎨',
      title: 'Tailwind-Powered UI',
      description:
        'Modern, responsive design with utility-first CSS, custom components, and consistent RinaWarp branding.',
      tags: ['Responsive Design', 'Custom Components', 'Modern UI'],
    },
    {
      icon: '🎤',
      title: 'Voice & Memory',
      description:
        'ElevenLabs TTS integration with persistent memory system that learns and adapts to your usage patterns.',
      tags: ['Voice Synthesis', 'Smart Memory', 'Context Learning'],
    },
    {
      icon: '📊',
      title: 'Real-Time Monitoring',
      description:
        'Live system stats, performance monitoring, and beautiful dashboards with animated visualizations.',
      tags: ['Live Stats', 'Performance', 'Visualizations'],
    },
    {
      icon: '💳',
      title: 'Payment & Licensing',
      description:
        'Stripe integration for secure payments, license management, and premium feature access.',
      tags: ['Stripe Payments', 'License Keys', 'Premium Features'],
    },
    {
      icon: '☁️',
      title: 'Cloud Ready',
      description:
        'AWS deployment ready with S3, CloudFront, Route 53, and production-grade infrastructure.',
      tags: ['AWS Deployed', 'CDN', 'Production Ready'],
    },
  ];

  const handleCheckout = async (planName) => {
    // Handle free download
    if (planName === 'Free') {
      trackDownload('free', 'free');
      // Scroll to download section
      document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Email is now optional - we'll use a placeholder if not provided
    const customerEmail = email || 'customer@rinawarptech.com';

    // Find the plan to get priceId
    const plan = plans.find((p) => p.name === planName);
    if (!plan || !plan.priceId) {
      alert('Invalid plan selected');
      return;
    }

    // Track checkout start
    const price = parseFloat(plan.price.replace('$', ''));
    trackCheckoutStart(planName, price);

    try {
      const response = await fetch('https://api.rinawarptech.com/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          email: customerEmail,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/pricing?cancelled=true`,
        }),
      });

      const { url } = await response.json();
      if (url) {
        // Track successful checkout initiation
        trackEngagement('checkout_initiated', planName);
        window.location.href = url;
      } else {
        alert('Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🧜‍♀️</span>
            <span className="logo-text">RinaWarp Terminal Pro</span>
          </div>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
            <a href="#download" className="nav-link">
              Download
            </a>
            <a href="#feedback" className="nav-link">
              Feedback
            </a>
            <button className="nav-cta">Get Started</button>
          </div>
          <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              The Most Advanced AI Terminal
              <span className="hero-subtitle">Ever Built</span>
            </h1>
            <p className="hero-description">
              Experience the future of terminal computing with AI-powered intelligence, stunning
              visual themes, and professional-grade features that make you more productive than ever
              before.
            </p>
            <div className="hero-badges">
              <span className="badge">🤖 AI-Powered</span>
              <span className="badge">🌊 Animated Themes</span>
              <span className="badge">⚡ Lightning Fast</span>
              <span className="badge">💻 Cross-Platform</span>
            </div>
            <div className="hero-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  trackEngagement('cta_clicked', 'get_rinawarp_pro');
                  document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get RinaWarp Pro
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  trackEngagement('cta_clicked', 'explore_features');
                  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Features
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="terminal-preview">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="terminal-title">RinaWarp Terminal Pro</span>
              </div>
              <div className="terminal-body">
                <div className="terminal-line">
                  <span className="prompt">$</span>
                  <span className="command">git status</span>
                </div>
                <div className="terminal-line ai-suggestion">
                  <span className="ai-icon">🤖</span>
                  <span className="suggestion">
                    Suggested: git add . && git commit -m "feat: add new feature"
                  </span>
                </div>
                <div className="terminal-line">
                  <span className="prompt">$</span>
                  <span className="command">!explain ls -la</span>
                </div>
                <div className="terminal-line explanation">
                  <span className="explanation-text">
                    📖 Lists all files with detailed information including permissions, size, and
                    date
                  </span>
                </div>
                <div className="terminal-line">
                  <span className="prompt">$</span>
                  <span className="cursor">_</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Advanced Features That Empower You</h2>
          <p className="section-subtitle">
            RinaWarp Terminal Pro comes packed with cutting-edge features that transform your
            terminal experience.
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-tags">
                  {feature.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo">
        <div className="container">
          <h2 className="section-title">See It In Action</h2>
          <div className="demo-content">
            <div className="demo-features">
              <div className="demo-feature">
                <div className="demo-icon">🤖</div>
                <h3>AI Command Suggestions</h3>
                <p>
                  Type 3+ characters and watch AI predict your next command with confidence scoring.
                </p>
              </div>
              <div className="demo-feature">
                <div className="demo-icon">🌊</div>
                <h3>Animated Themes</h3>
                <p>Beautiful underwater themes with floating bubbles and glowing effects.</p>
              </div>
              <div className="demo-feature">
                <div className="demo-icon">⚡</div>
                <h3>Professional Terminal</h3>
                <p>Full XTerm integration with keyboard shortcuts and command history.</p>
              </div>
            </div>
            <div className="demo-video">
              <div className="video-placeholder">
                <div className="play-button">▶</div>
                <p>Watch Demo Video</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="section-subtitle">
            Get started with our free version or unlock the full power of RinaWarp Pro.
          </p>

          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.limited ? 'limited' : ''}`}
                onClick={() => {
                  setSelectedPlan(plan.name.toLowerCase());
                  trackPlanSelection(plan.name.toLowerCase(), plan.price);
                }}
              >
                {plan.limited && <div className="limited-badge">Limited Time!</div>}
                {plan.popular && <div className="popular-badge">Most Popular</div>}

                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">/{plan.period}</span>
                  </div>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="feature-item">
                      <span className="check">✓</span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`plan-button ${plan.popular ? 'primary' : 'secondary'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.isFree) {
                      // For free plan, scroll to download section
                      document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
                      trackDownload('free', 'free');
                    } else {
                      handleCheckout(plan.name);
                    }
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Email Input - Now Optional */}
          <div className="email-section">
            <h3>Ready to Get Started?</h3>
            <p>Enter your email to receive your license key after purchase (optional):</p>
            <div className="email-input-group">
              <input
                type="email"
                id="email-input"
                name="email"
                placeholder="Enter your email address (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
              />
              <button className="email-button" onClick={() => handleCheckout(selectedPlan)}>
                Continue to Checkout
              </button>
            </div>
            <p className="email-note">
              💡 <strong>Pro tip:</strong> Adding your email ensures you receive your license key
              immediately after purchase!
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Download Section */}
      <section id="download" className="download">
        <div className="container">
          <h2 className="section-title">Download RinaWarp Terminal Pro</h2>
          <p className="section-subtitle">
            Available for all major platforms. Download and start using immediately.
          </p>
          <div className="download-buttons">
            <a
              href="https://rinawarptech.com/downloads/macos/RinaWarp Terminal Pro-1.0.0.dmg"
              className="download-btn mac"
              onClick={() => trackDownload('macos', 'free')}
              download
            >
              <span className="download-icon">🍎</span>
              <div className="download-info">
                <span className="download-title">macOS</span>
                <span className="download-subtitle">Intel & Apple Silicon</span>
              </div>
            </a>
            <a
              href="https://rinawarptech.com/downloads/windows/RinaWarp-Terminal-Pro-Windows-1.0.0.exe"
              className="download-btn windows"
              onClick={() => trackDownload('windows', 'free')}
              download
            >
              <span className="download-icon">🪟</span>
              <div className="download-info">
                <span className="download-title">Windows</span>
                <span className="download-subtitle">Windows 10 & 11</span>
              </div>
            </a>
            <a
              href="https://rinawarptech.com/downloads/linux/RinaWarp-Terminal-Pro-Linux-1.0.0.AppImage"
              className="download-btn linux"
              onClick={() => trackDownload('linux', 'free')}
              download
            >
              <span className="download-icon">🐧</span>
              <div className="download-info">
                <span className="download-title">Linux</span>
                <span className="download-subtitle">AppImage & DEB</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="feedback">
        <div className="container">
          <div className="feedback-content">
            <div className="feedback-info">
              <h2>Share Your Experience</h2>
              <p>
                Help others discover RinaWarp by sharing your feedback. Your testimonials help us
                improve and grow our community.
              </p>
            </div>
            <FeedbackForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-icon">🧜‍♀️</span>
              <span className="logo-text">RinaWarp Terminal Pro</span>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#download">Download</a>
              <a href="#">Support</a>
              <a href="#">Privacy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 RinaWarp Technologies, LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
