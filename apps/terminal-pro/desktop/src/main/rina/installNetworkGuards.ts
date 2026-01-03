import { NetworkGate } from './networkGate';

type FetchType = typeof fetch;

export function installNetworkGuards(gate: NetworkGate): void {
  // Guard global fetch
  const originalFetch: FetchType | undefined = (globalThis as any).fetch;
  if (originalFetch) {
    (globalThis as any).fetch = (async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : String(input?.url ?? '');
      gate.assertAllowedUrl(url);
      return originalFetch(input, init);
    }) as FetchType;
  }

  // Guard WebSocket (Node 20 has WebSocket in undici on some environments; in Electron main it may exist)
  const OriginalWebSocket = (globalThis as any).WebSocket;
  if (OriginalWebSocket) {
    (globalThis as any).WebSocket = class GuardedWebSocket extends OriginalWebSocket {
      constructor(url: string, protocols?: string | string[]) {
        gate.assertAllowedUrl(url);
        super(url, protocols as any);
      }
    };
  }
}
