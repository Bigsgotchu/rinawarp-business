/**
 * RinaWarp User Testing Integration
 * Central coordinator for all user testing components
 */

class UserTestingIntegration {
  constructor() {
    this.isTestingMode = this.detectTestingMode();
    this.components = {};
    this.testingConfig = this.loadTestingConfig();

    if (this.isTestingMode) {
      this.initializeTestingSuite();
    }
  }

  detectTestingMode() {
    return (
      window.location.search.includes('testing=true') ||
      window.location.search.includes('user-testing=true') ||
      localStorage.getItem('enableUserTesting') === 'true' ||
      localStorage.getItem('enableFrictionTracking') === 'true' ||
      localStorage.getItem('enableFeedbackCollection') === 'true'
    );
  }

  loadTestingConfig() {
    return {
      // Enable/disable individual components
      frictionObserver: {
        enabled: true,
        hesitationThreshold: 3000,
        maxInactivityTime: 10000,
      },
      feedbackCollector: {
        enabled: true,
        autoShowDelay: 30000,
        enableEmojiRatings: true,
        enableTextFeedback: true,
      },
      analyticsTracker: {
        enabled: true,
        enablePerformanceTracking: true,
        enableJourneyMapping: true,
        enableRealTimeReporting: true,
      },
      // Testing scenario configuration
      scenarios: {
        autoStart: false,
        guidedMode: true,
        recordSession: true,
      },
      // Integration settings
      integration: {
        enableUIIndicators: true,
        enableDebugPanel: false,
        enableSessionExport: true,
      },
    };
  }

  async initializeTestingSuite() {
    console.log('🚀 Initializing RinaWarp User Testing Suite...');

    try {
      // Initialize components in order
      await this.initializeAnalytics();
      await this.initializeFrictionObserver();
      await this.initializeFeedbackCollector();

      // Set up integration
      this.setupIntegration();
      this.setupUIIndicators();
      this.setupEventHandlers();

      // Add testing capabilities to window for manual control
      this.exposeTestingAPI();

      console.log('✅ User Testing Suite initialized successfully');
      this.notifyTestingReady();
    } catch (error) {
      console.error('❌ Failed to initialize User Testing Suite:', error);
    }
  }

  async initializeAnalytics() {
    if (!this.testingConfig.analyticsTracker.enabled) return;

    console.log('📊 Initializing Analytics Tracker...');

    // Create analytics tracker instance
    this.components.analytics = new AnalyticsTracker({
      enabled: true,
      enablePerformanceTracking: this.testingConfig.analyticsTracker.enablePerformanceTracking,
      enableJourneyMapping: this.testingConfig.analyticsTracker.enableJourneyMapping,
      enableRealTimeReporting: this.testingConfig.analyticsTracker.enableRealTimeReporting,
    });

    // Track testing session start
    this.components.analytics.recordEvent('testing_session_start', {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      config: this.testingConfig,
    });

    console.log('✅ Analytics Tracker ready');
  }

  async initializeFrictionObserver() {
    if (!this.testingConfig.frictionObserver.enabled) return;

    console.log('🔍 Initializing Friction Observer...');

    // Create friction observer instance
    this.components.frictionObserver = new FrictionObserver({
      enabled: true,
      hesitationThreshold: this.testingConfig.frictionObserver.hesitationThreshold,
      maxInactivityTime: this.testingConfig.frictionObserver.maxInactivityTime,
      enableHeatMapping: true,
      enableSessionReplay: true,
      enableUserCommentary: true,
    });

    console.log('✅ Friction Observer ready');
  }

  async initializeFeedbackCollector() {
    if (!this.testingConfig.feedbackCollector.enabled) return;

    console.log('💭 Initializing Feedback Collector...');

    // Create feedback collector instance
    this.components.feedbackCollector = new FeedbackCollector({
      enabled: true,
      autoShowDelay: this.testingConfig.feedbackCollector.autoShowDelay,
      enableEmojiRatings: this.testingConfig.feedbackCollector.enableEmojiRatings,
      enableTextFeedback: this.testingConfig.feedbackCollector.enableTextFeedback,
    });

    console.log('✅ Feedback Collector ready');
  }

  setupIntegration() {
    // Connect components for cross-component communication
    this.setupComponentCommunication();

    // Set up unified event handling
    this.setupUnifiedEventHandling();

    // Initialize testing scenarios if enabled
    if (this.testingConfig.scenarios.autoStart) {
      this.startTestingScenario();
    }
  }

