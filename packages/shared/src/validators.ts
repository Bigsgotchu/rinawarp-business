import { z } from 'zod';

// Small, reusable schemas and helpers.
export const NonEmptyString = z.string().trim().min(1);
export const UrlString = z.string().url();
export const ISODateString = z.string().datetime({ offset: true });

// Safe JSON helper
export function parseJson<T>(input: string, schema: z.ZodType<T>) {
  const unknown = JSON.parse(input) as unknown;
  return schema.parse(unknown);
}

export const SettingsSchema = z.object({
  shell: z.string().optional(),
  fontSize: z.number().int().min(8).max(48).default(14),
  theme: z.enum(['dark', 'light']).default('dark'),
  cwd: z.string().optional(),
});
export type Settings = z.infer<typeof SettingsSchema>;
