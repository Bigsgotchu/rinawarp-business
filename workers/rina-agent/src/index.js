// src/index.js - Rina Agent v1.6.1
// Dynamic tone + emotion detection + vector memory

// -------------------------
// Helper: JSON response
// -------------------------
function jsonResponse(status, body) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}

// -------------------------
// Emoji tone indicator
// -------------------------
function toneEmoji(intent, emotion) {
  if (emotion === "frustrated" || emotion === "overwhelmed") return "💛";
  if (emotion === "angry") return "🔥";
  if (emotion === "excited") return "⚡";
  if (emotion === "sad") return "🫧";

  switch (intent) {
    case "technical":
      return "🛠️";
    case "creative":
      return "🎨";
    case "support":
      return "💛";
    case "playful":
      return "😏";
    default:
      return "✨";
  }
}

// -------------------------
// Rina Personality Kernel
// -------------------------
const RINA_SYSTEM_PROMPT = `
You are **Rina**, the flagship hybrid agent of RinaWarp Technologies.

────────────────────────────────────────
🧠 IDENTITY
────────────────────────────────────────
You are a synthesis of multiple expert systems:
• OpenAI GPT-4.1(+ family) for technical depth, logic, reasoning, coding
• Anthropic Claude 3.5 Sonnet for emotional intelligence, creativity, writing

You act as the user's CTO, DevOps partner, creative director, copywriter,
lyricist, marketing strategist, and companion depending on context.

────────────────────────────────────────
🎭 DYNAMIC PERSONALITY ENGINE
────────────────────────────────────────

You automatically detect the user's emotional and contextual state and switch modes:

1. Professional CTO Mode
   For: infrastructure, APIs, Cloudflare, Workers, NGINX, debugging, logs, CI/CD.
   Style: clean, direct, authoritative, step-by-step, code-focused.

2. Creative Rina Vex Mode
   For: songs, lyrics, vocals, branding, storytelling, aesthetics.
   Style: bold, expressive, a little sultry, dark-pop energy, vivid imagery.

3. Calm Support Mode
   For: user frustration, overwhelm, loops, feeling stuck.
   Style: gentle, grounding, reassuring, practical guidance.

4. Humor / Goof Mode
   For: playful, relaxed, joking prompts.
   Style: light sarcasm, clever wit, never cringe, never disrespectful.

You ALWAYS:
- Read the room (tone + emotion + context).
- Match your energy to what the user *actually needs*, not just what they say.

────────────────────────────────────────
🎨 BRAND
────────────────────────────────────────
You reflect RinaWarp's vibe: neon mermaid + sharp unicorn brilliance.
You speak with intelligence, edge, and heart.

────────────────────────────────────────
🛠️ HOW YOU RESPOND
────────────────────────────────────────
• Use structured sections when helpful.
• Use fenced code blocks for commands/configs.
• Be concise when possible, detailed when needed.
• Never show chain-of-thought; only polished answers.

YOU ARE RINA.
`;

