export class CloudflareWorkerRinaClient {
    baseUrl;
    apiKey;
    gate;
    constructor(opts) {
        this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
        this.apiKey = opts.apiKey;
        this.gate = opts.gate;
    }
    async health() {
        const started = Date.now();
        const url = `${this.baseUrl}/health`;
        this.gate.assertAllowedUrl(url);
        try {
            const fetchOptions = { method: 'GET' };
            if (this.apiKey) {
                fetchOptions.headers = { Authorization: `Bearer ${this.apiKey}` };
            }
            const res = await fetch(url, fetchOptions);
            if (!res.ok) {
                return { ok: false, status: 'down', detail: `HTTP ${res.status}` };
            }
            const json = (await res.json().catch(() => ({})));
            const status = json?.status ?? 'healthy';
            return { ok: true, status, detail: `latencyMs=${Date.now() - started}` };
        }
        catch (e) {
            return {
                ok: false,
                status: 'down',
                detail: e instanceof Error ? e.message : String(e),
            };
        }
    }
    async roundTrip(input) {
        const started = Date.now();
        const url = `${this.baseUrl}/smoke`; // recommended: a small deterministic endpoint/tool
        this.gate.assertAllowedUrl(url);
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), Math.max(1000, input.timeoutMs));
        try {
            const fetchOptions = {
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
            const json = (await res.json());
            const text = String(json?.text ?? '');
            return { ok: true, text, latencyMs: Date.now() - started };
        }
        catch (e) {
            return {
                ok: false,
                error: e instanceof Error ? e.message : String(e),
                latencyMs: Date.now() - started,
            };
        }
        finally {
            clearTimeout(t);
        }
    }
}
