// ============================================================================
// File: src/main/rina/policyRinaProvider.ts
// Why: enforces offline=>safe mode + deterministic markers.
// ============================================================================
import type { RinaProvider, RinaHealthResponse, RinaSmokeResponse } from '../ipc/rinaIpc';
import type { RinaClient } from './types';
import { RuntimePolicy } from '../policy/runtimePolicy';
import { installNetworkGuards } from './installNetworkGuards';
import { session } from 'electron';

export class PolicyRinaProvider implements RinaProvider {
  public constructor(private readonly opts: { client: RinaClient; policy: RuntimePolicy }) {}

  public async getHealth(): Promise<RinaHealthResponse> {
    const h = await this.opts.client.health();
    if (h.ok)
      return {
        ok: true,
        status: h.status === 'down' ? 'degraded' : h.status,
        detail: h.detail ?? undefined,
      };
    return { ok: false, status: 'down', detail: h.detail ?? 'unknown' };
  }

  public async setOfflineMode(offline: boolean): Promise<void> {
    // Critical: offline implies safe mode centrally
    this.opts.policy.setMode({ offline });
  }

  public async smokeRoundTrip(input: {
    prompt: string;
    offline: boolean;
  }): Promise<RinaSmokeResponse> {
    // Critical: offline implies safe mode centrally
    this.opts.policy.setMode({ offline: input.offline });

    if (input.offline) {
      // Replace with your real offline fallback path if you have one.
      const text = `__RINA_OFFLINE_OK__ offline_fallback prompt="${input.prompt.slice(0, 64)}"`;
      return { ok: true, mode: 'offline', latencyMs: 0, text };
    }

    const res = await this.opts.client.roundTrip({ prompt: input.prompt, timeoutMs: 20_000 });
    if (!res.ok) return { ok: false, mode: 'online', latencyMs: res.latencyMs, error: res.error };

    if (!res.text.includes('__RINA_SMOKE_OK__')) {
      return {
        ok: false,
        mode: 'online',
        latencyMs: res.latencyMs,
        error: 'Missing marker __RINA_SMOKE_OK__ in online response',
      };
    }

    return { ok: true, mode: 'online', latencyMs: res.latencyMs, text: res.text };
  }

  public installNetworkGuards(): void {
    installNetworkGuards(this.opts.policy.getNetworkGate());
  }

  public installRendererNetworkBlock(): void {
    const ses = session.defaultSession;
    ses.webRequest.onBeforeRequest((details, callback) => {
      // Allow local file/app pages always
      const url = details.url;
      if (url.startsWith('file://') || url.startsWith('app://') || url.startsWith('devtools://')) {
        callback({});
        return;
      }

      // Enforce same offline rules as policy: throw blocks it.
      try {
        this.opts.policy.assertAllowedUrl(url);
        callback({});
      } catch {
        callback({ cancel: true });
      }
    });
  }
}
