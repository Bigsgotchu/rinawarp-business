import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { NonEmptyString, UrlString, ISODateString, parseJson } from '../src/validators';

describe('validators', () => {
  it('NonEmptyString', () => {
    expect(() => NonEmptyString.parse('')).toThrow();
    expect(NonEmptyString.parse('x')).toBe('x');
  });

  it('UrlString', () => {
    expect(() => UrlString.parse('nope')).toThrow();
    expect(UrlString.parse('https://ok.com')).toBe('https://ok.com');
  });

  it('ISODateString', () => {
    expect(() => ISODateString.parse('2020-01-01')).toThrow();
    expect(ISODateString.parse('2020-01-01T00:00:00.000Z')).toBe('2020-01-01T00:00:00.000Z');
  });

  it('parseJson with schema', () => {
    const schema = z.object({ url: UrlString });
    const data = parseJson('{"url":"https://a.b"}', schema);
    expect(data.url).toBe('https://a.b');
  });
});
