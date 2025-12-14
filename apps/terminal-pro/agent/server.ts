import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";
import morgan from "morgan";
import helmet from "helmet";
import net from "net";
import { handleCommand } from "./tools/handleCommand";
import { handleChat } from "./chat/handleChat";

// ---------- Types ----------
type Role = "system" | "user" | "assistant" | "tool" | "function";
interface ChatMessage {
  role: Role;
  content: string;
  name?: string;
}
interface ChatCompletionsBody {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  user?: string;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

// ---------- Config ----------
const REQUIRED_MODEL = process.env.REQUIRED_MODEL || "rina-agent";
const DEFAULT_PORT = Number(process.env.PORT) || 3333;
const BODY_LIMIT = process.env.BODY_LIMIT || "1mb";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// ---------- App / Middleware ----------
const app = express();
app.set("trust proxy", true);
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: false, // why: API responses, not static assets
  })
);
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: BODY_LIMIT }));
app.use(morgan("tiny"));

app.use((req, _res, next) => {
  (req as any).rid = req.headers["x-request-id"] || crypto.randomUUID();
  next();
});

// ---------- Utils ----------
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

function badRequest(message: string, details?: unknown): ApiError {
  const err: ApiError = new Error(message);
  err.status = 400;
  err.code = "bad_request";
  err.details = details;
  return err;
}
function notFound(message: string): ApiError {
  const err: ApiError = new Error(message);
  err.status = 404;
  err.code = "not_found";
  return err;
}
function problem(status: number, code: string, message: string, details?: unknown): ApiError {
  const err: ApiError = new Error(message);
  err.status = status;
  err.code = code;
  err.details = details;
  return err;
}

function validateMessages(messages: unknown): asserts messages is ChatMessage[] {
  if (!Array.isArray(messages)) throw badRequest("`messages` must be an array");
  if (messages.length === 0) throw badRequest("`messages` cannot be empty");
  for (const [i, m] of messages.entries()) {
    if (!m || typeof m !== "object") throw badRequest(`messages[${i}] invalid`);
    if (!("role" in m) || !("content" in m))
      throw badRequest(`messages[${i}] missing role/content`);
    const role = (m as any).role;
    const content = (m as any).content;
    if (!["system", "user", "assistant", "tool", "function"].includes(role)) {
      throw badRequest(`messages[${i}].role invalid: ${String(role)}`);
    }
    if (typeof content !== "string") {
      throw badRequest(`messages[${i}].content must be a string`);
    }
  }
}

function validateModel(model: unknown) {
  if (typeof model !== "string" || !model) throw badRequest("`model` required");
  if (model !== REQUIRED_MODEL)
    throw badRequest(`Model not found: ${model}`, { expected: REQUIRED_MODEL });
}

function validateSampling({ temperature, top_p }: Partial<ChatCompletionsBody>) {
  if (temperature !== undefined) {
    if (typeof temperature !== "number" || Number.isNaN(temperature))
      throw badRequest("`temperature` must be a number");
    if (temperature < 0 || temperature > 2)
      throw badRequest("`temperature` must be between 0 and 2");
  }
  if (top_p !== undefined) {
    if (typeof top_p !== "number" || Number.isNaN(top_p))
      throw badRequest("`top_p` must be a number");
    if (top_p <= 0 || top_p > 1)
      throw badRequest("`top_p` must be in (0, 1]");
  }
}

function asUnixSeconds(ts = Date.now()) {
  return Math.floor(ts / 1000);
}

function sseWrite(res: Response, payload: unknown) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function requireJson(req: Request) {
  const ct = req.headers["content-type"] || "";
  if (!ct.toString().startsWith("application/json")) {
    throw problem(415, "unsupported_media_type", "content-type must be application/json");
  }
}

