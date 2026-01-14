import { z } from 'zod';

export const RinaEnvelopeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('plan'),
    payload: z.object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
      risks: z.array(z.object({ level: z.enum(['low','medium','high']), text: z.string() })),
      steps: z.array(z.object({
        id: z.string(),
        title: z.string(),
        intent: z.string(),
        actions: z.array(z.object({ type: z.enum(['command','file_write','file_patch']) })),
        verify: z.array(z.object({ type: z.literal('command'), command: z.string() }))
      }))
    })
  }),
  z.object({ kind: z.literal('chat'), payload: z.any() }),
  z.object({ kind: z.literal('error'), payload: z.any() })
]);

export function extractFirstJsonObject(text: string): any {
  try {
    const match = text.match(/\{.*\}/s);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

export function validateRinaOutput(output: string) {
  const obj = extractFirstJsonObject(output);
  if (!obj) throw new Error("No JSON found");
  return RinaEnvelopeSchema.parse(obj);
}