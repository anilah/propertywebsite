import { DsqlSigner } from '@aws-sdk/dsql-signer';
import pg from 'pg';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { normalizeNzMobile, isValidNzMobile } = require('../backend/dist/utils/nzPhone.js');

const samples = [
  '021 421 454',
  '021421454',
  '021 021 88860',
  '02102188860',
  '021 123 4567',
  '0211234567',
  '021 029 71565',
  '642102971565',
  '021 217 0032',
];

console.log('Validation matrix:');
for (const s of samples) {
  const n = normalizeNzMobile(s);
  console.log(JSON.stringify({ input: s, normalized: n, digits: n.length, valid: isValidNzMobile(n) }));
}

const hostname = process.env.AURORA_DSQL_HOST;
const region = process.env.AURORA_DSQL_REGION || process.env.AWS_REGION || 'ap-southeast-2';
const signer = new DsqlSigner({ hostname, region, expiresIn: 900 });
const token = await signer.getDbConnectAdminAuthToken();
const client = new pg.Client({
  host: hostname,
  port: 5432,
  database: 'postgres',
  user: 'admin',
  password: token,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const r = await client.query(`
  SELECT id, "firstName", "lastName", "mobileNumber", role, "isActive"
  FROM users
  WHERE "mobileNumber" LIKE '%21421454%'
     OR "mobileNumber" LIKE '%2102188860%'
     OR LOWER("firstName") LIKE '%nona%'
     OR LOWER("firstName") LIKE '%ella%'
  ORDER BY "updatedAt" DESC
  LIMIT 20
`);
console.log('prod matches:', JSON.stringify(r.rows, null, 2));

const all = await client.query(`
  SELECT "mobileNumber",
         LENGTH(REGEXP_REPLACE("mobileNumber", '[^0-9]', '', 'g')) AS digits,
         "firstName", "lastName"
  FROM users WHERE role='AGENT'
  ORDER BY digits, "firstName"
`);
const byLen = {};
for (const row of all.rows) {
  byLen[row.digits] = (byLen[row.digits] || 0) + 1;
}
console.log('agent mobile digit lengths in prod:', byLen);

const invalid = all.rows.filter((row) => {
  const n = normalizeNzMobile(row.mobileNumber || '');
  return !isValidNzMobile(n);
});
console.log(
  'agents failing current validator:',
  invalid.map((row) => ({
    name: `${row.firstName} ${row.lastName}`,
    mobile: row.mobileNumber,
    digits: row.digits,
  }))
);

await client.end();
