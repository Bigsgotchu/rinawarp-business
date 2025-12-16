export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Simple health check
    if (pathname === '/api/live-session/health') {
      return json({ ok: true, service: 'live-session-worker' });
    }

    // WebSocket endpoint
    if (pathname.startsWith('/ws/live-session/')) {
      return handleWebSocket(request, env, ctx);
    }

    // REST: create a new shared session (host)
    if (pathname === '/api/live-session/create' && request.method === 'POST') {
      return handleCreateSession(request, env);
    }

    // REST: join an existing session (guest)
    if (pathname === '/api/live-session/join' && request.method === 'POST') {
      return handleJoinSession(request, env);
    }

    // REST: get session summary
    if (pathname.startsWith('/api/live-session/') && request.method === 'GET') {
      const [, , , sessionId] = pathname.split('/');
      if (!sessionId) return json({ error: 'Missing sessionId' }, 400);
      return handleGetSession(sessionId, env);
    }

    // REST: get replayable events
    if (pathname.startsWith('/api/live-session-events/') && request.method === 'GET') {
      const [, , , sessionId] = pathname.split('/');
      if (!sessionId) return json({ error: 'Missing sessionId' }, 400);
      return handleGetSessionEvents(sessionId, request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};

/* ──────────────────────────────────────────────
 * Helpers
 * ─────────────────────────────────────────── */

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function nowMs() {
  return Date.now();
}

class AuthError extends Error {}

// ⚠️ TEMP: minimal JWT decode (no signature verify)
// You can replace this with real verification later.
function parseAuthOrThrow(request) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    throw new AuthError('Missing bearer token');
  }
  const token = auth.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length < 2) throw new AuthError('Invalid token');

  try {
    const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);

    if (!payload.sub || !payload.teamId) {
      throw new AuthError('Missing user/team claims');
    }

    return {
      userId: payload.sub,
      teamId: payload.teamId,
      name: payload.name || 'Unknown',
      raw: payload,
    };
  } catch (err) {
    throw new AuthError('Failed to decode token');
  }
}

/* ──────────────────────────────────────────────
 * REST: Create Session (host)
 * ─────────────────────────────────────────── */

async function handleCreateSession(request, env) {
  let user;
  try {
    user = parseAuthOrThrow(request);
  } catch (err) {
    if (err instanceof AuthError) return json({ error: err.message }, 401);
    throw err;
  }

  const body = await safeJson(request);
  const title = body.title || 'Shared Terminal Session';
  const description = body.description || '';
  const settings = body.settings || {};
  const sessionId = crypto.randomUUID();
  const ts = nowMs();

  // Insert session row
  await env.DB.prepare(
    `
    INSERT INTO live_sessions (
      id, team_id, host_user_id, host_name,
      status, title, description, created_at, last_activity_at
    )
    VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)
  `,
  )
    .bind(sessionId, user.teamId, user.userId, user.name, title, description, ts, ts)
    .run();

  // Insert host participant
  await env.DB.prepare(
    `
    INSERT INTO live_session_participants (
      session_id, user_id, name, role, joined_at, last_seen_at
    )
    VALUES (?, ?, ?, 'host', ?, ?)
  `,
  )
    .bind(sessionId, user.userId, user.name, ts, ts)
    .run();

  // Cache session state in KV
  await env.LIVE_SESSIONS.put(
    `session:${sessionId}`,
    JSON.stringify({
      sessionId,
      teamId: user.teamId,
      hostUserId: user.userId,
      hostName: user.name,
      status: 'active',
      lastActivityAt: ts,
    }),
    { expirationTtl: 60 * 60 },
  );

  // Log event
  await logEvent(env, sessionId, {
    kind: 'meta',
    actorUserId: user.userId,
    actorName: user.name,
    payload: {
      type: 'session_created',
      title,
      description,
      settings,
    },
  });

  const wsUrl = buildWsUrl(
    request,
    sessionId,
    'host',
    request.headers.get('Authorization')?.replace('Bearer ', ''),
  );

  return json({
    ok: true,
    sessionId,
    role: 'host',
    wsUrl,
  });
}

/* ──────────────────────────────────────────────
 * REST: Join Session (guest)
 * ─────────────────────────────────────────── */

