const { init } = require('@sentry/electron');

// Initialize Sentry for Electron app monitoring
function initElectronSentry() {
  if (process.env.SENTRY_DSN) {
    init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
    });
    console.log('🔍 Electron Sentry monitoring initialized');
  } else {
    console.log('⚠️ Sentry DSN not configured - monitoring disabled');
  }
}

module.exports = { initElectronSentry };