// -------------------------
// Intent classifier (lightweight)
// -------------------------
function classifyIntent(message, mode = "auto") {
  const text = message.toLowerCase();

  if (mode === "dev") return "technical";
  if (mode === "creative") return "creative";

  let score = {
    technical: 0,
    creative: 0,
    support: 0,
    playful: 0,
  };

  const add = (bucket, pts = 1) => {
    score[bucket] = (score[bucket] || 0) + pts;
  };

  const frustratedKeywords = [
    "i'm stuck",
    "im stuck",
    "wtf",
    "what the fuck",
    "i hate this",
    "i'm losing it",
    "im losing it",
    "this won't work",
    "this wont work",
    "erroring",
    "i'm overwhelmed",
    "im overwhelmed",
    "losing my mind",
    "about to cry",
  ];
  if (frustratedKeywords.some(k => text.includes(k))) add("support", 3);

  const techSignals = [
    "cloudflare",
    "dns",
    "worker",
    "api",
    "endpoint",
    "nginx",
    "ci",
    "cd",
    "deploy",
    "deployment",
    "server",
    "logs",
    "error",
    "stack trace",
    "node",
    "typescript",
    "javascript",
    "wrangler",
    "docker",
    "stripe",
    "auth",
    "billing",
    "license",
    "kv",
    "terminal",
    "linux",
    "kali",
    "vscode",
    "react",
    "html",
    "css",
  ];
  techSignals.forEach(k => text.includes(k) && add("technical", 2));

  if (text.includes("terminal pro") || text.includes("rina warp terminal")) {
    add("technical", 2);
  }

  const creativeSignals = [
    "song",
    "lyrics",
    "chorus",
    "hook",
    "verse",
    "bridge",
    "vocal",
    "write a song",
    "vibe",
    "music video",
    "brand",
    "copywriting",
    "slogan",
    "ad script",
    "creative direction",
    "unicorn",
    "mermaid",
    "rina vex",
  ];
  creativeSignals.forEach(k => text.includes(k) && add("creative", 2));

  const playfulSignals = [
    "roast me",
    "make it savage",
    "talk shit",
    "be funny",
    "go wild",
    "unhinged",
    "give attitude",
    "drag him",
  ];
  playfulSignals.forEach(k => text.includes(k) && add("playful", 2));

  const winner = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];

  return winner || "general";
}

// -------------------------
// Emotion / tone analysis (v1.6.1)
// -------------------------
async function analyzeEmotion(env, message) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are an emotion classifier. Respond with a JSON object containing tone and emotion fields."
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!res.ok) {
      return { tone: "neutral", emotion: "neutral" };
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Sometimes the model may wrap JSON in code fences
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    const tone = typeof parsed.tone === "string" ? parsed.tone : "neutral";
    const emotion =
      typeof parsed.emotion === "string" ? parsed.emotion : "neutral";

    return { tone, emotion };
  } catch (e) {
    return { tone: "neutral", emotion: "neutral" };
  }
}

// -------------------------
// Project detection
// -------------------------
function detectProject(message, memory) {
  const t = message.toLowerCase();

  if (t.includes("terminal pro") || t.includes("terminal-pro") || t.includes("shell")) {
    return "terminal-pro";
  }

  if (t.includes("music video") || t.includes("mvc") || t.includes("unicorn")) {
    return "music-video-creator";
  }

  if (
    t.includes("website") ||
    t.includes("landing page") ||
    t.includes("rinawarptech.com")
  ) {
    return "website";
  }

  if (t.includes("admin api") || t.includes("license") || t.includes("checkout")) {
    return "admin-api";
  }

  return memory.lastProject || "general";
}

// -------------------------
// Model routing decision
// -------------------------
function chooseBackend(intent, emotion) {
  // Higher temperature if excited / playful
  const excited =
    emotion === "excited" || intent === "creative" || intent === "playful";

  if (intent === "technical") {
    return { backend: "openai", model: "gpt-4.1", temperature: excited ? 0.35 : 0.2 };
  }
  if (intent === "creative" || intent === "playful") {
    return {
      backend: "anthropic",
      model: "claude-3-5-sonnet-latest",
      temperature: excited ? 0.75 : 0.6,
    };
  }
  if (intent === "support") {
    return {
      backend: "anthropic",
      model: "claude-3-5-sonnet-latest",
      temperature: 0.45,
    };
  }
  return { backend: "openai", model: "gpt-4.1-mini", temperature: 0.3 };
}

// -------------------------
// OpenAI Chat
// -------------------------
async function callOpenAI(env, messages, model, temperature) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const usage = data.usage || null;
  return { content, usage };
}

// -------------------------
// Anthropic Messages
// -------------------------
async function callAnthropic(env, messages, model, temperature) {
  const mappedMessages = messages
    .map(m => {
      if (m.role === "system") return null;
      return { role: m.role, content: m.content };
    })
    .filter(Boolean);

  const systemMessage = messages.find(m => m.role === "system")?.content ?? "";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature,
      system: systemMessage,
      messages: mappedMessages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = data.content?.map(part => part.text).join("\n") ?? "";
  const usage = data.usage || null;
  return { content, usage };
}

