// Enhanced User Onboarding System
// Interactive tutorial system with progressive feature unlocking

export class OnboardingSystem {
  constructor() {
    this.currentStep = 0;
    this.completedSteps = new Set();
    this.userPreferences = {};
    this.tutorialData = this.initializeTutorialData();
    this.isActive = false;
    this.callbacks = {
      onStepComplete: null,
      onTutorialComplete: null,
      onFeatureUnlock: null,
    };
  }

  initializeTutorialData() {
    return {
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to RinaWarp Terminal Pro! 🧜‍♀️',
          description:
            "Let's take a quick tour of your new AI-powered terminal.",
          target: '.terminal-container',
          position: 'center',
          action: 'highlight',
          duration: 3000,
          features: ['basic_terminal'],
        },
        {
          id: 'ai_chat',
          title: 'Meet Rina - Your AI Assistant 🤖',
          description:
            'Try typing a question or command. Rina will help you with anything!',
          target: '.terminal-input',
          position: 'top',
          action: 'pulse',
          duration: 5000,
          features: ['ai_chat', 'voice_commands'],
        },
        {
          id: 'command_blocks',
          title: 'Command Blocks 📦',
          description:
            'Organize your commands with Warp-style blocks. Try running a few commands!',
          target: '.terminal-logs',
          position: 'center',
          action: 'highlight',
          duration: 4000,
          features: ['command_blocks'],
        },
        {
          id: 'themes',
          title: 'Beautiful Themes 🎨',
          description:
            'Customize your terminal with our stunning themes. Click the theme button!',
          target: '.theme-selector',
          position: 'bottom',
          action: 'pulse',
          duration: 3000,
          features: ['themes'],
        },
        {
          id: 'monitoring',
          title: 'Real-time Monitoring 📊',
          description:
            'Track your system performance with live monitoring. Click the monitor button!',
          target: '.monitor-button',
          position: 'top',
          action: 'highlight',
          duration: 4000,
          features: ['monitoring'],
        },
        {
          id: 'advanced_features',
          title: 'Advanced Features ⚡',
          description:
            'Discover split panes, workflows, and more. Press Cmd+K for the command palette!',
          target: '.terminal-container',
          position: 'center',
          action: 'pulse',
          duration: 5000,
          features: ['split_panes', 'workflows', 'command_palette'],
        },
        {
          id: 'upgrade',
          title: 'Unlock Premium Features 💎',
          description:
            'Upgrade to unlock unlimited AI queries, advanced themes, and more!',
          target: '.upgrade-button',
          position: 'bottom',
          action: 'highlight',
          duration: 4000,
          features: ['premium_features'],
        },
      ],
      features: {
        basic_terminal: { unlocked: true, tier: 'free' },
        ai_chat: { unlocked: true, tier: 'free' },
        voice_commands: { unlocked: false, tier: 'basic' },
        command_blocks: { unlocked: true, tier: 'free' },
        themes: { unlocked: true, tier: 'free' },
        monitoring: { unlocked: true, tier: 'free' },
        split_panes: { unlocked: false, tier: 'basic' },
        workflows: { unlocked: false, tier: 'basic' },
        command_palette: { unlocked: true, tier: 'free' },
        premium_features: { unlocked: false, tier: 'professional' },
      },
    };
  }

  startTutorial() {
    try {
      this.isActive = true;
      this.currentStep = 0;
      this.showStep(this.currentStep);
      this.trackEvent('tutorial_started');
    } catch (error) {
      console.error('Failed to start tutorial:', error);
    }
  }

  showStep(stepIndex) {
    if (stepIndex >= this.tutorialData.steps.length) {
      this.completeTutorial();
      return;
    }

    const step = this.tutorialData.steps[stepIndex];
    this.currentStep = stepIndex;

    // Create tutorial overlay
    this.createTutorialOverlay(step);

    // Track step start
    this.trackEvent('tutorial_step_started', { step: step.id });

    // Auto-advance after duration
    setTimeout(() => {
      if (this.isActive && this.currentStep === stepIndex) {
        this.nextStep();
      }
    }, step.duration);
  }

  createTutorialOverlay(step) {
    // Remove existing overlay
    this.removeTutorialOverlay();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
      <div class="tutorial-content">
        <div class="tutorial-header">
          <h3>${step.title}</h3>
          <button class="tutorial-close" onclick="window.onboardingSystem?.skipTutorial()">×</button>
        </div>
        <div class="tutorial-body">
          <p>${step.description}</p>
          <div class="tutorial-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${((this.currentStep + 1) / this.tutorialData.steps.length) * 100}%"></div>
            </div>
            <span class="progress-text">${this.currentStep + 1} of ${this.tutorialData.steps.length}</span>
          </div>
        </div>
        <div class="tutorial-actions">
          <button class="tutorial-skip" onclick="window.onboardingSystem?.skipTutorial()">Skip Tutorial</button>
          <button class="tutorial-next" onclick="window.onboardingSystem?.nextStep()">Next</button>
        </div>
      </div>
    `;

    // Position overlay
    this.positionOverlay(overlay, step);

    // Add to DOM
    document.body.appendChild(overlay);

    // Highlight target element
    this.highlightTarget(step);

    // Store reference
    this.currentOverlay = overlay;
  }

  positionOverlay(overlay, step) {
    const target = document.querySelector(step.target);
    if (!target) {
      overlay.style.position = 'fixed';
      overlay.style.top = '50%';
      overlay.style.left = '50%';
      overlay.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const rect = target.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();

    switch (step.position) {
      case 'top':
        overlay.style.position = 'fixed';
        overlay.style.top = `${rect.top - overlayRect.height - 20}px`;
        overlay.style.left = `${rect.left + rect.width / 2 - overlayRect.width / 2}px`;
        break;
      case 'bottom':
        overlay.style.position = 'fixed';
        overlay.style.top = `${rect.bottom + 20}px`;
        overlay.style.left = `${rect.left + rect.width / 2 - overlayRect.width / 2}px`;
        break;
      case 'left':
        overlay.style.position = 'fixed';
        overlay.style.top = `${rect.top + rect.height / 2 - overlayRect.height / 2}px`;
        overlay.style.left = `${rect.left - overlayRect.width - 20}px`;
        break;
      case 'right':
        overlay.style.position = 'fixed';
        overlay.style.top = `${rect.top + rect.height / 2 - overlayRect.height / 2}px`;
        overlay.style.left = `${rect.right + 20}px`;
        break;
      default: // center
        overlay.style.position = 'fixed';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
    }
  }

  highlightTarget(step) {
    const target = document.querySelector(step.target);
    if (!target) return;

    // Remove existing highlight
    this.removeHighlight();

    // Add highlight class
    target.classList.add('tutorial-highlight');

    // Add animation based on action
    if (step.action === 'pulse') {
      target.classList.add('tutorial-pulse');
    }

    // Store reference
    this.highlightedElement = target;
  }

  removeHighlight() {
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove(
        'tutorial-highlight',
        'tutorial-pulse'
      );
      this.highlightedElement = null;
    }
  }

  removeTutorialOverlay() {
    if (this.currentOverlay) {
      this.currentOverlay.remove();
      this.currentOverlay = null;
    }
    this.removeHighlight();
  }

  nextStep() {
    this.completeStep(this.currentStep);
    this.showStep(this.currentStep + 1);
  }

  completeStep(stepIndex) {
    const step = this.tutorialData.steps[stepIndex];
    this.completedSteps.add(stepIndex);

    // Unlock features
    step.features.forEach((feature) => {
      this.unlockFeature(feature);
    });

    // Track completion
    this.trackEvent('tutorial_step_completed', { step: step.id });

    // Callback
    if (this.callbacks.onStepComplete) {
      this.callbacks.onStepComplete(step);
    }
  }

  skipTutorial() {
    this.isActive = false;
    this.removeTutorialOverlay();
    this.trackEvent('tutorial_skipped');

    // Unlock all free features
    Object.keys(this.tutorialData.features).forEach((feature) => {
      if (this.tutorialData.features[feature].tier === 'free') {
        this.unlockFeature(feature);
      }
    });
  }

  completeTutorial() {
    this.isActive = false;
    this.removeTutorialOverlay();
    this.trackEvent('tutorial_completed');

    // Unlock all features based on user tier
    this.unlockAllFeaturesForTier('free'); // Default to free tier

    // Callback
    if (this.callbacks.onTutorialComplete) {
      this.callbacks.onTutorialComplete();
    }
  }

  unlockFeature(featureName) {
    if (this.tutorialData.features[featureName]) {
      this.tutorialData.features[featureName].unlocked = true;

      // Track feature unlock
      this.trackEvent('feature_unlocked', { feature: featureName });

      // Callback
      if (this.callbacks.onFeatureUnlock) {
        this.callbacks.onFeatureUnlock(featureName);
      }
    }
  }

  unlockAllFeaturesForTier(tier) {
    Object.keys(this.tutorialData.features).forEach((feature) => {
      if (this.tutorialData.features[feature].tier === tier) {
        this.unlockFeature(feature);
      }
    });
  }

  isFeatureUnlocked(featureName) {
    return this.tutorialData.features[featureName]?.unlocked || false;
  }

  trackEvent(eventName, data = {}) {
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'onboarding',
        ...data,
      });
    }

    // Send to internal analytics
    if (window.analytics) {
      window.analytics.track(eventName, {
        category: 'onboarding',
        ...data,
      });
    }
  }

  // Public API
  setCallback(type, callback) {
    this.callbacks[type] = callback;
  }

  getProgress() {
    return {
      currentStep: this.currentStep,
      totalSteps: this.tutorialData.steps.length,
      completedSteps: this.completedSteps.size,
      progress:
        (this.completedSteps.size / this.tutorialData.steps.length) * 100,
    };
  }

  reset() {
    this.currentStep = 0;
    this.completedSteps.clear();
    this.isActive = false;
    this.removeTutorialOverlay();
  }
}

// Global instance
window.onboardingSystem = new OnboardingSystem();
