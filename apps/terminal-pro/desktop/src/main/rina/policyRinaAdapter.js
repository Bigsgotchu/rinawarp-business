export class PolicyRinaAdapter {
    existing;
    policy;
    constructor(existing, policy) {
        this.existing = existing;
        this.policy = policy;
    }
    async health() {
        const h = await this.existing.health();
        if (h.ok)
            return { ok: true, status: 'healthy' };
        return { ok: false, status: 'down', detail: h.detail ?? 'down' };
    }
    async roundTrip(input) {
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
        }
        catch (e) {
            return {
                ok: false,
                error: e instanceof Error ? e.message : String(e),
                latencyMs: Date.now() - started,
            };
        }
    }
}
