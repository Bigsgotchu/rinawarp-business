import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleCheckout = (plan) => {
    setSelectedPlan(plan);
    // Here you would integrate with your actual checkout system
    alert(`Starting checkout for ${plan} plan. This would integrate with Stripe.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mermid-50">
      <Navigation />
      
      <main className="pt-20">
        {/* Header */}
        <section className="py-16 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, transparent pricing.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start free. Upgrade only when Rina saves you real time.
              <span className="block text-sm text-gray-500 mt-2">No ads. No telemetry. No data resale.</span>
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">Local-first</span>
              <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">Offline-capable</span>
              <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">Stripe checkout</span>
              <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">Cancel anytime</span>
            </div>
          </div>
        </section>

        {/* Monthly Plans */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Monthly Plans</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    $0<span className="text-lg text-gray-500"> forever</span>
                  </div>
                  <p className="text-gray-600">
                    Explore RinaWarp and your local terminal workflow — no card required.
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Local terminal sandbox (daily limits)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Daily command quota (anti-abuse)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Safety-restricted execution mode
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-3 mt-1">−</span>
                    No AI agent features
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-3 mt-1">−</span>
                    No voice
                  </li>
                </ul>
                
                <Link
                  to="/download"
                  className="block w-full bg-gray-100 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Download
                </Link>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Free is designed to be useful — not frustrating.
                </p>
              </div>

              {/* Basic Plan */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    $9.99<span className="text-lg text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600">
                    For developers who want helpful guidance without full automation.
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Unlimited local terminal usage
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Entry-level Rina Agent assistance
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Light productivity helpers
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-3 mt-1">−</span>
                    Excludes advanced automations
                  </li>
                </ul>
                
                <button
                  onClick={() => handleCheckout('basic')}
                  className="block w-full bg-mermid-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-mermid-700 transition-colors"
                >
                  Choose Basic
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Most users land here after a week of daily use.
                </p>
              </div>

              {/* Starter Plan - Featured */}
              <div className="bg-white border-2 border-mermid-600 rounded-xl p-8 relative transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Recommended
                  </span>
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    $29<span className="text-lg text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600">
                    Unlock Rina's core agent workflow for daily professional terminal work.
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Advanced agent suggestions & higher limits
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Automation basics (repeatable workflows)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Expanded tooling set
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    Upgrade/downgrade anytime
                  </li>
                </ul>
                
                <button
                  onClick={() => handleCheckout('starter')}
                  className="block w-full bg-gradient-to-r from-mermid-600 to-mermid-700 text-white text-center py-3 rounded-lg font-semibold hover:from-mermid-700 hover:to-mermid-800 transition-all duration-200"
                >
                  Choose Starter
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Best for consistent daily usage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lifetime Plans */}
        <section className="py-16 px-6 bg-mermid-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Lifetime licenses</h2>
              <p className="text-lg text-gray-600 mb-6">
                For long-term users who prefer owning software instead of paying monthly.
                <strong> Early tiers are limited</strong>.
              </p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-left">
                <p className="text-sm text-gray-600">
                  <strong>What "lifetime" means:</strong> Lifetime licenses include all features available at time of purchase. 
                  Future cloud services may require a separate plan.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Lifetime licenses help fund long-term development — no ads, no telemetry, no VC pressure.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Founder Lifetime */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Founder Lifetime</h3>
                  <div className="text-3xl font-bold text-mermid-600 mb-2">
                    $699<span className="text-sm text-gray-500"> one-time</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Early supporter tier. Limited to <strong>200</strong> total.
                  </p>
                </div>
                
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Lifetime license (one-time)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Priority onboarding email
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Early access to major releases
                  </li>
                </ul>
                
                <button
                  onClick={() => handleCheckout('founder_lifetime')}
                  className="w-full bg-mermid-600 text-white py-2 rounded-lg font-semibold hover:bg-mermid-700 transition-colors"
                >
                  Get Founder Lifetime
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  When the 200 sell out, this tier is gone.
                </p>
              </div>

              {/* Pioneer Lifetime */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pioneer Lifetime</h3>
                  <div className="text-3xl font-bold text-mermid-600 mb-2">
                    $800<span className="text-sm text-gray-500"> one-time</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Second wave. Limited to <strong>300</strong> total.
                  </p>
                </div>
                
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Lifetime license (one-time)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Priority onboarding email
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Early access to major releases
                  </li>
                </ul>
                
                <button
                  onClick={() => handleCheckout('pioneer_lifetime')}
                  className="w-full bg-mermid-600 text-white py-2 rounded-lg font-semibold hover:bg-mermid-700 transition-colors"
                >
                  Get Pioneer Lifetime
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  When the 300 sell out, this tier is gone.
                </p>
              </div>

              {/* Evergreen Lifetime */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Evergreen Lifetime</h3>
                  <div className="text-3xl font-bold text-mermid-600 mb-2">
                    $999<span className="text-sm text-gray-500"> one-time</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Always available after early tiers sell out.
                  </p>
                </div>
                
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Lifetime license (one-time)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Standard onboarding
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    Access to local-first features
                  </li>
                </ul>
                
                <button
                  onClick={() => handleCheckout('evergreen_lifetime')}
                  className="w-full bg-mermid-600 text-white py-2 rounded-lg font-semibold hover:bg-mermid-700 transition-colors"
                >
                  Get Evergreen Lifetime
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Best for people who want ownership long-term.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">FAQ</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg">
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                    <span className="font-semibold text-gray-900">Do I have to start with a paid plan?</span>
                    <span className="ml-6 flex-shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    No. Start on Free and upgrade when the agent saves you enough time to justify it.
                  </div>
                </details>
              </div>

              <div className="border border-gray-200 rounded-lg">
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                    <span className="font-semibold text-gray-900">Is my data sent anywhere?</span>
                    <span className="ml-6 flex-shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    Core features are local-first. If you enable cloud features, only what's required for that request is transmitted.
                  </div>
                </details>
              </div>

              <div className="border border-gray-200 rounded-lg">
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                    <span className="font-semibold text-gray-900">Can I cancel or downgrade?</span>
                    <span className="ml-6 flex-shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    Yes. Cancel anytime. Plan changes take effect at the next billing cycle.
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 px-6 bg-mermid-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to try RinaWarp?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Download free, then upgrade when you're ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/download"
                className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-mermid-700 hover:to-mermid-800 transition-all duration-200"
              >
                Download for Windows
              </Link>
              <Link
                to="/"
                className="bg-white text-mermid-600 border-2 border-mermid-600 px-8 py-3 rounded-lg font-semibold hover:bg-mermid-50 transition-all duration-200"
              >
                Read the Docs
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Payments are processed securely by Stripe.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PricingPage;