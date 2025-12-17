import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Command,
  Terminal,
  Search,
  Settings,
  Mic,
  Mail,
  Info,
  Heart,
  Bug,
} from 'lucide-react';

const KeyboardShortcuts = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('general');

  const shortcuts = {
    general: [
      { keys: ['Ctrl', 'K'], description: 'New tab', icon: Terminal },
      { keys: ['Ctrl', 'W'], description: 'Close tab', icon: X },
      { keys: ['Ctrl', 'Tab'], description: 'Next tab', icon: ChevronRight },
      {
        keys: ['Ctrl', 'Shift', 'Tab'],
        description: 'Previous tab',
        icon: ChevronLeft,
      },
      { keys: ['Ctrl', ','], description: 'Settings', icon: Settings },
      { keys: ['F11'], description: 'Toggle fullscreen', icon: Maximize },
    ],
    ai: [
      { keys: ['Ctrl', 'Space'], description: 'Voice commands', icon: Mic },
      { keys: ['Ctrl', 'I'], description: 'AI code completion', icon: Zap },
      {
        keys: ['Ctrl', 'Shift', 'I'],
        description: 'Explain code',
        icon: HelpCircle,
      },
      {
        keys: ['Ctrl', 'Alt', 'I'],
        description: 'Optimize code',
        icon: TrendingUp,
      },
    ],
    navigation: [
      { keys: ['Ctrl', 'P'], description: 'Quick open file', icon: File },
      {
        keys: ['Ctrl', 'Shift', 'P'],
        description: 'Command palette',
        icon: Command,
      },
      { keys: ['Ctrl', 'G'], description: 'Go to line', icon: MapPin },
      { keys: ['Ctrl', 'F'], description: 'Find in file', icon: Search },
    ],
    editing: [
      { keys: ['Ctrl', 'C'], description: 'Copy', icon: Copy },
      { keys: ['Ctrl', 'V'], description: 'Paste', icon: Clipboard },
      { keys: ['Ctrl', 'X'], description: 'Cut', icon: Scissors },
      { keys: ['Ctrl', 'Z'], description: 'Undo', icon: Undo },
      { keys: ['Ctrl', 'Y'], description: 'Redo', icon: Redo },
      { keys: ['Ctrl', 'A'], description: 'Select all', icon: MousePointer },
    ],
    about: [
      {
        keys: [],
        description: 'Contact Support',
        icon: Mail,
        link: 'mailto:support@rinawarptech.com',
      },
      { keys: [], description: 'Version: 1.0.0', icon: Info },
      { keys: [], description: 'Built with ❤️ for developers', icon: Heart },
      {
        keys: [],
        description: 'Send Debug Bundle',
        icon: Bug,
        onClick: () => handleSendDebugBundle(),
      },
    ],
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Close modal with Escape
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }

      // Ctrl+/ to show/hide shortcuts
      if (
        event.ctrlKey &&
        event.key === '/' &&
        !event.shiftKey &&
        !event.altKey
      ) {
        event.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Would need to trigger opening from parent
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSendDebugBundle = async () => {
    if (!confirm('This will send your logs and config to support. Continue?'))
      return;

    try {
      // Placeholder for zipping and sending
      console.log('Sending debug bundle...');
      // In real implementation, zip logs/config and send to support@rinawarptech.com
      alert('Debug bundle sent to support!');
    } catch (error) {
      console.error('Error sending debug bundle:', error);
      alert('Failed to send debug bundle.');
    }
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
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600">
                Boost your productivity with these shortcuts
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Press <kbd className="bg-white px-1 rounded">Ctrl</kbd> +{' '}
                <kbd className="bg-white px-1 rounded">/</kbd> to toggle
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex border-b bg-gray-50">
            {Object.keys(shortcuts).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                  activeCategory === category
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shortcuts[activeCategory].map((shortcut, index) => {
                const IconComponent = shortcut.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-blue-600" />
                      </div>
                      {shortcut.link ? (
                        <a
                          href={shortcut.link}
                          className="text-gray-700 hover:text-blue-600"
                        >
                          {shortcut.description}
                        </a>
                      ) : shortcut.onClick ? (
                        <button
                          onClick={shortcut.onClick}
                          className="text-gray-700 hover:text-blue-600 text-left"
                        >
                          {shortcut.description}
                        </button>
                      ) : (
                        <span className="text-gray-700">
                          {shortcut.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="bg-white border px-2 py-1 rounded text-xs font-mono text-gray-800 shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> Use these shortcuts to work faster and
                more efficiently
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KeyboardShortcuts;
