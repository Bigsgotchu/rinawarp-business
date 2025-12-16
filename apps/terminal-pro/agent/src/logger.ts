import pino from 'pino';
import pinoHttp from 'pino-http';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined, // why: avoid leaking env in logs
  redact: { paths: ['req.headers.authorization', 'req.headers.cookie'], remove: true },
});

export const httpLogger = pinoHttp({
  logger,
  customProps: (req) => ({ rid: (req as any).rid || undefined }), // why: correlate logs by request id
  quietReqLogger: true,
});
