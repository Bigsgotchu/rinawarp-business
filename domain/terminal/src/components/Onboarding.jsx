import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Zap,
  Users,
  Star,
} from 'lucide-react';

const Onboarding = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Welcome to RinaWarp Terminal Pro',
      description:
        'Your advanced AI-powered terminal with voice commands and intelligent features.',
      icon: Terminal,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-2">🚀 Getting Started</h3>
            <p className="text-sm opacity-90">
              Experience the future of terminal interfaces with AI assistance,
              voice commands, and seamless workflow integration.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">AI-Powered</div>
              <div className="text-sm text-gray-600">Smart code completion</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🎤</div>
              <div className="font-medium">Voice Commands</div>
              <div className="text-sm text-gray-600">Hands-free operation</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'AI Code Completion',
      description:
        'Get intelligent code suggestions and auto-completion powered by advanced AI.',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div className="text-gray-400 mb-2">
              // AI suggests completions as you type
            </div>
            <div>
              console.log("Hello, <span className="text-blue-400">World</span>
              ");
            </div>
            <div className="text-gray-500 mt-2">
              // ↑ AI suggested "World" based on context
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Context-aware suggestions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm">Multi-language support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-sm">Smart error detection</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Voice Commands',
      description:
        'Control your terminal with natural voice commands for hands-free operation.',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">
              Try these voice commands:
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  🎤
                </span>
                <span className="text-sm">"Open project"</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  🎤
                </span>
                <span className="text-sm">"Run tests"</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  🎤
                </span>
                <span className="text-sm">"Search for [keyword]"</span>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm">
              <strong>Tip:</strong> Click the microphone icon or press{' '}
              <kbd className="bg-gray-200 px-1 rounded">Ctrl+Space</kbd> to
              start voice commands.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Quick Actions & Shortcuts',
      description:
        'Boost your productivity with keyboard shortcuts and quick actions.',
      icon: Star,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">Essential Shortcuts</div>
              <div className="space-y-1 text-sm">
                <div>
                  <kbd className="bg-gray-200 px-1 rounded">Ctrl</kbd> +{' '}
                  <kbd className="bg-gray-200 px-1 rounded">K</kbd> New tab
                </div>
                <div>
                  <kbd className="bg-gray-200 px-1 rounded">Ctrl</kbd> +{' '}
                  <kbd className="bg-gray-200 px-1 rounded">W</kbd> Close tab
                </div>
                <div>
                  <kbd className="bg-gray-200 px-1 rounded">Ctrl</kbd> +{' '}
                  <kbd className="bg-gray-200 px-1 rounded">Space</kbd> Voice
                  commands
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-sm">Quick Actions</div>
              <div className="space-y-1 text-sm">
                <div>🔍 Global search</div>
                <div>📁 Project switcher</div>
                <div>⚙️ Settings panel</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm">
              <strong>Pro Tip:</strong> Use{' '}
              <kbd className="bg-gray-200 px-1 rounded">Ctrl+/</kbd> to view all
              shortcuts anytime.
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isCompleted) {
      onComplete && onComplete();
    }
  }, [isCompleted, onComplete]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                {React.createElement(steps[currentStep].icon, {
                  className: 'w-5 h-5 text-white',
                })}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {steps[currentStep].title}
                </h2>
                <p className="text-sm text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                {steps[currentStep].description}
              </p>
              {steps[currentStep].content}
            </div>

            {/* Progress indicators */}
            <div className="flex space-x-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-500'
                      : index < currentStep
                        ? 'bg-green-400'
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={nextStep}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <span>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </span>
                {currentStep < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Onboarding;
