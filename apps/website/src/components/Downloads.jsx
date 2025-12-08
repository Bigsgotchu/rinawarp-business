import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Apple, Monitor, Server, Check, Star, Users, TrendingUp } from 'lucide-react';

const Downloads = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('macos');

  const platforms = [
    {
      id: 'macos',
      name: 'macOS',
      icon: Apple,
      version: '1.0.0',
      size: '45 MB',
      requirements: 'macOS 10.15+',
      features: ['Native M1/M2 support', 'Touch Bar integration', 'iCloud sync'],
    },
    {
      id: 'windows',
      name: 'Windows',
      icon: Monitor,
      version: '1.0.0',
      size: '42 MB',
      requirements: 'Windows 10+',
      features: ['WSL 2 support', 'Native notifications', 'PowerShell integration'],
    },
    {
      id: 'linux',
      name: 'Linux',
      icon: Server,
      version: '1.0.0',
      size: '40 MB',
      requirements: 'Ubuntu 18.04+, Debian 10+, or similar',
      features: ['AppImage support', 'Native package managers', 'Wayland compatible'],
    },
  ];

  const handleDownload = (platform) => {
    // Track download conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'download_conversion', {
        event_category: 'conversion',
        event_label: platform,
        value: platform,
      });
    }

    // Redirect to GitHub releases (to be updated when packaged)
    window.open('https://github.com/rinawarp/terminal-pro/releases', '_blank');
  };

  const selectedPlatformData = platforms.find((p) => p.id === selectedPlatform);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-mermid-50">
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
            Download <span className="gradient-text">RinaWarp Terminal Pro</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Get started in minutes. Available for all major platforms with full feature parity.
          </p>

          {/* Social proof stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Users className="w-5 h-5 text-mermid-600" />
              <span className="font-semibold text-slate-900">10,000+</span>
              <span className="text-slate-600">Active Users</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-slate-900">4.9/5</span>
              <span className="text-slate-600">Rating</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-slate-900">3x</span>
              <span className="text-slate-600">Productivity Boost</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Platform selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-mermid-500 bg-mermid-50'
                      : 'border-slate-200 hover:border-mermid-300 hover:bg-mermid-25'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        selectedPlatform === platform.id
                          ? 'bg-mermid-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <platform.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{platform.name}</h3>
                      <p className="text-sm text-slate-600">
                        Version {platform.version} • {platform.size}
                      </p>
                    </div>
                    {selectedPlatform === platform.id && (
                      <Check className="w-5 h-5 text-mermid-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Download button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={() => handleDownload(selectedPlatform)}
              className="w-full btn-primary text-lg py-4 mt-8 group"
            >
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              Download for {selectedPlatformData?.name}
            </motion.button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Free 14-day trial • No credit card required
            </p>
          </motion.div>

          {/* Platform details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-mermid-100 rounded-lg">
                <selectedPlatformData.icon className="w-6 h-6 text-mermid-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedPlatformData?.name} Features
                </h3>
                <p className="text-slate-600">{selectedPlatformData?.requirements}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {selectedPlatformData?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-mermid-600 rounded-full"></div>
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">File size:</span>
                <span className="font-medium">{selectedPlatformData?.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-600">Version:</span>
                <span className="font-medium">{selectedPlatformData?.version}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom section with enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-mermid-600 to-mermid-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need Enterprise Features?</h3>
            <p className="text-mermid-100 mb-6 max-w-2xl mx-auto">
              Get advanced team management, priority support, and custom integrations for your
              organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-mermid-600 hover:bg-mermid-50 px-6 py-3 rounded-lg font-semibold transition-colors">
                Contact Sales
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-mermid-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                View Enterprise Pricing
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Downloads;