// ---------- Routes ----------
app.post(
  "/v1/chat/completions",
  asyncHandler(async (req: Request, res: Response) => {
    requireJson(req);
    const body = req.body as ChatCompletionsBody;
    validateModel(body?.model);
    validateMessages(body?.messages);
    validateSampling(body);

    const stream = Boolean(body?.stream);
    const model = body.model;
    const messages = body.messages;

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      const start = {
        id: "rina-local",
        object: "chat.completion.chunk",
        created: asUnixSeconds(),
        model,
        choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }],
      };
      sseWrite(res, start);

      let pingTimer: NodeJS.Timeout | null = null;
      const startPing = () => {
        pingTimer = setInterval(() => {
          // why: keep proxies from closing idle SSE
          res.write(`: ping ${Date.now()}\n\n`);
        }, 15000);
      };
      const stopPing = () => {
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = null;
      };

      let clientClosed = false;
      req.on("close", () => {
        clientClosed = true;
        stopPing();
      });

      startPing();

      try {
        const full = await handleChat(messages, model);
        const chunkSize = 80;
        for (let i = 0; i < full.length; i += chunkSize) {
          if (clientClosed) break;
          const piece = full.slice(i, i + chunkSize);
          sseWrite(res, {
            id: "rina-local",
            object: "chat.completion.chunk",
            created: asUnixSeconds(),
            model,
            choices: [{ index: 0, delta: { content: piece }, finish_reason: null }],
          });
        }
        if (!clientClosed) {
          sseWrite(res, {
            id: "rina-local",
            object: "chat.completion.chunk",
            created: asUnixSeconds(),
            model,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          });
        }
      } catch (e) {
        sseWrite(res, {
          error: {
            message: (e as Error).message || "stream_error",
            type: "stream_error",
          },
        });
      } finally {
        stopPing();
        if (!clientClosed) {
          sseWrite(res, "[DONE]");
          res.end();
        }
      }
      return;
    }

    const reply = await handleChat(messages, model);
    res.json({
      id: "rina-local",
      object: "chat.completion",
      created: asUnixSeconds(),
      model,
      choices: [
        { index: 0, message: { role: "assistant", content: reply }, finish_reason: "stop" },
      ],
      usage: { prompt_tokens: null, completion_tokens: null, total_tokens: null },
    });
  })
);

app.post(
  "/chat",
  asyncHandler(async (req: Request, res: Response) => {
    requireJson(req);
    const { messages, model } = req.body ?? {};
    validateModel(model);
    validateMessages(messages);
    const reply = await handleChat(messages, model);
    res.json(reply);
  })
);

app.post(
  "/tool",
  asyncHandler(async (req: Request, res: Response) => {
    requireJson(req);
    if (!req.body || typeof req.body !== "object")
      throw badRequest("request body must be JSON object");
    const result = await handleCommand(req.body);
    res.json(result);
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get("/ready", (_req, res) => {
  res.json({ ready: true });
});

// OpenAI-compatible models listing for clients that probe /v1/models
app.get("/v1/models", (_req, res) => {
  res.json({
    object: "list",
    data: [
      {
        id: "rina-agent",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "local",
      },
    ],
  });
});

// ---------- 404 ----------
app.use((_req, _res, next) => next(notFound("route_not_found")));

// ---------- Error Handler ----------
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: ApiError, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status && err.status >= 400 ? err.status : 500;
    const payload = {
      error: {
        message: err.message || "internal_error",
        code: err.code || (status === 400 ? "bad_request" : "internal_error"),
        details: err.details ?? undefined,
        request_id: (req as any).rid,
      },
    };
    if (status >= 500) {
      console.error("Unhandled error:", {
        rid: (req as any).rid,
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(status).json(payload);
  }
);

// ---------- Port Selection Helper ----------
async function getAvailablePort(preferred: number): Promise<number> {
  // why: avoid EADDRINUSE loops in dev
  const tryListen = (port: number) =>
    new Promise<number>((resolve) => {
      const srv = net.createServer();
      srv.unref();
      srv.on("error", () => resolve(0));
      srv.listen(port, () => {
        const p = (srv.address() as net.AddressInfo).port;
        srv.close(() => resolve(p));
      });
    });
  
  if (await tryListen(preferred)) return preferred;
  return await new Promise<number>((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.listen(0, () => {
      const p = (srv.address() as net.AddressInfo).port;
      srv.close(() => resolve(p));
    });
  });
}

// ---------- Server ----------
getAvailablePort(DEFAULT_PORT).then((PORT) => {
  const server = app.listen(PORT, () => {
    console.log(`🧠 Rina Agent running on http://127.0.0.1:${PORT}`);
  });

  // Graceful shutdown
  function shutdown(signal: string) {
    console.log(`\n${signal} received. Shutting down…`);
    server.close((err?: Error) => {
      if (err) {
        console.error("HTTP server close error", err);
        process.exit(1);
      }
      process.exit(0);
    });
  }
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
});
