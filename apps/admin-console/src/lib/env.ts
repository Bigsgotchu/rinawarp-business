import { loadEnv } from '../../../../packages/shared/src/env';

export const env = loadEnv({
  // Vite exposes variables on import.meta.env at build time; pass-through for typing.
  NODE_ENV: import.meta.env.MODE,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
});
