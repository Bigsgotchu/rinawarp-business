import { installNetworkGuards } from './installNetworkGuards';
import { session } from 'electron';
export class AppRinaProvider {
    client;
    gate;
    enforceRendererOffline;
    rendererOfflineInstalled = false;
    constructor(opts) {
        this.client = opts.client;
        this.gate = opts.gate;
        this.enforceRendererOffline = Boolean(opts.enforceRendererOffline);
        installNetworkGuards(this.gate);
    }
    async getHealth() {
        const h = await this.client.health();
        if (h.ok)
            return {
                ok: true,
                status: h.status === 'down' ? 'degraded' : h.status,
                detail: h.detail ?? undefined,
            };
        return { ok: false, status: 'down', detail: h.detail ?? 'unknown' };
    }
    async setOfflineMode(offline) {
        this.gate.setOffline(offline);
        if (this.enforceRendererOffline) {
            this.installRendererNetworkBlockOnce();
        }
    }
    async smokeRoundTrip(input) {
        // Force offline at gate-level for this call.
        this.gate.setOffline(input.offline);
        if (input.offline) {
            // Your offline fallback must be deterministic.
            const text = `__RINA_OFFLINE_OK__ offline_fallback prompt="${input.prompt.slice(0, 64)}"`;
            return { ok: true, mode: 'offline', latencyMs: 0, text };
        }
        // Online must hit real client and include marker.
        const res = await this.client.roundTrip({ prompt: input.prompt, timeoutMs: 20_000 });
        if (!res.ok) {
            return { ok: false, mode: 'online', latencyMs: res.latencyMs, error: res.error };
        }
        const text = res.text;
        if (!text.includes('__RINA_SMOKE_OK__')) {
            return {
                ok: false,
                mode: 'online',
                latencyMs: res.latencyMs,
                error: `Missing marker __RINA_SMOKE_OK__ in response: ${text.slice(0, 200)}`,
            };
        }
        return { ok: true, mode: 'online', latencyMs: res.latencyMs, text };
    }
    installRendererNetworkBlockOnce() {
        if (this.rendererOfflineInstalled)
            return;
        this.rendererOfflineInstalled = true;
        const ses = session.defaultSession;
        ses.webRequest.onBeforeRequest((details, callback) => {
            // Only block when offline is enabled
            try {
                // Allow local file/app pages always
                const url = details.url;
                if (url.startsWith('file://') ||
                    url.startsWith('app://') ||
                    url.startsWith('devtools://')) {
                    callback({});
                    return;
                }
                // Enforce same offline rules as gate: throw blocks it.
                this.gate.assertAllowedUrl(url);
                callback({});
            }
            catch {
                callback({ cancel: true });
            }
        });
    }
}
