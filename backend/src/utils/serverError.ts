import type { Response } from 'express';
import { logError } from './logger.js';

export type ServerErrorContext = Record<string, unknown>;

/** Avoid leaking DB/ORM messages to clients in production. */
export function sendServerError(
  res: Response,
  err: unknown,
  context?: ServerErrorContext
): void {
  logError('handler_uncaught_exception', err, context);

  const expose =
    process.env.NODE_ENV === 'development' && err instanceof Error && err.message;
  res.status(500).json({ error: expose || 'Internal server error' });
}
