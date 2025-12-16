// Minimal, opt-in Sentry init for main process.
const Sentry = require('@sentry/electron/main');

function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENV || process.env.NODE_ENV || 'production',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '0.1'),
    release: process.env.npm_package_version,
    autoSessionTracking: true,
  });
}

module.exports = { initSentry };
