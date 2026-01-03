import type { RinaClient, RinaHealth, RinaRoundTripResult } from './types';
import { NetworkGate } from './networkGate';

export type CloudflareWorkerClientOptions = {
  baseUrl: string; // e.g. https://<your-worker>.workers.dev
  apiKey?: string; // optional
  gate: NetworkGate;
};

export class CloudflareWorkerRinaClient implements RinaClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly gate: NetworkGate;

  public constructor(opts: CloudflareWorkerClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.apiKey = opts.apiKey;
    this.gate = opts.gate;
  }

  public async health(): Promise<RinaHealth> {
    const started = Date.now();
    const url = `${this.baseUrl}/health`;
    this.gate.assertAllowedUrl(url);

    try {
      const fetchOptions: any = { method: 'GET' };
      if (this.apiKey) {
        fetchOptions.headers = { Authorization: `Bearer ${this.apiKey}` };
      }
      const res = await fetch(url, fetchOptions);

      if (!res.ok) {
        return { ok: false, status: 'down', detail: `HTTP ${res.status}` };
      }

      const json = (await res.json().catch(() => ({}))) as any;
      const status = (json?.status as RinaHealth['status']) ?? 'healthy';
      return { ok: true, status, detail: `latencyMs=${Date.now() - started}` };
    } catch (e) {
      return {
        ok: false,
        status: 'down',
        detail: e instanceof Error ? e.message : String(e),
      };
    }
  }

  public async roundTrip(input: {
    prompt: string;
    timeoutMs: number;
  }): Promise<RinaRoundTripResult> {
    const started = Date.now();
    const url = `${this.baseUrl}/smoke`; // recommended: a small deterministic endpoint/tool
    this.gate.assertAllowedUrl(url);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), Math.max(1000, input.timeoutMs));

    try {
      const fetchOptions: any = {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.prompt }),
      };
      if (this.apiKey) {
        fetchOptions.headers.Authorization = `Bearer ${this.apiKey}`;
      }
      const res = await fetch(url, fetchOptions);

      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}`, latencyMs: Date.now() - started };
      }

      const json = (await res.json()) as any;
      const text = String(json?.text ?? '');
      return { ok: true, text, latencyMs: Date.now() - started };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        latencyMs: Date.now() - started,
      };
    } finally {
      clearTimeout(t);
    }
  }
}
