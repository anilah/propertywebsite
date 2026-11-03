#!/usr/bin/env bash
# =============================================================================
# add-enquiry-email-audit-column.sh — Add emailAudit JSON column to enquiries
#
# Usage (from repo root):
#   source backend/.env.production.prod
#   bash scripts/add-enquiry-email-audit-column.sh
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
  console.log('▶  Connected. Adding emailAudit column to enquiries…');

  await client.query(\`
    ALTER TABLE enquiries
    ADD COLUMN IF NOT EXISTS \"emailAudit\" TEXT;
  \`);

  console.log('✅  Column \"emailAudit\" added (or already existed).');
  await client.end();
})().catch(err => { console.error('❌ ', err.message); process.exit(1); });
"
