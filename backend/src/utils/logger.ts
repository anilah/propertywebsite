import type { Request } from 'express';

export type LogFields = Record<string, unknown>;

function ts(): string {
  return new Date().toISOString();
}

function includeStack(): boolean {
  return process.env.LOG_STACK === 'true' || process.env.NODE_ENV === 'development';
}

/** Safe for logs: no full mobile numbers. */
export function maskNzMobileForLog(mobileDigits: string): string {
  const s = String(mobileDigits).replace(/\D/g, '');
  if (s.length <= 2) return '**';
  return `…${s.slice(-2)}`;
}

/** API Gateway / ALB request correlation (search CloudWatch by requestId). */
export function getHttpRequestMeta(req: Pick<Request, 'method' | 'originalUrl' | 'headers'>): LogFields {
  const h = req.headers;
  const requestId =
    (typeof h['x-request-id'] === 'string' && h['x-request-id']) ||
    (typeof h['x-amzn-requestid'] === 'string' && h['x-amzn-requestid']) ||
    undefined;
  return {
    httpMethod: req.method,
    httpPath: req.originalUrl?.split('?')[0],
    ...(requestId ? { requestId } : {}),
    ...(typeof h['x-forwarded-for'] === 'string' ? { forwardedFor: h['x-forwarded-for'].split(',')[0]?.trim() } : {}),
  };
}

function serializeUnknown(err: unknown): LogFields {
  if (err instanceof Error) {
    const p = err as Error & { code?: string; meta?: unknown };
    return {
      errName: err.name,
      errMessage: err.message,
      ...(includeStack() ? { errStack: err.stack } : {}),
      ...(typeof p.code === 'string' ? { prismaCode: p.code } : {}),
      ...(p.meta && typeof p.meta === 'object' ? { prismaMeta: p.meta as LogFields } : {}),
    };
  }
  if (err && typeof err === 'object') {
    try {
      return { err: JSON.parse(JSON.stringify(err)) as LogFields };
    } catch {
      return { err: String(err) };
    }
  }
  return { err: String(err) };
}

export function logInfo(msg: string, fields?: LogFields): void {
  console.log(JSON.stringify({ level: 'info', ts: ts(), msg, service: 'propertyreach-api', ...fields }));
}

export function logWarn(msg: string, fields?: LogFields): void {
  console.warn(JSON.stringify({ level: 'warn', ts: ts(), msg, service: 'propertyreach-api', ...fields }));
}

export function logError(msg: string, err?: unknown, fields?: LogFields): void {
  const errPart = err !== undefined ? serializeUnknown(err) : {};
  console.error(
    JSON.stringify({
      level: 'error',
      ts: ts(),
      msg,
      service: 'propertyreach-api',
      ...fields,
      ...errPart,
    })
  );
}
