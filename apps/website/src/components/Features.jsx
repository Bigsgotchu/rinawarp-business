import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Mic,
  Zap,
  Search,
  GitBranch,
  Shield,
  Palette,
  Rocket,
  Code,
  Terminal,
  Sparkles,
  Layers,
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Code Intelligence',
      description:
        'Advanced AI algorithms understand your codebase context and provide intelligent code suggestions, auto-completion, and refactoring recommendations.',
      benefits: ['Context-aware suggestions', 'Smart refactoring', 'Code pattern recognition'],
      color: 'from-blue-500 to-purple-600',
    },
    {
      icon: Mic,
      title: 'Voice Integration',
      description:
        'Control your terminal with natural voice commands. Execute complex operations, navigate files, and manage your workflow hands-free.',
      benefits: ['Natural language commands', 'Hands-free operation', 'Accessibility support'],
      color: 'from-green-500 to-teal-600',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description:
        'Optimized performance with intelligent caching and preloading. Experience blazing-fast command execution and instant responses.',
      benefits: ['Sub-second responses', 'Smart caching', 'Optimized performance'],
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description:
        'Find anything across your codebase with semantic search powered by AI. Search by function, concept, or even describe what you need.',
      benefits: ['Semantic search', 'Cross-project search', 'Instant results'],
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: GitBranch,
      title: 'Git Intelligence',
      description:
        'AI-powered Git operations with automatic conflict resolution, smart commit messages, and intelligent branch management.',
      benefits: ['Smart merge resolution', 'Auto-generated commits', 'Branch optimization'],
      color: 'from-indigo-500 to-blue-600',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Bank-grade security with end-to-end encryption, secure credential management, and comprehensive audit trails.',
      benefits: ['End-to-end encryption', 'Secure credentials', 'Audit compliance'],
      color: 'from-gray-600 to-slate-700',
    },
    {
      icon: Palette,
      title: 'Beautiful Themes',
      description:
        'Customizable interface with carefully crafted themes and layouts. Choose from hundreds of color schemes and customize every detail.',
      benefits: ['Hundreds of themes', 'Custom layouts', 'Accessibility options'],
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Rocket,
      title: 'Plugin Ecosystem',
      description:
        'Extensive plugin system allows you to extend functionality with community-built and custom plugins for any workflow.',
      benefits: ['Community plugins', 'Custom extensions', 'API integrations'],
      color: 'from-emerald-500 to-green-600',
    },
    {
      icon: Layers,
      title: 'Multi-Tab Interface',
      description:
        'Organize your workflow with multiple tabs, split panes, and session management. Keep everything organized and accessible.',
      benefits: ['Multiple sessions', 'Split pane support', 'Session persistence'],
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="features" className="py-20 bg-white">
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
            Supercharge Your <span className="gradient-text">Development Workflow</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover the powerful features that make RinaWarp Terminal Pro the most advanced
            AI-powered terminal for modern developers.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="card h-full hover:shadow-xl transition-all duration-300">
                <div className="mb-6">
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>

                <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>

                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <div className="w-1.5 h-1.5 bg-mermid-600 rounded-full"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-mermid-50 to-accent-50 px-6 py-3 rounded-full border border-mermid-200">
            <Sparkles className="w-5 h-5 text-mermid-600" />
            <span className="text-mermid-800 font-medium">
              Join thousands of developers already using RinaWarp Terminal Pro
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
