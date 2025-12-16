import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const MusicVideoCreator = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mermid-50">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI Music Video Creator
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your music into stunning visual experiences with AI-powered video creation.
              From audio analysis to visual storytelling, create professional music videos in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/ai-music-video"
                className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-mermid-700 hover:to-mermid-800 transition-all duration-200"
              >
                Try Demo
              </a>
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
              Powerful AI Music Video Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-mermid-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-mermid-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Audio Analysis</h3>
                <p className="text-gray-600">
                  Advanced AI analyzes your music's tempo, mood, and structure to create perfectly synchronized visuals.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-mermid-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-mermid-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Styles</h3>
                <p className="text-gray-600">
                  Choose from multiple AI-generated visual styles or create custom themes that match your artistic vision.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-mermid-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-mermid-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Export</h3>
                <p className="text-gray-600">
                  Generate and export high-quality videos in various formats optimized for social media and streaming platforms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="py-16 px-6 bg-mermid-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Simple, Transparent Pricing
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                <p className="text-3xl font-bold text-mermid-600 mb-4">$29<span className="text-sm text-gray-500">/month</span></p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>• 10 videos per month</li>
                  <li>• Basic AI styles</li>
                  <li>• HD export</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-mermid-200">
                <div className="bg-mermid-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                  Popular
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Creator</h3>
                <p className="text-3xl font-bold text-mermid-600 mb-4">$69<span className="text-sm text-gray-500">/month</span></p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>• 50 videos per month</li>
                  <li>• Premium AI styles</li>
                  <li>• 4K export</li>
                  <li>• Custom branding</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                <p className="text-3xl font-bold text-mermid-600 mb-4">$199<span className="text-sm text-gray-500">/month</span></p>
                <ul className="text-left text-gray-600 space-y-2">
                  <li>• Unlimited videos</li>
                  <li>• All AI styles</li>
                  <li>• 8K export</li>
                  <li>• API access</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8">
              <Link
                to="/pricing"
                className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-mermid-700 hover:to-mermid-800 transition-all duration-200"
              >
                View Full Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Create Stunning Music Videos?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Transform your music into visual art with the power of AI. No design skills required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/ai-music-video"
                className="bg-gradient-to-r from-mermid-600 to-mermid-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-mermid-700 hover:to-mermid-800 transition-all duration-200"
              >
                Try Demo Now
              </a>
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

export default MusicVideoCreator;