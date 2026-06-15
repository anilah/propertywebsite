#!/usr/bin/env node
/**
 * Creates all application indexes on Aurora DSQL using CREATE INDEX ASYNC.
 * Run once after `npm run db:push:dsql` (or after any schema change that adds tables).
 * Safe to re-run — uses IF NOT EXISTS.
 *
 * Usage:
 *   npm run db:indexes:dsql
 */
import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });
const prodEnv = resolve(root, '.env.production');
if (existsSync(prodEnv)) {
  config({ path: prodEnv, override: true });
}

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

// Column names match the camelCase field names in the Prisma schema (no @map on individual columns).
const indexes = [
  // listings
  `CREATE INDEX ASYNC IF NOT EXISTS idx_listings_created_by       ON listings ("createdBy")`,
  `CREATE INDEX ASYNC IF NOT EXISTS idx_listings_type_status      ON listings ("listingType", status)`,
  `CREATE INDEX ASYNC IF NOT EXISTS idx_listings_region_district  ON listings (region, district, suburb)`,
  `CREATE INDEX ASYNC IF NOT EXISTS idx_listings_status_date      ON listings (status, "listedDate")`,
  // listing_media
  `CREATE INDEX ASYNC IF NOT EXISTS idx_listing_media_listing_order ON listing_media ("listingId", "sortOrder")`,
  // listing_updates
  `CREATE INDEX ASYNC IF NOT EXISTS idx_listing_updates_author    ON listing_updates ("authorUserId")`,
  `CREATE INDEX ASYNC IF NOT EXISTS idx_listing_updates_listing   ON listing_updates ("listingId", "createdAt")`,
  // listing_open_homes
  `CREATE INDEX ASYNC IF NOT EXISTS idx_open_homes_listing        ON listing_open_homes ("listingId", "startsAt")`,
  // listing_documents
  `CREATE INDEX ASYNC IF NOT EXISTS idx_listing_docs_listing      ON listing_documents ("listingId", "sortOrder")`,
  // enquiries
  `CREATE INDEX ASYNC IF NOT EXISTS idx_enquiries_listing         ON enquiries ("listingId", "createdAt")`,
  // otps
  `CREATE INDEX ASYNC IF NOT EXISTS idx_otps_mobile_code          ON otps ("mobileNumber", code)`,
];

for (const sql of indexes) {
  const name = sql.match(/IF NOT EXISTS (\S+)/)?.[1] ?? sql;
  try {
    await client.query(sql);
    console.log(`✔  ${name}`);
  } catch (e) {
    console.error(`✘  ${name}: ${e.message}`);
  }
}

await client.end();
console.log('\nDone. Async indexes are being built in the background on DSQL.');
