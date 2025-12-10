/**
 * Simple Feedback System for Soft Launch
 */

class FeedbackSystem {
  constructor() {
    this.feedbackEndpoint = '/api/feedback';
    this.localStorageKey = 'rinawarp-feedback-cache';
  }

  async submitFeedback(message) {
    try {
      // For now, log to console and store locally
      console.log('📝 User Feedback:', message);

      // Store in local storage for now
      const feedbackData = {
        message,
        timestamp: new Date().toISOString(),
        version: '1.0.0-soft-launch'
      };

      // Get existing feedback or create new array
      const existingFeedback = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem(this.localStorageKey, JSON.stringify(existingFeedback));

      // In production, send to backend
      // const response = await fetch(this.feedbackEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message })
      // });

      return { success: true, message: 'Thanks for your feedback! 💖' };
    } catch (error) {
      console.error('Feedback submission failed:', error);
      return { success: false, message: 'Could not submit feedback right now.' };
    }
  }

  getCachedFeedback() {
    return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
  }

  clearFeedbackCache() {
    localStorage.removeItem(this.localStorageKey);
  }
}

// Export for use in main application
window.FeedbackSystem = FeedbackSystem;
window.feedbackSystem = new FeedbackSystem();