import React, { createContext, useContext, useEffect } from 'react';
import {
  announceToScreenReader,
  setupKeyboardNavigation,
} from '../utils/accessibility';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  useEffect(() => {
    setupKeyboardNavigation();
  }, []);

  const announce = (message, priority = 'polite') => {
    announceToScreenReader(message, priority);
  };

  const focusElement = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
    }
  };

  const trapFocus = (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  };

  const value = {
    announce,
    focusElement,
    trapFocus,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
