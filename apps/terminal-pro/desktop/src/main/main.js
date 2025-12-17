const path = require("path");
const fs = require("fs");
const os = require('os');
const pty = require('node-pty');
const recorder = require('node-record-lpcm16');
const OpenAI = require("openai");
const Sentry = require("@sentry/electron");
const WebSocket = require('ws');
// Only initialize OpenAI if API key is available
const ai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
// Use dynamic import for electron-store (ESM module)
let store;
async function initStore() {
  const { default: Store } = await import('electron-store');
  store = new Store();
  return store;
}

// ==== CONFIG STORAGE (license etc.) ==================================

function getConfigPath() {
  const userDir = app.getPath("userData");
  return path.join(userDir, "config.json");
}

// =============================
// AUTO-UPDATER (VS Code Style)
// =============================
// Auto-updater will be initialized later when app is ready
let autoUpdater;

// Allow per-channel update feeds
function getUpdateChannel() {
  try {
    return store.get("updateChannel", "stable"); // free, canary, nightly, etc.
  } catch (e) {
    return "stable";
  }
}

function configureAutoUpdater() {
  const channel = getUpdateChannel();

  autoUpdater.setFeedURL({
    provider: "generic",
    url: `https://download.rinawarptech.com/terminal-pro/${channel}/`
  });
}

// Emit events to renderer
function setupAutoUpdaterIPC(mainWindow) {
  autoUpdater.on("checking-for-update", () => {
    mainWindow.webContents.send("update:checking");
  });

  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update:available", info);
  });

  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update:none");
  });

  autoUpdater.on("error", (err) => {
    mainWindow.webContents.send("update:error", err ? err.toString() : "unknown error");
  });

  autoUpdater.on("download-progress", (progressObj) => {
    mainWindow.webContents.send("update:progress", {
      percent: progressObj.percent.toFixed(0),
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    mainWindow.webContents.send("update:downloaded", info);
  });
}

function readConfig() {
  const configPath = getConfigPath();
  try {
    if (!fs.existsSync(configPath)) return {};
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read config:", e);
    return {};
  }
}

function writeConfig(cfg) {
  const configPath = getConfigPath();
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  } catch (e) {
    console.error("Failed to write config:", e);
  }
}

// ==== LICENSE VERIFICATION (calls your backend) ======================

const API_ROOT = process.env.RINAWARP_API_URL || "https://api.rinawarptech.com";

async function verifyLicenseWithBackend(licenseKey) {
  // Adjust this to match your actual endpoint signature if needed
  const url = `${API_ROOT}/api/license/verify?key=${encodeURIComponent(
    licenseKey
  )}`;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`License verify HTTP ${res.status}`);
  }
  const data = await res.json();
  return data; // expected: { valid: boolean, data: { ... } }
}

// ==== RINA AGENT BRAIN (Cloudflare Worker) ===========================

const RINA_AGENT_URL =
  process.env.RINA_AGENT_URL || "https://rinawarptech.com/api/agent";

let mainWindow;
let micStream = null;

// Lightweight health/status tracking for the Agent
let agentStatus = {
  healthy: false,
  lastChecked: null,
  lastError: null,
};

// Simple helper to broadcast status to renderer
function broadcastAgentStatus() {
  if (!mainWindow) return;
  mainWindow.webContents.send("agent:status", agentStatus);
}

