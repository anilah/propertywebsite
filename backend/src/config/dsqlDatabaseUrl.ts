import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { logInfo } from '../utils/logger.js';

/**
 * When `AURORA_DSQL_IAM_AUTH=true`, builds `DATABASE_URL` using an IAM auth token
 * before PrismaClient is constructed (short-lived token — see `AURORA_DSQL_TOKEN_EXPIRES_SEC`).
 */
export async function applyDsqlIamDatabaseUrl(): Promise<void> {
  if (process.env.AURORA_DSQL_IAM_AUTH !== 'true') return;

  const hostname = process.env.AURORA_DSQL_HOST?.trim();
  if (!hostname) {
    throw new Error('AURORA_DSQL_HOST is required when AURORA_DSQL_IAM_AUTH=true');
  }

  const region =
    process.env.AURORA_DSQL_REGION?.trim() ||
    process.env.AWS_REGION?.trim() ||
    process.env.AWS_DEFAULT_REGION?.trim();
  if (!region) {
    throw new Error('AWS_REGION or AURORA_DSQL_REGION is required when AURORA_DSQL_IAM_AUTH=true');
  }

  const database = process.env.AURORA_DSQL_DATABASE?.trim() || 'postgres';
  const user = process.env.AURORA_DSQL_USER?.trim() || 'admin';
  const useAdminToken = process.env.AURORA_DSQL_ADMIN_TOKEN !== 'false';

  const expiresRaw = process.env.AURORA_DSQL_TOKEN_EXPIRES_SEC?.trim();
  const expiresIn = expiresRaw ? Number(expiresRaw) : undefined;
  if (expiresRaw !== undefined && (Number.isNaN(expiresIn) || (expiresIn ?? 0) <= 0)) {
    throw new Error('AURORA_DSQL_TOKEN_EXPIRES_SEC must be a positive number of seconds when set');
  }

  const signer = new DsqlSigner({ hostname, region, expiresIn });
  const token = useAdminToken
    ? await signer.getDbConnectAdminAuthToken()
    : await signer.getDbConnectAuthToken();

  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(token);
  const encDb = encodeURIComponent(database);
  const schema = process.env.AURORA_DSQL_SCHEMA?.trim() || 'public';

  process.env.DATABASE_URL = `postgresql://${encUser}:${encPass}@${hostname}:5432/${encDb}?sslmode=require&schema=${encodeURIComponent(schema)}`;
}

/**
 * Refreshes the DSQL IAM token and reconnects the Prisma client.
 * Call this on a schedule (e.g. every 50 min when token lifetime is 1 h).
 * No-op when AURORA_DSQL_IAM_AUTH is not 'true'.
 */
export async function refreshDsqlConnection(): Promise<void> {
  if (process.env.AURORA_DSQL_IAM_AUTH !== 'true') return;
  try {
    await applyDsqlIamDatabaseUrl();
    // Reconnect Prisma with the fresh DATABASE_URL.
    // database.ts exports a Proxy so all existing imports pick up the new client.
    const { reconnectPrisma } = await import('./database.js');
    await reconnectPrisma();
    logInfo('dsql_token_refreshed', {});
  } catch (err) {
    // Log but don't crash — next refresh attempt will retry.
    console.error('[dsql] token refresh failed:', err);
  }
}

/**
 * Schedules automatic DSQL token refresh.
 * `intervalSec` defaults to 10 minutes — safe buffer before the default 15-minute token expiry.
 * Call once after server/Lambda init.
 */
export function scheduleDsqlTokenRefresh(intervalSec = 10 * 60): void {
  if (process.env.AURORA_DSQL_IAM_AUTH !== 'true') return;
  const ms = intervalSec * 1000;
  const id = setInterval(() => {
    refreshDsqlConnection().catch(() => {/* already logged */});
  }, ms);
  // Don't keep the Node process alive just for this timer.
  if (typeof id === 'object' && 'unref' in id) (id as NodeJS.Timeout).unref();
  logInfo('dsql_refresh_scheduled', { intervalSec });
}
