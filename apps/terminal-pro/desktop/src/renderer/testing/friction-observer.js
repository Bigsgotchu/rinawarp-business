/**
 * RinaWarp Friction Observation System
 * Real-time user behavior tracking for interface friction detection
 */

class FrictionObserver {
  constructor(options = {}) {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isRecording = false;

    // Configuration
    this.config = {
      hesitationThreshold: 3000, // 3 seconds of inactivity
      maxInactivityTime: 10000, // 10 seconds before marking as friction
      retryAttempts: 3, // Number of failed attempts before flagging
      enableHeatMapping: true,
      enableSessionReplay: true,
      enableUserCommentary: true,
      ...options,
    };

    // State tracking
    this.userState = {
      currentFocus: null,
      lastInteraction: Date.now(),
      interactionCount: 0,
      errorCount: 0,
      hesitationEvents: [],
      abandonmentStage: null,
      helpSeekingEvents: [],
    };

    // Element interaction tracking
    this.elementInteractions = new Map();
    this.scrollEvents = [];
    this.clickHeatMap = new Map();

    // Initialize observation
    this.initializeTracking();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeTracking() {
    // Start session recording
    this.startSessionRecording();

    // Set up global event listeners
    this.setupGlobalListeners();

    // Initialize focus tracking
    this.initializeFocusTracking();

    // Start inactivity monitoring
    this.startInactivityMonitoring();

    // Set up heat mapping
    if (this.config.enableHeatMapping) {
      this.initializeHeatMapping();
    }
  }

  startSessionRecording() {
    this.isRecording = true;
    this.recordEvent('session_start', {
      sessionId: this.sessionId,
      timestamp: this.startTime,
      userAgent: navigator.userAgent,
      screenSize: {
        width: screen.width,
        height: screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  setupGlobalListeners() {
    // Track all user interactions
    document.addEventListener('click', (e) => this.handleClick(e), true);
    document.addEventListener('keydown', (e) => this.handleKeydown(e), true);
    document.addEventListener('scroll', (e) => this.handleScroll(e), true);
    document.addEventListener('focus', (e) => this.handleFocus(e), true);
    document.addEventListener('blur', (e) => this.handleBlur(e), true);

    // Track form interactions
    document.addEventListener('input', (e) => this.handleInput(e), true);
    document.addEventListener('change', (e) => this.handleChange(e), true);

    // Track mouse movement for heat mapping
    if (this.config.enableHeatMapping) {
      document.addEventListener('mousemove', (e) => this.handleMouseMove(e), true);
    }

    // Track visibility changes
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

    // Track beforeunload for session end
    window.addEventListener('beforeunload', () => this.endSession());
  }

  initializeFocusTracking() {
    // Track focus on key interactive elements
    const focusableElements = [
      '#intentInput',
      '.intent-btn',
      '.action-proposal',
      '.terminal-toggle',
      '.header-btn',
      '.capability-chip',
    ];

    focusableElements.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        element.addEventListener('focus', (e) => this.trackFocus(e.target));
        element.addEventListener('blur', (e) => this.trackBlur(e.target));
      });
    });
  }

  startInactivityMonitoring() {
    setInterval(() => {
      const timeSinceLastInteraction = Date.now() - this.userState.lastInteraction;

      if (
        timeSinceLastInteraction > this.config.hesitationThreshold &&
        !this.userState.hesitationEvents.length
      ) {
        this.recordHesitation('initial_hesitation', timeSinceLastInteraction);
      } else if (timeSinceLastInteraction > this.config.maxInactivityTime) {
        this.recordHesitation('extended_inactivity', timeSinceLastInteraction);
      }
    }, 1000);
  }

  initializeHeatMapping() {
    // Create heat map overlay
    this.createHeatMapOverlay();
  }

  createHeatMapOverlay() {
    const heatMap = document.createElement('div');
    heatMap.id = 'friction-heatmap';
    heatMap.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.3;
        `;
    document.body.appendChild(heatMap);
  }

  // Event Handlers
  handleClick(event) {
    this.updateLastInteraction();
    const element = this.getElementIdentifier(event.target);

    this.recordEvent('click', {
      element: element,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
    });

    this.updateClickHeatMap(event.clientX, event.clientY);
    this.trackElementInteraction(element, 'click');
  }

  handleKeydown(event) {
    this.updateLastInteraction();

    // Special handling for important keys
    const importantKeys = ['Enter', 'Escape', 'Tab', 'F1', 'F9', 'F10'];

    this.recordEvent('keypress', {
      key: event.key,
      code: event.code,
      important: importantKeys.includes(event.key),
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
    });

    // Track help-seeking behavior
    if (event.key === 'F1' || (event.key === '?' && event.shiftKey)) {
      this.recordHelpSeeking('keyboard_shortcut', 'help');
    }
  }

  handleScroll(event) {
    const scrollData = {
      x: window.scrollX,
      y: window.scrollY,
      maxX: document.documentElement.scrollWidth - window.innerWidth,
      maxY: document.documentElement.scrollHeight - window.innerHeight,
      timestamp: Date.now(),
    };

    this.scrollEvents.push(scrollData);

    // Record significant scroll events
    if (this.scrollEvents.length % 10 === 0) {
      this.recordEvent('scroll_batch', {
        events: this.scrollEvents.slice(-10),
        timestamp: Date.now(),
      });
    }
  }

  handleFocus(event) {
    const element = this.getElementIdentifier(event.target);
    this.userState.currentFocus = element;

    this.recordEvent('focus', {
      element: element,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
    });
  }

  handleBlur(event) {
    const element = this.getElementIdentifier(event.target);

    if (this.userState.currentFocus === element) {
      this.userState.currentFocus = null;
    }

    this.recordEvent('blur', {
      element: element,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
    });
  }

  handleInput(event) {
    this.updateLastInteraction();
    const element = this.getElementIdentifier(event.target);
    const value = event.target.value;

    this.recordEvent('input', {
      element: element,
      value: value,
      valueLength: value.length,
      timestamp: Date.now(),
    });

    // Track input patterns for friction detection
    if (element === '#intentInput') {
      this.analyzeInputPatterns(value);
    }
  }

  handleChange(event) {
    this.updateLastInteraction();
    const element = this.getElementIdentifier(event.target);

    this.recordEvent('change', {
      element: element,
      value: event.target.value,
      timestamp: Date.now(),
    });
  }

  handleMouseMove(event) {
    // Throttle mouse move events to avoid overwhelming data
    if (Math.random() < 0.1) {
      // Sample 10% of mouse moves
      this.recordEvent('mouse_move', {
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      });
    }
  }

  handleVisibilityChange() {
    this.recordEvent('visibility_change', {
      hidden: document.hidden,
      timestamp: Date.now(),
    });
  }

  // Analysis Methods
  analyzeInputPatterns(input) {
    const patterns = {
      backspaces: (input.match(/./g) || []).length < input.length ? 1 : 0,
      pauses: this.detectInputPauses(input),
      corrections: this.detectCorrections(input),
      hesitation: input.length > 0 && input.length < 10 ? 1 : 0,
    };

    if (patterns.pauses > 0 || patterns.hesitation > 0) {
      this.recordEvent('input_pattern', {
        patterns: patterns,
        inputLength: input.length,
        timestamp: Date.now(),
      });
    }
  }

  detectInputPauses(input) {
    // This would need to be implemented with timestamps
    // For now, return 0 as placeholder
    return 0;
  }

  detectCorrections(input) {
    // Detect if user made corrections (simplified version)
    return input.includes('^') || input.includes('||') ? 1 : 0;
  }

  // Friction Detection
  recordHesitation(type, duration) {
    const hesitation = {
      type: type,
      duration: duration,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
      currentFocus: this.userState.currentFocus,
    };

    this.userState.hesitationEvents.push(hesitation);

    this.recordEvent('hesitation', hesitation);

    // Trigger visual feedback for severe hesitations
    if (duration > this.config.maxInactivityTime) {
      this.showHesitationFeedback();
    }
  }

  showHesitationFeedback() {
    // Show subtle hint to user about potential friction
    const hint = document.createElement('div');
    hint.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 63, 174, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            animation: fadeInUp 0.3s ease;
        `;
    hint.textContent = 'Need help? Try asking Rina something like "Create a web app"';

    document.body.appendChild(hint);

    setTimeout(() => {
      hint.remove();
    }, 5000);
  }

  recordHelpSeeking(method, helpType) {
    const helpEvent = {
      method: method,
      type: helpType,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
      currentFocus: this.userState.currentFocus,
    };

    this.userState.helpSeekingEvents.push(helpEvent);

    this.recordEvent('help_seeking', helpEvent);
  }

  recordAbandonment(stage) {
    this.userState.abandonmentStage = stage;

    this.recordEvent('abandonment', {
      stage: stage,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
      totalInteractions: this.userState.interactionCount,
    });
  }

  // Utility Methods
  getElementIdentifier(element) {
    if (!element) return 'unknown';

    // Try to get a unique identifier
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    if (element.tagName) return element.tagName.toLowerCase();

    return 'unknown';
  }

  updateLastInteraction() {
    this.userState.lastInteraction = Date.now();
    this.userState.interactionCount++;
  }

  updateClickHeatMap(x, y) {
    const key = `${Math.floor(x / 50)}_${Math.floor(y / 50)}`; // Grid-based heat map
    this.clickHeatMap.set(key, (this.clickHeatMap.get(key) || 0) + 1);
  }

  trackElementInteraction(element, action) {
    if (!this.elementInteractions.has(element)) {
      this.elementInteractions.set(element, []);
    }

    this.elementInteractions.get(element).push({
      action: action,
      timestamp: Date.now(),
    });
  }

  trackFocus(element) {
    this.recordEvent('element_focus', {
      element: this.getElementIdentifier(element),
      timestamp: Date.now(),
    });
  }

  trackBlur(element) {
    this.recordEvent('element_blur', {
      element: this.getElementIdentifier(element),
      timestamp: Date.now(),
    });
  }

  // Data Recording
  recordEvent(eventType, data) {
    const event = {
      type: eventType,
      sessionId: this.sessionId,
      timestamp: data.timestamp || Date.now(),
      data: data,
    };

    // In a real implementation, this would send to analytics service
    console.log('Friction Event:', event);

    // Store locally for session summary
    this.storeEventLocally(event);
  }

  storeEventLocally(event) {
    if (!window.sessionEvents) {
      window.sessionEvents = [];
    }
    window.sessionEvents.push(event);
  }

  endSession() {
    if (this.isRecording) {
      this.isRecording = false;

      const sessionSummary = {
        sessionId: this.sessionId,
        duration: Date.now() - this.startTime,
        totalInteractions: this.userState.interactionCount,
        hesitationEvents: this.userState.hesitationEvents.length,
        helpSeekingEvents: this.userState.helpSeekingEvents.length,
        abandonmentStage: this.userState.abandonmentStage,
        elementInteractions: Object.fromEntries(this.elementInteractions),
        clickHeatMap: Object.fromEntries(this.clickHeatMap),
        scrollEvents: this.scrollEvents.length,
      };

      this.recordEvent('session_end', sessionSummary);

      // Generate session report
      this.generateSessionReport(sessionSummary);
    }
  }

  generateSessionReport(summary) {
    const report = {
      sessionId: summary.sessionId,
      duration: this.formatDuration(summary.duration),
      interactionDensity: Math.round((summary.totalInteractions / (summary.duration / 1000)) * 60), // per minute
      frictionScore: this.calculateFrictionScore(summary),
      recommendations: this.generateRecommendations(summary),
    };

    console.log('Session Report:', report);

    // In real implementation, this would be sent to analytics dashboard
    return report;
  }

  calculateFrictionScore(summary) {
    let score = 0;

    // Hesitation events add friction points
    score += summary.hesitationEvents * 2;

    // Help seeking indicates friction
    score += summary.helpSeekingEvents * 3;

    // Low interaction density suggests friction
    if (summary.interactionDensity < 5) score += 5;

    // Abandonment indicates high friction
    if (summary.abandonmentStage) score += 10;

    return Math.min(score, 100); // Cap at 100
  }

  generateRecommendations(summary) {
    const recommendations = [];

    if (summary.hesitationEvents > 3) {
      recommendations.push('Consider adding more onboarding guidance');
    }

    if (summary.helpSeekingEvents > 2) {
      recommendations.push('Improve discoverability of help features');
    }

    if (summary.interactionDensity < 5) {
      recommendations.push('Interface may be too complex or intimidating');
    }

    if (summary.abandonmentStage) {
      recommendations.push(`Address friction at ${summary.abandonmentStage} stage`);
    }

    return recommendations;
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize in testing mode or when explicitly enabled
  if (
    window.location.search.includes('testing=true') ||
    localStorage.getItem('enableFrictionTracking') === 'true'
  ) {
    window.frictionObserver = new FrictionObserver({
      enableHeatMapping: true,
      enableSessionReplay: true,
      enableUserCommentary: true,
    });

    console.log('Friction Observer initialized for user testing');
  }
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrictionObserver;
}
