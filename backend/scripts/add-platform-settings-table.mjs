#!/usr/bin/env node
/**
 * Sprint 3 migration: create platform_settings table on Aurora DSQL.
 */
import { execFileSync } from 'node:child_process';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from 'pg';
const { Client } = pkg;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });
const prodEnv = resolve(root, '.env.production');
if (existsSync(prodEnv)) config({ path: prodEnv, override: true });
const prodProdEnv = resolve(root, '.env.production.prod');
if (existsSync(prodProdEnv)) config({ path: prodProdEnv, override: true });

const host   = process.env.AURORA_DSQL_HOST?.trim();
const region = process.env.AURORA_DSQL_REGION?.trim() || 'ap-southeast-2';

if (!host) { console.error('AURORA_DSQL_HOST not set'); process.exit(1); }

console.log(`Generating DSQL IAM token for ${host}…`);
const token = execFileSync('aws', [
  'dsql', 'generate-db-connect-admin-auth-token',
  '--hostname', host,
  '--region',   region,
  '--expires-in', '900',
], { encoding: 'utf8' }).trim();

const client = new Client({
  host, port: 5432, database: 'postgres', user: 'admin',
  password: token, ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log('Connected to Aurora DSQL.');

const migrations = [
  `CREATE TABLE IF NOT EXISTS platform_settings (
    id              TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
    platform        TEXT        NOT NULL,
    config          TEXT        NOT NULL DEFAULT '{}',
    "isActive"      BOOLEAN     NOT NULL DEFAULT false,
    "lastTestedAt"  TIMESTAMPTZ,
    "lastTestOk"    BOOLEAN,
    "lastTestMsg"   TEXT,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE (platform)
  )`,
];

for (const sql of migrations) {
  console.log(`  ▶ ${sql.slice(0, 60).replace(/\s+/g, ' ')}…`);
  await client.query(sql);
  console.log('    ✓');
}

await client.end();
console.log('✅  platform_settings table ready.');
