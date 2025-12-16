import rateLimit from 'express-rate-limit';

export function makeRateLimiter() {
  // why: env-driven caps for quick ops tuning
  const windowMs = Number(process.env.RL_WINDOW_MS || 60_000);
  const limit = Number(process.env.RL_LIMIT || 120);
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
  });
}
