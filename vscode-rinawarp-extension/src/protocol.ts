import { z } from "zod";

export const RinaEnvelopeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("plan"),
    payload: z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      summary: z.string().min(1),
      risks: z
        .array(
          z.object({
            level: z.enum(["low", "medium", "high"]),
            text: z.string().min(1),
          }),
        )
        .default([]),
      steps: z.array(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1),
          intent: z.string().min(1),
          actions: z.array(
            z.discriminatedUnion("type", [
              z.object({ type: z.literal("command"), cwd: z.string().optional(), command: z.string().min(1) }),
              z.object({ type: z.literal("file_write"), path: z.string().min(1), content: z.string() }),
              z.object({ type: z.literal("file_patch"), path: z.string().min(1), unifiedDiff: z.string().min(1) })
            ]),
          ),
          verify: z
            .array(z.object({ type: z.literal("command"), cwd: z.string().optional(), command: z.string().min(1) }))
            .default([]),
        }),
      ),
    }),
  }),
  z.object({ kind: z.literal("chat"), payload: z.object({ text: z.string() }) }),
  z.object({ kind: z.literal("error"), payload: z.object({ message: z.string().min(1), code: z.string().optional() }) }),
]);

export type RinaEnvelope = z.infer<typeof RinaEnvelopeSchema>;

export type ValidateOk<T> = { ok: true; value: T; rawJson: string };
export type ValidateErr = {
  ok: false;
  raw: string;
  extractedJson?: string;
  reason: "non_json" | "json_parse_error" | "invalid_schema";
  issues: { message: string; path?: (string | number)[] }[];
};

export function extractFirstJsonObject(input: string): string | null {
  const s = input.trim();
  const start = s.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inStr = false;
  let esc = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }

    if (ch === '"') {
      inStr = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") depth--;

    if (depth === 0) return s.slice(start, i + 1);
  }
  return null;
}

export function validateRinaOutput(raw: string): ValidateOk<RinaEnvelope> | ValidateErr {
  const trimmed = raw.trim();

  const parseStrict = (jsonText: string): ValidateOk<RinaEnvelope> | ValidateErr => {
    try {
      const obj = JSON.parse(jsonText);
      const parsed = RinaEnvelopeSchema.safeParse(obj);
      if (!parsed.success) {
        return {
          ok: false,
          raw,
          extractedJson: jsonText,
          reason: "invalid_schema",
          issues: parsed.error.issues.map((i: { message: string; path?: (string | number)[] }) => ({ message: i.message, path: i.path })),
        };
      }
      return { ok: true, value: parsed.data, rawJson: jsonText };
    } catch {
      return {
        ok: false,
        raw,
        extractedJson: jsonText,
        reason: "json_parse_error",
        issues: [{ message: "JSON parse error" }],
      };
    }
  };

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return parseStrict(trimmed);

  const extracted = extractFirstJsonObject(trimmed);
  if (!extracted) {
    return { ok: false, raw, reason: "non_json", issues: [{ message: "Non-JSON output" }] };
  }
  return parseStrict(extracted);
}