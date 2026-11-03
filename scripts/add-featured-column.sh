#!/usr/bin/env bash
# =============================================================================
# add-featured-column.sh — Add the featured column to the listings table
#
# The `featured` field was referenced throughout the app code (listingMapper,
# listingsController, AdminListingFormPage) but was never actually added to
# the `Listing` model in schema.prisma nor to the production database. This
# caused every listing update (PATCH /api/listings/:id) to fail with
# "Unknown argument `featured`" once the Prisma client was regenerated to
# match the code's expectations, or silently be ignored on read.
#
# Usage (from repo root):
#   source backend/.env.production.prod
#   bash scripts/add-featured-column.sh
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
  console.log('▶  Connected. Adding featured column to listings…');

  await client.query(\`
    ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS \"featured\" BOOLEAN;
  \`);

  console.log('▶  Backfilling existing rows with featured = false…');
  await client.query(\`UPDATE listings SET \"featured\" = false WHERE \"featured\" IS NULL;\`);

  console.log('✅  Column \"featured\" added (or already existed) and backfilled.');
  await client.end();
})().catch(err => { console.error('❌ ', err.message); process.exit(1); });
"
