// live-session.js
// RinaWarp Terminal Pro – Live Session Client (Host + Guest)

const API_ROOT =
  window.RINA_API_ROOT ||
  "https://api.rinawarptech.com"; // this should point at the worker domain

const LiveSessionState = {
  sessionId: null,
  role: null,          // "host" | "guest"
  ws: null,
  connected: false,
  connecting: false,
  lastError: null,
  hostTerminalId: null,
  onGuestInput: null,  // callback(data) used by host to write into PTY
};

async function getAuthToken() {
  try {
    if (window.RinaAuth?.getToken) {
      return await window.RinaAuth.getToken();
    }
  } catch (err) {
    console.error("[LiveSession] Failed to fetch auth token", err);
  }
  return null;
}

function setStatusUI(text, colorClass = "") {
  const el = document.getElementById("live-session-status");
  if (!el) return;

  el.textContent = text;
  el.className = "live-session-status"; // reset
  if (colorClass) el.classList.add(colorClass);
}

function appendLog(line) {
  const log = document.getElementById("live-session-log");
  if (!log) return;
  const div = document.createElement("div");
  div.className = "live-session-log-line";
  div.textContent = line;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function attachWebSocket(wsUrl) {
  if (LiveSessionState.ws) {
    try {
      LiveSessionState.ws.close();
    } catch {}
  }

  const ws = new WebSocket(wsUrl);
  LiveSessionState.ws = ws;
  LiveSessionState.connected = false;
  LiveSessionState.connecting = true;
  LiveSessionState.lastError = null;

  setStatusUI("Connecting…", "status-connecting");
  appendLog(`[ws] Connecting to ${wsUrl}`);

  ws.addEventListener("open", () => {
    LiveSessionState.connected = true;
    LiveSessionState.connecting = false;
    setStatusUI(
      `Live: ${LiveSessionState.role === "host" ? "Hosting" : "Guest"}`,
      "status-live"
    );
    appendLog("[ws] Connected");
  });

  ws.addEventListener("close", (ev) => {
    LiveSessionState.connected = false;
    LiveSessionState.connecting = false;
    setStatusUI("Offline", "status-offline");
    appendLog(
      `[ws] Closed (code=${ev.code}, reason=${ev.reason || "none"})`
    );
  });

  ws.addEventListener("error", (err) => {
    LiveSessionState.lastError = String(err);
    setStatusUI("Error", "status-error");
    appendLog(`[ws] Error: ${err}`);
  });

  ws.addEventListener("message", (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      handleIncomingMessage(msg);
    } catch (err) {
      appendLog(`[ws] Invalid JSON: ${ev.data}`);
    }
  });
}

function safeSend(msg) {
  if (!LiveSessionState.ws || LiveSessionState.ws.readyState !== WebSocket.OPEN) {
    appendLog("[ws] Tried to send but socket not open");
    return;
  }
  LiveSessionState.ws.send(JSON.stringify(msg));
}

function handleIncomingMessage(msg) {
  const { type } = msg;

  if (type === "hello") {
    appendLog(
      `[ws] hello – role=${msg.role} session=${msg.sessionId} ts=${msg.ts}`
    );
    return;
  }

  if (type === "error") {
    appendLog(`[ws] error: ${msg.message}`);
    setStatusUI("Error", "status-error");
    return;
  }

  if (type === "pty_output" && LiveSessionState.role === "guest") {
    appendLog("[ws] pty_output (guest) – forwarding to terminal");
    if (window.RinaTerminalUI?.writeToActiveTerminal) {
      window.RinaTerminalUI.writeToActiveTerminal(msg.data || "");
    }
    return;
  }

  if (type === "pty_input" && LiveSessionState.role === "host") {
    appendLog(
      `[ws] pty_input from guest ${msg.fromUserName || msg.fromUserId || "?"}`
    );
    if (typeof LiveSessionState.onGuestInput === "function") {
      LiveSessionState.onGuestInput(msg.data || "");
    }
    return;
  }

  if (type === "meta") {
    appendLog(
      `[ws] meta from ${msg.from}: ${JSON.stringify(msg.payload).slice(0, 120)}`
    );
    return;
  }

  appendLog(`[ws] unknown message: ${JSON.stringify(msg).slice(0, 120)}`);
}