// Health check against Cloudflare Agent
async function checkAgentHealth({ broadcast = true } = {}) {
  const started = Date.now();
  try {
    // We just need to know "is the Worker reachable?"
    // HEAD/GET may return 405 but that still proves reachability.
    const res = await fetch(RINA_AGENT_URL, { method: "HEAD" }).catch(() =>
      fetch(RINA_AGENT_URL, { method: "GET" })
    );

    const duration = Date.now() - started;
    if (!res) {
      agentStatus = {
        healthy: false,
        lastChecked: new Date().toISOString(),
        lastError: "No response from Cloudflare Worker",
      };
      console.error("[RinaAgent] Health check: no response (", duration, "ms)");
    } else {
      const ok = res.ok || res.status === 405; // 405 is "method not allowed" but server reachable
      agentStatus = {
        healthy: ok,
        lastChecked: new Date().toISOString(),
        lastError: ok ? null : `HTTP ${res.status}`,
      };
      console.log(
        "[RinaAgent] Health check:",
        ok ? "healthy" : "unhealthy",
        "| status =",
        res.status,
        "|",
        duration,
        "ms"
      );
    }
  } catch (err) {
    const duration = Date.now() - started;
    agentStatus = {
      healthy: false,
      lastChecked: new Date().toISOString(),
      lastError: err.message || String(err),
    };
    console.error("[RinaAgent] Health check failed in", duration, "ms:", err);
  }

  if (broadcast) {
    broadcastAgentStatus();
  }

  return agentStatus;
}

// ──────────────── Terminal PTY Registry ────────────────
const terminals = new Map();
let nextTerminalId = 1;

// ──────────────── WebSocket Server for Collaboration ────────────────
let websocketServer = null;
const sharedTerminalSessions = new Map(); // sessionId -> {terminalId, participants: Set}

// WebSocket server setup
function setupWebSocketServer() {
    try {
        // Create WebSocket server on port 8080 (or configurable port)
        const port = process.env.WEBSOCKET_PORT || 8080;
        websocketServer = new WebSocket.Server({ port });

        console.log(`[WebSocket] Server started on port ${port}`);

        websocketServer.on('connection', (socket, request) => {
            console.log('[WebSocket] New connection established');

            // Parse session ID and user ID from query parameters
            const url = new URL(request.url, `http://${request.headers.host}`);
            const searchParams = new URLSearchParams(url.search);
            const sessionId = searchParams.get('sessionId');
            const userId = searchParams.get('userId');
            const token = searchParams.get('token');

            if (!sessionId || !userId) {
                console.error('[WebSocket] Missing sessionId or userId in connection');
                socket.close(1008, 'Missing required parameters');
                return;
            }

            // Store connection info
            socket.sessionId = sessionId;
            socket.userId = userId;

            // Add to session participants
            if (!sharedTerminalSessions.has(sessionId)) {
                sharedTerminalSessions.set(sessionId, {
                    terminalId: null,
                    participants: new Set()
                });
            }

            const session = sharedTerminalSessions.get(sessionId);
            session.participants.add(userId);

            console.log(`[WebSocket] User ${userId} joined session ${sessionId}. Participants: ${session.participants.size}`);

            // Handle messages
            socket.on('message', (message) => {
                try {
                    const data = JSON.parse(message);

                    // Broadcast to all participants in the same session
                    broadcastToSession(sessionId, userId, data);
                } catch (error) {
                    console.error('[WebSocket] Error processing message:', error);
                }
            });

            // Handle connection close
            socket.on('close', () => {
                console.log(`[WebSocket] Connection closed for user ${userId} in session ${sessionId}`);

                if (session) {
                    session.participants.delete(userId);
                    console.log(`[WebSocket] User ${userId} left session ${sessionId}. Remaining participants: ${session.participants.size}`);

                    // Clean up session if no participants left
                    if (session.participants.size === 0) {
                        sharedTerminalSessions.delete(sessionId);
                        console.log(`[WebSocket] Session ${sessionId} cleaned up (no participants)`);
                    }
                }
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error(`[WebSocket] Error for user ${userId}:`, error);
            });
        });

        return true;
    } catch (error) {
        console.error('[WebSocket] Failed to start server:', error);
        return false;
    }
}

/**
 * Broadcast message to all participants in a session
 * @param {string} sessionId - Session ID
 * @param {string} senderUserId - User ID of sender
 * @param {Object} message - Message to broadcast
 */
