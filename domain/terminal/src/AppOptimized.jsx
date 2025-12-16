// Optimized RinaWarp Terminal Pro with Lazy Loading
// Reduces bundle size by lazy-loading heavy components

import React, { useState, useEffect } from 'react';
import { applyTheme, initTheme } from './themeManager';
import { LazyWrapper } from './components/LazyWrapper';
import {
  LazyCommandPredictor,
  LazyCommandExplainer,
  LazyAdvancedTerminal,
  LazyTerminalComponents,
  preloadAIComponents,
} from './components/LazyComponents';
import { FloatingBubbles } from './components/TerminalComponents';

function AppOptimized() {
  // Core state
  const [logs, setLogs] = useState([
    '🤖 Enhanced Agent Mode enabled',
    'Type !help to see all available commands',
    'Try typing a command for AI suggestions!',
  ]);
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({ cpu: 0, ram: 0, net: 0 });
  const [isAgentMode, setIsAgentMode] = useState(true);
  const [aiProvider, setAiProvider] = useState('groq');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // AI features
  const [commandSuggestions, setCommandSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [currentTheme, setCurrentTheme] = useState('mermaid-enhanced');

  // Advanced terminal features
  const [useAdvancedTerminal, setUseAdvancedTerminal] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([]);

  // Lazy loaded components state
  const [commandPredictor, setCommandPredictor] = useState(null);
  const [commandExplainer, setCommandExplainer] = useState(null);
  const [terminalComponents, setTerminalComponents] = useState(null);

  useEffect(() => {
    initTheme();
    applyTheme(currentTheme);

    // Load available AI providers
    const loadProviders = async () => {
      try {
        const response = await fetch(
          'https://api.rinawarptech.com/api/providers'
        );
        const data = await response.json();
        setAvailableProviders(data.providers);
        if (data.providers.length > 0) {
          setAiProvider(data.providers[0].id);
        }
      } catch (error) {
        console.log('Could not load AI providers:', error);
      }
    };

    loadProviders();

    // Mock system stats
    const interval = setInterval(() => {
      setStats({
        cpu: Math.random() * 100,
        ram: Math.random() * 100,
        net: Math.floor(Math.random() * 10000),
      });
    }, 2000);

    // Lazy load AI components after initial render
    const loadAIComponents = async () => {
      try {
        const { default: CommandPredictor } =
          await import('./ai/commandPredictor');
        const { default: CommandExplainer } =
          await import('./ai/commandExplainer');

        const predictor = new CommandPredictor();
        const explainer = new CommandExplainer();

        predictor.initialize();

        setCommandPredictor(predictor);
        setCommandExplainer(explainer);
      } catch (error) {
        console.error('Failed to load AI components:', error);
      }
    };

    // Load terminal components
    const loadTerminalComponents = async () => {
      try {
        const {
          TerminalHeader,
          TerminalLogs,
          TerminalInput,
          StatCard,
          TerminalButton,
          ThemeSelector,
          LoadingSpinner,
        } = await import('./components/TerminalComponents');

        setTerminalComponents({
          TerminalHeader,
          TerminalLogs,
          TerminalInput,
          StatCard,
          TerminalButton,
          ThemeSelector,
          LoadingSpinner,
        });
      } catch (error) {
        console.error('Failed to load terminal components:', error);
      }
    };

    // Load components with delay to prioritize initial render
    setTimeout(() => {
      loadAIComponents();
      loadTerminalComponents();
    }, 500);

    return () => clearInterval(interval);
  }, [currentTheme]);

  // Handle command input
  const handleCommand = async (command) => {
    if (!command.trim()) return;

    const newLog = `🧜‍♀️ ${command}`;
    setLogs((prev) => [...prev, newLog]);
    setInput('');

    if (command.startsWith('!')) {
      const specialCommand = command.slice(1).toLowerCase();

      switch (specialCommand) {
        case 'help':
          setLogs((prev) => [
            ...prev,
            '📋 Available commands:',
            '!help - Show this help',
            '!clear - Clear terminal',
            '!stats - Show system stats',
            '!theme <name> - Change theme',
            '!voice - Toggle voice',
            '!ai <provider> - Switch AI provider',
          ]);
          break;
        case 'clear':
          setLogs([]);
          break;
        case 'stats':
          setLogs((prev) => [
            ...prev,
            `💻 CPU: ${stats.cpu.toFixed(1)}%`,
            `🧠 RAM: ${stats.ram.toFixed(1)}%`,
            `🌐 Network: ${stats.net} bytes/s`,
          ]);
          break;
        case 'voice':
          setVoiceEnabled(!voiceEnabled);
          setLogs((prev) => [
            ...prev,
            `🎤 Voice ${!voiceEnabled ? 'enabled' : 'disabled'}`,
          ]);
          break;
        default:
          if (specialCommand.startsWith('theme ')) {
            const themeName = specialCommand.split(' ')[1];
            setCurrentTheme(themeName);
            setLogs((prev) => [...prev, `🎨 Theme changed to ${themeName}`]);
          } else if (specialCommand.startsWith('ai ')) {
            const provider = specialCommand.split(' ')[1];
            setAiProvider(provider);
            setLogs((prev) => [
              ...prev,
              `🤖 AI provider changed to ${provider}`,
            ]);
          } else {
            setLogs((prev) => [
              ...prev,
              `❓ Unknown command: ${specialCommand}`,
            ]);
          }
      }
      return;
    }

    // AI processing
    if (commandPredictor) {
      try {
        const suggestions = await commandPredictor.predict(command);
        if (suggestions.length > 0) {
          setCommandSuggestions(suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Command prediction failed:', error);
      }
    }

    // Simulate AI response
    const responses = [
      '🤖 I understand you want to run that command!',
      "🧜‍♀️ That's an interesting command you're trying to execute.",
      '⚡ Let me help you with that command execution.',
      '🌊 I can assist you with terminal operations!',
      '💫 Command processed successfully!',
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    setLogs((prev) => [...prev, response]);
  };

  // Handle advanced terminal command
  const handleAdvancedTerminalCommand = async (command) => {
    setTerminalHistory((prev) => [...prev, command]);
    await handleCommand(command);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev < commandSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev > 0 ? prev - 1 : commandSuggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Loading fallback
  if (!terminalComponents) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-pink-400 mb-2">
            RinaWarp Terminal Pro
          </h2>
          <p className="text-blue-300">Loading enhanced features...</p>
        </div>
      </div>
    );
  }

  const {
    TerminalHeader,
    TerminalLogs,
    TerminalInput,
    StatCard,
    TerminalButton,
    ThemeSelector,
    LoadingSpinner,
  } = terminalComponents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <FloatingBubbles count={20} />

      {isAgentMode ? (
        <div className="container mx-auto p-6">
          <TerminalHeader
            title="🧜‍♀️ RinaWarp Terminal Pro"
            subtitle="Enhanced Agent Mode"
            className="mb-6"
          >
            <div className="flex gap-2">
              <TerminalButton
                onClick={() => setIsAgentMode(false)}
                variant="ghost"
                size="sm"
              >
                📊 Dashboard
              </TerminalButton>
            </div>
            <TerminalButton
              onClick={() => setUseAdvancedTerminal(!useAdvancedTerminal)}
              variant={useAdvancedTerminal ? 'accent' : 'ghost'}
              size="sm"
            >
              {useAdvancedTerminal ? '🖥️ Advanced Terminal' : '💬 Chat Mode'}
            </TerminalButton>
            <TerminalButton
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              variant={voiceEnabled ? 'accent' : 'ghost'}
              size="sm"
            >
              {voiceEnabled ? '🎤 Voice On' : '🎤 Voice Off'}
            </TerminalButton>
          </TerminalHeader>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {useAdvancedTerminal ? (
                <LazyWrapper>
                  <LazyAdvancedTerminal
                    onCommand={handleAdvancedTerminalCommand}
                    className="h-96"
                    theme={currentTheme}
                  />
                </LazyWrapper>
              ) : (
                <TerminalLogs logs={logs} className="h-96 mb-4" />
              )}

              {!useAdvancedTerminal && (
                <TerminalInput
                  value={input}
                  onChange={setInput}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a command or !help for options..."
                  suggestions={commandSuggestions}
                  showSuggestions={showSuggestions}
                  selectedSuggestion={selectedSuggestion}
                  onSuggestionSelect={handleSuggestionSelect}
                />
              )}
            </div>

            <div className="space-y-4">
              <StatCard
                title="CPU Usage"
                value={`${stats.cpu.toFixed(1)}%`}
                icon="💻"
                color="blue"
              />
              <StatCard
                title="Memory"
                value={`${stats.ram.toFixed(1)}%`}
                icon="🧠"
                color="green"
              />
              <StatCard
                title="Network"
                value={`${stats.net} B/s`}
                icon="🌐"
                color="purple"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />

            <div className="flex gap-2">
              <TerminalButton
                onClick={() => setLogs([])}
                variant="ghost"
                size="sm"
              >
                🗑️ Clear
              </TerminalButton>
              <TerminalButton
                onClick={() => handleCommand('!help')}
                variant="ghost"
                size="sm"
              >
                ❓ Help
              </TerminalButton>
              <TerminalButton
                onClick={() => handleCommand('!stats')}
                variant="ghost"
                size="sm"
              >
                📊 Stats
              </TerminalButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-6">
          <TerminalHeader
            title="📊 System Dashboard"
            subtitle="Real-time Monitoring"
            className="mb-6"
          >
            <TerminalButton
              onClick={() => setIsAgentMode(true)}
              variant="primary"
              size="sm"
            >
              🤖 Agent Mode
            </TerminalButton>
          </TerminalHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="CPU Usage"
              value={`${stats.cpu.toFixed(1)}%`}
              icon="💻"
              color="blue"
              trend="up"
            />
            <StatCard
              title="Memory Usage"
              value={`${stats.ram.toFixed(1)}%`}
              icon="🧠"
              color="green"
              trend="stable"
            />
            <StatCard
              title="Network I/O"
              value={`${stats.net} B/s`}
              icon="🌐"
              color="purple"
              trend="down"
            />
          </div>

          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-pink-400 mb-2">
                AI Features
              </h3>
              <p className="text-blue-300 mb-4">
                Advanced AI-powered terminal assistance
              </p>
              <TerminalButton variant="primary" size="sm">
                Explore AI
              </TerminalButton>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-pink-400 mb-2">Themes</h3>
              <p className="text-blue-300 mb-4">
                Beautiful visual themes and customization
              </p>
              <TerminalButton variant="secondary" size="sm">
                View Themes
              </TerminalButton>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-pink-400 mb-2">Terminal</h3>
              <p className="text-blue-300 mb-4">
                Advanced terminal with xterm.js integration
              </p>
              <TerminalButton variant="accent" size="sm">
                Open Terminal
              </TerminalButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppOptimized;
