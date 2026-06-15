import { PrismaClient, type Prisma } from '@prisma/client';
import { logInfo } from '../utils/logger.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function prismaLogConfig(): Prisma.LogDefinition[] {
  if (process.env.PRISMA_LOG_QUERIES === 'true') {
    return [
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'query' },
    ];
  }
  if (process.env.NODE_ENV === 'development') {
    return [
      { emit: 'stdout', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ];
  }
  return [{ emit: 'stdout', level: 'error' }];
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({ log: prismaLogConfig() });
}

const createdNewClient = globalThis.prisma === undefined;
if (createdNewClient) {
  globalThis.prisma = createPrismaClient();
  if (process.env.PRISMA_LOG_QUERIES === 'true') {
    logInfo('prisma_client_initialized', { queryLogging: true });
  }
}

// Handle graceful shutdown for long-running local processes only.
// In Lambda, forcing disconnect on beforeExit can cause runtime exit issues.
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  process.on('beforeExit', async () => {
    await globalThis.prisma?.$disconnect();
  });
}

/**
 * Disconnects the current Prisma client, creates a new one with the fresh
 * DATABASE_URL (updated by refreshDsqlConnection), and stores it on globalThis
 * so the proxy below picks it up transparently.
 */
export async function reconnectPrisma(): Promise<void> {
  const old = globalThis.prisma;
  globalThis.prisma = createPrismaClient();
  if (old) {
    try { await old.$disconnect(); } catch { /* ignore */ }
  }
}

/**
 * Proxy that always delegates to the current globalThis.prisma instance.
 * This means all controller imports stay valid even after reconnectPrisma()
 * replaces the underlying client (e.g. on DSQL token refresh).
 */
export default new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = globalThis.prisma!;
    const val = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
