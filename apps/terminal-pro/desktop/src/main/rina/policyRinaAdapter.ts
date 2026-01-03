// ============================================================================
// File: src/main/rina/policyRinaAdapter.ts
// Why: plug your existing Rina into our smoke tests + policy.
// Replace the "ExistingRina" shape with your real one.
// ============================================================================
import type { RinaClient, RinaHealth, RinaRoundTripResult } from './types';
import { RuntimePolicy, assertAllowed } from '../policy/runtimePolicy';

export type ExistingRina = {
  health: () => Promise<{ ok: boolean; detail?: string }>;
  // Example: your real function might be sendMessage / chat / request / toolCall
  roundTrip: (input: { prompt: string; timeoutMs: number }) => Promise<{ text: string }>;
};

export class PolicyRinaAdapter implements RinaClient {
  public constructor(
    private readonly existing: ExistingRina,
    private readonly policy: RuntimePolicy,
  ) {}

  public async health(): Promise<RinaHealth> {
    const h = await this.existing.health();
    if (h.ok) return { ok: true, status: 'healthy' };
    return { ok: false, status: 'down', detail: h.detail ?? 'down' };
  }

  public async roundTrip(input: {
    prompt: string;
    timeoutMs: number;
  }): Promise<RinaRoundTripResult> {
    const started = Date.now();

    // If your real Rina calls network under the hood, it should use global fetch/ws,
    // which are already blocked by policy when offline. If it bypasses that, you'll wire it here.
    // For deterministic smoke, your existing Rina must return "__RINA_SMOKE_OK__" in online mode.

    try {
      // If you have a direct URL call here, enforce policy.decide({kind:"network", url})
      // Example:
      // assertAllowed(this.policy.decide({ kind: "network", url: "https://..." }));

      const res = await this.existing.roundTrip({
        prompt: input.prompt,
        timeoutMs: input.timeoutMs,
      });
      return { ok: true, text: String(res.text ?? ''), latencyMs: Date.now() - started };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        latencyMs: Date.now() - started,
      };
    }
  }
}
