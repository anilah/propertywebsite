import type { Request, Response, NextFunction } from 'express';
import { getHttpRequestMeta, logError } from '../utils/logger.js';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  const statusCodeFromErr = (err as { type?: string }).type === 'entity.too.large' ? 413 : undefined;
  const statusCode = res.statusCode !== 200 ? res.statusCode : statusCodeFromErr ?? 500;
  const isDev = process.env.NODE_ENV === 'development';

  logError('express_error_handler', err, {
    ...getHttpRequestMeta(req),
    statusCode,
  });

  const clientMessage =
    statusCode >= 500 && !isDev ? 'Internal server error' : err.message || 'Internal server error';

  res.status(statusCode).json({
    error: clientMessage,
    ...(isDev && { stack: err.stack }),
  });
};
