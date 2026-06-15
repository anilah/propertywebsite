/**
 * One-time script: replace any bcrypt-hashed agent PINs with fresh 6-digit plain-text PINs.
 * Run with: node scripts/fix-bcrypt-pins.mjs
 */
import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });

// Build DATABASE_URL via fresh DSQL IAM token (same as prisma-dsql-push.mjs)
if (process.env.AURORA_DSQL_IAM_AUTH === 'true') {
  const host = process.env.AURORA_DSQL_HOST?.trim();
  const region = process.env.AURORA_DSQL_REGION?.trim() || process.env.AWS_REGION?.trim() || 'ap-southeast-2';
  if (!host) { console.error('AURORA_DSQL_HOST not set'); process.exit(1); }
  const token = execFileSync(
    'aws',
    ['dsql', 'generate-db-connect-admin-auth-token', '--expires-in', '900', '--region', region, '--hostname', host],
    { encoding: 'utf8' }
  ).trim();
  process.env.DATABASE_URL = `postgresql://${encodeURIComponent('admin')}:${encodeURIComponent(token)}@${host}:5432/postgres?sslmode=require`;
}

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL not set'); process.exit(1); }

const client = new pg.Client({ connectionString: url });
await client.connect();

const { rows: agents } = await client.query(
  `SELECT id, "mobileNumber", pin FROM users WHERE role = 'AGENT'`
);

let fixed = 0;
for (const agent of agents) {
  if (agent.pin && agent.pin.startsWith('$2')) {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    await client.query(`UPDATE users SET pin = $1 WHERE id = $2`, [newPin, agent.id]);
    console.log(`Fixed ${agent.mobileNumber}  →  new PIN: ${newPin}`);
    fixed++;
  }
}

if (fixed === 0) console.log('No bcrypt hashes found — all agent PINs are already plain text.');
else console.log(`\nDone. ${fixed} agent(s) updated.`);

await client.end();
