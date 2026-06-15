import serverlessExpress from '@vendia/serverless-express';
import dotenv from 'dotenv';
import { applyDsqlIamDatabaseUrl, scheduleDsqlTokenRefresh } from './config/dsqlDatabaseUrl.js';
import { assertProductionConfig } from './config/env.js';
import { logError, logInfo, logWarn } from './utils/logger.js';

dotenv.config();

type LambdaContext = {
  awsRequestId?: string;
  functionName?: string;
  getRemainingTimeInMillis?: () => number;
  callbackWaitsForEmptyEventLoop?: boolean;
};

type ServerlessHandler = (
  event: unknown,
  context: unknown,
  callback: (err: unknown, result?: unknown) => void
) => void;

let serverlessHandler: ServerlessHandler | undefined;
let initPromise: Promise<void> | null = null;
let processHooksRegistered = false;

function pickEventMeta(event: unknown): Record<string, unknown> {
  const e = event as { requestContext?: { http?: { method?: string; path?: string } }; rawPath?: string; path?: string };
  return {
    eventMethod: e?.requestContext?.http?.method,
    eventPath: e?.requestContext?.http?.path || e?.rawPath || e?.path,
  };
}

function registerProcessHooks(): void {
  if (processHooksRegistered) return;
  processHooksRegistered = true;

  process.on('unhandledRejection', (reason) => {
    logError('lambda_unhandled_rejection', reason);
  });
  process.on('uncaughtException', (err) => {
    logError('lambda_uncaught_exception', err);
  });
  process.on('beforeExit', (code) => {
    logWarn('lambda_process_before_exit', { code });
  });
  process.on('exit', (code) => {
    logWarn('lambda_process_exit', { code });
  });
}

async function ensureLambdaInit(): Promise<ServerlessHandler> {
  if (serverlessHandler) return serverlessHandler;
  if (!initPromise) {
    initPromise = (async () => {
      logInfo('lambda_init_start', {});
      await applyDsqlIamDatabaseUrl();
      assertProductionConfig();
      scheduleDsqlTokenRefresh();
      const { createApp } = await import('./app.js');
      serverlessHandler = serverlessExpress({
        app: createApp(),
        resolutionMode: 'CALLBACK',
      }) as ServerlessHandler;
      logInfo('lambda_init_complete', {});
    })();
  }
  await initPromise;
  return serverlessHandler!;
}

export const handler = (
  event: unknown,
  context: LambdaContext,
  callback: (err: unknown, result?: unknown) => void
): void => {
  registerProcessHooks();
  logInfo('lambda_invocation', {
    awsRequestId: context?.awsRequestId,
    functionName: context?.functionName,
    remainingMs:
      typeof context?.getRemainingTimeInMillis === 'function'
        ? context.getRemainingTimeInMillis()
        : undefined,
    ...pickEventMeta(event),
  });

  // In Lambda, don't wait for open handles (DB pools, timers) to drain.
  context.callbackWaitsForEmptyEventLoop = false;

  let settled = false;
  const wrappedCallback = (err: unknown, result?: unknown) => {
    if (settled) {
      logWarn('lambda_callback_called_multiple_times', {
        awsRequestId: context?.awsRequestId,
      });
      return;
    }
    settled = true;
    if (err) {
      logError('lambda_callback_error', err, {
        awsRequestId: context?.awsRequestId,
      });
    } else {
      logInfo('lambda_callback_success', {
        awsRequestId: context?.awsRequestId,
      });
    }
    callback(err, result);
  };

  void ensureLambdaInit()
    .then((h) => h(event, context, wrappedCallback))
    .catch((err) => wrappedCallback(err));
};