async function handleJoinSession(request, env) {
  let user;
  try {
    user = parseAuthOrThrow(request);
  } catch (err) {
    if (err instanceof AuthError) return json({ error: err.message }, 401);
    throw err;
  }

  const body = await safeJson(request);
  const sessionId = body.sessionId;
  if (!sessionId) return json({ error: 'Missing sessionId' }, 400);

  const session = await env.DB.prepare(`SELECT * FROM live_sessions WHERE id = ?`)
    .bind(sessionId)
    .first();

  if (!session) return json({ error: 'Session not found' }, 404);
  if (session.status !== 'active') return json({ error: 'Session is not active' }, 400);

  // Enforce same team
  if (session.team_id !== user.teamId) {
    return json({ error: 'Not authorized for this team session' }, 403);
  }

  const ts = nowMs();

  await env.DB.prepare(
    `
    INSERT INTO live_session_participants (
      session_id, user_id, name, role, joined_at, last_seen_at
    )
    VALUES (?, ?, ?, 'guest', ?, ?)
  `,
  )
    .bind(sessionId, user.userId, user.name, ts, ts)
    .run();

  await env.DB.prepare(`UPDATE live_sessions SET last_activity_at = ? WHERE id = ?`)
    .bind(ts, sessionId)
    .run();

  await env.LIVE_SESSIONS.put(
    `session:${sessionId}`,
    JSON.stringify({
      sessionId,
      teamId: session.team_id,
      hostUserId: session.host_user_id,
      hostName: session.host_name,
      status: 'active',
      lastActivityAt: ts,
    }),
    { expirationTtl: 60 * 60 },
  );

  await logEvent(env, sessionId, {
    kind: 'join',
    actorUserId: user.userId,
    actorName: user.name,
    payload: { role: 'guest' },
  });

  const wsUrl = buildWsUrl(
    request,
    sessionId,
    'guest',
    request.headers.get('Authorization')?.replace('Bearer ', ''),
  );

  return json({
    ok: true,
    sessionId,
    role: 'guest',
    wsUrl,
  });
}

/* ──────────────────────────────────────────────
 * REST: Get Session Summary
 * ─────────────────────────────────────────── */

async function handleGetSession(sessionId, env) {
  const session = await env.DB.prepare(`SELECT * FROM live_sessions WHERE id = ?`)
    .bind(sessionId)
    .first();

  if (!session) return json({ error: 'Session not found' }, 404);

  const participants = await env.DB.prepare(
    `
    SELECT user_id, name, role, joined_at, last_seen_at, left_at
    FROM live_session_participants
    WHERE session_id = ?
    ORDER BY joined_at ASC
  `,
  )
    .bind(sessionId)
    .all();

  return json({
    ok: true,
    session,
    participants: participants.results || [],
  });
}

/* ──────────────────────────────────────────────
 * REST: Get Session Events (replay)
 * ─────────────────────────────────────────── */

async function handleGetSessionEvents(sessionId, request, env) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '200', 10), 1000);
  const beforeTs = parseInt(url.searchParams.get('beforeTs') || '0', 10);

  let query = `
    SELECT id, ts, actor_user_id, actor_name, kind, payload
    FROM live_session_events
    WHERE session_id = ?
  `;
  const params = [sessionId];

  if (beforeTs > 0) {
    query += ' AND ts < ? ';
    params.push(beforeTs);
  }

  query += ' ORDER BY ts DESC LIMIT ? ';
  params.push(limit);

  const events = await env.DB.prepare(query)
    .bind(...params)
    .all();

  return json({
    ok: true,
    sessionId,
    events: (events.results || []).map((e) => ({
      id: e.id,
      ts: e.ts,
      actorUserId: e.actor_user_id,
      actorName: e.actor_name,
      kind: e.kind,
      payload: safeParseJson(e.payload),
    })),
  });
}

/* ──────────────────────────────────────────────
 * WebSocket: live stream
 * ─────────────────────────────────────────── */

// In-memory registry per worker instance
// For true global state you’d move this to Durable Objects
const sessionSockets = new Map(); // sessionId → { host: WebSocket|null, guests: Set<WebSocket> }

function getSessionState(sessionId) {
  if (!sessionSockets.has(sessionId)) {
    sessionSockets.set(sessionId, { host: null, guests: new Set() });
  }
  return sessionSockets.get(sessionId);
}

function handleWebSocket(request, env, ctx) {
  const upgradeHeader = request.headers.get('Upgrade') || '';
  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }

  const url = new URL(request.url);
  const [, , , sessionId] = url.pathname.split('/');
  if (!sessionId) return new Response('Missing sessionId', { status: 400 });

  const role = url.searchParams.get('role') || 'guest';

  // --- AUTH CHECK FOR WEBSOCKET -------------------------------------
  let user;
  try {
    // WS connections can't send Authorization header reliably,
    // so we accept token in query param: ?token=XYZ
    const token = url.searchParams.get('token');
    if (!token) throw new AuthError('Missing auth token');

    const fakeAuthHeader = new Request(request.url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    user = parseAuthOrThrow(fakeAuthHeader);
  } catch (err) {
    return new Response('Unauthorized WebSocket', { status: 401 });
  }

  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  const ts = nowMs();

  server.accept();

  const state = getSessionState(sessionId);

  if (role === 'host') {
    if (state.host) {
      server.send(JSON.stringify({ type: 'error', message: 'Host already connected' }));
      server.close(1013, 'Host already connected');
      return new Response(null, { status: 101, webSocket: client });
    }
    state.host = server;
  } else {
    state.guests.add(server);
  }

  server.send(JSON.stringify({ type: 'hello', sessionId, role, ts }));

  server.addEventListener('message', (event) =>
    handleWsMessage(event, { server, role, sessionId, env }),
  );

  server.addEventListener('close', () => handleWsClose({ server, role, sessionId }));

  // Lightweight keepalive marker in KV
  ctx.waitUntil(
    (async () => {
      try {
        await env.LIVE_SESSIONS.put(
          `session:${sessionId}`,
          JSON.stringify({ sessionId, lastPing: nowMs() }),
          { expirationTtl: 60 * 60 },
        );
      } catch (err) {
        console.error('KV keepalive error', err);
      }
    })(),
  );

  return new Response(null, { status: 101, webSocket: client });
}

