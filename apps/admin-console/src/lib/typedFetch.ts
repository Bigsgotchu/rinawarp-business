import type { z } from 'zod';

/**
 * Minimal typed fetch with zod validation.
 */
export async function typedFetch<T>(
  input: string | URL,
  init: RequestInit,
  schema: z.ZodType<T>,
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const data = (await res.json()) as unknown;
  return schema.parse(data);
}
