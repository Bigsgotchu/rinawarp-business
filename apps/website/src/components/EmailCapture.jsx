import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Check, Sparkles, Gift } from 'lucide-react';

const EmailCapture = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Track email capture conversion
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'email_capture', {
          event_category: 'conversion',
          event_label: 'newsletter_signup',
          value: 'newsletter',
        });
      }

      // Simulate API call to email service
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would integrate with your email service (Mailchimp, ConvertKit, etc.)
      console.log('Email captured:', email);

      setIsSubmitted(true);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              // Email capture form
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-mermid-600 to-mermid-700 p-6 text-white relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Get Your Free AI Toolkit!</h3>
                      <p className="text-mermid-100">Limited time offer</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-mermid-600" />
                    <span className="font-medium text-slate-900">What you'll get:</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">AI Command Cheat Sheet (PDF)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Voice Command Templates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Productivity Tips Newsletter</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Early Access to New Features</span>
                    </li>
                  </ul>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-mermid-500 focus:border-mermid-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Get My Free Toolkit'
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-slate-500 text-center mt-4">
                    No spam, unsubscribe at any time. We respect your privacy.
                  </p>
                </div>
              </motion.div>
            ) : (
              // Success state
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome aboard! 🎉</h3>

                <p className="text-slate-600 mb-4">
                  Check your email for your free AI toolkit and productivity tips!
                </p>

                <p className="text-sm text-slate-500">This popup will close automatically...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailCapture;
