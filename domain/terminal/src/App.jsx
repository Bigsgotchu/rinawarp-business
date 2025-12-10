import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { HelpCircle, Github, MessageCircle, Users } from 'lucide-react';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem(
      'rinawarp-onboarding-completed'
    );
    if (hasSeenOnboarding) {
      setIsFirstVisit(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsFirstVisit(false);
    localStorage.setItem('rinawarp-onboarding-completed', 'true');
  };

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  // Show onboarding automatically on first visit
  useEffect(() => {
    if (isFirstVisit) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">RinaWarp Terminal Pro</h1>
            <p className="text-sm text-gray-400">
              Advanced AI-powered terminal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Community links */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="https://github.com/rinawarp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm">GitHub</span>
            </a>
            <a
              href="https://discord.gg/rinawarp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">Discord</span>
            </a>
            <a
              href="/community"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">Community</span>
            </a>
          </div>

          {/* Help button */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Keyboard shortcuts (Ctrl+/)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            RinaWarp Terminal Pro
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Experience the future of terminal interfaces with AI-powered code
            completion, voice commands, and intelligent workflow automation.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">AI Code Completion</h3>
              <p className="text-gray-400 text-sm">
                Intelligent suggestions and auto-completion powered by advanced
                AI
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="text-lg font-semibold mb-2">Voice Commands</h3>
              <p className="text-gray-400 text-sm">
                Control your terminal with natural voice commands
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <p className="text-gray-400 text-sm">
                Lightning-fast with offline support and lazy loading
              </p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
              Launch Terminal
            </button>
            <button
              onClick={handleStartOnboarding}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition-all border border-gray-600"
            >
              Take Tour
            </button>
          </div>

          {/* Pricing preview */}
          <div className="mt-16 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Choose Your Plan
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">Creator</div>
                <div className="text-lg font-bold text-green-400">$19/mo</div>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">Pro Studio</div>
                <div className="text-lg font-bold">$39/mo</div>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">Studio</div>
                <div className="text-lg font-bold text-blue-400">$99/mo</div>
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">Enterprise</div>
                <div className="text-lg font-bold">$249/mo</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-gray-800 text-center text-gray-400">
        <p>&copy; 2024 RinaWarp Terminal Pro. Built with ❤️ for developers.</p>
      </footer>

      {/* Modals */}
      <Onboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
