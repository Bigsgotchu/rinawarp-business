export default {
  async fetch(request, env, ctx) {
    const upgrade = request.headers.get("Upgrade");
    if (upgrade !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const sessionId = parts[parts.length - 1]; // /ws/shared-terminal/:sessionId

    if (!sessionId) {
      return new Response("Missing sessionId", { status: 400 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const hub = new SharedTerminalHub(sessionId, env);
    hub.accept(server);

    return new Response(null, { status: 101, webSocket: client });
  },
};

class SharedTerminalHub {
  /**
   * @param {string} sessionId
   * @param {any} env
   */
  constructor(sessionId, env) {
    this.sessionId = sessionId;
    this.env = env;
    this.clients = new Map(); // client -> { userId, teamId, role }
    this.nextClientId = 1;
  }

  accept(ws) {
    const clientId = `c_${this.nextClientId++}`;

    ws.accept();
    this.clients.set(ws, {
      clientId,
      userId: null,
      teamId: null,
      role: "guest",
    });

    ws.addEventListener("message", (event) =>
      this.onMessage(ws, event, clientId)
    );
    ws.addEventListener("close", () => this.onClose(ws));
    ws.addEventListener("error", (err) => {
      console.error("[SharedTerminal] WS error:", err);
      this.onClose(ws);
    });
  }

  async onMessage(ws, event, clientId) {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (e) {
      console.warn("Invalid JSON message:", event.data);
      return;
    }

    const meta = this.clients.get(ws);
    if (!meta) return;

    switch (msg.type) {
      case "hello": {
        // { type: "hello", userId, teamId, role }
        meta.userId = msg.userId || null;
        meta.teamId = msg.teamId || null;
        meta.role = msg.role === "host" ? "host" : "guest";
        this.broadcast({
          type: "participant_joined",
          clientId: meta.clientId,
          userId: meta.userId,
          teamId: meta.teamId,
          role: meta.role,
        });
        await this.logEvent("join", meta, {});
        break;
      }

      case "pty_out": {
        // Only host should send PTY output
        if (meta.role !== "host") return;
        // { type: "pty_out", data, tabId }
        this.broadcastExcept(ws, {
          type: "pty_out",
          data: msg.data,
          tabId: msg.tabId,
        });
        await this.logEvent("pty_out", meta, {
          tabId: msg.tabId,
          size: msg.data ? msg.data.length : 0,
        });
        break;
      }

      case "input": {
        // Guests and host can send input; host app will decide how to handle
        // { type: "input", data, tabId }
        this.broadcast({
          type: "input",
          fromClientId: meta.clientId,
          data: msg.data,
          tabId: msg.tabId,
        });
        await this.logEvent("input", meta, {
          tabId: msg.tabId,
          size: msg.data ? msg.data.length : 0,
        });
        break;
      }

      case "meta": {
        // Generic metadata (cursor positions, focus, etc.)
        this.broadcast({
          type: "meta",
          fromClientId: meta.clientId,
          payload: msg.payload || {},
        });
        await this.logEvent("meta", meta, { payload: msg.payload || {} });
        break;
      }

      default:
        console.warn("Unknown message type:", msg.type);
    }
  }

  onClose(ws) {
    const meta = this.clients.get(ws);
    if (!meta) return;
    this.clients.delete(ws);

    this.broadcast({
      type: "participant_left",
      clientId: meta.clientId,
      userId: meta.userId,
      role: meta.role,
    });

    this.logEvent("leave", meta, {}).catch((err) =>
      console.error("logEvent leave failed", err)
    );
  }

  broadcast(payload) {
    const msg = JSON.stringify({ sessionId: this.sessionId, ...payload });
    for (const ws of this.clients.keys()) {
      try {
        ws.send(msg);
      } catch (e) {
        console.warn("Failed to send WS message:", e);
      }
    }
  }

  broadcastExcept(exceptWs, payload) {
    const msg = JSON.stringify({ sessionId: this.sessionId, ...payload });
    for (const ws of this.clients.keys()) {
      if (ws === exceptWs) continue;
      try {
        ws.send(msg);
      } catch (e) {
        console.warn("Failed to send WS message:", e);
      }
    }
  }

  async logEvent(eventType, meta, payload) {
    try {
      const db = this.env.RINAWARP_D1;
      const now = Date.now();
      await db
        .prepare(
          `INSERT INTO session_realtime_events
          (session_id, team_id, user_id, role, event_type, payload, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          this.sessionId,
          meta.teamId,
          meta.userId,
          meta.role,
          eventType,
          JSON.stringify(payload || {}),
          now
        )
        .run();
    } catch (e) {
      console.error("[SharedTerminal] Failed to log event:", e);
    }
  }
}