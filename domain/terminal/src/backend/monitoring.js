import * as Sentry from '@sentry/node';

// Initialize Sentry for backend monitoring
function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: require('express') }),
      ],
    });
    console.log('🔍 Sentry monitoring initialized');
  } else {
    console.log('⚠️ Sentry DSN not configured - monitoring disabled');
  }
}

// Error tracking middleware
function errorHandler(err, req, res, next) {
  console.error('Backend error:', err);

  // Capture error with Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
}

// Performance monitoring
function trackPerformance(operation, fn) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;

      if (process.env.SENTRY_DSN) {
        Sentry.addBreadcrumb({
          message: `Operation: ${operation}`,
          level: 'info',
          data: { duration },
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, {
          tags: { operation },
          extra: { duration },
        });
      }

      throw error;
    }
  };
}

// Analytics tracking
function trackEvent(event, properties = {}) {
  if (process.env.SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message: `Event: ${event}`,
      level: 'info',
      data: properties,
    });
  }

  // Log to console for development
  console.log(`📊 Analytics: ${event}`, properties);
}

export { initSentry, errorHandler, trackPerformance, trackEvent };
