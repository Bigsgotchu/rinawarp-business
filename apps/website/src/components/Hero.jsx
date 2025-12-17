import React from 'react';
import { motion } from 'framer-motion';
import { Download, Zap, Sparkles, Terminal } from 'lucide-react';

const Hero = () => {
  const handleDownloadClick = (platform) => {
    // Track download intent for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'download_intent', {
        event_category: 'engagement',
        event_label: platform,
        value: platform,
      });
    }

    // For now, redirect to GitHub releases (to be updated when packaged)
    window.open('https://github.com/rinawarp/terminal-pro/releases', '_blank');
  };

  const handleGetStarted = () => {
    // Smooth scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-mermid-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-mermid-200/30 to-accent-200/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-mermid-100/40 to-accent-100/40 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-mermid-100 text-mermid-800 px-4 py-2 rounded-full text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Terminal Revolution
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Code Faster with <span className="gradient-text">AI Intelligence</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            RinaWarp Terminal Pro combines voice integration, intelligent automation, and advanced
            productivity features to supercharge your development workflow. Write code faster,
            deploy smarter, and focus on what matters most.
          </motion.p>

          {/* Value propositions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            <div className="flex items-center gap-2 text-slate-700">
              <Zap className="w-5 h-5 text-mermid-600" />
              <span className="font-medium">3x Faster Development</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Terminal className="w-5 h-5 text-mermid-600" />
              <span className="font-medium">Voice Commands</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-5 h-5 text-mermid-600" />
              <span className="font-medium">AI Code Completion</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button
              onClick={handleGetStarted}
              className="btn-primary text-lg px-8 py-4 min-w-[200px]"
            >
              Start Free Trial
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadClick('macos')}
                className="btn-secondary text-base px-6 py-3"
              >
                <Download className="w-4 h-4" />
                macOS
              </button>
              <button
                onClick={() => handleDownloadClick('windows')}
                className="btn-secondary text-base px-6 py-3"
              >
                <Download className="w-4 h-4" />
                Windows
              </button>
              <button
                onClick={() => handleDownloadClick('linux')}
                className="btn-secondary text-base px-6 py-3"
              >
                <Download className="w-4 h-4" />
                Linux
              </button>
            </div>
          </motion.div>

          {/* Social proof indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-mermid-400 to-mermid-600 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full border-2 border-white"></div>
              </div>
              <span>Join 10,000+ developers</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-400">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <span>4.9/5 from 500+ reviews</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Terminal preview mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4"
      >
        <div className="terminal-code rounded-t-lg">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-600">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-slate-400 text-sm ml-4">rinawarp-terminal-pro</span>
          </div>
          <div className="space-y-2">
            <div className="text-mermid-400">$ rina --voice "create a React component"</div>
            <div className="text-slate-300">✓ Creating React component with AI assistance...</div>
            <div className="text-green-400">✓ Component generated successfully!</div>
            <div className="text-slate-400 border-l-2 border-mermid-400 pl-4 ml-4">
              Generated: src/components/AITerminal.jsx
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
