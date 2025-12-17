/**
 * RinaWarp Feedback Collection System
 * In-app feedback mechanisms for user testing
 */

class FeedbackCollector {
  constructor(options = {}) {
    this.sessionId = this.generateSessionId();
    this.feedbackQueue = [];
    this.isEnabled = options.enabled || false;

    this.config = {
      autoShowDelay: 30000, // 30 seconds
      followUpDelay: 120000, // 2 minutes
      enableEmojiRatings: true,
      enableTextFeedback: true,
      enableVoiceFeedback: false,
      ...options,
    };

    this.feedbackState = {
      hasShownInitial: false,
      hasShownFollowUp: false,
      currentRating: null,
      feedbackGiven: false,
    };

    this.ratingCategories = [
      { id: 'approachability', label: 'How approachable does Rina feel?', icon: '🤗' },
      { id: 'clarity', label: 'How clear is the interface?', icon: '💡' },
      { id: 'navigation', label: 'How easy is it to find what you need?', icon: '🧭' },
      { id: 'confidence', label: 'How confident do you feel using this?', icon: '💪' },
      { id: 'delight', label: 'How delightful is the experience?', icon: '✨' },
    ];

    this.initializeFeedback();
  }

  generateSessionId() {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeFeedback() {
    if (!this.isEnabled) return;

    // Auto-show feedback after delay
    setTimeout(() => {
      if (!this.feedbackState.hasShownInitial) {
        this.showInitialFeedback();
      }
    }, this.config.autoShowDelay);

    // Set up manual feedback triggers
    this.setupManualTriggers();

    // Monitor user behavior for context-aware feedback
    this.setupBehaviorMonitoring();
  }

  setupManualTriggers() {
    // Add floating feedback button
    this.createFeedbackButton();

    // Keyboard shortcut for quick feedback
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.showQuickFeedback();
      }
    });
  }

  setupBehaviorMonitoring() {
    // Monitor for friction indicators to trigger contextual feedback
    if (window.frictionObserver) {
      // Listen for friction events
      document.addEventListener('friction_detected', (e) => {
        this.handleFrictionDetected(e.detail);
      });
    }

    // Monitor for successful interactions to trigger positive feedback
    this.monitorPositiveInteractions();
  }

  createFeedbackButton() {
    const feedbackBtn = document.createElement('button');
    feedbackBtn.id = 'feedback-trigger';
    feedbackBtn.innerHTML = '💭';
    feedbackBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff3fae, #74d1ff);
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(255, 63, 174, 0.3);
            transition: all 0.3s ease;
            opacity: 0.8;
        `;

    feedbackBtn.addEventListener('mouseenter', () => {
      feedbackBtn.style.transform = 'scale(1.1)';
      feedbackBtn.style.opacity = '1';
    });

    feedbackBtn.addEventListener('mouseleave', () => {
      feedbackBtn.style.transform = 'scale(1)';
      feedbackBtn.style.opacity = '0.8';
    });

    feedbackBtn.addEventListener('click', () => {
      this.showQuickFeedback();
    });

    document.body.appendChild(feedbackBtn);
  }

  showInitialFeedback() {
    this.feedbackState.hasShownInitial = true;

    const modal = this.createFeedbackModal({
      title: 'How is your experience so far?',
      subtitle: "We'd love to hear your thoughts on the new conversation-first interface",
      type: 'initial',
    });

    document.body.appendChild(modal);
    this.showModal(modal);
  }

  showFollowUpFeedback() {
    if (this.feedbackState.hasShownFollowUp) return;

    this.feedbackState.hasShownFollowUp = true;

    const modal = this.createFeedbackModal({
      title: 'Quick check-in',
      subtitle: 'How has your experience been with Rina?',
      type: 'followup',
    });

    document.body.appendChild(modal);
    this.showModal(modal);
  }

  showQuickFeedback() {
    const modal = this.createFeedbackModal({
      title: 'Share your thoughts',
      subtitle: 'Your feedback helps us improve RinaWarp',
      type: 'quick',
    });

    document.body.appendChild(modal);
    this.showModal(modal);
  }

  createFeedbackModal(config) {
    const modal = document.createElement('div');
    modal.className = 'feedback-modal';
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

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;

    modalContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #e5e7eb; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">
                    ${config.title}
                </h2>
                <p style="color: #9ca3af; margin: 0; font-size: 16px;">
                    ${config.subtitle}
                </p>
            </div>

            <div class="feedback-categories" style="margin-bottom: 24px;">
                ${this.ratingCategories
                  .map(
                    (cat) => `
                    <div class="rating-category" style="margin-bottom: 16px;">
                        <label style="display: flex; align-items: center; justify-content: space-between; color: #e5e7eb; font-size: 14px; margin-bottom: 8px;">
                            <span><span style="margin-right: 8px;">${cat.icon}</span>${cat.label}</span>
                        </label>
                        <div class="rating-stars" data-category="${cat.id}" style="display: flex; gap: 4px; justify-content: flex-end;">
                            ${[1, 2, 3, 4, 5]
                              .map(
                                (star) => `
                                <button class="star-btn" data-rating="${star}" data-category="${cat.id}" style="
                                    background: none;
                                    border: none;
                                    font-size: 20px;
                                    cursor: pointer;
                                    color: #374151;
                                    transition: color 0.2s;
                                ">⭐</button>
                            `,
                              )
                              .join('')}
                        </div>
                    </div>
                `,
                  )
                  .join('')}
            </div>

            <div class="feedback-text-section" style="margin-bottom: 24px;">
                <label style="display: block; color: #e5e7eb; font-size: 14px; margin-bottom: 8px;">
                    What could we improve? (optional)
                </label>
                <textarea class="feedback-textarea" style="
                    width: 100%;
                    min-height: 80px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 12px;
                    color: #e5e7eb;
                    font-size: 14px;
                    resize: vertical;
                    font-family: inherit;
                " placeholder="Share any thoughts, concerns, or suggestions..."></textarea>
            </div>

            <div class="feedback-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="feedback-cancel" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #9ca3af;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                ">Skip</button>
                <button class="feedback-submit" style="
                    background: linear-gradient(135deg, #ff3fae, #74d1ff);
                    border: none;
                    color: white;
                    padding: 10px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                ">Submit Feedback</button>
            </div>
        `;

    modal.appendChild(modalContent);

    // Add event listeners
    this.setupModalListeners(modal, config.type);

    return modal;
  }

  setupModalListeners(modal, type) {
    const cancelBtn = modal.querySelector('.feedback-cancel');
    const submitBtn = modal.querySelector('.feedback-submit');
    const textarea = modal.querySelector('.feedback-textarea');
    const starBtns = modal.querySelectorAll('.star-btn');

    // Star rating functionality
    starBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const rating = parseInt(e.target.dataset.rating);
        const category = e.target.dataset.category;
        this.setRating(category, rating);

        // Update star display
        const container = e.target.closest('.rating-stars');
        const stars = container.querySelectorAll('.star-btn');
        stars.forEach((star, index) => {
          star.style.color = index < rating ? '#fbbf24' : '#374151';
        });
      });
    });

    // Cancel functionality
    cancelBtn.addEventListener('click', () => {
      this.hideModal(modal);
      this.recordFeedback('cancelled', type);
    });

    // Submit functionality
    submitBtn.addEventListener('click', () => {
      const feedback = this.collectFeedbackData(modal, type);
      this.submitFeedback(feedback);
      this.hideModal(modal);
      this.showThankYouMessage();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideModal(modal);
        this.recordFeedback('cancelled', type);
      }
    });

    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.hideModal(modal);
        this.recordFeedback('cancelled', type);
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  setRating(category, rating) {
    if (!this.feedbackState.currentRating) {
      this.feedbackState.currentRating = {};
    }
    this.feedbackState.currentRating[category] = rating;
  }

  collectFeedbackData(modal, type) {
    const ratings = this.feedbackState.currentRating || {};
    const textFeedback = modal.querySelector('.feedback-textarea').value;

    return {
      sessionId: this.sessionId,
      type: type,
      timestamp: Date.now(),
      ratings: ratings,
      textFeedback: textFeedback.trim(),
      overallRating: this.calculateOverallRating(ratings),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  calculateOverallRating(ratings) {
    const values = Object.values(ratings);
    if (values.length === 0) return null;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }

  submitFeedback(feedback) {
    // Store locally
    this.feedbackQueue.push(feedback);
    this.feedbackState.feedbackGiven = true;

    // Send to analytics (in real implementation)
    this.sendToAnalytics(feedback);

    // Log for development
    console.log('Feedback submitted:', feedback);
  }

  sendToAnalytics(feedback) {
    // In real implementation, this would send to your analytics service
    // Example: Google Analytics, PostHog, Mixpanel, etc.

    // For now, we'll just store it locally
    if (!window.userFeedbackData) {
      window.userFeedbackData = [];
    }
    window.userFeedbackData.push(feedback);
  }

  showModal(modal) {
    // Animate in
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

  hideModal(modal) {
    modal.style.transition = 'opacity 0.3s ease';
    modal.querySelector('div').style.transition = 'all 0.3s ease';
    modal.style.opacity = '0';
    modal.querySelector('div').style.transform = 'scale(0.9)';
    modal.querySelector('div').style.opacity = '0';

    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  showThankYouMessage() {
    const thankYou = document.createElement('div');
    thankYou.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            z-index: 10002;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            animation: fadeInUp 0.5s ease;
        `;
    thankYou.textContent = 'Thank you for your feedback! 🙏';

    document.body.appendChild(thankYou);

    setTimeout(() => {
      thankYou.remove();
    }, 3000);
  }

  recordFeedback(action, type, details = {}) {
    const event = {
      action: action,
      type: type,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      details: details,
    };

    console.log('Feedback event:', event);
  }

  handleFrictionDetected(frictionData) {
    // Show contextual feedback if user seems confused
    if (frictionData.severity === 'high' && !this.feedbackState.feedbackGiven) {
      setTimeout(() => {
        this.showContextualFeedback(frictionData);
      }, 5000);
    }
  }

  showContextualFeedback(frictionData) {
    const modal = this.createFeedbackModal({
      title: 'Having trouble?',
      subtitle: "We noticed you might need some help. What's confusing you?",
      type: 'contextual',
    });

    document.body.appendChild(modal);
    this.showModal(modal);
  }

  monitorPositiveInteractions() {
    // Monitor for successful task completion to trigger positive feedback
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check for successful interactions
          const newMessages = mutation.target.querySelectorAll('.message.rina');
          if (newMessages.length > 0) {
            // User successfully received a response from Rina
            this.triggerPositiveFeedback();
          }
        }
      });
    });

    const conversationArea = document.querySelector('.conversation-messages');
    if (conversationArea) {
      observer.observe(conversationArea, { childList: true });
    }
  }

  triggerPositiveFeedback() {
    // Show positive feedback prompt
    if (Math.random() < 0.3 && !this.feedbackState.feedbackGiven) {
      // 30% chance
      setTimeout(() => {
        this.showPositiveFeedback();
      }, 10000); // 10 seconds after successful interaction
    }
  }

  showPositiveFeedback() {
    const modal = this.createFeedbackModal({
      title: 'How is Rina working for you?',
      subtitle: "We'd love to know if the conversation approach is helpful",
      type: 'positive',
    });

    document.body.appendChild(modal);
    this.showModal(modal);
  }

  // Public methods for external control
  enable() {
    this.isEnabled = true;
    this.initializeFeedback();
  }

  disable() {
    this.isEnabled = false;
    // Clean up any existing feedback elements
    const existingModal = document.querySelector('.feedback-modal');
    const existingButton = document.querySelector('#feedback-trigger');
    if (existingModal) existingModal.remove();
    if (existingButton) existingButton.remove();
  }

  forceShow() {
    this.showQuickFeedback();
  }

  getFeedbackData() {
    return {
      sessionId: this.sessionId,
      queue: this.feedbackQueue,
      state: this.feedbackState,
    };
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize in testing mode or when explicitly enabled
  if (
    window.location.search.includes('testing=true') ||
    localStorage.getItem('enableFeedbackCollection') === 'true' ||
    localStorage.getItem('enableUserTesting') === 'true'
  ) {
    window.feedbackCollector = new FeedbackCollector({
      enabled: true,
      autoShowDelay: 30000,
      enableEmojiRatings: true,
      enableTextFeedback: true,
    });

    console.log('Feedback Collector initialized for user testing');
  }
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeedbackCollector;
}
