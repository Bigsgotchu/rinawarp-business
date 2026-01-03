// ============================================================================
// File: src/main/policy/runtimePolicy.ts
// ============================================================================
import { EventEmitter } from 'node:events';
import { NetworkGate } from '../rina/networkGate';

export type RuntimeMode = {
  offline: boolean;
  safeMode: boolean;
};

export type ToolAction =
  | { kind: 'network'; url: string }
  | { kind: 'terminal:exec'; command: string }
  | { kind: 'fs:read'; path: string }
  | { kind: 'fs:write'; path: string }
  | { kind: 'fs:delete'; path: string };

export type PolicyDecision = { ok: true } | { ok: false; reason: string };

export class RuntimePolicy extends EventEmitter {
  private mode: RuntimeMode = { offline: false, safeMode: false };
  private allowHosts = new Set<string>();
  private networkGate: NetworkGate;

  public constructor(networkGate?: NetworkGate) {
    super();
    this.networkGate = networkGate || new NetworkGate();
  }

  public getMode(): RuntimeMode {
    return { ...this.mode };
  }

  public setAllowHosts(hosts: string[]): void {
    this.allowHosts = new Set(hosts.map((h) => h.toLowerCase()));
    this.networkGate.setAllowHosts(hosts);
  }

  public setMode(next: Partial<RuntimeMode>): RuntimeMode {
    // Rule: offline implies safe mode (user asked for this)
    const offline = next.offline ?? this.mode.offline;
    const safeMode = offline ? true : (next.safeMode ?? this.mode.safeMode);

    this.mode = { offline, safeMode };

    // Sync with NetworkGate
    this.networkGate.setOffline(offline);

    this.emit('change', this.getMode());
    return this.getMode();
  }

  public decide(action: ToolAction): PolicyDecision {
    const { offline, safeMode } = this.mode;

    if (action.kind === 'network') {
      try {
        this.networkGate.assertAllowedUrl(action.url);
        return { ok: true };
      } catch (e) {
        return { ok: false, reason: e instanceof Error ? e.message : 'Network blocked' };
      }
    }

    if (action.kind === 'terminal:exec') {
      if (!safeMode) return { ok: true };
      return { ok: false, reason: 'Safe mode: terminal execution blocked' };
    }

    if (action.kind === 'fs:read') return { ok: true };

    if (action.kind === 'fs:write') {
      if (!safeMode) return { ok: true };
      return { ok: false, reason: 'Safe mode: filesystem write blocked' };
    }

    if (action.kind === 'fs:delete') {
      if (!safeMode) return { ok: true };
      return { ok: false, reason: 'Safe mode: filesystem delete blocked' };
    }

    // Exhaustive guard
    return { ok: false, reason: 'Unknown action' };
  }

  // Delegate NetworkGate methods for backward compatibility
  public setOffline(offline: boolean): void {
    this.setMode({ offline });
  }

  public assertAllowedUrl(url: string): void {
    this.networkGate.assertAllowedUrl(url);
  }

  public assertAllowedRequestOptions(opts: any): void {
    this.networkGate.assertAllowedRequestOptions(opts);
  }

  public getNetworkGate(): NetworkGate {
    return this.networkGate;
  }
}

export function assertAllowed(decision: PolicyDecision): void {
  if (!decision.ok) throw new Error(decision.reason);
}
