import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Rocket, X, GraduationCap, Download } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { getUser, getToken } from '../utils/auth';

const Pricing = () => {
  const [highlightedPlan, setHighlightedPlan] = useState('starter');
  const [stripePromise, setStripePromise] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Stripe
    const initStripe = async () => {
      const stripe = await loadStripe(
        'pk_live_51RaxSiG2ToGP7ChnER91fDiWR58IxAOLrCsj2qUlyHLwCazYLsuvDNH5EKPFIJ5onGTVlBvfvs8W8eKrNFaiCoAJ00u4j0qtki',
      );
      setStripePromise(stripe);
    };
    initStripe();

    // Check for existing user
    const userData = getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Explore RinaWarp and your local terminal workflow — no card required.',
      icon: Download,
      price: { monthly: 0, yearly: 0 },
      originalPrice: { monthly: 0, yearly: 0 },
      priceId: null, // Free plan doesn't need checkout
      features: [
        'Local terminal sandbox (daily limits)',
        'Daily command quota (anti-abuse)',
        'Safety-restricted execution mode',
        'No AI agent features',
        'No voice',
        'No premium modules',
      ],
      limitations: [],
      cta: 'Download Free',
      popular: false,
      action: 'download',
    },
    {
      id: 'basic',
      name: 'Basic',
      description: 'For developers who want helpful guidance without full automation.',
      icon: Star,
      price: { monthly: 9.99, yearly: 99.9 },
      originalPrice: { monthly: 19.99, yearly: 199.88 },
      priceId: 'price_basic_monthly', // TODO: Create Stripe price
      features: [
        'Unlimited local terminal usage',
        'Entry-level Rina Agent assistance',
        'Light productivity helpers',
        'Excludes advanced automations & premium modules',
        'No real-time voice',
      ],
      limitations: [],
      cta: 'Choose Basic',
      popular: false,
      action: 'checkout',
      fineprint: 'Most users land here after a week of daily use.',
    },
    {
      id: 'starter',
      name: 'Starter',
      description: "Unlock Rina's core agent workflow for daily professional terminal work.",
      icon: Zap,
      price: { monthly: 29, yearly: 290 },
      originalPrice: { monthly: 39, yearly: 390 },
      priceId: 'price_starter_monthly', // TODO: Create Stripe price
      features: [
        'Advanced agent suggestions & higher limits',
        'Automation basics (repeatable workflows)',
        'Expanded tooling set',
        'Upgrade/downgrade anytime',
      ],
      limitations: [],
      cta: 'Choose Starter',
      popular: true,
      action: 'checkout',
      badge: 'Recommended',
      fineprint: 'Best for consistent daily usage.',
    },
    {
      id: 'creator',
      name: 'Creator',
      description: 'For builders who live in the terminal and want faster iteration.',
      icon: Crown,
      price: { monthly: 69, yearly: 690 },
      originalPrice: { monthly: 89, yearly: 890 },
      priceId: 'price_creator_monthly', // TODO: Create Stripe price
      features: [
        'Everything in Starter',
        'Voice-enabled command execution',
        'Priority agent execution & higher limits',
        'Expanded modules & integrations',
      ],
      limitations: [],
      cta: 'Choose Creator',
      popular: false,
      action: 'checkout',
      badge: 'Best value for heavy users',
      fineprint: 'Best value for heavy users.',
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For professionals who want near-zero limits and priority handling.',
      icon: Rocket,
      price: { monthly: 99, yearly: 990 },
      originalPrice: { monthly: 129, yearly: 1290 },
      priceId: 'price_pro_monthly', // TODO: Create Stripe price
      features: [
        'Everything in Creator',
        'Unlimited agent usage (fair-use protected)',
        'All modules included',
        'Priority support',
      ],
      limitations: [],
      cta: 'Choose Pro',
      popular: false,
      action: 'checkout',
      badge: 'Power users',
      fineprint: 'Designed for heavy daily workflows.',
    },
  ];

  const lifetimePlans = [
    {
      id: 'founder-lifetime',
      name: 'Founder Lifetime',
      description: 'Early supporter tier. Limited to 200 total.',
      price: 699,
      priceId: 'price_founder_lifetime', // TODO: Create Stripe price
      features: [
        'Lifetime license (one-time)',
        'Priority onboarding email',
        'Early access to major releases',
      ],
      cta: 'Get Founder Lifetime',
      limit: 'Limited to 200',
      fineprint: 'When the 200 sell out, this tier is gone.',
    },
    {
      id: 'pioneer-lifetime',
      name: 'Pioneer Lifetime',
      description: 'Second wave. Limited to 300 total.',
      price: 800,
      priceId: 'price_pioneer_lifetime', // TODO: Create Stripe price
      features: [
        'Lifetime license (one-time)',
        'Priority onboarding email',
        'Early access to major releases',
      ],
      cta: 'Get Pioneer Lifetime',
      limit: 'Limited to 300',
      fineprint: 'When the 300 sell out, this tier is gone.',
    },
    {
      id: 'evergreen-lifetime',
      name: 'Evergreen Lifetime',
      description: 'Always available after early tiers sell out.',
      price: 999,
      priceId: 'price_evergreen_lifetime', // TODO: Create Stripe price
      features: [
        'Lifetime license (one-time)',
        'Standard onboarding',
        'Access to local-first features',
      ],
      cta: 'Get Evergreen Lifetime',
      fineprint: 'Best for people who want ownership long-term.',
    },
  ];

  const handlePlanSelect = async (planId) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    // Track pricing conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'plan_selected', {
        event_category: 'conversion',
        event_label: planId,
        value: plan.price.monthly,
      });
    }

    // Handle free plan
    if (plan.action === 'download') {
      window.location.href = '/download';
      return;
    }

    // Check if user is authenticated for paid plans
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
          customerEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout
      if (stripePromise) {
        await stripePromise.redirectToCheckout({ sessionId });
      } else {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLifetimeSelect = async (planId) => {
    const plan = lifetimePlans.find((p) => p.id === planId);
    if (!plan) return;

    // Track pricing conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'plan_selected', {
        event_category: 'conversion',
        event_label: planId,
        value: plan.price,
      });
    }

    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session for lifetime purchase
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
          customerEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      // Redirect to Stripe Checkout
      if (stripePromise) {
        await stripePromise.redirectToCheckout({ sessionId });
      } else {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSavings = (plan) => {
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyTotal = plan.price.yearly;
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
  };

  return (
    <section className="rw-pricing py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Simple, transparent pricing.
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
            Start free. Upgrade only when Rina saves you real time.
            <span className="block text-sm text-slate-500 mt-2">
              No ads. No telemetry. No data resale.
            </span>
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <span className="rw-badge bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
              Local-first
            </span>
            <span className="rw-badge bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
              Offline-capable
            </span>
            <span className="rw-badge bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
              Stripe checkout
            </span>
            <span className="rw-badge bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
              Cancel anytime
            </span>
          </div>
        </motion.div>

        {/* Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHighlightedPlan(plan.id)}
              className={`relative ${plan.popular ? 'scale-105' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div
                className={`card h-full ${
                  plan.popular ? 'border-2 border-mermid-500 shadow-xl' : 'border border-slate-200'
                }`}
              >
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex p-3 rounded-lg mb-4 ${
                      plan.popular ? 'bg-mermid-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <plan.icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-slate-900">
                        ${plan.price.monthly}
                      </span>
                      <span className="text-slate-600">/ month</span>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4">{plan.description}</p>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all mb-6 ${
                    plan.popular ? 'btn-primary' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Processing...' : plan.cta}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.fineprint && (
                  <p className="text-xs text-slate-500 text-center mt-4">{plan.fineprint}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lifetime Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Lifetime licenses (one-time purchase)
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              For long-term users who prefer owning software instead of paying monthly.
              <strong className="text-slate-900"> Early tiers are limited</strong>.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-2">What "lifetime" means:</h3>
            <p className="text-slate-700 mb-2">
              Lifetime licenses include all features available at time of purchase. Future cloud
              services may require a separate plan.
            </p>
            <p className="text-sm text-slate-600">
              Lifetime licenses help fund long-term development — no ads, no telemetry, no VC
              pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lifetimePlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card border-2 border-slate-200"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-600 ml-2">one-time</span>
                  </div>
                  <p className="text-slate-600 mb-2">{plan.description}</p>
                  {plan.limit && <p className="text-sm font-medium text-slate-800">{plan.limit}</p>}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleLifetimeSelect(plan.id)}
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-lg font-semibold btn-primary transition-all mb-4"
                >
                  {isLoading ? 'Processing...' : plan.cta}
                </button>

                {plan.fineprint && (
                  <p className="text-xs text-slate-500 text-center">{plan.fineprint}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">FAQ</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Do I have to start with a paid plan?
              </h3>
              <p className="text-slate-700">
                No. Start on Free and upgrade when the agent saves you enough time to justify it.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Is my data sent anywhere?</h3>
              <p className="text-slate-700">
                Core features are local-first. If you enable cloud features, only what's required
                for that request is transmitted.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Can I cancel or downgrade?</h3>
              <p className="text-slate-700">
                Yes. Cancel anytime. Plan changes take effect at the next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">What about refunds?</h3>
              <p className="text-slate-700">
                We offer a straightforward refund policy. If something isn't working as expected,
                contact support and we'll help.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Why are lifetime tiers limited?</h3>
              <p className="text-slate-700">
                They're early-supporter tiers designed to fund development without ads or telemetry.
                Once each tier sells out, it closes permanently.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to try RinaWarp?</h2>
          <p className="text-slate-600 mb-6">Download free, then upgrade when you're ready.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/download" className="btn-primary px-8 py-3 rounded-lg font-semibold">
              Download for Windows
            </a>
            <a
              href="/docs"
              className="bg-slate-100 text-slate-900 hover:bg-slate-200 px-8 py-3 rounded-lg font-semibold"
            >
              Read the Docs
            </a>
          </div>
          <p className="text-sm text-slate-500 mt-4">Payments are processed securely by Stripe.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
