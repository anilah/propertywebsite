#!/usr/bin/env bash
# =============================================================================
# add-tradie-work-fields.sh — gallery + business detail columns on Aurora DSQL
#
# Usage (from repo root):
#   source backend/.env.production.prod
#   bash scripts/add-tradie-work-fields.sh
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
  console.log('▶  Adding tradie work / detail columns if missing…');

  // Aurora DSQL: ADD COLUMN must not include NOT NULL / DEFAULT constraints.
  const cols = [
    ['tagline',            'TEXT'],
    ['\"yearsExperience\"', 'INTEGER'],
    ['\"insuranceInfo\"',   'TEXT'],
    ['\"workImages\"',      'TEXT'],
  ];

  for (const [name, type] of cols) {
    await client.query(
      'ALTER TABLE tradies ADD COLUMN IF NOT EXISTS ' + name + ' ' + type
    );
    console.log('   +', name);
  }

  const filled = await client.query(
    \"UPDATE tradies SET \\\"workImages\\\" = '[]' WHERE \\\"workImages\\\" IS NULL\"
  );
  console.log('   backfilled workImages:', filled.rowCount);

  console.log('✅  tradie work fields ready');
  await client.end();
})().catch((e) => { console.error(e); process.exit(1); });
"
