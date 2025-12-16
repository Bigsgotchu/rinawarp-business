// Frontend-only RinaWarp Terminal Pro with Lazy Loading
// Optimized for browser with no backend dependencies

import React, { useState, useEffect, useRef } from 'react';
import { applyTheme, initTheme } from './themeManager';
import { LazyWrapper } from './components/LazyWrapper';
import UnifiedMonitor from './monitoring/unified-monitor';
import AlertSystem from './monitoring/alert-system';
import TerminalIntegration from './terminal-integration';
import { OnboardingSystem } from './onboarding/OnboardingSystem';
import { AdvancedPerformanceMonitor } from './monitoring/AdvancedPerformanceMonitor';
import { EnterpriseManager } from './enterprise/EnterpriseManager';
import { IntegrationManager } from './integrations/IntegrationManager';
import { DocumentationSystem } from './docs/DocumentationSystem';
import UnifiedAISystem from './ai/unified-ai-system.js';
import RinaAIIntegration from './ai/rina-ai-integration.js';
import AIConfigPanel from './components/AIConfigPanel.jsx';
import WarpStyleTerminal from './components/WarpStyleTerminal.jsx';
import AdvancedWarpTerminal from './components/AdvancedWarpTerminal.jsx';
import { unlockApplication, checkUnlockStatus } from './unlock.js';
import UpdateManager from './auto-update/UpdateManager.js';
import './onboarding/OnboardingStyles.css';
import { FloatingBubbles } from './components/TerminalComponents';

