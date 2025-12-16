// Export a configured app WITHOUT calling listen(), so tests and server can share it.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import crypto from 'crypto';
import { handleCommand } from '../tools/handleCommand';
import { handleChat } from '../chat/handleChat';
import { httpLogger } from './logger';
import { metricsMiddleware, renderMetrics, chatLatency } from './observability/metrics';
import { makeRateLimiter } from './middleware/rateLimit';
import { apiKeyGuard } from './middleware/apiKey';
import type { Request, Response, NextFunction } from 'express';

type Role = 'system' | 'user' | 'assistant' | 'tool' | 'function';
interface ChatMessage {
  role: Role;
  content: string;
  name?: string;
  tool_call_id?: string;
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

const REQUIRED_MODEL = process.env.REQUIRED_MODEL || 'rina-agent';

// --- ADD: tool-message sanitizer ---
function sanitizeMessagesForNonToolModel(messages: ChatMessage[]): ChatMessage[] {
  // why: our local rina-agent does not emit OpenAI-style tool_calls; strip or stringify tool/function results.
  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (m.role === 'tool' || m.role === 'function') {
      // Option A: drop silently
      // continue;

      // Option B (safer traceability): convert to an assistant note
      out.push({
        role: 'assistant',
        content: `[tool:${m.name ?? 'unknown'}${m.tool_call_id ? ` id=${m.tool_call_id}` : ''}] ${m.content}`,
      });
      continue;
    }
    out.push(m);
  }
  return out;
}

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: process.env.BODY_LIMIT || '1mb' }));

// why: request id for logs/metrics correlation
app.use((req, _res, next) => {
  (req as any).rid = req.headers['x-request-id'] || crypto.randomUUID();
  next();
});

// Logging: pino (structured) + morgan (tiny) if needed for quick dev grep
app.use(httpLogger);
if (process.env.LOG_TINY === 'true') app.use(morgan('tiny'));

// Global metrics + optional rate limit + API key
app.use(metricsMiddleware);
if (process.env.RL_ENABLE === 'true') app.use(makeRateLimiter());
app.use(apiKeyGuard);

const badRequest = (message: string, details?: unknown) =>
  Object.assign(new Error(message), { status: 400, code: 'bad_request', details });
const notFound = (message: string) =>
  Object.assign(new Error(message), { status: 404, code: 'not_found' });
const problem = (s: number, c: string, m: string, d?: unknown) =>
  Object.assign(new Error(m), { status: s, code: c, details: d });
const asUnix = () => Math.floor(Date.now() / 1000);

function requireJson(req: Request) {
  const ct = String(req.headers['content-type'] || '');
  if (!ct.startsWith('application/json'))
    throw problem(415, 'unsupported_media_type', 'content-type must be application/json');
}
function validateMessages(messages: unknown): asserts messages is ChatMessage[] {
  if (!Array.isArray(messages)) throw badRequest('`messages` must be an array');
  if (messages.length === 0) throw badRequest('`messages` cannot be empty');
  for (const [i, m] of messages.entries()) {
    if (!m || typeof m !== 'object') throw badRequest(`messages[${i}] invalid`);
    // @ts-ignore
    const { role, content } = m;
    if (!['system', 'user', 'assistant', 'tool', 'function'].includes(role))
      throw badRequest(`messages[${i}].role invalid: ${String(role)}`);
    if (typeof content !== 'string') throw badRequest(`messages[${i}].content must be a string`);
  }
}
function validateModel(model: unknown) {
  if (typeof model !== 'string' || !model) throw badRequest('`model` required');
  if (model !== REQUIRED_MODEL)
    throw badRequest(`Model not found: ${model}`, { expected: REQUIRED_MODEL });
}
function validateSampling({ temperature, top_p }: Partial<ChatCompletionsBody>) {
  if (
    temperature !== undefined &&
    (typeof temperature !== 'number' || temperature < 0 || temperature > 2)
  )
    throw badRequest('`temperature` must be between 0 and 2');
  if (top_p !== undefined && (typeof top_p !== 'number' || top_p <= 0 || top_p > 1))
    throw badRequest('`top_p` must be in (0, 1]');
}
function sseWrite(res: Response, payload: unknown) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