async function handleWsMessage(event, { server, role, sessionId, env }) {
  let msg;
  try {
    msg = JSON.parse(event.data);
  } catch {
    server.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    return;
  }

  const kind = msg.type;

  // Host sends PTY output → broadcast to guests
  if (kind === 'pty_output' && role === 'host') {
    const data = msg.data || '';
    const state = getSessionState(sessionId);

    for (const guest of state.guests) {
      try {
        guest.send(JSON.stringify({ type: 'pty_output', data }));
      } catch (err) {
        console.error('Broadcast to guest failed', err);
      }
    }

    await logEvent(env, sessionId, {
      kind: 'pty_output',
      actorUserId: msg.actorUserId || null,
      actorName: msg.actorName || null,
      payload: { data },
    });

    await env.DB.prepare(`UPDATE live_sessions SET last_activity_at = ? WHERE id = ?`)
      .bind(nowMs(), sessionId)
      .run();

    return;
  }

  // Guest sends PTY input → forward to host
  if (kind === 'pty_input' && role === 'guest') {
    const data = msg.data || '';
    const state = getSessionState(sessionId);

    if (state.host) {
      try {
        state.host.send(
          JSON.stringify({
            type: 'pty_input',
            data,
            fromUserId: msg.actorUserId || null,
            fromUserName: msg.actorName || null,
          }),
        );
      } catch (err) {
        console.error('Forward to host failed', err);
      }

      await logEvent(env, sessionId, {
        kind: 'pty_input',
        actorUserId: msg.actorUserId || null,
        actorName: msg.actorName || null,
        payload: { data },
      });

      await env.DB.prepare(`UPDATE live_sessions SET last_activity_at = ? WHERE id = ?`)
        .bind(nowMs(), sessionId)
        .run();
    } else {
      server.send(
        JSON.stringify({
          type: 'error',
          message: 'Host is not connected',
        }),
      );
    }

    return;
  }

  // Meta messages (cursor, typing, presence etc.)
  if (kind === 'meta') {
    const state = getSessionState(sessionId);
    const payload = msg.payload || {};

    if (role === 'host') {
      for (const guest of state.guests) {
        try {
          guest.send(
            JSON.stringify({
              type: 'meta',
              payload,
              from: 'host',
            }),
          );
        } catch (err) {
          console.error('Meta to guest failed', err);
        }
      }
    } else {
      if (state.host) {
        try {
          state.host.send(
            JSON.stringify({
              type: 'meta',
              payload,
              from: 'guest',
            }),
          );
        } catch (err) {
          console.error('Meta to host failed', err);
        }
      }
    }

    await logEvent(env, sessionId, {
      kind: 'meta',
      actorUserId: msg.actorUserId || null,
      actorName: msg.actorName || null,
      payload,
    });

    return;
  }

  server.send(
    JSON.stringify({
      type: 'error',
      message: `Unknown message type: ${kind}`,
    }),
  );
}

function handleWsClose({ server, role, sessionId }) {
  const state = getSessionState(sessionId);
  if (role === 'host') {
    if (state.host === server) {
      state.host = null;
    }
  } else {
    state.guests.delete(server);
  }

  if (!state.host && state.guests.size === 0) {
    sessionSockets.delete(sessionId);
  }
}

/* ──────────────────────────────────────────────
 * Event logging to D1
 * ─────────────────────────────────────────── */

async function logEvent(env, sessionId, { kind, actorUserId, actorName, payload }) {
  const ts = nowMs();
  const payloadJson = JSON.stringify(payload || {});

  await env.DB.prepare(
    `
    INSERT INTO live_session_events (
      session_id, ts, actor_user_id, actor_name, kind, payload
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  )
    .bind(sessionId, ts, actorUserId || null, actorName || null, kind, payloadJson)
    .run();
}

/* ──────────────────────────────────────────────
 * Misc utils
 * ─────────────────────────────────────────── */

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function buildWsUrl(request, sessionId, role, token) {
  const url = new URL(request.url);
  const wsProto = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProto}//${url.host}/ws/live-session/${sessionId}?role=${role}&token=${token}`;
}
