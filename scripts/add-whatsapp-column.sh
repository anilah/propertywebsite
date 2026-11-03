#!/usr/bin/env bash
# =============================================================================
# add-whatsapp-column.sh — Add the whatsappNumber column to the users table
#
# Usage (from repo root):
#   source backend/.env.production.prod
#   bash scripts/add-whatsapp-column.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../backend"

if [[ -z "${AURORA_DSQL_HOST:-}" ]]; then
  echo "❌  AURORA_DSQL_HOST is not set. Run: source backend/.env.production.prod"
  exit 1
fi

echo "▶  Generating Aurora DSQL IAM auth token…"

node -e "
const { DsqlSigner } = require('@aws-sdk/dsql-signer');
const { Client } = require('pg');

(async () => {
  const hostname = process.env.AURORA_DSQL_HOST;
  const region   = process.env.AURORA_DSQL_REGION || process.env.AWS_REGION || 'ap-southeast-2';

  const signer = new DsqlSigner({ hostname, region, expiresIn: 900 });
  const token  = await signer.getDbConnectAdminAuthToken();

  const client = new Client({
    host:     hostname,
    port:     5432,
    database: 'postgres',
    user:     'admin',
    password: token,
    ssl:      { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('▶  Connected. Adding whatsappNumber column…');

  await client.query(\`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS \"whatsappNumber\" TEXT;
  \`);

  console.log('✅  Column \"whatsappNumber\" added (or already existed).');
  await client.end();
})().catch(err => { console.error('❌ ', err.message); process.exit(1); });
"
