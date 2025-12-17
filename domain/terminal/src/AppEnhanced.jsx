// Enhanced RinaWarp Terminal Pro with ALL Advanced Features
// Integrates AI, Mermaid theme, Tailwind, and advanced terminal features

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { applyTheme, initTheme } from './themeManager';
import { LazyWrapper } from './components/LazyWrapper';
import {
  LazyCommandPredictor,
  LazyCommandExplainer,
  LazyAdvancedTerminal,
  LazyTerminalComponents,
  preloadAIComponents,
} from './components/LazyComponents';
import { useAccessibility } from './components/AccessibilityProvider';
import {
  TerminalHeader,
  TerminalButton,
  TerminalLogs,
  TerminalInput,
  StatCard,
  FloatingBubbles,
  ThemeSelector,
} from './components/TerminalComponents';

// Lazy load heavy components
const ActivationModal = React.lazy(
  () => import('./components/ActivationModal')
);
const AdvancedTerminal = React.lazy(
  () => import('./terminal/AdvancedTerminal')
);

function AppEnhanced() {
  const { t } = useTranslation();
  const { trapFocus } = useAccessibility();

  // Core state
  const [logs, setLogs] = useState([
    '🤖 Enhanced Agent Mode enabled',
    '🔑 Personal License: RINAWARP-PERSONAL-LIFETIME-001 (Active)',
    '✨ All premium features unlocked!',
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

  // Initialize AI components (lazy loaded)
  const [commandPredictor, setCommandPredictor] = useState(null);
  const [commandExplainer, setCommandExplainer] = useState(null);
  const [showActivate, setShowActivate] = useState(false);

  // React Query mutations for API calls
  const aiChatMutation = useMutation({
    mutationFn: async ({ prompt, provider, enableVoice }) => {
      const response = await fetch(
        'https://api.rinawarptech.com/api/ai-stream',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, provider, enableVoice }),
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    },
    onSuccess: (response) => {
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = async () => {
        const { done, value } = await reader.read();
        if (done) return;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) {
              setStreamingText((prev) => prev + data);
              setLogs((prev) => {
                const newLogs = [...prev];
                newLogs[newLogs.length - 1] =
                  `🤖 Rina: ${prev[prev.length - 1].replace('🤖 Rina: ', '') + data}`;
                return newLogs;
              });
            }
          }
        }
        readStream();
      };
      readStream();
    },
    onError: (error) => {
      setLogs((prev) => [...prev, `⚠️ ${t('failedToReach')}`]);
    },
  });

  const advancedTerminalMutation = useMutation({
    mutationFn: async ({ command, provider }) => {
      const response = await fetch('https://api.rinawarptech.com/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: command, provider, enableVoice: false }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    },
  });

  useEffect(() => {
    initTheme();
    applyTheme(currentTheme);

    // Check license status at startup
    (async () => {
      try {
        const res = await window.rw.check();
        if (!res?.ok) setShowActivate(true);
      } catch {
        setShowActivate(true);
      }
    })();

    // Load available AI providers using React Query
    const { data: providersData } = useQuery({
      queryKey: ['aiProviders'],
      queryFn: async () => {
        const response = await fetch(
          'https://api.rinawarptech.com/api/providers'
        );
        if (!response.ok) throw new Error('Failed to fetch providers');
        return response.json();
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: (data) => {
        setAvailableProviders(data.providers || []);
        if (data.providers && data.providers.length > 0) {
          setAiProvider(data.providers[0].id);
        }
      },
      onError: (error) => {
        console.log('Could not load AI providers:', error);
      },
    });

    // Mock system stats
    const interval = setInterval(() => {
      setStats({
        cpu: Math.random() * 100,
        ram: Math.random() * 100,
        net: Math.floor(Math.random() * 10000),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentTheme]);

  // Trap focus in modal
  useEffect(() => {
    if (showActivate) {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        trapFocus(modal);
        const firstFocusable = modal.querySelector('button, input, textarea');
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    }
  }, [showActivate, trapFocus]);

  // Enhanced input handling with AI predictions
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim().length > 2) {
      try {
        const predictions = await commandPredictor.predictCommand(value, {
          currentDirectory: window.location.pathname,
          recentCommands: logs.filter((log) => log.startsWith('>')).slice(-5),
          systemInfo: stats,
        });

        setCommandSuggestions(predictions.suggestions || []);
        setShowSuggestions(true);
        setSelectedSuggestion(0);
      } catch (error) {
        console.log('Prediction error:', error);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Enhanced command execution
  const runCommand = async () => {
    if (!input.trim()) return;

    const userInput = input;
    setLogs((prev) => [...prev, `> ${userInput}`]);
    setInput('');
    setShowSuggestions(false);

    // Learn from command
    commandPredictor.learnFromCommand(userInput, true, { category: 'user' });

    // Handle special commands
    if (userInput.startsWith('!help')) {
      setLogs((prev) => [
        ...prev,
        `📋 ${t('helpCommands')}`,
        `  !help - ${t('help')}`,
        `  !memory - ${t('memory')}`,
        `  !recent - ${t('recent')}`,
        `  !clear-memory - ${t('clearMemoryCmd')}`,
        `  !explain <command> - ${t('explain')}`,
        `  !suggest - ${t('suggest')}`,
        `  !theme <name> - ${t('themeCmd')}`,
        `  !terminal - ${t('terminalCmd')}`,
        `  check cpu/ram - ${t('checkStats')}`,
        `  ${t('chatWithRina')}`,
      ]);
      return;
    }

    if (userInput.startsWith('!explain')) {
      const command = userInput.replace('!explain', '').trim();
      if (command) {
        try {
          const explanation = await commandExplainer.explainCommand(command);
          setLogs((prev) => [
            ...prev,
            `📖 ${t('commandExplanation')} ${explanation.command}`,
            `   ${explanation.explanation}`,
            ...explanation.examples.map((ex) => `   Example: ${ex}`),
            ...explanation.warnings.map((warn) => `   ⚠️ ${warn}`),
          ]);
        } catch (error) {
          setLogs((prev) => [...prev, `⚠️ ${t('failedToReach')}`]);
        }
      } else {
        setLogs((prev) => [...prev, 'Usage: !explain <command>']);
      }
      return;
    }

    if (userInput.startsWith('!theme')) {
      const themeName =
        userInput.replace('!theme', '').trim() || 'mermaid-enhanced';
      setCurrentTheme(themeName);
      applyTheme(themeName);
      setLogs((prev) => [...prev, `🎨 ${t('themeChanged')} ${themeName}`]);
      return;
    }

    if (userInput.startsWith('!terminal')) {
      setUseAdvancedTerminal(!useAdvancedTerminal);
      setLogs((prev) => [
        ...prev,
        `🖥️ ${!useAdvancedTerminal ? t('advancedMode') : t('disabledMode')}`,
      ]);
      return;
    }

    if (userInput.startsWith('!suggest')) {
      try {
        const suggestions = commandExplainer.getContextualSuggestions({
          currentDirectory: window.location.pathname,
          systemLoad: stats.cpu / 100,
        });
        setLogs((prev) => [
          ...prev,
          `💡 ${t('suggestions')}`,
          ...suggestions.map((s) => `   ${s}`),
        ]);
      } catch (error) {
        setLogs((prev) => [...prev, `⚠️ ${t('failedToReach')}`]);
      }
      return;
    }

    // System stats command
    if (
      userInput.toLowerCase().includes('cpu') ||
      userInput.toLowerCase().includes('ram')
    ) {
      setLogs((prev) => [
        ...prev,
        `📊 ${t('systemStats')}`,
        `   CPU: ${stats.cpu.toFixed(1)}%`,
        `   RAM: ${stats.ram.toFixed(1)}%`,
        `   Network: ${(stats.net / 1024).toFixed(1)} KB/s`,
      ]);
      return;
    }

    // AI chat with streaming using React Query mutation
    setIsStreaming(true);
    setStreamingText('');
    setLogs((prev) => [...prev, '🤖 Rina: ']);

    aiChatMutation.mutate(
      {
        prompt: userInput,
        provider: aiProvider,
        enableVoice: voiceEnabled,
      },
      {
        onSettled: () => {
          setIsStreaming(false);
          setStreamingText('');
        },
      }
    );
  };

  // Handle suggestion selection
  const selectSuggestion = (index) => {
    if (commandSuggestions[index]) {
      setInput(commandSuggestions[index].command);
      setShowSuggestions(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (showSuggestions && commandSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
        selectSuggestion(selectedSuggestion);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter') {
      runCommand();
    }
  };

  // Advanced terminal command handler using React Query mutation
  const handleAdvancedTerminalCommand = async (command) => {
    // Process commands in advanced terminal mode
    if (command === 'help') {
      return 'Available commands: help, clear, history, ls, cd, and more!';
    }

    // Send to AI for processing
    try {
      const data = await advancedTerminalMutation.mutateAsync({
        command,
        provider: aiProvider,
      });
      return data.response || 'Command processed';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  if (isAgentMode) {
    return (
      <div
        className="terminal bg-ocean-gradient min-h-screen p-4 font-mono relative overflow-hidden"
        role="main"
        id="main-content"
      >
        {/* Floating Bubbles Background */}
        <FloatingBubbles count={20} />

        {/* Terminal Header */}
        <TerminalHeader
          title={`🧜‍♀️ ${t('title')}`}
          subtitle={
            isStreaming ? `⚡ ${t('streamingResponse')}` : t('subtitle')
          }
          className="mb-6"
        >
          <div className="flex gap-4 items-center mt-4 flex-wrap">
            {availableProviders.length > 1 && (
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="bg-mermaid-ocean/80 text-mermaid-text border border-mermaid-cyan rounded-lg px-3 py-2 text-sm"
                aria-label="Select AI provider"
              >
                {availableProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            )}

            <TerminalButton
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              variant={voiceEnabled ? 'accent' : 'ghost'}
              size="sm"
            >
              {voiceEnabled ? `🎤 ${t('voiceOn')}` : `🔇 ${t('voiceOff')}`}
            </TerminalButton>

            <TerminalButton
              onClick={() => setUseAdvancedTerminal(!useAdvancedTerminal)}
              variant={useAdvancedTerminal ? 'accent' : 'ghost'}
              size="sm"
            >
              {useAdvancedTerminal
                ? `🖥️ ${t('advancedTerminal')}`
                : `💬 ${t('chatMode')}`}
            </TerminalButton>

            <TerminalButton
              onClick={() => setShowActivate(true)}
              variant="secondary"
              size="sm"
            >
              🔑 {t('activate')}
            </TerminalButton>

            <TerminalButton
              onClick={() => setIsAgentMode(false)}
              variant="secondary"
              size="sm"
            >
              📊 {t('dashboard')}
            </TerminalButton>

            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-mermaid-ocean/80 text-mermaid-text border border-mermaid-cyan rounded-lg px-3 py-2 text-sm"
              aria-label="Select language"
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>
        </TerminalHeader>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Terminal/Logs Section */}
          <div className="lg:col-span-2">
            {useAdvancedTerminal ? (
              <div className="bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl shadow-glow h-96">
                <Suspense fallback={<div>Loading Terminal...</div>}>
                  <AdvancedTerminal
                    onCommand={handleAdvancedTerminalCommand}
                    theme={currentTheme}
                    className="h-full"
                  />
                </Suspense>
              </div>
            ) : (
              <TerminalLogs logs={logs} className="h-96" />
            )}

            {/* Input Section */}
            {!useAdvancedTerminal && (
              <div className="mt-4">
                <TerminalInput
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('askAgent')}
                  suggestions={commandSuggestions}
                  showSuggestions={showSuggestions}
                  selectedSuggestion={selectedSuggestion}
                  onSuggestionSelect={selectSuggestion}
                />
              </div>
            )}
          </div>

          {/* Sidebar with Stats and Controls */}
          <div className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 gap-4">
              <StatCard
                title={t('cpuUsage')}
                value={stats.cpu.toFixed(1)}
                unit="%"
                icon="⚡"
                color="cyan"
              />
              <StatCard
                title={t('ramUsage')}
                value={stats.ram.toFixed(1)}
                unit="%"
                icon="🧠"
                color="coral"
              />
              <StatCard
                title={t('network')}
                value={(stats.net / 1024).toFixed(1)}
                unit="KB/s"
                icon="🌐"
                color="seaweed"
              />
            </div>

            {/* Theme Selector */}
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={(theme) => {
                setCurrentTheme(theme);
                applyTheme(theme);
              }}
            />

            {/* Quick Actions */}
            <div className="bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-seaweed/30 rounded-xl p-4 shadow-seaweed-glow">
              <h3 className="text-mermaid-text font-bold mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <TerminalButton
                  onClick={() =>
                    setLogs((prev) => [...prev, '🧠 Memory cleared!'])
                  }
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  🧠 {t('clearMemory')}
                </TerminalButton>
                <TerminalButton
                  onClick={() =>
                    setLogs((prev) => [...prev, '📊 System stats updated'])
                  }
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  📊 {t('refreshStats')}
                </TerminalButton>
                <TerminalButton
                  onClick={() =>
                    setLogs((prev) => [...prev, '🎨 Theme refreshed'])
                  }
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  🎨 {t('refreshTheme')}
                </TerminalButton>
              </div>
            </div>
          </div>
        </div>

        {/* Activation Modal */}
        {showActivate && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activation-modal-title"
          >
            <div className="bg-black/80 rounded-xl p-4 shadow-glow w-[90vw] max-w-2xl">
              <Suspense fallback={<div>Loading...</div>}>
                <ActivationModal onClose={() => setShowActivate(false)} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard Mode
  return (
    <div
      className="app bg-ocean-gradient min-h-screen p-6"
      role="main"
      id="main-content"
    >
      <div className="max-w-7xl mx-auto">
        <TerminalHeader
          title="RinaWarp Terminal Pro - Dashboard"
          subtitle="System Monitoring & Control Center"
          className="mb-8"
        >
          <div className="flex gap-4 items-center mt-4">
            <TerminalButton
              onClick={() => setShowActivate(true)}
              variant="secondary"
              size="sm"
            >
              🔑 {t('activate')}
            </TerminalButton>
            <TerminalButton
              onClick={() => setIsAgentMode(true)}
              variant="primary"
              size="lg"
            >
              🚀 {t('launchAgent')}
            </TerminalButton>
          </div>
        </TerminalHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title={t('cpuUsage')}
            value={stats.cpu.toFixed(1)}
            unit="%"
            icon="⚡"
            color="cyan"
          />
          <StatCard
            title={t('ramUsage')}
            value={stats.ram.toFixed(1)}
            unit="%"
            icon="🧠"
            color="coral"
          />
          <StatCard
            title={t('network')}
            value={(stats.net / 1024).toFixed(1)}
            unit="KB/s"
            icon="🌐"
            color="seaweed"
          />
        </div>

        {/* Theme Selector */}
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={(theme) => {
            setCurrentTheme(theme);
            applyTheme(theme);
          }}
          className="mb-8"
        />

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl p-6 shadow-glow">
            <h3 className="text-xl font-bold text-mermaid-cyan mb-3">
              🤖 {t('aiFeatures')}
            </h3>
            <p className="text-mermaid-text/80 mb-4">
              Advanced AI integration with predictive completion and command
              explanation.
            </p>
            <TerminalButton variant="primary" size="sm">
              {t('exploreAi')}
            </TerminalButton>
          </div>

          <div className="bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-coral/30 rounded-xl p-6 shadow-coral-glow">
            <h3 className="text-xl font-bold text-mermaid-coral mb-3">
              🎨 {t('themes')}
            </h3>
            <p className="text-mermaid-text/80 mb-4">
              Beautiful underwater themes with glowing effects and animations.
            </p>
            <TerminalButton variant="secondary" size="sm">
              {t('viewThemes')}
            </TerminalButton>
          </div>

          <div className="bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-seaweed/30 rounded-xl p-6 shadow-seaweed-glow">
            <h3 className="text-xl font-bold text-mermaid-seaweed mb-3">
              ⚡ {t('terminal')}
            </h3>
            <p className="text-mermaid-text/80 mb-4">
              Advanced terminal features with XTerm integration and shortcuts.
            </p>
            <TerminalButton variant="accent" size="sm">
              {t('openTerminal')}
            </TerminalButton>
          </div>
        </div>
      </div>

      {/* Activation Modal */}
      {showActivate && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activation-modal-title"
        >
          <div className="bg-black/80 rounded-xl p-4 shadow-glow w-[90vw] max-w-2xl">
            <ActivationModal onClose={() => setShowActivate(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AppEnhanced;