  setupComponentCommunication() {
    // Listen for friction events and trigger contextual feedback
    document.addEventListener('friction_event', (event) => {
      const frictionData = event.detail;

      // Trigger analytics tracking
      if (this.components.analytics) {
        this.components.analytics.trackFriction(
          frictionData.type,
          frictionData.severity,
          frictionData.context,
        );
      }

      // Trigger contextual feedback after delay
      if (this.components.feedbackCollector && frictionData.severity === 'high') {
        setTimeout(() => {
          this.components.feedbackCollector.showContextualFeedback(frictionData);
        }, 5000);
      }
    });

    // Listen for feedback events and track analytics
    document.addEventListener('feedback_submitted', (event) => {
      const feedbackData = event.detail;

      if (this.components.analytics) {
        this.components.analytics.trackApproachabilityFeedback(
          feedbackData.ratings,
          feedbackData.textFeedback,
        );
      }
    });

    // Listen for user actions and track journey
    document.addEventListener('user_action', (event) => {
      const actionData = event.detail;

      if (this.components.analytics) {
        this.components.analytics.trackUserAction(
          actionData.action,
          actionData.element,
          actionData.context,
        );
      }
    });
  }

  setupUnifiedEventHandling() {
    // Wrap key interface interactions for unified tracking
    this.wrapInterfaceInteractions();
  }

  wrapInterfaceInteractions() {
    // Monitor conversation interactions
    this.monitorConversationArea();

    // Monitor action proposal interactions
    this.monitorActionProposals();

    // Monitor terminal interactions
    this.monitorTerminalArea();

    // Monitor navigation and settings
    this.monitorNavigationElements();
  }

