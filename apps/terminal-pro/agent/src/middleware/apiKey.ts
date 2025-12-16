import type { Request, Response, NextFunction } from 'express';

export function apiKeyGuard(req: Request, res: Response, next: NextFunction) {
  if (process.env.REQUIRE_API_KEY !== 'true') return next();
  const expected = process.env.API_KEY || '';
  const got = (req.header('x-api-key') || req.header('authorization') || '').replace(
    /^Bearer\s+/i,
    '',
  );
  if (!expected || got !== expected) {
    return res.status(401).json({ error: { message: 'unauthorized', code: 'unauthorized' } });
  }
  next();
}
