import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      avatar: 'SC',
      content:
        'RinaWarp Terminal Pro has completely transformed my development workflow. The AI code completion is incredibly accurate, and voice commands save me hours every week.',
      rating: 5,
      metrics: { productivity: '+85%', satisfaction: 'Excellent' },
    },
    {
      name: 'Marcus Rodriguez',
      role: 'DevOps Engineer',
      company: 'CloudSystems',
      avatar: 'MR',
      content:
        'The voice integration is a game-changer for system administration. I can execute complex commands hands-free while working on servers. Absolutely love it!',
      rating: 5,
      metrics: { efficiency: '+70%', time_saved: '15hrs/week' },
    },
    {
      name: 'Emily Watson',
      role: 'Full Stack Developer',
      company: 'StartupXYZ',
      avatar: 'EW',
      content:
        "As someone who types all day, the voice commands have been a lifesaver for my wrists. Plus, the AI understands context better than any other tool I've tried.",
      rating: 5,
      metrics: { health_impact: 'Reduced strain', accuracy: '95%' },
    },
    {
      name: 'David Kim',
      role: 'Engineering Manager',
      company: 'DataFlow Solutions',
      avatar: 'DK',
      content:
        "My team's productivity has increased dramatically since adopting RinaWarp. The multi-tab interface and advanced search make complex projects manageable.",
      rating: 5,
      metrics: { team_productivity: '+60%', project_speed: '+40%' },
    },
    {
      name: 'Lisa Thompson',
      role: 'Frontend Developer',
      company: 'DesignStudio Pro',
      avatar: 'LT',
      content:
        "The customization options are incredible. I've created the perfect development environment that matches my workflow perfectly. Highly recommended!",
      rating: 5,
      metrics: { customization: 'Perfect fit', ease_of_use: '10/10' },
    },
    {
      name: 'Alex Turner',
      role: 'Backend Developer',
      company: 'APIFirst Corp',
      avatar: 'AT',
      content:
        "The Git integration and intelligent conflict resolution have saved me countless hours. It's like having a senior developer as your coding partner.",
      rating: 5,
      metrics: { git_conflicts: '-80%', code_quality: '+45%' },
    },
  ];

  const stats = [
    { label: 'Average Productivity Increase', value: '+73%', description: 'Across all users' },
    { label: 'Customer Satisfaction', value: '4.9/5', description: 'Based on 500+ reviews' },
    { label: 'Time Saved Weekly', value: '12hrs', description: 'Average per developer' },
    { label: 'Feature Adoption Rate', value: '94%', description: 'AI features actively used' },
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
            Loved by <span className="gradient-text">Developers Worldwide</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            See what developers are saying about RinaWarp Terminal Pro and how it's transforming
            their daily workflow.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-mermid-600 mb-2">{stat.value}</div>
              <div className="text-slate-900 font-medium mb-1">{stat.label}</div>
              <div className="text-sm text-slate-600">{stat.description}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="card h-full group"
            >
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-mermid-200 z-0" />
                <p className="relative z-10 text-slate-700 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-mermid-400 to-mermid-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">{testimonial.rating}/5</span>
              </div>

              {/* Metrics */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex flex-wrap gap-3">
                  {Object.entries(testimonial.metrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-mermid-50 text-mermid-700 px-2 py-1 rounded text-xs font-medium"
                    >
                      {value}
                    </div>
                  ))}
                </div>
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
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Join Them?</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Experience the same productivity boost that thousands of developers are already
              enjoying with RinaWarp Terminal Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">Start Your Free Trial</button>
              <button className="btn-secondary">Read More Reviews</button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
