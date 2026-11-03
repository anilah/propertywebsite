#!/usr/bin/env bash
# =============================================================================
# add-tradie-enquiries-table.sh — public Enquire leads for tradies (Aurora DSQL)
#
# Usage (from repo root):
#   source backend/.env.production.prod
#   bash scripts/add-tradie-enquiries-table.sh
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
  console.log('▶  Creating tradie_enquiries table if missing…');
  // Aurora DSQL: no FK / DEFAULT constraints on create
  await client.query(\`
    CREATE TABLE IF NOT EXISTS tradie_enquiries (
      id TEXT NOT NULL,
      \"tradieId\" TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      intent TEXT,
      \"createdAt\" TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (id)
    )
  \`);
  console.log('✅  tradie_enquiries ready');
  await client.end();
})().catch((e) => { console.error(e); process.exit(1); });
"