// ---- routes
app.get('/metrics', asyncHandler(renderMetrics)); // Prometheus

app.get('/v1/models', (_req, res) => {
  res.json({
    object: 'list',
    data: [{ id: 'rina-agent', object: 'model', created: asUnix(), owned_by: 'local' }],
  });
});

app.post(
  '/v1/chat/completions',
  asyncHandler(async (req, res) => {
    requireJson(req);
    const body = req.body as ChatCompletionsBody;
    validateModel(body?.model);

    // SANITIZE before validating shapes
    const sanitized = sanitizeMessagesForNonToolModel((body?.messages || []) as ChatMessage[]);
    validateMessages(sanitized);
    validateSampling(body);

    const stream = Boolean(body?.stream);
    const model = body.model;
    const messages = sanitized; // <— use sanitized messages

    // metrics timer
    const end = chatLatency.startTimer();
    const done = () => end(); // why: ensure we observe even on error

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      sseWrite(res, {
        id: 'rina-local',
        object: 'chat.completion.chunk',
        created: asUnix(),
        model,
        choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }],
      });

      let ping: NodeJS.Timeout | null = setInterval(
        () => res.write(`: ping ${Date.now()}\n\n`),
        15000,
      );
      const stop = () => {
        if (ping) clearInterval(ping);
        ping = null;
      };
      let closed = false;
      req.on('close', () => {
        closed = true;
        stop();
        done();
      });

      try {
        const full = await handleChat(messages, model);
        const CHUNK = Number(process.env.SSE_CHUNK || 80);
        for (let i = 0; i < full.length && !closed; i += CHUNK) {
          const piece = full.slice(i, i + CHUNK);
          sseWrite(res, {
            id: 'rina-local',
            object: 'chat.completion.chunk',
            created: asUnix(),
            model,
            choices: [{ index: 0, delta: { content: piece }, finish_reason: null }],
          });
        }
        if (!closed)
          sseWrite(res, {
            id: 'rina-local',
            object: 'chat.completion.chunk',
            created: asUnix(),
            model,
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
          });
      } catch (e: any) {
        sseWrite(res, { error: { message: e?.message || 'stream_error', type: 'stream_error' } });
      } finally {
        stop();
        if (!closed) {
          sseWrite(res, '[DONE]');
          res.end();
        }
        done();
      }
      return;
    }

    const reply = await handleChat(messages, model);
    res.json({
      id: 'rina-local',
      object: 'chat.completion',
      created: asUnix(),
      model,
      choices: [
        { index: 0, message: { role: 'assistant', content: reply }, finish_reason: 'stop' },
      ],
      usage: { prompt_tokens: null, completion_tokens: null, total_tokens: null },
    });
    done();
  }),
);

app.post(
  '/chat',
  asyncHandler(async (req, res) => {
    requireJson(req);
    const { messages, model } = req.body ?? {};
    validateModel(model);

    // SANITIZE here as well
    const sanitized = sanitizeMessagesForNonToolModel(messages as ChatMessage[]);
    validateMessages(sanitized);
    const reply = await handleChat(sanitized, model);
    res.json(reply);
  }),
);

app.post(
  '/tool',
  asyncHandler(async (req, res) => {
    requireJson(req);
    if (!req.body || typeof req.body !== 'object')
      throw badRequest('request body must be JSON object');
    const result = await handleCommand(req.body);
    res.json(result);
  }),
);

app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.get('/ready', (_req, res) => res.json({ ready: true }));

app.use((_req, _res, next) => next(notFound('route_not_found')));
app.use((err: ApiError, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status && err.status >= 400 ? err.status : 500;
  const payload = {
    error: {
      message: err.message || 'internal_error',
      code: err.code || (status === 400 ? 'bad_request' : 'internal_error'),
      details: err.details ?? undefined,
      request_id: (req as any).rid,
    },
  };
  if (status >= 500) {
    // why: keep prod logs concise and structured
    (req as any).log?.error?.({ err, rid: (req as any).rid }, 'Unhandled error');
  }
  res.status(status).json(payload);
});

export default app;
