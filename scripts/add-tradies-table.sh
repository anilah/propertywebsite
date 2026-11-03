#!/usr/bin/env bash
# =============================================================================
# add-tradies-table.sh — create the tradies directory table on Aurora DSQL
#
# Usage (from repo root):
#   source backend/.env.production.prod
#   bash scripts/add-tradies-table.sh
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
  console.log('▶  Creating tradies table if missing…');
  await client.query(\`
    CREATE TABLE IF NOT EXISTS tradies (
      id               TEXT        NOT NULL,
      slug             TEXT        NOT NULL,
      \"businessName\"   TEXT        NOT NULL,
      \"contactName\"    TEXT,
      categories       TEXT        NOT NULL DEFAULT '[]',
      skills           TEXT        NOT NULL DEFAULT '[]',
      description      TEXT,
      phone            TEXT        NOT NULL,
      \"whatsappNumber\" TEXT,
      email            TEXT,
      website          TEXT,
      \"photoUrl\"       TEXT,
      \"licenseNumber\"  TEXT,
      region           TEXT,
      district         TEXT,
      suburbs          TEXT        NOT NULL DEFAULT '[]',
      \"isActive\"       BOOLEAN     NOT NULL DEFAULT true,
      featured         BOOLEAN     NOT NULL DEFAULT false,
      \"callClicks\"     INTEGER     NOT NULL DEFAULT 0,
      \"whatsappClicks\" INTEGER     NOT NULL DEFAULT 0,
      \"createdBy\"      TEXT,
      \"createdAt\"      TIMESTAMPTZ NOT NULL DEFAULT now(),
      \"updatedAt\"      TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (id),
      UNIQUE (slug)
    )
  \`);
  console.log('✅  tradies table ready');
  await client.end();
})().catch((e) => { console.error(e); process.exit(1); });
"