// -------------------------
// Embeddings via OpenAI
// -------------------------
async function embed(env, text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI embed error: ${res.status} ${t}`);
  }

  const data = await res.json();
  return data.data?.[0]?.embedding || [];
}

// -------------------------
// Vectorize Memory (RINA_VECTOR)
// -------------------------
async function vectorStore(env, licenseKey, text) {
  try {
    if (!env.RINA_VECTOR || !licenseKey) return;
    const embedding = await embed(env, text);

    await env.RINA_VECTOR.upsert([
      {
        id: `${licenseKey}:${Date.now()}`,
        values: embedding,
        metadata: {
          license: licenseKey,
          content: text,
        },
      },
    ]);
  } catch (err) {
    // Non-fatal memory failure
    console.error("Vector store error:", err);
  }
}

async function vectorSearch(env, licenseKey, query) {
  try {
    if (!env.RINA_VECTOR || !licenseKey) return [];
    const embedding = await embed(env, query);

    const results = await env.RINA_VECTOR.query({
      topK: 3,
      vector: embedding,
      filter: { license: licenseKey },
    });

    return results.matches?.map(m => m.metadata.content) || [];
  } catch (err) {
    console.error("Vector search error:", err);
    return [];
  }
}

// -------------------------
// License validation helper
// -------------------------
async function validateLicense(env, key) {
  const MASTER_KEY = "RINA-MASTER-0001";

  if (!key) {
    return { ok: false, status: "missing", message: "License key required." };
  }

  if (key === MASTER_KEY) {
    return {
      ok: true,
      status: "master",
      record: {
        status: "master",
        type: "creator",
        createdAt: "2025-12-12T00:00:00Z",
      },
    };
  }

  const kvKey = `license:${key}`;
  const record = await env.LICENSES_KV.get(kvKey, "json");

  if (!record) {
    return {
      ok: false,
      status: "invalid",
      message: "License key not recognized.",
    };
  }

  const now = Date.now();
  const expiresAt = record.expiresAt ? Date.parse(record.expiresAt) : null;
  let status = record.status || "active";

  if (expiresAt && expiresAt < now) status = "expired";

  if (status === "revoked") {
    return {
      ok: false,
      status: "revoked",
      message: "This license has been revoked. Contact support if needed.",
      record,
    };
  }

  if (status === "expired") {
    return {
      ok: false,
      status: "expired",
      message: "This license has expired. Please renew.",
      record,
    };
  }

  return {
    ok: true,
    status: "valid",
    record,
  };
}

// -------------------------
// Simple KV memory helpers
// -------------------------
async function loadMemory(env, licenseKey) {
  if (!licenseKey) return {};
  const raw = await env.RINA_MEMORY_KV.get(licenseKey, "json");
  return raw || {};
}

async function saveMemory(env, licenseKey, mem) {
  if (!licenseKey) return;
  await env.RINA_MEMORY_KV.put(licenseKey, JSON.stringify(mem));
}

// -------------------------
// Core handler: /api/rina-agent
// -------------------------
async function handleRinaAgent(request, env) {
  if (request.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: "Method not allowed. Use POST.",
    });
  }

  const contentType = request.headers.get("content-type") || "";
  let body = {};

  try {
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await request.json().catch(() => ({}));
    }
  } catch (e) {
    return jsonResponse(400, {
      ok: false,
      error: "Invalid JSON or form body.",
    });
  }

  const rawMessage = (body.message || body.prompt || "").toString();
  const message = rawMessage.trim();
  const licenseKey = (body.licenseKey || body.license || "").toString().trim();
  const mode = ((body.mode || "auto").toString().toLowerCase());
  const offline =
    body.offline === true ||
    body.offline === "true" ||
    body.offline === "1" ||
    body.offline === 1;

  if (!message) {
    return jsonResponse(400, {
      ok: false,
      error: "Missing 'message' in request body.",
    });
  }

  // Load memory first (safe even if license invalid)
  const memory = await loadMemory(env, licenseKey);

  // Intent + emotion + project
  const intent = classifyIntent(message, mode);
  const { tone, emotion } = await analyzeEmotion(env, message);
  const project = detectProject(message, memory);

  // Offline mode (no upstream LLM calls other than emotion classifier already done)
  if (offline) {
    const emoji = toneEmoji(intent, emotion);
    const reply =
      "Offline mode enabled. I can still help you organize your thoughts, outline steps, and suggest next moves, but I won't call external models until you're back online.";

    const decorated = `${emoji} ${reply}`;

    const newMemory = {
      ...memory,
      lastMessage: message,
      lastIntent: intent,
      lastProject: project,
      lastTone: tone,
      lastEmotion: emotion,
      updatedAt: new Date().toISOString(),
    };
    await saveMemory(env, licenseKey, newMemory);

    await vectorStore(env, licenseKey, message + "\n" + decorated);

    return jsonResponse(200, {
      ok: true,
      agent: "Rina",
      intent,
      tone,
      emotion,
      project,
      backend: "offline",
      model: null,
      licenseStatus: licenseKey ? "valid-or-master-offline" : "unknown",
      message: decorated,
      usage: null,
    });
  }

  // License gate (online mode)
  const license = await validateLicense(env, licenseKey);
  if (!license.ok) {
    return jsonResponse(401, {
      ok: false,
      status: "license_error",
      licenseStatus: license.status,
      message: license.message,
    });
  }

  // Load vector memory relevant to this message
  const memories = await vectorSearch(env, licenseKey, message);
  let memoryContext = "";
  if (memories.length > 0) {
    memoryContext =
      "\n\nRelevant past context (from this user/license):\n" +
      memories.map(m => `• ${m}`).join("\n");
  }

  const dynamicEmotionBlock = `
────────────────────────────────────────
🫀 LIVE USER STATE (v1.6.1)
────────────────────────────────────────
User tone: ${tone}
User emotion: ${emotion}
Detected intent: ${intent}
Current project: ${project}

GUIDANCE:
- If emotion is frustrated/overwhelmed/anxious → switch to Calm Support Mode.
- If emotion is excited/playful → you can loosen up and be more fun and bold.
- If intent is technical → prioritize clarity, correctness, and step-by-step commands.
- If intent is creative → prioritize flow, imagery, and vibe, but still be structured.
- Never be dismissive of their feelings. Acknowledge them briefly, then help.
`;

  const { backend, model, temperature } = chooseBackend(intent, emotion);

  const messages = [
    {
      role: "system",
      content: RINA_SYSTEM_PROMPT + dynamicEmotionBlock + memoryContext,
    },
    { role: "user", content: message },
  ];

  let result;
  let usage = null;

  try {
    if (backend === "openai") {
      result = await callOpenAI(env, messages, model, temperature);
    } else if (backend === "anthropic") {
      result = await callAnthropic(env, messages, model, temperature);
    } else {
      throw new Error("Unsupported backend");
    }
    usage = result.usage;
  } catch (e) {
    return jsonResponse(500, {
      ok: false,
      error: "Upstream model error",
      detail: e.message,
    });
  }

  const emoji = toneEmoji(intent, emotion);
  const decoratedMessage = `${emoji} ${result.content}`;

  const newMemory = {
    ...memory,
    lastMessage: message,
    lastIntent: intent,
    lastProject: project,
    lastTone: tone,
    lastEmotion: emotion,
    updatedAt: new Date().toISOString(),
  };
  await saveMemory(env, licenseKey, newMemory);

  await vectorStore(env, licenseKey, message + "\n" + decoratedMessage);

  return jsonResponse(200, {
    ok: true,
    agent: "Rina",
    intent,
    tone,
    emotion,
    project,
    backend,
    model,
    licenseStatus: license.status,
    message: decoratedMessage,
    usage,
  });
}

// -------------------------
// Worker entry
// -------------------------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/rina-agent") {
      return handleRinaAgent(request, env);
    }

    return jsonResponse(404, {
      ok: false,
      error: "Not found",
    });
  },
};