function broadcastToSession(sessionId, senderUserId, message) {
    const session = sharedTerminalSessions.get(sessionId);
    if (!session) return;

    // Add metadata to message
    const messageWithMetadata = {
        ...message,
        sessionId,
        senderUserId,
        timestamp: Date.now()
    };

    // Convert to string
    const messageString = JSON.stringify(messageWithMetadata);

    // Broadcast to all participants
    websocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId &&
            client.userId !== senderUserId) {
            try {
                client.send(messageString);
            } catch (error) {
                console.error(`[WebSocket] Error sending to client ${client.userId}:`, error);
            }
        }
    });
}

// -----------------------------
// CREATE WINDOW
// -----------------------------
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../shared/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the appropriate URL based on environment
  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Focus on the window when initially shown
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Setup auto-updater
  setupAutoUpdaterIPC(mainWindow);
  configureAutoUpdater();
  autoUpdater.checkForUpdatesAndNotify();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Function to create main window with license gate
function createMainWindowWithLicenseGate() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../shared/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the appropriate URL based on environment
  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000?showLicenseGate=true'
    : `file://${path.join(__dirname, '../renderer/index.html')}?showLicenseGate=true`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Focus on the window when initially shown
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Setup auto-updater
  setupAutoUpdaterIPC(mainWindow);
  configureAutoUpdater();
  autoUpdater.checkForUpdatesAndNotify();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// -----------------------------
