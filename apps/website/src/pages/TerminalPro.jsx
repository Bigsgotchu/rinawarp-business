import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const TerminalPro = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mermid-50">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              RinaWarp Terminal Pro
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The intelligent terminal that combines local-first privacy with AI-powered assistance.
              Built for developers who value both productivity and control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/download"
                className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-mermid-700 hover:to-mermid-800 transition-all duration-200"
              >
                Download Free
              </Link>
              <Link
                to="/pricing"
                className="bg-white text-mermid-600 border-2 border-mermid-600 px-8 py-3 rounded-lg font-semibold hover:bg-mermid-50 transition-all duration-200"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Terminal Pro?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-mermid-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-mermid-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Local-First</h3>
                <p className="text-gray-600">
                  Your data stays on your machine. No telemetry, no data collection, no cloud dependencies for core features.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-mermid-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-mermid-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-gray-600">
                  Intelligent suggestions, command completion, and workflow automation powered by advanced AI models.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-mermid-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-mermid-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Built for speed with instant command execution, real-time suggestions, and minimal resource usage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-mermid-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Terminal Experience?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of developers who have upgraded their productivity with RinaWarp Terminal Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/download"
                className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-mermid-700 hover:to-mermid-800 transition-all duration-200"
              >
                Start Free Today
              </Link>
              <Link
                to="/"
                className="text-mermid-600 hover:text-mermid-700 font-semibold"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default TerminalPro;