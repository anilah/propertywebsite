#!/usr/bin/env node
/**
 * Runs `prisma db push` against Aurora DSQL using a fresh admin token from the AWS CLI.
 * Requires: `aws` CLI, credentials with permission to call generate-db-connect-admin-auth-token,
 * and AURORA_DSQL_HOST (+ optional AURORA_DSQL_REGION) in backend/.env
 */
import { config } from 'dotenv';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });
// Manual production deploys: values in .env.production override .env
const prodEnv = resolve(root, '.env.production');
if (existsSync(prodEnv)) {
  config({ path: prodEnv, override: true });
}

let host = process.env.AURORA_DSQL_HOST?.trim();
const region =
  process.env.AURORA_DSQL_REGION?.trim() ||
  process.env.AWS_REGION?.trim() ||
  'ap-southeast-2';
const expiresIn = process.env.DSQL_TOKEN_EXPIRES_SEC?.trim() || '3600';

if (!host && process.env.DATABASE_URL) {
  const m = process.env.DATABASE_URL.match(
    /@([a-z0-9]+\.dsql\.[a-z0-9-]+\.on\.aws)(?::\d+)?\//i
  );
  if (m) host = m[1];
}

if (!host) {
  console.error(
    'Set AURORA_DSQL_HOST in backend/.env, or use a DATABASE_URL that contains your *.dsql.<region>.on.aws host.'
  );
  process.exit(1);
}

let token;
try {
  token = execFileSync(
    'aws',
    [
      'dsql',
      'generate-db-connect-admin-auth-token',
      '--expires-in',
      expiresIn,
      '--region',
      region,
      '--hostname',
      host,
    ],
    { encoding: 'utf8' }
  ).trim();
} catch (e) {
  console.error(e?.stderr?.toString?.() || e?.message || e);
  process.exit(1);
}

if (!token) {
  console.error('aws dsql generate-db-connect-admin-auth-token returned an empty token.');
  process.exit(1);
}

const schema = process.env.AURORA_DSQL_SCHEMA?.trim() || 'public';
process.env.DATABASE_URL = `postgresql://${encodeURIComponent('admin')}:${encodeURIComponent(token)}@${host}:5432/${encodeURIComponent('postgres')}?sslmode=require&schema=${encodeURIComponent(schema)}`;

const prismaArgs = ['prisma', 'db', 'push', '--accept-data-loss', ...process.argv.slice(2)];
const r = spawnSync('npx', prismaArgs, {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
process.exit(r.status ?? 1);
