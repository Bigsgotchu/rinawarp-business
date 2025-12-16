import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Shared
  SENTRY_DSN: z.string().url().optional(),
  // Admin Console
  VITE_API_URL: z.string().url().optional(),
  // Electron
  APP_UPDATES_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Load and validate environment variables (process.env in Node/Electron,
 * import.meta.env in Vite/React). Works in both apps.
 */
export function loadEnv(raw?: Record<string, unknown>): Env {
  const source =
    raw ??
    (typeof process !== 'undefined' && process.env
      ? process.env
      : typeof import.meta !== 'undefined'
        ? // Vite injects import.meta.env
          (import.meta as any).env
        : {});

  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid environment: ${message}`);
  }
  return parsed.data;
}

// Eager singleton for convenience in Node/Electron.
// In Vite, prefer a lazy call inside modules to allow mocked envs in tests.
export const env = (() => {
  try {
    return loadEnv();
  } catch {
    // Avoid throwing at import-time in bundlers; let apps call loadEnv explicitly.
    return undefined;
  }
})();
