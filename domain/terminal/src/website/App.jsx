import LandingPage from '@shared/templates/LandingPage.jsx';

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
      product: 'free',
      interval: null,
    },
    {
      name: 'Creator',
      price: '$19',
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
      product: 'creator',
      interval: 'month',
    },
    {
      name: 'Pro Studio',
      price: '$39',
      period: 'month',
      features: [
        'Everything in Creator',
        '🎯 Enhanced features for professionals',
        '🎨 Exclusive premium themes',
        '💬 Priority support',
        '☁️ Cloud sync features',
        '🔧 Advanced customization options',
        '📈 Performance analytics',
        '🎁 Best for professionals!',
      ],
      cta: 'Subscribe Now',
      popular: false,
      product: 'proStudio',
      interval: 'month',
    },
    {
      name: 'Studio',
      price: '$99',
      period: 'month',
      features: [
        'Everything in Pro Studio',
        '🎯 Team collaboration features',
        '🎨 Custom branding options',
        '💬 Direct developer support',
        '☁️ Advanced cloud features',
        '🔧 Enterprise customization',
        '📈 Advanced analytics',
        '🎁 Perfect for teams!',
      ],
      cta: 'Subscribe Now',
      popular: false,
      product: 'studio',
      interval: 'month',
    },
    {
      name: 'Enterprise',
      price: '$249',
      period: 'month',
      features: [
        'Everything in Studio',
        '🎯 API access and cloud scaling',
        '🎨 White-label options',
        '💬 Dedicated support',
        '☁️ Enterprise cloud features',
        '🔧 Custom integrations',
        '📈 Enterprise analytics',
        '🎁 Built for scale!',
      ],
      cta: 'Subscribe Now',
      popular: false,
      product: 'enterprise',
      interval: 'month',
    },
    {
      name: 'Founder Access',
      price: '$799',
      period: 'one-time',
      features: [
        'Everything in Enterprise',
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
      product: 'founderAccess',
      interval: null,
    },
    {
      name: 'Lifetime Local License',
      price: '$499',
      period: 'one-time',
      features: [
        'Everything in Creator',
        '🎯 Lifetime access to terminal features',
        '🎨 Premium themes',
        '💬 Community support',
        '🔧 Local license only',
        '📈 Performance analytics',
        '🎁 Great for personal use!',
      ],
      cta: 'Buy Lifetime',
      popular: false,
      product: 'lifetimeLocal',
      interval: null,
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
      document
        .getElementById('download')
        .scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Email is now optional - we'll use a placeholder if not provided
    const customerEmail = email || 'customer@rinawarptech.com';

    // Find the plan to get product and interval
    const plan = plans.find((p) => p.name === planName);
    if (!plan || !plan.product) {
      alert('Invalid plan selected');
      return;
    }

    // Track checkout start
    const price = parseFloat(plan.price.replace('$', ''));
    trackCheckoutStart(planName, price);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: plan.product,
          interval: plan.interval,
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

  return <LandingPage />;
}

export default App;
