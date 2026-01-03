export function installNetworkGuards(gate) {
    // Guard global fetch
    const originalFetch = globalThis.fetch;
    if (originalFetch) {
        globalThis.fetch = (async (input, init) => {
            const url = typeof input === 'string' ? input : String(input?.url ?? '');
            gate.assertAllowedUrl(url);
            return originalFetch(input, init);
        });
    }
    // Guard WebSocket (Node 20 has WebSocket in undici on some environments; in Electron main it may exist)
    const OriginalWebSocket = globalThis.WebSocket;
    if (OriginalWebSocket) {
        globalThis.WebSocket = class GuardedWebSocket extends OriginalWebSocket {
            constructor(url, protocols) {
                gate.assertAllowedUrl(url);
                super(url, protocols);
            }
        };
    }
}
