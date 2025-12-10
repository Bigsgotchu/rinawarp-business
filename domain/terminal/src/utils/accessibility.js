/**
 * Accessibility utilities for screen reader announcements and keyboard navigation.
 */

/**
 * Announces a message to screen readers using aria-live.
 * @param {string} message - The message to announce.
 * @param {string} priority - 'polite' or 'assertive' (default: 'polite').
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Sets up keyboard navigation for the application.
 * Handles tab navigation, escape key, and focus management.
 */
export function setupKeyboardNavigation() {
  // Focus management for modals and dialogs
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      // Close modals or dialogs on Escape
      const activeModal = document.querySelector(
        '[role="dialog"][aria-hidden="false"]'
      );
      if (activeModal) {
        const closeButton =
          activeModal.querySelector('[aria-label="Close"]') ||
          activeModal.querySelector('button[aria-label*="close"]');
        if (closeButton) {
          closeButton.click();
        }
      }
    }

    // Tab navigation improvements
    if (event.key === 'Tab') {
      // Ensure focus stays within modals
      const activeModal = document.querySelector(
        '[role="dialog"][aria-hidden="false"]'
      );
      if (activeModal && !activeModal.contains(document.activeElement)) {
        const firstFocusable = activeModal.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  // Skip links for navigation
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    transition: top 0.3s;
  `;
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  document.body.insertBefore(skipLink, document.body.firstChild);
}
