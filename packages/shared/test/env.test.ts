import { describe, it, expect } from 'vitest';
import { loadEnv } from '../src/env';

describe('env', () => {
  it('loads defaults', () => {
    const env = loadEnv({ NODE_ENV: 'development' });
    expect(env.NODE_ENV).toBe('development');
  });

  it('rejects invalid URL', () => {
    expect(() => loadEnv({ NODE_ENV: 'production', VITE_API_URL: 'nope' })).toThrow();
  });

  it('accepts optional urls', () => {
    const env = loadEnv({
      NODE_ENV: 'production',
      VITE_API_URL: 'https://api.example.com',
      APP_UPDATES_URL: 'https://updates.example.com',
    });
    expect(env.VITE_API_URL).toBeDefined();
    expect(env.APP_UPDATES_URL).toBeDefined();
  });
});
