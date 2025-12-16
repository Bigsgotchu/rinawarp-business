import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// why: default registry and global metrics
client.collectDefaultMetrics({ prefix: 'rinawarp_' });

export const httpRequestDuration = new client.Histogram({
  name: 'rinawarp_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.05, 0.1, 0.2, 0.4, 0.8, 1.5, 3],
});

export const chatLatency = new client.Histogram({
  name: 'rinawarp_chat_completion_duration_seconds',
  help: 'Duration of /v1/chat/completions handler',
  buckets: [0.05, 0.1, 0.2, 0.4, 0.8, 1.5, 3, 6],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const delta = Number(process.hrtime.bigint() - start) / 1e9;
    const route = (req.route?.path || req.path || 'unknown').toString();
    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(delta);
  });
  next();
}

export async function renderMetrics(_req: Request, res: Response) {
  res.setHeader('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}
