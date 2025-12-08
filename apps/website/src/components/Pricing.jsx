import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Rocket, X, GraduationCap } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { getUser, getToken } from '../utils/auth';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [highlightedPlan, setHighlightedPlan] = useState('pro');
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
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individual developers',
      icon: Star,
      price: { monthly: 29.99, yearly: 287.9 },
      originalPrice: { monthly: 39.99, yearly: 359.88 },
      priceId: 'price_1S9aIvG2ToGP7Chn28SGZBhC', // Basic monthly
      features: [
        '500 AI Queries per day',
        '25 Macros',
        '200 Voice Commands per day',
        '3 Device Licenses',
        '20 Themes',
        'Email Support',
        'Basic Analytics',
      ],
      limitations: ['Limited AI requests per day', 'Basic themes only', 'Standard export formats'],
      cta: 'Start Starter Plan',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best for professional developers',
      icon: Zap,
      price: { monthly: 79.99, yearly: 767.9 },
      originalPrice: { monthly: 99.99, yearly: 959.88 },
      priceId: 'price_1S9aIwG2ToGP7ChnUCqmkFh4', // Professional monthly
      features: [
        '2,000 AI Queries per day',
        '100 Macros',
        '1,000 Voice Commands per day',
        '10 Device Licenses',
        'Unlimited Themes',
        'Priority Support',
        'Advanced Analytics',
      ],
      limitations: [],
      cta: 'Start Pro Plan',
      popular: true,
    },
    {
      id: 'terminal-pro-plus',
      name: 'Terminal Pro+',
      description: 'Ideal for teams and businesses',
      icon: Crown,
      price: { monthly: 149.99, yearly: 1439.9 },
      originalPrice: { monthly: 199.99, yearly: 1799.88 },
      priceId: 'price_1S9aIwG2ToGP7Chnt7ZNKEyV', // Business monthly
      features: [
        '10,000 AI Queries per day',
        '500 Macros',
        '5,000 Voice Commands per day',
        '50 Device Licenses',
        'Unlimited Themes',
        'Dedicated Support',
        'Team Management',
        'Advanced Analytics',
      ],
      limitations: [],
      cta: 'Start Terminal Pro+',
      popular: false,
    },
  ];

  const handlePlanSelect = async (planId) => {
    // Track pricing conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'plan_selected', {
        event_category: 'conversion',
        event_label: planId,
        value: planId,
      });
    }

    // Check if user is authenticated
    if (!user) {
      // Redirect to login
      navigate('/login');
      return;
    }

    setIsLoading(true);

    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) return;

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

  const getSavings = (plan) => {
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyTotal = plan.price.yearly;
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Start free and upgrade as you grow. All plans include our core AI features with
            different usage limits.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-mermid-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
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
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
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

                  <p className="text-slate-600 mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-slate-900">
                        $
                        {billingCycle === 'monthly'
                          ? plan.price.monthly
                          : (plan.price.yearly / 12).toFixed(2)}
                      </span>
                      <span className="text-slate-600">
                        /{billingCycle === 'monthly' ? 'mo' : 'mo'}
                      </span>
                    </div>

                    {billingCycle === 'yearly' && (
                      <div className="text-center mt-2">
                        <span className="text-slate-500 line-through text-sm">
                          ${(plan.originalPrice.yearly / 12).toFixed(2)}/mo
                        </span>
                        <span className="text-green-600 text-sm font-medium ml-2">
                          Save $${((plan.originalPrice.yearly - plan.price.yearly) / 12).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {billingCycle === 'monthly' && (
                      <div className="text-center mt-2">
                        <span className="text-slate-500 line-through text-sm">
                          ${plan.originalPrice.monthly}/mo
                        </span>
                        <span className="text-green-600 text-sm font-medium ml-2">
                          Save ${plan.originalPrice.monthly - plan.price.monthly}/mo
                        </span>
                      </div>
                    )}
                  </div>
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

                  {plan.limitations.map((limitation, limitationIndex) => (
                    <div key={limitationIndex} className="flex items-start gap-3 opacity-60">
                      <X className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 px-6 py-3 rounded-full border border-green-200">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              30-day money-back guarantee • Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
