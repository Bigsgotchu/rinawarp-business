// Simple error monitoring setup for RinaWarp
// Privacy-friendly error tracking without personal data

(function () {
  'use strict';

  // Error tracking function
  function trackError(error, context = {}) {
    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: context,
    };

    // In development, log to console
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error('Error captured:', errorData);
      return;
    }

    // In production, send to error monitoring service
    // This would integrate with Sentry, LogRocket, or similar service
    if (typeof window.fetch === 'function') {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    }
  }

  // Global error handler
  window.addEventListener('error', function (event) {
    trackError(event.error, {
      type: 'javascript',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Promise rejection handler
  window.addEventListener('unhandledrejection', function (event) {
    trackError(new Error(event.reason), {
      type: 'promise',
      promise: event.promise,
    });
  });

  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          trackError(new Error('Performance data'), {
            type: 'performance',
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded:
              perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: performance
              .getEntriesByType('paint')
              .find((entry) => entry.name === 'first-paint')?.startTime,
          });
        }
      }, 0);
    });
  }

  // Make trackError available globally for manual error reporting
  window.RinaWarpErrorTracking = {
    track: trackError,
    info: function (message, context = {}) {
      trackError(new Error(message), { type: 'info', ...context });
    },
    warn: function (message, context = {}) {
      trackError(new Error(message), { type: 'warning', ...context });
    },
  };
})();
