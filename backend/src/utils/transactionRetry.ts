import { Prisma } from '@prisma/client';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Prisma P2034 = transaction conflict; PostgreSQL 40001 = serialization_failure (incl. DSQL OCC). */
export function isRetryableTransactionError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2034') return true;
  }
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code ?? '');
    if (code === '40001') return true;
  }
  return false;
}

/**
 * Retries a callback when the DB reports a serialization / optimistic concurrency conflict.
 * Use for short transactional writes where replay is safe.
 */
export async function runWithTransactionRetry<T>(
  fn: () => Promise<T>,
  options?: { maxAttempts?: number; baseDelayMs?: number }
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? 4;
  const baseDelayMs = options?.baseDelayMs ?? 25;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isRetryableTransactionError(e) || attempt === maxAttempts) throw e;
      await delay(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw lastErr;
}