/* ──────────────────────────────────────────────
 * Public API
 * ─────────────────────────────────────────── */

async function startHostSession(meta = {}) {
  if (LiveSessionState.connecting || LiveSessionState.connected) {
    appendLog("[live] Already connected; ignoring startHostSession");
    return LiveSessionState;
  }

  const token = await getAuthToken();
  if (!token) {
    appendLog("[live] No auth token; cannot host live session");
    setStatusUI("Auth required", "status-error");
    return LiveSessionState;
  }

  try {
    const res = await fetch(`${API_ROOT}/api/live-session/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meta),
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      appendLog(`[live] Failed to create session: ${json.error || res.status}`);
      setStatusUI("Create failed", "status-error");
      return LiveSessionState;
    }

    LiveSessionState.sessionId = json.sessionId;
    LiveSessionState.role = json.role || "host";

    appendLog(
      `[live] Hosting session ${json.sessionId}, role=${LiveSessionState.role}`
    );

    if (json.wsUrl) {
      attachWebSocket(json.wsUrl);
    }

    return LiveSessionState;
  } catch (err) {
    appendLog(`[live] Error creating session: ${err.message}`);
    setStatusUI("Error", "status-error");
    return LiveSessionState;
  }
}

async function joinSession(sessionId) {
  if (!sessionId) return;
  const token = await getAuthToken();
  if (!token) {
    appendLog("[live] No auth token; cannot join live session");
    setStatusUI("Auth required", "status-error");
    return LiveSessionState;
  }

  try {
    const res = await fetch(`${API_ROOT}/api/live-session/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      appendLog(
        `[live] Failed to join session: ${json.error || res.status}`
      );
      setStatusUI("Join failed", "status-error");
      return LiveSessionState;
    }

    LiveSessionState.sessionId = json.sessionId;
    LiveSessionState.role = json.role || "guest";

    appendLog(
      `[live] Joined session ${json.sessionId}, role=${LiveSessionState.role}`
    );

    if (json.wsUrl) {
      attachWebSocket(json.wsUrl);
    }

    return LiveSessionState;
  } catch (err) {
    appendLog(`[live] Error joining session: ${err.message}`);
    setStatusUI("Error", "status-error");
    return LiveSessionState;
  }
}

function sendPTYOutputFromHost(data) {
  if (
    LiveSessionState.role !== "host" ||
    !LiveSessionState.connected ||
    !data
  ) {
    return;
  }

  safeSend({
    type: "pty_output",
    data,
  });
}

function sendPTYInputFromGuest(data) {
  if (
    LiveSessionState.role !== "guest" ||
    !LiveSessionState.connected ||
    !data
  ) {
    return;
  }

  safeSend({
    type: "pty_input",
    data,
  });
}

function registerOnGuestInput(callback) {
  LiveSessionState.onGuestInput = callback;
}

function isLiveHost() {
  return LiveSessionState.connected && LiveSessionState.role === "host";
}

function isLiveGuest() {
  return LiveSessionState.connected && LiveSessionState.role === "guest";
}

/* ──────────────────────────────────────────────
 * Wire into UI buttons (if present)
 * ─────────────────────────────────────────── */

function initLiveSessionUI() {
  const hostBtn = document.getElementById("live-session-host-btn");
  const joinBtn = document.getElementById("live-session-join-btn");
  const joinInput = document.getElementById("live-session-join-input");

  if (hostBtn) {
    hostBtn.addEventListener("click", async () => {
      await startHostSession({
        title: "RinaWarp Live Terminal",
        description: "Shared Terminal Pro session",
      });
    });
  }

  if (joinBtn && joinInput) {
    joinBtn.addEventListener("click", async () => {
      const val = joinInput.value.trim();
      if (!val) return;
      await joinSession(val);
    });
  }

  setStatusUI("Offline", "status-offline");
}

/* ──────────────────────────────────────────────
 * Export global bridge
 * ─────────────────────────────────────────── */

window.RinaLiveSession = {
  state: LiveSessionState,
  startHostSession,
  joinSession,
  sendPTYOutputFromHost,
  sendPTYInputFromGuest,
  registerOnGuestInput,
  isLiveHost,
  isLiveGuest,
};

document.addEventListener("DOMContentLoaded", () => {
  initLiveSessionUI();
});