function AppFrontend() {
  // Core state
  const [logs, setLogs] = useState([
    'Welcome to RinaWarp Terminal Pro - AI-Powered Terminal Emulator!',
    "Ask me anything - I'm your AI coding assistant!",
    'Type !ai-providers to see all available AI models',
    "Try: 'help me with git' or 'explain this code'",
    'Type !help to see all available commands',
    "Run './setup-ai.sh' to start the AI backend server",
  ]);
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({ cpu: 0, ram: 0, net: 0 });
  const [isAgentMode, setIsAgentMode] = useState(true); // AI Terminal is the main mode
  const [aiProvider, setAiProvider] = useState('groq');
  const [aiMode, setAiMode] = useState('hybrid');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('mermaid-enhanced');
  const [terminalComponents, setTerminalComponents] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monitor, setMonitor] = useState(null);
  const [alertSystem, setAlertSystem] = useState(null);
  const [monitoringData, setMonitoringData] = useState(null);
  const [terminalIntegration, setTerminalIntegration] = useState(null);
  const [onboardingSystem, setOnboardingSystem] = useState(null);
  const [performanceMonitor, setPerformanceMonitor] = useState(null);
  const [enterpriseManager, setEnterpriseManager] = useState(null);
  const [integrationManager, setIntegrationManager] = useState(null);
  const [documentationSystem, setDocumentationSystem] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [unifiedAISystem, setUnifiedAISystem] = useState(null);
  const [rinaAI, setRinaAI] = useState(null);
  const [updateManager, setUpdateManager] = useState(null);
  const terminalContainerRef = useRef(null);

  useEffect(() => {
    // UNLOCK APPLICATION FOR PERSONAL USE
    unlockApplication();

    initTheme();
    applyTheme(currentTheme);

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
          FloatingBubbles,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load terminal components:', error);
        setIsLoading(false);
      }
    };

    loadTerminalComponents();

    // Initialize all new systems
    const initializeSystems = () => {
      // Initialize Onboarding System
      const onboarding = new OnboardingSystem();
      setOnboardingSystem(onboarding);

      // Initialize Advanced Performance Monitor
      const perfMonitor = new AdvancedPerformanceMonitor();
      setPerformanceMonitor(perfMonitor);

      // Initialize Enterprise Manager
      const enterprise = new EnterpriseManager();
      setEnterpriseManager(enterprise);

      // Initialize Integration Manager
      const integrations = new IntegrationManager();
      setIntegrationManager(integrations);

      // Initialize Documentation System
      const docs = new DocumentationSystem();
      setDocumentationSystem(docs);

      // Initialize Unified AI System
      const aiSystem = new UnifiedAISystem();
      setUnifiedAISystem(aiSystem);
      console.log('🧠 Unified AI system initialized');

      // Initialize Rina AI Integration
      const rinaSystem = new RinaAIIntegration();
      setRinaAI(rinaSystem);
      console.log('🧜‍♀️ Rina AI system initialized');

      // Initialize Update Manager
      const updateMgr = new UpdateManager();
      setUpdateManager(updateMgr);

      // Start auto-update if in personal mode
      if (updateMgr.isPersonal) {
        updateMgr.startAutoUpdate();
        console.log('🔄 Auto-update system started for personal development');
      }

      // Check if first-time user
      const isFirstTime = !localStorage.getItem(
        'rinawarp_onboarding_completed'
      );
      if (isFirstTime) {
        setShowOnboarding(true);
      }
    };

    initializeSystems();

    // Initialize monitoring system
    const terminalInterface = {
      output: (message, type = 'info') => {
        setLogs((prev) => [...prev, message]);
      },
      addCommand: (command, handler) => {
        // Commands will be handled in handleCommand
      },
      addHelp: (command, description) => {
        // Help will be integrated into help system
      },
    };

    const monitorInstance = new UnifiedMonitor(terminalInterface);
    const alertInstance = new AlertSystem(terminalInterface);

    setMonitor(monitorInstance);
    setAlertSystem(alertInstance);

    // Start monitoring
    monitorInstance.startMonitoring();

    // Initialize terminal integration
    if (terminalContainerRef.current) {
      const terminal = new TerminalIntegration(terminalContainerRef.current, {
        terminal: {
          theme: currentTheme,
        },
      });
      setTerminalIntegration(terminal);
    }

    // Mock system stats
    const interval = setInterval(() => {
      setStats({
        cpu: Math.random() * 100,
        ram: Math.random() * 100,
        net: Math.floor(Math.random() * 10000),
      });

      // Update monitoring data
      if (monitorInstance) {
        const data = monitorInstance.getStats();
        setMonitoringData(data);

        // Check alerts
        if (alertInstance) {
          alertInstance.checkThresholds(data);
        }
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (monitorInstance) {
        monitorInstance.stopMonitoring();
      }
    };
  }, [currentTheme]);

  // Handle command input
  const handleCommand = async (command) => {
    if (!command.trim()) return;

    // Add command to logs without prefix (Warp style)
    setLogs((prev) => [...prev, command]);
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
            '!ai <provider> - Switch AI provider (groq, openai, ollama, huggingface, cohere)',
            '!ai-providers - Show all available AI providers',
            '!ai-config - Open AI configuration panel',
            '!ai-mode - Show available AI modes',
            '!ai-mode <mode> - Switch AI mode (hybrid, llm, learning, local)',
            '!test-ai - Test AI backend connection',
            '!test-rina - Test Rina AI integration',
            '!chat <message> - Chat with Rina directly',
            '!monitor - Show monitoring dashboard',
            '!monitor-start - Start monitoring',
            '!monitor-stop - Stop monitoring',
            '!monitor-status - Show current status',
            '!monitor-alerts - Show active alerts',
            '!monitor-stripe - Show Stripe status',
            '!alerts-config - Show alert configuration',
            '!alerts-test - Test alert system',
            '!onboarding - Start tutorial',
            '!docs - Show documentation',
            '!performance - Show performance metrics',
            '!enterprise - Show enterprise status',
            '!integrations - Show integrations',
            '!update - Check for updates',
            '!update-push - Push personal changes to production',
            '!update-status - Show update status',
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
        case 'monitor':
          if (monitor) {
            monitor.showDashboard();
          } else {
            setLogs((prev) => [
              ...prev,
              '❌ Monitoring system not initialized',
            ]);
          }
          break;
        case 'monitor-start':
          if (monitor) {
            monitor.startMonitoring();
          } else {
            setLogs((prev) => [
              ...prev,
              '❌ Monitoring system not initialized',
            ]);
          }
          break;
        case 'monitor-stop':
          if (monitor) {
            monitor.stopMonitoring();
          } else {
            setLogs((prev) => [
              ...prev,
              '❌ Monitoring system not initialized',
            ]);
          }
          break;
        case 'monitor-status':
          if (monitor) {
            monitor.showStatus();
          } else {
            setLogs((prev) => [
              ...prev,
              '❌ Monitoring system not initialized',
            ]);
          }
          break;
        case 'monitor-alerts':
          if (monitor) {
            monitor.showAlerts();
          } else {
            setLogs((prev) => [
              ...prev,
              '❌ Monitoring system not initialized',
            ]);
          }
          break;
        case 'monitor-stripe':
          if (monitor) {
            monitor.showStripeStatus();
          } else {
            setLogs((prev) => [
              ...prev,
              '❌ Monitoring system not initialized',
            ]);
          }
          break;
        case 'alerts-config':
          if (alertSystem) {
            alertSystem.showConfig();
          } else {
            setLogs((prev) => [...prev, '❌ Alert system not initialized']);
          }
          break;
        case 'alerts-test':
          if (alertSystem) {
            alertSystem.testAlerts();
          } else {
            setLogs((prev) => [...prev, '❌ Alert system not initialized']);
          }
          break;
        case 'onboarding':
          setShowOnboarding(true);
          if (onboardingSystem) {
            onboardingSystem.startTutorial();
          }
          break;
        case 'docs':
          setShowDocumentation(true);
          break;
        case 'performance':
          if (performanceMonitor) {
            const report = performanceMonitor.getPerformanceReport();
            setLogs((prev) => [
              ...prev,
              `📊 Performance Score: ${report.score}/100`,
              `⚡ Load Time: ${report.metrics.performance.loadTime}ms`,
              `🧠 Memory Usage: ${report.metrics.performance.memoryUsage?.percentage || 0}%`,
              `❌ Error Rate: ${report.metrics.performance.errorRate}`,
            ]);
          }
          break;
        case 'enterprise':
          if (enterpriseManager) {
            const status = enterpriseManager.getEnterpriseStatus();
            setLogs((prev) => [
              ...prev,
              `🏢 Enterprise Features: ${Object.keys(status.features).filter((f) => status.features[f]).length} enabled`,
              `👥 Team Members: ${status.team.memberCount}`,
              `🔐 SSO: ${status.sso ? 'Configured' : 'Not configured'}`,
              `📋 Audit Events: ${status.auditLog.totalEvents}`,
            ]);
          }
          break;
        case 'integrations':
          if (integrationManager) {
            const enabled = integrationManager.getEnabledIntegrations();
            setLogs((prev) => [
              ...prev,
              `🔌 Enabled Integrations: ${enabled.length}`,
              `📋 Available: ${integrationManager.getAvailableIntegrations().length}`,
            ]);
          }
          break;
        case 'update':
          if (updateManager) {
            setLogs((prev) => [...prev, '🔄 Checking for updates...']);
            updateManager
              .checkForUpdates()
              .then((updateInfo) => {
                if (updateInfo) {
                  setLogs((prev) => [
                    ...prev,
                    `✅ Update available: v${updateInfo.newVersion}`,
                    `📦 Size: ${Math.round(updateInfo.updateSize / 1024)}KB`,
                    `🆕 Features: ${updateInfo.features.join(', ')}`,
                    `⚠️  Critical: ${updateInfo.critical ? 'Yes' : 'No'}`,
                  ]);
                } else {
                  setLogs((prev) => [...prev, "✅ You're up to date!"]);
                }
              })
              .catch((error) => {
                setLogs((prev) => [
                  ...prev,
                  `❌ Update check failed: ${error.message}`,
                ]);
              });
          } else {
            setLogs((prev) => [...prev, '❌ Update manager not initialized']);
          }
          break;
        case 'update-push':
          if (updateManager) {
            setLogs((prev) => [
              ...prev,
              '📤 Pushing personal changes to production...',
            ]);
            updateManager
              .pushPersonalChanges()
              .then((result) => {
                setLogs((prev) => [
                  ...prev,
                  '✅ Changes pushed successfully!',
                  `📊 New version: ${result.newVersion}`,
                  `📁 Processed: ${result.processedChanges} changes`,
                ]);
              })
              .catch((error) => {
                setLogs((prev) => [
                  ...prev,
                  `❌ Push failed: ${error.message}`,
                ]);
              });
          } else {
            setLogs((prev) => [...prev, '❌ Update manager not initialized']);
          }
          break;
        case 'update-status':
          if (updateManager) {
            const status = updateManager.getUpdateStatus();
            setLogs((prev) => [
              ...prev,
              '📊 Update Status:',
              `🔢 Current Version: ${status.currentVersion}`,
              `🔓 Personal Mode: ${status.isPersonal ? 'Yes' : 'No'}`,
              `🔄 Auto-Update: ${status.autoUpdateEnabled ? 'Enabled' : 'Disabled'}`,
              `⏰ Last Check: ${status.lastCheck}`,
            ]);
          } else {
            setLogs((prev) => [...prev, '❌ Update manager not initialized']);
          }
          break;
        case 'ai-providers':
          setLogs((prev) => [
            ...prev,
            '🤖 Available AI Providers:',
            `• Groq (Fast, Premium) - Current: ${aiProvider === 'groq' ? '✅' : '❌'}`,
            `• OpenAI (Advanced, Premium) - Current: ${aiProvider === 'openai' ? '✅' : '❌'}`,
            `• Ollama (Local, Free) - Current: ${aiProvider === 'ollama' ? '✅' : '❌'}`,
            `• Hugging Face (Free Tier) - Current: ${aiProvider === 'huggingface' ? '✅' : '❌'}`,
            `• Cohere (Free Tier) - Current: ${aiProvider === 'cohere' ? '✅' : '❌'}`,
            "💡 Use '!ai <provider>' to switch",
          ]);
          break;
        case 'ai-config':
          setShowAIConfig(true);
          break;
        case 'ai-mode':
          if (unifiedAISystem) {
            const modes = unifiedAISystem.getAvailableModes();
            setLogs((prev) => [
              ...prev,
              '🧠 Available AI Modes:',
              ...modes.map((mode) => `• ${mode.name}: ${mode.description}`),
              "💡 Use '!ai-mode <mode>' to switch",
            ]);
          }
          break;
        case 'test-ai':
          setLogs((prev) => [
            ...prev,
            '🧪 Testing AI backend connection...',
            '📡 Checking server at https://rinawarptech.com...',
          ]);

          // Test AI backend
          fetch('https://rinawarptech.com/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: 'Hello! Test connection.',
              provider: 'groq',
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              setLogs((prev) => [
                ...prev,
                '✅ AI Backend Connected!',
                `🤖 Response: ${data.response}`,
                `🔧 Provider: ${data.provider || 'fallback'}`,
                `⚡ Status: ${data.type === 'ai' ? 'Working' : 'Fallback Mode'}`,
              ]);
            })
            .catch((error) => {
              setLogs((prev) => [
                ...prev,
                '❌ AI Backend Not Available',
                "💡 Run './setup-ai.sh' to start the server",
                `🔧 Error: ${error.message}`,
              ]);
            });
          break;
        case 'test-rina':
          if (rinaAI) {
            setLogs((prev) => [...prev, '🧜‍♀️ Testing Rina AI integration...']);
            rinaAI.testConnection().then((result) => {
              if (result.success) {
                setLogs((prev) => [
                  ...prev,
                  '✅ Rina AI is working!',
                  `💖 Response: ${result.response}`,
                  `🧜‍♀️ Personality: ${result.rinaPersonality ? 'Active' : 'Basic'}`,
                ]);
              } else {
                setLogs((prev) => [
                  ...prev,
                  `❌ Rina AI test failed: ${result.error}`,
                  `🧜‍♀️ Personality: ${result.rinaPersonality ? 'Active' : 'Basic'}`,
                ]);
              }
            });
          } else {
            setLogs((prev) => [...prev, '❌ Rina AI system not initialized']);
          }
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
          } else if (specialCommand.startsWith('ai-mode ')) {
            const mode = specialCommand.split(' ')[1];
            if (unifiedAISystem) {
              const success = unifiedAISystem.setMode(mode);
              if (success) {
                setLogs((prev) => [...prev, `🧠 AI mode changed to ${mode}`]);
              } else {
                setLogs((prev) => [...prev, `❌ Invalid AI mode: ${mode}`]);
              }
            }
          } else if (specialCommand.startsWith('chat ')) {
            const message = specialCommand.substring(5); // Remove 'chat ' prefix
            if (rinaAI && message.trim()) {
              setLogs((prev) => [...prev, `You: ${message}`]);
              rinaAI
                .chat(message, { preferredProvider: aiProvider })
                .then((response) => {
                  setLogs((prev) => [
                    ...prev,
                    `${response.emoji} Rina (${response.mood}): ${response.message}`,
                    `🔧 Provider: ${response.provider} | Energy: ${response.energy}/10`,
                  ]);
                })
                .catch((error) => {
                  setLogs((prev) => [
                    ...prev,
                    `❌ Chat error: ${error.message}`,
                  ]);
                });
            } else if (!message.trim()) {
              setLogs((prev) => [...prev, '❓ Usage: !chat <your message>']);
            } else {
              setLogs((prev) => [...prev, '❌ Rina AI not available']);
            }
          } else {
            setLogs((prev) => [
              ...prev,
              `❓ Unknown command: ${specialCommand}`,
            ]);
          }
      }
      return;
    }

    // Simulate AI response (Warp style - no prefix)
    const responses = [
      'I understand you want to run that command!',
      "That's an interesting command you're trying to execute.",
      'Let me help you with that command execution.',
      'I can assist you with terminal operations!',
      'Command processed successfully!',
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    setLogs((prev) => [...prev, response]);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  // Loading fallback
  if (isLoading || !terminalComponents) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-pink-400 mb-2">
            RinaWarp Terminal Pro
          </h2>
          <p className="text-blue-300">Loading optimized frontend...</p>
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
            subtitle="AI-Powered Terminal Emulator"
            className="mb-6"
          >
            <div className="flex gap-2">
              <TerminalButton
                onClick={() => setIsAgentMode(false)}
                variant="ghost"
                size="sm"
              >
                📊 Bonus Features
              </TerminalButton>
              <div className="flex items-center gap-3">
                {/* AI Provider Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-300">AI Provider:</label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-pink-400"
                  >
                    <option value="groq">🤖 Groq (Fast)</option>
                    <option value="openai">🧠 OpenAI (Advanced)</option>
                    <option value="anthropic">🤖 Claude (Safe)</option>
                    <option value="google">🔍 Gemini (Efficient)</option>
                    <option value="ollama">🏠 Ollama (Local)</option>
                    <option value="huggingface">🤗 Hugging Face (Free)</option>
                    <option value="cohere">⚡ Cohere (Free)</option>
                  </select>
                </div>

                {/* AI Mode Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-300">AI Mode:</label>
                  <select
                    value={aiMode}
                    onChange={(e) => {
                      setAiMode(e.target.value);
                      if (unifiedAISystem) {
                        unifiedAISystem.setMode(e.target.value);
                      }
                    }}
                    className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-pink-400"
                  >
                    <option value="hybrid">🔄 Hybrid (AI + Learning)</option>
                    <option value="llm">🤖 LLM Only</option>
                    <option value="learning">🧠 Learning Only</option>
                    <option value="local">🏠 Local Only</option>
                  </select>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-300">Theme:</label>
                  <select
                    value={currentTheme}
                    onChange={(e) => setCurrentTheme(e.target.value)}
                    className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-pink-400"
                  >
                    <option value="mermaid-enhanced">
                      🧜‍♀️ Mermaid Enhanced
                    </option>
                    <option value="ocean-blue">🌊 Ocean Blue</option>
                    <option value="dark-matrix">🖤 Dark Matrix</option>
                    <option value="cyberpunk">⚡ Cyberpunk</option>
                    <option value="professional">💼 Professional</option>
                    <option value="gaming">🎮 Gaming</option>
                    <option value="nature">🌿 Nature</option>
                    <option value="space">🚀 Space</option>
                  </select>
                </div>

                {/* Voice Toggle */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-300">Voice:</label>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      voiceEnabled
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {voiceEnabled ? '🎤 On' : '🎤 Off'}
                  </button>
                </div>

                {/* AI Config Button */}
                <TerminalButton
                  onClick={() => setShowAIConfig(true)}
                  variant="primary"
                  size="sm"
                >
                  ⚙️ Config
                </TerminalButton>
              </div>
            </div>
          </TerminalHeader>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Advanced Warp-Style Terminal Interface */}
              <AdvancedWarpTerminal
                onCommand={handleCommand}
                logs={logs}
                placeholder="Ask Rina anything or run a command... (Try: 'help me with git' or '!ai-providers')"
                className="h-[600px]"
              />
            </div>

            <div className="space-y-4">
              {/* AI Quick Actions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-lg font-bold text-pink-400 mb-3">
                  🤖 AI Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <TerminalButton
                    onClick={() => setInput('help me with git commands')}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    📝 Git Help
                  </TerminalButton>
                  <TerminalButton
                    onClick={() => setInput('explain this code')}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    💻 Code Review
                  </TerminalButton>
                  <TerminalButton
                    onClick={() => setInput('!test-ai')}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    🧪 Test AI
                  </TerminalButton>
                  <TerminalButton
                    onClick={() => setInput('!monitor')}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    📊 System Status
                  </TerminalButton>
                  <TerminalButton
                    onClick={() => setShowAIConfig(true)}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    ⚙️ AI Config
                  </TerminalButton>
                  <TerminalButton
                    onClick={() => setInput('!test-rina')}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    🧜‍♀️ Test Rina
                  </TerminalButton>
                  <TerminalButton
                    onClick={() => setInput('!chat Hello Rina!')}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    💬 Chat
                  </TerminalButton>
                </div>
              </div>

              {/* Quick Settings Panel */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-3">
                  ⚡ Quick Settings
                </h3>
                <div className="space-y-3">
                  {/* Clear Terminal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      Clear Terminal
                    </span>
                    <TerminalButton
                      onClick={() => setLogs([])}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      🗑️ Clear
                    </TerminalButton>
                  </div>

                  {/* Test AI Connection */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      Test AI Connection
                    </span>
                    <TerminalButton
                      onClick={() => {
                        setLogs((prev) => [
                          ...prev,
                          '🧪 Testing AI connection...',
                        ]);
                        fetch('https://rinawarptech.com/api/ai', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            prompt: 'Hello! Test connection.',
                            provider: aiProvider,
                          }),
                        })
                          .then((response) => response.json())
                          .then((data) => {
                            setLogs((prev) => [
                              ...prev,
                              `✅ AI Connected! Response: ${data.response.substring(0, 50)}...`,
                              `🔧 Provider: ${data.provider || 'fallback'}`,
                            ]);
                          })
                          .catch((error) => {
                            setLogs((prev) => [
                              ...prev,
                              `❌ AI Not Available: ${error.message}`,
                              "💡 Run './setup-ai.sh' to start the server",
                            ]);
                          });
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      🧪 Test
                    </TerminalButton>
                  </div>

                  {/* Show System Stats */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">System Stats</span>
                    <TerminalButton
                      onClick={() =>
                        setLogs((prev) => [
                          ...prev,
                          `💻 CPU: ${stats.cpu.toFixed(1)}%`,
                          `🧠 Memory: ${stats.ram.toFixed(1)}%`,
                          `🌐 Network: ${stats.net} B/s`,
                        ])
                      }
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      📊 Stats
                    </TerminalButton>
                  </div>
                </div>
              </div>

              {/* System Stats */}
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
              <TerminalButton
                onClick={() => handleCommand('!monitor')}
                variant="ghost"
                size="sm"
              >
                🚨 Monitor
              </TerminalButton>
              <TerminalButton
                onClick={() => handleCommand('!onboarding')}
                variant="ghost"
                size="sm"
              >
                🎓 Tutorial
              </TerminalButton>
              <TerminalButton
                onClick={() => handleCommand('!docs')}
                variant="ghost"
                size="sm"
              >
                📚 Docs
              </TerminalButton>
              <TerminalButton
                onClick={() => handleCommand('!performance')}
                variant="ghost"
                size="sm"
              >
                📊 Performance
              </TerminalButton>
              <TerminalButton
                onClick={() => handleCommand('!enterprise')}
                variant="ghost"
                size="sm"
              >
                🏢 Enterprise
              </TerminalButton>
              <TerminalButton
                onClick={() => handleCommand('!integrations')}
                variant="ghost"
                size="sm"
              >
                🔌 Integrations
              </TerminalButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-6">
          <TerminalHeader
            title="📊 Bonus Features"
            subtitle="Monitoring, Analytics & Advanced Tools"
            className="mb-6"
          >
            <TerminalButton
              onClick={() => setIsAgentMode(true)}
              variant="primary"
              size="sm"
            >
              🧜‍♀️ AI Terminal
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

          {monitoringData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Requests"
                value={monitoringData.totalRequests}
                icon="📊"
                color="blue"
              />
              <StatCard
                title="Payments"
                value={monitoringData.successfulPayments}
                icon="💳"
                color="green"
              />
              <StatCard
                title="Errors"
                value={monitoringData.errors}
                icon="❌"
                color="red"
              />
              <StatCard
                title="Stripe Status"
                value={monitoringData.stripeStatus.toUpperCase()}
                icon="💳"
                color={
                  monitoringData.stripeStatus === 'healthy' ? 'green' : 'red'
                }
              />
            </div>
          )}

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

      {/* AI Configuration Panel */}
      <AIConfigPanel
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
        aiSystem={unifiedAISystem}
      />
    </div>
  );
}

export default AppFrontend;
