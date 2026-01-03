// ============================================================================
// File: src/main/policy/runtimePolicy.ts
// ============================================================================
import { EventEmitter } from 'node:events';
import { NetworkGate } from '../rina/networkGate';
export class RuntimePolicy extends EventEmitter {
    mode = { offline: false, safeMode: false };
    allowHosts = new Set();
    networkGate;
    constructor(networkGate) {
        super();
        this.networkGate = networkGate || new NetworkGate();
    }
    getMode() {
        return { ...this.mode };
    }
    setAllowHosts(hosts) {
        this.allowHosts = new Set(hosts.map((h) => h.toLowerCase()));
        this.networkGate.setAllowHosts(hosts);
    }
    setMode(next) {
        // Rule: offline implies safe mode (user asked for this)
        const offline = next.offline ?? this.mode.offline;
        const safeMode = offline ? true : (next.safeMode ?? this.mode.safeMode);
        this.mode = { offline, safeMode };
        // Sync with NetworkGate
        this.networkGate.setOffline(offline);
        this.emit('change', this.getMode());
        return this.getMode();
    }
    decide(action) {
        const { offline, safeMode } = this.mode;
        if (action.kind === 'network') {
            try {
                this.networkGate.assertAllowedUrl(action.url);
                return { ok: true };
            }
            catch (e) {
                return { ok: false, reason: e instanceof Error ? e.message : 'Network blocked' };
            }
        }
        if (action.kind === 'terminal:exec') {
            if (!safeMode)
                return { ok: true };
            return { ok: false, reason: 'Safe mode: terminal execution blocked' };
        }
        if (action.kind === 'fs:read')
            return { ok: true };
        if (action.kind === 'fs:write') {
            if (!safeMode)
                return { ok: true };
            return { ok: false, reason: 'Safe mode: filesystem write blocked' };
        }
        if (action.kind === 'fs:delete') {
            if (!safeMode)
                return { ok: true };
            return { ok: false, reason: 'Safe mode: filesystem delete blocked' };
        }
        // Exhaustive guard
        return { ok: false, reason: 'Unknown action' };
    }
    // Delegate NetworkGate methods for backward compatibility
    setOffline(offline) {
        this.setMode({ offline });
    }
    assertAllowedUrl(url) {
        this.networkGate.assertAllowedUrl(url);
    }
    assertAllowedRequestOptions(opts) {
        this.networkGate.assertAllowedRequestOptions(opts);
    }
    getNetworkGate() {
        return this.networkGate;
    }
}
export function assertAllowed(decision) {
    if (!decision.ok)
        throw new Error(decision.reason);
}