  monitorConversationArea() {
    const intentInput = document.getElementById('intentInput');
    const conversationMessages = document.querySelector('.conversation-messages');

    if (intentInput) {
      // Track input patterns and hesitation
      let inputStartTime = null;

      intentInput.addEventListener('focus', () => {
        inputStartTime = Date.now();
        this.trackUserAction('intent_input_focus', '#intentInput');
      });

      intentInput.addEventListener('blur', () => {
        if (inputStartTime) {
          const focusDuration = Date.now() - inputStartTime;
          this.trackUserAction('intent_input_blur', '#intentInput', { focusDuration });
        }
      });

      // Track typing patterns
      let typingTimer = null;
      intentInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          this.trackUserAction('intent_input_idle', '#intentInput');
        }, 2000);
      });
    }

    if (conversationMessages) {
      // Track message sending
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target === intentInput && !e.shiftKey) {
          this.trackUserAction('message_sent', '#intentInput', {
            messageLength: intentInput.value.length,
            timestamp: Date.now(),
          });
        }
      });
    }
  }

  monitorActionProposals() {
    // Monitor action proposal interactions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.action-proposal')) {
        const proposal = e.target.closest('.action-proposal');
        this.trackUserAction('action_proposal_click', '.action-proposal', {
          proposalTitle: proposal.querySelector('.action-title')?.textContent,
          clickType: e.target.className,
        });
      }
    });

    // Monitor confirm/cancel actions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('confirm-btn')) {
        this.trackUserAction('action_confirmed', '.confirm-btn');
      } else if (e.target.classList.contains('cancel-btn')) {
        this.trackUserAction('action_cancelled', '.cancel-btn');
      }
    });
  }

  monitorTerminalArea() {
    const terminalToggle = document.getElementById('terminalToggle');
    const terminalOutput = document.querySelector('.terminal-output');

    if (terminalToggle) {
      terminalToggle.addEventListener('click', () => {
        const isCollapsed = terminalOutput?.classList.contains('collapsed');
        this.trackUserAction('terminal_toggle', '#terminalToggle', {
          action: isCollapsed ? 'expand' : 'collapse',
        });
      });
    }

    // Monitor terminal controls
    document.addEventListener('click', (e) => {
      if (e.target.closest('.terminal-btn')) {
        const btn = e.target.closest('.terminal-btn');
        this.trackUserAction('terminal_control', '.terminal-btn', {
          control: btn.textContent.trim(),
        });
      }
    });
  }

  monitorNavigationElements() {
    // Monitor header buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.header-btn')) {
        const btn = e.target.closest('.header-btn');
        this.trackUserAction('navigation_click', '.header-btn', {
          button: btn.textContent.trim(),
        });
      }
    });

    // Monitor capability chips
    document.addEventListener('click', (e) => {
      if (e.target.closest('.capability-chip')) {
        const chip = e.target.closest('.capability-chip');
        this.trackUserAction('capability_click', '.capability-chip', {
          capability: chip.textContent.trim(),
        });
      }
    });
  }

  setupUIIndicators() {
    if (!this.testingConfig.integration.enableUIIndicators) return;

    // Add testing mode indicator
    this.createTestingIndicator();

    // Add debug panel if enabled
    if (this.testingConfig.integration.enableDebugPanel) {
      this.createDebugPanel();
    }
  }

  createTestingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'testing-mode-indicator';
    indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #ff3fae, #74d1ff);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(255, 63, 174, 0.3);
            animation: pulse 2s infinite;
        `;
    indicator.textContent = '🧪 Testing Mode';

    // Add click handler for testing controls
    indicator.addEventListener('click', () => {
      this.showTestingControls();
    });

    document.body.appendChild(indicator);
  }

  createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'testing-debug-panel';
    debugPanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 16px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 300px;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #333;
        `;

    debugPanel.innerHTML = `
            <div style="margin-bottom: 8px; color: #ff3fae;">🔧 Testing Debug Panel</div>
            <div id="debug-content">
                <div>Session: ${this.components.analytics?.sessionId || 'Not started'}</div>
                <div>Events: <span id="event-count">0</span></div>
                <div>Friction: <span id="friction-count">0</span></div>
                <div>Feedback: <span id="feedback-count">0</span></div>
            </div>
            <div style="margin-top: 8px;">
                <button onclick="window.userTestingSuite.exportData()" style="margin-right: 4px;">Export</button>
                <button onclick="window.userTestingSuite.showReport()">Report</button>
            </div>
        `;

    document.body.appendChild(debugPanel);

    // Update debug panel periodically
    this.updateDebugPanel();
  }

  updateDebugPanel() {
    const eventCountEl = document.getElementById('event-count');
    const frictionCountEl = document.getElementById('friction-count');
    const feedbackCountEl = document.getElementById('feedback-count');

    if (eventCountEl && this.components.analytics) {
      const events = window.analyticsData?.[this.components.analytics.sessionId] || [];
      eventCountEl.textContent = events.length;
    }

    // Continue updating
    setTimeout(() => this.updateDebugPanel(), 1000);
  }

  setupEventHandlers() {
    // Keyboard shortcuts for testing
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+T: Toggle testing controls
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.showTestingControls();
      }

      // Ctrl+Shift+F: Force show feedback
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        this.components.feedbackCollector?.forceShow();
      }

      // Ctrl+Shift+E: Export data
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        this.exportTestingData();
      }
    });
  }

  exposeTestingAPI() {
    // Make testing suite available globally for manual control
    window.userTestingSuite = {
      analytics: this.components.analytics,
      frictionObserver: this.components.frictionObserver,
      feedbackCollector: this.components.feedbackCollector,

      // Control methods
      startScenario: (scenarioName) => this.startTestingScenario(scenarioName),
      showFeedback: () => this.components.feedbackCollector?.forceShow(),
      exportData: () => this.exportTestingData(),
      showReport: () => this.generateTestingReport(),
      getMetrics: () => this.getTestingMetrics(),
    };

    console.log('🔧 Testing API exposed: window.userTestingSuite');
  }

  trackUserAction(action, element, context = {}) {
    // Unified action tracking
    document.dispatchEvent(
      new CustomEvent('user_action', {
        detail: { action, element, context },
      }),
    );
  }

  notifyTestingReady() {
    // Dispatch event that testing is ready
    document.dispatchEvent(
      new CustomEvent('testing_ready', {
        detail: {
          components: Object.keys(this.components),
          config: this.testingConfig,
          sessionId: this.components.analytics?.sessionId,
        },
      }),
    );
  }

  showTestingControls() {
    const modal = this.createTestingControlsModal();
    document.body.appendChild(modal);
    this.showModal(modal);
  }

  createTestingControlsModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            backdrop-filter: blur(5px);
        `;

    const content = document.createElement('div');
    content.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

    content.innerHTML = `
            <h3 style="color: #e5e7eb; margin: 0 0 20px 0;">🧪 Testing Controls</h3>
            <div style="margin-bottom: 16px;">
                <button onclick="window.userTestingSuite.showFeedback()" style="margin-right: 8px;">
                    💭 Show Feedback
                </button>
                <button onclick="window.userTestingSuite.exportData()" style="margin-right: 8px;">
                    📊 Export Data
                </button>
                <button onclick="window.userTestingSuite.showReport()">
                    📋 Generate Report
                </button>
            </div>
            <div style="margin-bottom: 16px;">
                <button onclick="window.userTestingSuite.startScenario('onboarding')" style="margin-right: 8px;">
                    🚀 Start Onboarding Test
                </button>
                <button onclick="window.userTestingSuite.startScenario('task-planning')">
                    📝 Start Task Planning Test
                </button>
            </div>
            <div style="text-align: right;">
                <button onclick="this.closest('.modal').remove()">Close</button>
            </div>
        `;

    modal.appendChild(content);
    return modal;
  }

  showModal(modal) {
    modal.style.opacity = '0';
    modal.querySelector('div').style.transform = 'scale(0.9)';
    modal.querySelector('div').style.opacity = '0';

    setTimeout(() => {
      modal.style.transition = 'opacity 0.3s ease';
      modal.querySelector('div').style.transition = 'all 0.3s ease';
      modal.style.opacity = '1';
      modal.querySelector('div').style.transform = 'scale(1)';
      modal.querySelector('div').style.opacity = '1';
    }, 10);
  }

  startTestingScenario(scenarioName = 'onboarding') {
    console.log(`🎭 Starting testing scenario: ${scenarioName}`);

    if (this.components.analytics) {
      this.components.analytics.recordEvent('scenario_start', {
        scenario: scenarioName,
        timestamp: Date.now(),
      });
    }

    // Trigger scenario-specific setup
    this.setupScenarioInstructions(scenarioName);
  }

  setupScenarioInstructions(scenarioName) {
    const instructions = {
      onboarding:
        'Complete first-time user onboarding. Launch app, read welcome, send first message.',
      'task-planning':
        'Complete basic task planning. Define intent, review proposals, select action.',
      'feature-discovery':
        'Explore interface features. Navigate through different sections and capabilities.',
      'complex-task':
        'Handle complex multi-step task. Set up project, evaluate proposals, manage execution.',
    };

    const instruction = instructions[scenarioName] || 'Complete the assigned testing scenario.';

    // Show scenario instructions
    this.showScenarioModal(scenarioName, instruction);
  }

  showScenarioModal(scenarioName, instruction) {
    const modal = document.createElement('div');
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
        `;

    const content = document.createElement('div');
    content.style.cssText = `
            background: linear-gradient(135deg, #ff3fae, #74d1ff);
            color: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 500px;
            text-align: center;
        `;

    content.innerHTML = `
            <h3>🎭 Testing Scenario: ${scenarioName}</h3>
            <p style="margin: 16px 0;">${instruction}</p>
            <button onclick="this.closest('.modal').remove()" style="background: white; color: #ff3fae; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                Start Testing
            </button>
        `;

    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  exportTestingData() {
    if (!this.components.analytics) {
      console.warn('Analytics not available for export');
      return;
    }

    const report = this.generateTestingReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `rinawarp-testing-report-${Date.now()}.json`;
    link.click();

    console.log('📊 Testing data exported');
  }

  generateTestingReport() {
    const analytics = this.components.analytics;
    const frictionObserver = this.components.frictionObserver;
    const feedbackCollector = this.components.feedbackCollector;

    const report = {
      sessionId: analytics?.sessionId,
      timestamp: new Date().toISOString(),
      testingConfig: this.testingConfig,
      analytics: analytics?.generateSessionReport(),
      friction: frictionObserver
        ? {
            sessionId: frictionObserver.sessionId,
            events: window.sessionEvents || [],
            summary: frictionObserver.generateSessionReport({}),
          }
        : null,
      feedback: feedbackCollector?.getFeedbackData(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    console.log('📋 Testing report generated:', report);
    return report;
  }

  getTestingMetrics() {
    return {
      sessionId: this.components.analytics?.sessionId,
      components: Object.keys(this.components),
      config: this.testingConfig,
      isActive: this.isTestingMode,
    };
  }

  // Cleanup
  destroy() {
    // Clean up all components
    Object.values(this.components).forEach((component) => {
      if (component.destroy) {
        component.destroy();
      }
    });

    // Remove UI indicators
    const indicator = document.getElementById('testing-mode-indicator');
    const debugPanel = document.getElementById('testing-debug-panel');
    if (indicator) indicator.remove();
    if (debugPanel) debugPanel.remove();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize testing suite
  window.userTestingIntegration = new UserTestingIntegration();
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserTestingIntegration;
}
