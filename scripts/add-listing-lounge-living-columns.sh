#!/usr/bin/env bash
# =============================================================================
# add-listing-lounge-living-columns.sh — lounges + livingRooms on listings
#
# Usage (from repo root):
#   source backend/.env.production.prod
#   bash scripts/add-listing-lounge-living-columns.sh
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
  console.log('▶  Adding lounges / livingRooms columns if missing…');
  // Aurora DSQL: ADD COLUMN must not include NOT NULL / DEFAULT constraints.
  await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS lounges INTEGER');
  await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS \"livingRooms\" INTEGER');
  console.log('▶  Backfilling nulls to 0…');
  await client.query('UPDATE listings SET lounges = 0 WHERE lounges IS NULL');
  await client.query('UPDATE listings SET \"livingRooms\" = 0 WHERE \"livingRooms\" IS NULL');
  console.log('✅  Columns ready');
  await client.end();
})().catch((e) => { console.error(e); process.exit(1); });
"