// REGISTER IPC HANDLERS
// -----------------------------
function registerIPC() {
  // Config: get entire config (for non-license preferences)
  ipcMain.handle("config:get", async () => {
    return readConfig();
  });

  // 🔹 Auth: expose auth token to renderer (for live sessions, portal, etc.)
  ipcMain.handle("auth:getToken", async () => {
    return store.get("authToken", null);
  });

  // License: set license key (using electron-store as source of truth)
  ipcMain.handle("config:setLicenseKey", async (event, licenseKey) => {
    store.set("licenseKey", licenseKey);
    store.set("licenseLastUpdated", Date.now());
    return true;
  });

  // License: clear license key
  ipcMain.handle("config:clearLicense", async () => {
    store.delete("licenseKey");
    store.delete("licenseLastUpdated");
    return true;
  });

  // License: get current license key
  ipcMain.handle("license:getKey", async () => {
    return store.get("licenseKey");
  });

  // License: verify with backend
  ipcMain.handle("license:verify", async (event, licenseKey) => {
    try {
      const result = await verifyLicenseWithBackend(licenseKey);
      return { ok: true, result };
    } catch (e) {
      console.error("License verify failed:", e);
      return { ok: false, error: e.message };
    }
  });

  // 🔹 Unified Cloudflare Agent entrypoint
  ipcMain.handle("agent:ask", async (event, payload) => {
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).slice(2, 9);

    // Normalize payload
    const body =
      typeof payload === "string"
        ? { message: payload }
        : { ...(payload || {}) };

    const started = Date.now();

    // Per-request debug log (visible in terminal/devtools)
    console.log("\n[RinaAgent]", requestId, "→ Outgoing @", timestamp);
    console.log("[RinaAgent]", requestId, "Payload:", {
      // Don't spam huge objects
      message: body.message || body.prompt || "<no message>",
      type: body.type || body.mode || "generic",
    });

    // Also send a log event to the renderer for the in-app debug panel
    if (mainWindow) {
      mainWindow.webContents.send("agent:log", {
        requestId,
        phase: "request",
        timestamp,
        bodyPreview: {
          message: body.message || body.prompt || "<no message>",
          type: body.type || body.mode || "generic",
        },
      });
    }

    try {
      const res = await fetch(RINA_AGENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Optional secret header if your Worker expects one:
          // "x-rinawarp-agent-secret": process.env.RINA_AGENT_SECRET || "",
        },
        body: JSON.stringify(body),
      });

      const rawText = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = rawText;
      }

      const duration = Date.now() - started;

      console.log(
        "[RinaAgent]",
        requestId,
        "← Response",
        `HTTP ${res.status} in ${duration}ms`
      );
      console.log("[RinaAgent]", requestId, "Body:", parsed);

      if (mainWindow) {
        mainWindow.webContents.send("agent:log", {
          requestId,
          phase: "response",
          status: res.status,
          duration,
          body: parsed,
        });
      }

      if (!res.ok) {
        agentStatus = {
          healthy: false,
          lastChecked: new Date().toISOString(),
          lastError: `HTTP ${res.status}`,
        };
        broadcastAgentStatus();

        return {
          ok: false,
          status: res.status,
          error:
            (parsed && parsed.error) ||
            (typeof parsed === "string" ? parsed : "Agent API error"),
          raw: parsed,
        };
      }

      agentStatus = {
        healthy: true,
        lastChecked: new Date().toISOString(),
        lastError: null,
      };
      broadcastAgentStatus();

      return {
        ok: true,
        status: res.status,
        data: parsed,
      };
    } catch (err) {
      const duration = Date.now() - started;
      console.error(
        "[RinaAgent]",
        requestId,
        "Request failed after",
        duration,
        "ms:",
        err
      );

      agentStatus = {
        healthy: false,
        lastChecked: new Date().toISOString(),
        lastError: err.message || String(err),
      };
      broadcastAgentStatus();

      if (mainWindow) {
        mainWindow.webContents.send("agent:log", {
          requestId,
          phase: "error",
          duration,
          error: err.message || String(err),
        });
      }

      return {
        ok: false,
        error: "Agent request failed",
        details: err.message || String(err),
      };
    }
  });

  // 🔹 Agent status IPC
  ipcMain.handle("agent:get-status", async () => {
    // Returns the last known status (used by status indicator on startup)
    return agentStatus;
  });

  ipcMain.handle("agent:check-now", async () => {
    // Forces a health check and returns fresh status
    const status = await checkAgentHealth({ broadcast: true });
    return status;
  });
  ipcMain.handle("rina:chat", async (event, payload = {}) => {
    const { prompt } = payload;
    const licenseKey = store.get("licenseKey", null);
    const token = store.get("authToken", null);

    if (!prompt || !prompt.trim()) {
      return { error: true, message: "Empty prompt" };
    }

    try {
      const res = await fetch(RINA_AGENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode: "rina",
          licenseKey,
          context: {
            app: "terminal-pro",
            os: process.platform,
            moodHint: "focused",
            userSkillLevel: "intermediate",
            projectType: "terminal-pro",
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      // Store license plan if backend returns it
      if (data.license && data.license.plan) {
        store.set("licensePlan", data.license.plan);
        store.set("licenseFeatures", data.license.features || {});
      }

      return data;
    } catch (err) {
      console.error("Rina IPC error:", err);
      return {
        error: true,
        message: "Failed to reach Rina AI service",
        details: err.message,
      };
    }
  });
  // 🔹 Get Rina layout (open/width)
  ipcMain.handle("rina:get-layout", async () => {
    const layout = store.get("rinaLayout", {
      isOpen: true,
      sidebarWidth: 360,
      onboardingDone: false,
    });
    return layout;
  });

  // 🔹 Set Rina layout
  ipcMain.handle("rina:set-layout", async (event, layoutUpdate = {}) => {
    const current = store.get("rinaLayout", {
      isOpen: true,
      sidebarWidth: 360,
      onboardingDone: false,
    });

    const next = {
      ...current,
      ...layoutUpdate,
    };

    store.set("rinaLayout", next);
    return next;
  });

  // 🔹 Get license plan
  ipcMain.handle("get-license-plan", async () => {
    return {
      plan: store.get("licensePlan", "free"),
      features: store.get("licenseFeatures", {}),
    };
  });

  // 🔹 Start Stripe upgrade
  ipcMain.handle("billing:start-upgrade", async (event, { tier }) => {
    const licenseKey = store.get("licenseKey", null);
    const token = store.get("authToken", null);

    try {
      const res = await fetch(`${API_ROOT}/api/billing/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tier,
          licenseKey,
          success_url: "rinawarp-terminal-pro://upgrade-success",
          cancel_url: "rinawarp-terminal-pro://upgrade-cancel",
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Open Stripe checkout in default browser
        shell.openExternal(data.url);
        return { success: true, url: data.url };
      } else {
        return { success: false, error: "No checkout URL returned" };
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      return {
        success: false,
        error: "Failed to create checkout session",
        details: err.message,
      };
    }
  });

  // 🔹 Refresh license from backend
  ipcMain.handle("license:refresh", async () => {
    const licenseKey = store.get("licenseKey", null);
    const token = store.get("authToken", null);

    try {
      const res = await fetch(`${API_ROOT}/api/license/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await res.json();

      if (data.plan) {
        // Update stored license info
        store.set("licensePlan", data.plan);
        store.set("licenseFeatures", data.features || {});
        return data;
      } else {
        return { plan: "free", features: {} };
      }
    } catch (err) {
      console.error("License refresh error:", err);
      return { plan: "free", features: {} };
    }
  });
  // Add IPC handler for restarting app
  ipcMain.handle("update:restart", () => {
    autoUpdater.quitAndInstall();
  });

  // Sync IPC handlers
  ipcMain.handle("sync:save", async (event, { key, value }) => {
    const userId = store.get("userId");
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const res = await fetch(`${API_ROOT}/api/sync/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, key, value })
      });

      if (!res.ok) {
        throw new Error(`Sync save failed: ${res.status}`);
      }

      return true;
    } catch (err) {
      console.error("Sync save error:", err);
      throw err;
    }
  });

  ipcMain.handle("sync:load", async (event, { key }) => {
    const userId = store.get("userId");
    if (!userId) {
      return null;
    }

    try {
      const res = await fetch(`${API_ROOT}/api/sync/load?userId=${userId}&key=${key}`);
      if (!res.ok) {
        throw new Error(`Sync load failed: ${res.status}`);
      }

      const data = await res.json();
      return data.value;
    } catch (err) {
      console.error("Sync load error:", err);
      return null;
    }
  });

  // Add IPC handlers for update channel management
  ipcMain.handle("update:get-channel", () => {
    return store.get("updateChannel", "stable");
  });

  ipcMain.handle("update:set-channel", (event, channel) => {
    const allowed = ["stable", "canary", "nightly"];
    if (!allowed.includes(channel)) return store.get("updateChannel", "stable");
    store.set("updateChannel", channel);
    return channel;
  });

  // Add IPC handlers for changelog functionality
  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });

  ipcMain.handle("get-release-notes", () => {
    // This will be called when the update is downloaded
    // The release notes are available in the update info
    return "Latest update includes:\n- Improved performance\n- Bug fixes\n- New features";
  });

  // ──────────────── Team IPC Handlers ────────────────
  ipcMain.handle("team:create-billing-session", async (event, { teamId, seats }) => {
    const userId = store.get("userId");
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const res = await fetch(`${API_ROOT}/api/team/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, seats })
      });

      if (!res.ok) {
        throw new Error(`Billing request failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Team billing error:", err);
      throw err;
    }
  });

  ipcMain.handle("team:get-seats", async (event, { teamId }) => {
    try {
      const res = await fetch(`${API_ROOT}/api/team/seats?teamId=${teamId}`);
      if (!res.ok) {
        throw new Error(`Seats request failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Team seats error:", err);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("team:create-shared-session", async (event, { teamId, sessionName }) => {
    const userId = store.get("userId");
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const res = await fetch(`${API_ROOT}/api/team/shared-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, userId, sessionName })
      });

      if (!res.ok) {
        throw new Error(`Session creation failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Shared session error:", err);
      throw err;
    }
  });

  ipcMain.handle("team:join-session", async (event, { sessionId }) => {
    const userId = store.get("userId");
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const res = await fetch(`${API_ROOT}/api/team/join-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId })
      });

      if (!res.ok) {
        throw new Error(`Join session failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Join session error:", err);
      throw err;
    }
  });

  ipcMain.handle("team:get-activity", async (event, { teamId, limit = 50 }) => {
    try {
      const res = await fetch(`${API_ROOT}/api/team/activity?teamId=${teamId}&limit=${limit}`);
      if (!res.ok) {
        throw new Error(`Activity request failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Team activity error:", err);
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle("team:store-ai-memory", async (event, { teamId, memoryType, content, tags }) => {
    const userId = store.get("userId");
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const res = await fetch(`${API_ROOT}/api/team/ai-memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, userId, memoryType, content, tags })
      });

      if (!res.ok) {
        throw new Error(`AI memory storage failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("AI memory error:", err);
      throw err;
    }
  });

  ipcMain.handle("team:search-memory", async (event, { teamId, query, memoryType, limit }) => {
    try {
      let url = `${API_ROOT}/api/team/search-memory?teamId=${teamId}`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (memoryType) url += `&type=${memoryType}`;
      if (limit) url += `&limit=${limit}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Memory search failed: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Memory search error:", err);
      return { ok: false, error: err.message };
    }
  });

  // 🔹 Open Mission Control Portal
  ipcMain.handle("portal:open", async (event, { teamId }) => {
    const userId = store.get("userId");
    const authToken = store.get("authToken");

    if (!userId || !authToken) {
      throw new Error("User not authenticated");
    }

    // Open the portal in the default browser
    const portalUrl = teamId
      ? `https://rinawarptech.com/portal?teamId=${teamId}`
      : `https://rinawarptech.com/portal`;

    shell.openExternal(portalUrl);
    return { success: true, url: portalUrl };
  });

  // ──────────────── Terminal IPC Handlers ────────────────

  ipcMain.handle('terminal:create', (event, options = {}) => {
    const shell =
      options.shell ||
      (process.platform === 'win32'
        ? 'powershell.exe'
        : process.env.SHELL || '/bin/bash');

    const cols = options.cols || 80;
    const rows = options.rows || 24;
    const cwd = options.cwd || os.homedir();

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols,
      rows,
      cwd,
      env: process.env,
    });

    const id = String(nextTerminalId++);
    terminals.set(id, ptyProcess);

    ptyProcess.onData((data) => {
      event.sender.send('terminal:data', { id, data });
    });

    ptyProcess.onExit((exit) => {
      event.sender.send('terminal:exit', {
        id,
        code: exit.exitCode,
        signal: exit.signal,
      });
      terminals.delete(id);
    });

    return { id };
  });

  ipcMain.handle('terminal:write', (event, { id, data }) => {
    const term = terminals.get(id);
    if (term) term.write(data);
  });

  ipcMain.handle('terminal:resize', (event, { id, cols, rows }) => {
    const term = terminals.get(id);
    if (term && Number.isFinite(cols) && Number.isFinite(rows)) {
      try {
        term.resize(cols, rows);
      } catch (err) {
        console.error('Failed to resize PTY', id, err);
      }
    }
  });

  ipcMain.handle('terminal:kill', (event, { id }) => {
    const term = terminals.get(id);
    if (term) {
      try {
        term.kill();
      } catch (err) {
        console.error('Failed to kill PTY', id, err);
      }
      terminals.delete(id);
    }
  });

  // Voice handlers
  ipcMain.handle("voice:start", async () => {
    if (micStream) return;

    if (!ai) {
      mainWindow.webContents.send("voice:error", "OpenAI API key not configured");
      return;
    }

    micStream = recorder.record({
      sampleRateHertz: 16000,
      threshold: 0,
      verbose: false,
      recordProgram: "arecord"
    });

    const audio = micStream.stream();

    let buffer = [];

    audio.on("data", (chunk) => buffer.push(chunk));

    audio.on("end", async () => {
      try {
        const full = Buffer.concat(buffer);

        // speech → text
        const text = await ai.audio.transcriptions.create({
          file: full,
          model: "gpt-4o-mini-tts",
          language: "en"
        });

        const transcript = text.text;
        mainWindow.webContents.send("voice:transcript", transcript);

        // AI → response
        const answer = await ai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are Rina Agent, respond concisely." },
            { role: "user", content: transcript }
          ]
        });

        const reply = answer.choices[0].message.content;

        // speak response
        const audioOut = await ai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: "alloy",
          input: reply
        });

        mainWindow.webContents.send("voice:response", reply);
      } catch (error) {
        console.error("Voice processing error:", error);
        mainWindow.webContents.send("voice:error", "Failed to process voice: " + error.message);
      }
    });
  });

    // ──────────────── WebSocket IPC Handlers ────────────────
    ipcMain.handle('websocket:start-server', async () => {
        try {
            const success = setupWebSocketServer();
            return { success, port: process.env.WEBSOCKET_PORT || 8080 };
        } catch (error) {
            console.error('[WebSocket] Failed to start server:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('websocket:stop-server', async () => {
        try {
            if (websocketServer) {
                websocketServer.close();
                websocketServer = null;
                sharedTerminalSessions.clear();
                console.log('[WebSocket] Server stopped');
                return { success: true };
            }
            return { success: true, message: 'Server not running' };
        } catch (error) {
            console.error('[WebSocket] Failed to stop server:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('websocket:create-shared-session', async (event, { terminalId, sessionName }) => {
        try {
            const userId = store.get("userId");
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Create session via backend API
            const res = await fetch(`${API_ROOT}/api/terminal/create-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.get("authToken")}`
                },
                body: JSON.stringify({
                    terminalId,
                    sessionName,
                    userId
                })
            });

            if (!res.ok) {
                throw new Error(`Session creation failed: ${res.status}`);
            }

            const data = await res.json();

            // Store terminal ID in session
            const session = sharedTerminalSessions.get(data.sessionId) || {
                terminalId: null,
                participants: new Set()
            };
            session.terminalId = terminalId;
            sharedTerminalSessions.set(data.sessionId, session);

            return data;
        } catch (err) {
            console.error("Shared session creation error:", err);
            throw err;
        }
    });

    ipcMain.handle('websocket:join-shared-session', async (event, { sessionId }) => {
        try {
            const userId = store.get("userId");
            const token = store.get("authToken");
            if (!userId || !token) {
                throw new Error("User not authenticated");
            }

            // Join session via backend API
            const res = await fetch(`${API_ROOT}/api/terminal/join-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId,
                    userId
                })
            });

            if (!res.ok) {
                throw new Error(`Join session failed: ${res.status}`);
            }

            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Join session error:", err);
            throw err;
        }
    });

    ipcMain.handle('websocket:broadcast-terminal-data', async (event, { sessionId, terminalId, data }) => {
        try {
            const session = sharedTerminalSessions.get(sessionId);
            if (!session || session.terminalId !== terminalId) {
                throw new Error("Invalid session or terminal");
            }

            // Broadcast terminal data to all participants
            broadcastToSession(sessionId, null, {
                type: 'terminal-data',
                terminalId,
                data
            });

            return { success: true };
        } catch (err) {
            console.error("Broadcast error:", err);
            throw err;
        }
    });
  // Add IPC handler for crash recovery status
  ipcMain.handle("crash-recovery:get-status", async () => {
    const state = store.get("crashRecovery");
    if (state) {
      return {
        hasRecoveryData: true,
        timestamp: state.timestamp,
        hasTerminalState: state.lastTerminalState?.length > 0,
        hasSession: !!state.lastSession,
        hasFiles: !!state.lastFiles
      };
    }
    return { hasRecoveryData: false };
  });

  // Add IPC handler to clear crash recovery data
  ipcMain.handle("crash-recovery:clear", async () => {
    store.delete("crashRecovery");
    return true;
  });
}

// ==== CRASH RECOVERY SYSTEM =======================================
// Save terminal state before app quit
function saveTerminalState() {
  try {
    const state = {
      lastTerminalState: Array.from(terminals.entries()).map(([id, term]) => ({
        id,
        shell: term.shell,
        cwd: term.cwd,
        cols: term.cols,
        rows: term.rows
      })),
      lastSession: store.get("lastSession"),
      lastFiles: store.get("lastFiles"),
      timestamp: new Date().toISOString()
    };
    store.set("crashRecovery", state);
    console.log("[CrashRecovery] State saved");
  } catch (e) {
    console.error("[CrashRecovery] Failed to save state:", e);
  }
}

// Restore terminal state after crash
async function restoreTerminalState() {
  try {
    const state = store.get("crashRecovery");
    if (state) {
      console.log("[CrashRecovery] Restoring from crash...", state);
      store.set("lastSession", state.lastSession);
      store.set("lastFiles", state.lastFiles);
      // State restored, will be shown in UI
    }
  } catch (e) {
    console.error("[CrashRecovery] Failed to restore state:", e);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  saveTerminalState();
  // Restart app after 2 seconds
  setTimeout(() => {
    app.relaunch();
    app.quit();
  }, 2000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  saveTerminalState();
});

// Main entry point
(async () => {
  // Import electron dynamically
  const { app, BrowserWindow, ipcMain, shell } = await import('electron');

  // Initialize Sentry after electron is imported
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.3,
      release: `rinawarp-terminal-pro@${app.getVersion?.() || "dev"}`,
      environment: process.env.NODE_ENV || "production",
    });
  }

  // Initialize auto-updater after app is ready
  const { autoUpdater } = await import('electron-updater');
  const log = await import('electron-log');

  // Logging
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";

  // Where updates are hosted
  autoUpdater.setFeedURL({
    provider: "generic",
    url: "https://download.rinawarptech.com/releases/"
  });

  // Initialize store first
  await initStore();

  // Start WebSocket server for collaboration
  setupWebSocketServer();

  // CRITICAL FIX: Wait for app to be ready before creating windows
  app.whenReady().then(async () => {
    // Check license status before creating main window
    const licenseKey = store.get("licenseKey");

    if (licenseKey) {
      // License key exists, verify it with backend
      verifyLicenseWithBackend(licenseKey)
        .then(result => {
          if (result.valid) {
            // Valid license, proceed to main app
            createMainWindow();
            registerIPC();
          } else {
            // Invalid license, show license gate
            createMainWindowWithLicenseGate();
            registerIPC();
          }
        })
        .catch(error => {
          console.error("License verification failed, showing license gate:", error);
          createMainWindowWithLicenseGate();
          registerIPC();
        });
    } else {
      // No license key, show license gate
      createMainWindowWithLicenseGate();
      registerIPC();
    }

    // Initial Agent health check + periodic pings (every 60s)
    checkAgentHealth({ broadcast: true });
    setInterval(() => {
      checkAgentHealth({ broadcast: true });
    }, 60_000);

    // Restore from crash if needed
    await restoreTerminalState();
  });
      })
      .catch(error => {
        console.error("License verification failed, showing license gate:", error);
        createMainWindowWithLicenseGate();
        registerIPC();
      });
  } else {
    // No license key, show license gate
    createMainWindowWithLicenseGate();
    registerIPC();
  }

  // Initial Agent health check + periodic pings (every 60s)
  checkAgentHealth({ broadcast: true });
  setInterval(() => {
    checkAgentHealth({ broadcast: true });
  }, 60_000);

  // Restore from crash if needed
  await restoreTerminalState();

  // Save state before quit
  app.on('before-quit', () => {
    saveTerminalState();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const licenseKey = store.get("licenseKey");
      if (licenseKey) {
        createMainWindow();
      } else {
        createMainWindowWithLicenseGate();
      }
    }
  });

  // -----------------------------
  // QUIT WHEN ALL WINDOWS CLOSED
  // -----------------------------
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
})();