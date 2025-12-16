import { z } from 'zod';

// Request/response schemas
export const AppVersionReq = z.object({});
export const AppVersionRes = z.object({ version: z.string() });

export const OpenExternalReq = z.object({ url: z.string().url() });
export const OpenExternalRes = z.object({ opened: z.boolean() });

export const RunTaskReq = z.object({
  id: z.string().min(1),
  payload: z.unknown().optional(),
});
export const RunTaskRes = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), result: z.unknown().optional() }),
  z.object({ ok: z.literal(false), error: z.string() }),
]);

export const PtySpawnReq = z.object({
  id: z.string(),
  cwd: z.string().optional(),
  shell: z.string().optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  cols: z.number().int().positive().default(80),
  rows: z.number().int().positive().default(24),
});

export const PtySpawnRes = z.object({
  pid: z.number().int().positive(),
  id: z.string(),
});

export const PtyInputReq = z.object({
  id: z.string(),
  data: z.string(),
});

// Alias for write as requested in the plan
export const PtyWriteReq = PtyInputReq;

export const PtyResizeReq = z.object({
  id: z.string(),
  cols: z.number().int().positive(),
  rows: z.number().int().positive(),
});

export const PtyKillReq = z.object({
  id: z.string(),
  signal: z.string().optional(),
});

export const PtyDataEvent = z.object({
  id: z.string(),
  data: z.string(),
});

export const PtyExitEvent = z.object({
  id: z.string(),
  code: z.number().int().nonnegative(),
  signal: z.string().nullable(),
});

export type AppVersionReqT = z.infer<typeof AppVersionReq>;
export type AppVersionResT = z.infer<typeof AppVersionRes>;
export type OpenExternalReqT = z.infer<typeof OpenExternalReq>;
export type OpenExternalResT = z.infer<typeof OpenExternalRes>;
export type RunTaskReqT = z.infer<typeof RunTaskReq>;
export type RunTaskResT = z.infer<typeof RunTaskRes>;
export type PtySpawnReqT = z.infer<typeof PtySpawnReq>;
export type PtySpawnResT = z.infer<typeof PtySpawnRes>;
export type PtyInputReqT = z.infer<typeof PtyInputReq>;
export type PtyWriteReqT = z.infer<typeof PtyWriteReq>;
export type PtyResizeReqT = z.infer<typeof PtyResizeReq>;
export type PtyKillReqT = z.infer<typeof PtyKillReq>;
export type PtyDataEventT = z.infer<typeof PtyDataEvent>;
export type PtyExitEventT = z.infer<typeof PtyExitEvent>;
