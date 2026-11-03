#!/usr/bin/env node
/**
 * One-time migration: add agencyLogoUrl + agencyBrandColor to the users table.
 * Uses Aurora DSQL IAM auth (same pattern as prisma-dsql-push.mjs).
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
  host,
  port: 5432,
  database: 'postgres',
  user: 'admin',
  password: token,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log('Connected to Aurora DSQL.');

const migrations = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "agencyLogoUrl"    TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "agencyBrandColor" TEXT`,
];

for (const sql of migrations) {
  console.log(`  ▶ ${sql}`);
  await client.query(sql);
  console.log('    ✓');
}

await client.end();
console.log('✅  Migration complete.');
