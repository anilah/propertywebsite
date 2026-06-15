import type { Request, Response, NextFunction } from 'express';
import { logInfo } from '../utils/logger.js';

/**
 * On Lambda: enabled by default (set LOG_HTTP=false to disable).
 * Local: only when LOG_HTTP=true.
 */
function shouldLogHttp(): boolean {
  if (process.env.LOG_HTTP === 'false') return false;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return true;
  return process.env.LOG_HTTP === 'true';
}

function incomingRequestId(req: Request): string | undefined {
  const h = req.headers;
  return (
    (typeof h['x-request-id'] === 'string' && h['x-request-id']) ||
    (typeof h['x-amzn-requestid'] === 'string' && h['x-amzn-requestid']) ||
    (typeof h['x-amzn-trace-id'] === 'string' && h['x-amzn-trace-id']) ||
    undefined
  );
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (!shouldLogHttp()) {
    next();
    return;
  }

  const start = Date.now();
  const requestId = incomingRequestId(req);
  const contentLength = req.headers['content-length'];

  logInfo('http_request_start', {
    method: req.method,
    path: req.originalUrl?.split('?')[0],
    ...(requestId ? { requestId } : {}),
    ...(contentLength ? { contentLength } : {}),
    ...(process.env.AWS_LAMBDA_REQUEST_ID ? { lambdaAwsRequestId: process.env.AWS_LAMBDA_REQUEST_ID } : {}),
  });

  res.on('finish', () => {
    logInfo('http_request_end', {
      method: req.method,
      path: req.originalUrl?.split('?')[0],
      status: res.statusCode,
      ms: Date.now() - start,
      ...(requestId ? { requestId } : {}),
      ...(process.env.AWS_LAMBDA_REQUEST_ID ? { lambdaAwsRequestId: process.env.AWS_LAMBDA_REQUEST_ID } : {}),
    });
  });

  next();
}
