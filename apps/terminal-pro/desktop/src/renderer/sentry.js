// Renderer opt-in Sentry (safe: does nothing when DSN missing).
// Works with both browser and Electron environments.

(function () {
  let Sentry;
  try {
    Sentry = require('@sentry/electron/renderer');
  } catch {
    // Fallback to browser SDK if Electron package not available
    try {
      Sentry = require('@sentry/browser');
    } catch {
      // No Sentry available - silently skip
      console.log('[sentry] Sentry package not available, skipping initialization');
      return;
    }
  }

  const dsn = (typeof process !== 'undefined' ? process.env?.SENTRY_DSN : '') || '';

  if (dsn) {
    Sentry.init({
      dsn,
      environment: (typeof process !== 'undefined' ? process.env?.SENTRY_ENV : '') || 'production',
      tracesSampleRate: Number(
        (typeof process !== 'undefined' ? process.env?.SENTRY_TRACES_SAMPLE_RATE : '') || '0.1',
      ),
      profilesSampleRate: Number(
        (typeof process !== 'undefined' ? process.env?.SENTRY_PROFILES_SAMPLE_RATE : '') || '0.1',
      ),
      release: typeof process !== 'undefined' ? process.env?.npm_package_version : '',
    });
    console.log('[sentry] Initialized with DSN');
  } else {
    console.log('[sentry] SENTRY_DSN not set, skipping initialization');
  }
})();
