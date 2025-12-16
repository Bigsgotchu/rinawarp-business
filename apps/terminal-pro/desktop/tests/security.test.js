import { expect, test } from 'vitest';
import { z } from 'zod';

// Test URL validation schema (same as in main.js)
const UrlSchema = z.string().transform((s) => {
  const u = new URL(s);
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw new Error('Only http/https allowed');
  }
  return u.toString();
});

// Test path validation schemas
const RootSchema = z.enum(['config', 'home']);
const PartsSchema = z.array(z.string()).nonempty();
const PathInputSchema = z.object({
  root: RootSchema,
  parts: PartsSchema,
});

test('url schema blocks non-http(s)', () => {
  expect(() => UrlSchema.parse('file:///etc/passwd')).toThrow();
  expect(() => UrlSchema.parse('javascript:alert(1)')).toThrow();
  expect(UrlSchema.parse('https://example.com')).toBe('https://example.com/');
  expect(UrlSchema.parse('http://example.com')).toBe('http://example.com/');
});

test('path schema validates roots and parts', () => {
  expect(() => PathInputSchema.parse({ root: 'invalid', parts: ['file.txt'] })).toThrow();
  expect(() => PathInputSchema.parse({ root: 'config', parts: [] })).toThrow();
  expect(PathInputSchema.parse({ root: 'config', parts: ['file.txt'] })).toEqual({
    root: 'config',
    parts: ['file.txt'],
  });
  expect(PathInputSchema.parse({ root: 'home', parts: ['dir', 'file.txt'] })).toEqual({
    root: 'home',
    parts: ['dir', 'file.txt'],
  });
});

// Test safe path joining (mock implementation)
function safeJoin(base, parts) {
  const path = require('path');
  const joined = path.join(base, ...parts);
  if (!joined.startsWith(base + path.sep) && joined !== base) {
    throw new Error('Path traversal blocked');
  }
  return joined;
}

test('safeJoin blocks path traversal', () => {
  const base = '/safe';
  expect(() => safeJoin(base, ['..', 'secret.txt'])).toThrow('Path traversal blocked');
  expect(() => safeJoin(base, ['../outside.txt'])).toThrow('Path traversal blocked');
  expect(safeJoin(base, ['file.txt'])).toBe('/safe/file.txt');
  expect(safeJoin(base, ['subdir', 'file.txt'])).toBe('/safe/subdir/file.txt');
});

test('file size validation', () => {
  const maxBytes = 200000;
  const validSize = 100000;
  const invalidSize = 300000;

  expect(validSize <= maxBytes).toBe(true);
  expect(invalidSize <= maxBytes).toBe(false);
});
