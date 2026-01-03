/**
 * Temporary debugging script to identify failing API endpoints
 *
 * USAGE:
 * 1. Open DevTools Console in your running app
 * 2. Paste this entire script
 * 3. Watch for API FAIL / API ERROR messages
 * 4. Report the URLs back for targeted fixes
 */

// Temporarily intercept all fetch calls
const originalFetch = window.fetch;
let fetchCallCount = 0;

window.fetch = async (...args) => {
  const url = args[0];
  const options = args[1] || {};

  // Skip internal/extension requests
  if (url.includes('chrome-extension') || url.includes('moz-extension')) {
    return originalFetch(...args);
  }

  fetchCallCount++;

  console.log(`🔍 API CALL #${fetchCallCount}:`, {
    url: url,
    method: options.method || 'GET',
    timestamp: new Date().toLocaleTimeString(),
  });

  try {
    const response = await originalFetch(...args);

    if (!response.ok) {
      console.error('❌ API FAIL:', url, {
        status: response.status,
        statusText: response.statusText,
        method: options.method || 'GET',
      });
    } else {
      console.log('✅ API SUCCESS:', url, response.status);
    }

    return response;
  } catch (error) {
    console.error('💥 API ERROR:', url, {
      error: error.message,
      method: options.method || 'GET',
      type: error.constructor.name,
    });
    throw error;
  }
};

// Also intercept WebSocket connections (common in live sessions)
const originalWebSocket = window.WebSocket;
let wsCallCount = 0;

window.WebSocket = function (url, protocols) {
  wsCallCount++;

  console.log(`🌐 WS CALL #${wsCallCount}:`, {
    url: url,
    protocols: protocols,
    timestamp: new Date().toLocaleTimeString(),
  });

  const ws = new originalWebSocket(url, protocols);

  // Monitor WebSocket events
  ws.addEventListener('open', () => {
    console.log('✅ WS CONNECTED:', url);
  });

  ws.addEventListener('error', (error) => {
    console.error('❌ WS ERROR:', url, error);
  });

  ws.addEventListener('close', (event) => {
    console.log('🔌 WS CLOSED:', url, {
      code: event.code,
      reason: event.reason,
    });
  });

  return ws;
};

// Instructions
console.log(`
🎯 API DEBUGGING ACTIVE
─────────────────────────

This script is now monitoring all network calls.

WHAT TO DO:
1. Use your app normally
2. Watch for API FAIL / API ERROR messages
3. Note the failing URLs
4. Report them back for targeted fixes

WHAT YOU'LL SEE:
🔍 API CALL #N: [URL] - Normal requests
✅ API SUCCESS: [URL] 200 - Successful requests  
❌ API FAIL: [URL] 403 - Failed requests
💥 API ERROR: [URL] - Network/connection errors
🌐 WS CALL #N: [WS_URL] - WebSocket connections

TO STOP MONITORING:
window.fetch = originalFetch;
window.WebSocket = originalWebSocket;

─────────────────────────
`);

// Export for easy cleanup
window.debugAPI = {
  stop: () => {
    window.fetch = originalFetch;
    window.WebSocket = originalWebSocket;
    console.log('🛑 API debugging stopped');
  },
  stats: {
    totalCalls: () => fetchCallCount,
    totalWebSockets: () => wsCallCount,
  },
};
