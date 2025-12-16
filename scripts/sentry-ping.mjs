// CI guard: if SENTRY_DSN is set, send a test event and flush.
import * as url from 'node:url';
import * as path from 'node:path';

const haveDsn = !!process.env.SENTRY_DSN;
if (!haveDsn) {
  console.log('[sentry:ping] SENTRY_DSN not set – skipping.');
  process.exit(0);
}

// Try main SDK (headless, OK in CI)
let Sentry;
try {
  Sentry = await import('@sentry/electron/main');
} catch {
  // fallback to browser SDK if electron package not resolvable in CI
  try {
    Sentry = await import('@sentry/node');
  } catch {
    console.log('[sentry:ping] Sentry package not available, skipping.');
    process.exit(0);
  }
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENV || 'ci',
  tracesSampleRate: 0,
  profilesSampleRate: 0,
  release: process.env.npm_package_version,
});

const err = new Error(`[ci] sentry ping ${new Date().toISOString()}`);
Sentry.captureException(err);

// best-effort flush
if (typeof Sentry.flush === 'function') {
  const ok = await Sentry.flush(5000);
  if (!ok) {
    console.error('[sentry:ping] flush timeout (non-fatal).');
  }
}
console.log('[sentry:ping] sent.');