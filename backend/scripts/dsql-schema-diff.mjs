/**
 * Compare prisma/schema.prisma with the Aurora DSQL database in AURORA_DSQL_HOST and
 * report (or add) missing columns.
 *
 * Usage (from backend/):
 *   set -a; source .env; set +a
 *   node scripts/dsql-schema-diff.mjs            # report only
 *   node scripts/dsql-schema-diff.mjs --apply    # add missing columns + backfill defaults
 *
 * DSQL's ADD COLUMN takes no DEFAULT / NOT NULL, so required columns are added nullable
 * and existing rows are backfilled with the Prisma default. Missing tables are only
 * reported; create them with create-dsql-tables.mjs.
 */
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import pg from 'pg';
import pkg from '@prisma/client';

const { Prisma } = pkg;
const apply = process.argv.includes('--apply');

const SQL_TYPES = {
  String: 'TEXT',
  Int: 'INTEGER',
  BigInt: 'BIGINT',
  Float: 'DOUBLE PRECISION',
  Decimal: 'NUMERIC',
  Boolean: 'BOOLEAN',
  DateTime: 'TIMESTAMPTZ',
  Json: 'TEXT',
};

function sqlType(field) {
  if (field.kind === 'enum') return 'TEXT';
  return SQL_TYPES[field.type] ?? 'TEXT';
}

/** SQL literal for the Prisma default, or null when there is nothing sensible to backfill. */
function backfillValue(field) {
  const d = field.default;
  if (d === undefined) return null;
  if (typeof d === 'object' && d !== null && 'name' in d) {
    if (d.name === 'now') return 'now()';
    return null;
  }
  if (typeof d === 'boolean' || typeof d === 'number') return String(d);
  return `'${String(d).replace(/'/g, "''")}'`;
}

const hostname = process.env.AURORA_DSQL_HOST;
if (!hostname) {
  console.error('AURORA_DSQL_HOST is not set. Run: set -a; source .env; set +a');
  process.exit(1);
}
const region = process.env.AURORA_DSQL_REGION || process.env.AWS_REGION || 'ap-southeast-2';
const password = await new DsqlSigner({ hostname, region, expiresIn: 900 }).getDbConnectAdminAuthToken();
const client = new pg.Client({ host: hostname, port: 5432, database: 'postgres', user: 'admin', password, ssl: { rejectUnauthorized: false } });
await client.connect();

const { rows } = await client.query(
  "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'"
);
const existing = new Map();
for (const r of rows) {
  if (!existing.has(r.table_name)) existing.set(r.table_name, new Set());
  existing.get(r.table_name).add(r.column_name);
}

console.log(`Database: ${hostname.split('.')[0]}…  mode: ${apply ? 'APPLY' : 'report only'}\n`);
let missingCount = 0;

for (const model of Prisma.dmmf.datamodel.models) {
  const table = model.dbName ?? model.name;
  const cols = existing.get(table);
  if (!cols) {
    console.log(`✗ table ${table} is missing (create it with scripts/create-dsql-tables.mjs)`);
    missingCount++;
    continue;
  }
  for (const field of model.fields) {
    if (field.kind === 'object') continue;
    const column = field.dbName ?? field.name;
    if (cols.has(column)) continue;
    missingCount++;
    const type = sqlType(field);
    const fill = field.isRequired ? backfillValue(field) : null;
    console.log(`✗ ${table}."${column}" ${type}${field.isRequired ? ' (required' + (fill ? `, backfill ${fill})` : ', NO default to backfill)') : ''}`);
    if (!apply) continue;
    await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${column}" ${type}`);
    if (fill) await client.query(`UPDATE ${table} SET "${column}" = ${fill} WHERE "${column}" IS NULL`);
    console.log(`  ✓ added${fill ? ' and backfilled' : ''}`);
  }
}

console.log(missingCount === 0 ? '\n✅ Database matches the Prisma schema.' : `\n${missingCount} difference(s) ${apply ? 'processed' : 'found'}.`);
await client.end();
