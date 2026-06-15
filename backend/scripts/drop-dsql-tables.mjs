#!/usr/bin/env node
/**
 * Drops all application tables from Aurora DSQL so `npm run db:push:dsql` can create them fresh.
 * Use when the schema has changed in a way DSQL can't ALTER (e.g. removing constraints, changing PKs).
 *
 * Usage:
 *   npm run db:drop:dsql
 */
import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });

const host = process.env.AURORA_DSQL_HOST?.trim();
const region =
  process.env.AURORA_DSQL_REGION?.trim() ||
  process.env.AWS_REGION?.trim() ||
  'ap-southeast-2';

if (!host) {
  console.error('Set AURORA_DSQL_HOST in backend/.env');
  process.exit(1);
}

let token;
try {
  token = execFileSync(
    'aws',
    ['dsql', 'generate-db-connect-admin-auth-token', '--expires-in', '900', '--region', region, '--hostname', host],
    { encoding: 'utf8' }
  ).trim();
} catch (e) {
  console.error(e?.stderr?.toString?.() || e?.message || e);
  process.exit(1);
}

const client = new pg.Client({
  host,
  port: 5432,
  database: process.env.AURORA_DSQL_DATABASE?.trim() || 'postgres',
  user: process.env.AURORA_DSQL_USER?.trim() || 'admin',
  password: token,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

// Drop in reverse dependency order (no FK constraints, but safer ordering)
const tables = [
  'enquiries',
  'listing_documents',
  'listing_open_homes',
  'listing_updates',
  'listing_media',
  'listings',
  'otps',
  'users',
  '_prisma_migrations',
];

for (const table of tables) {
  try {
    await client.query(`DROP TABLE IF EXISTS "${table}"`);
    console.log(`✔  dropped ${table}`);
  } catch (e) {
    console.warn(`⚠  ${table}: ${e.message}`);
  }
}

await client.end();
console.log('\nAll tables dropped. Run: npm run db:push:dsql');
