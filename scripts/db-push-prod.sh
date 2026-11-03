#!/usr/bin/env bash
# =============================================================================
# db-push-prod.sh — Push Prisma schema changes to the production Aurora DSQL
#
# Generates a short-lived IAM auth token, sets DATABASE_URL, then runs
# `prisma db push` to apply schema additions without a migration history.
#
# Usage:
#   source backend/.env.production.prod  # loads AURORA_DSQL_* + AWS_* vars
#   bash scripts/db-push-prod.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../backend"

if [[ -z "${AURORA_DSQL_HOST:-}" ]]; then
  echo "❌  AURORA_DSQL_HOST is not set."
  echo "    Run: source backend/.env.production.prod"
  exit 1
fi

echo "▶  Generating Aurora DSQL IAM auth token…"

# Use a small Node script to call the DsqlSigner and print the DATABASE_URL
DB_URL=$(node -e "
const { DsqlSigner } = require('@aws-sdk/dsql-signer');
(async () => {
  const signer = new DsqlSigner({
    hostname: '${AURORA_DSQL_HOST}',
    region: '${AURORA_DSQL_REGION:-ap-southeast-2}',
    expiresIn: 900,
  });
  const token = await signer.getDbConnectAdminAuthToken();
  const url = 'postgresql://admin:' + encodeURIComponent(token)
    + '@${AURORA_DSQL_HOST}:5432/postgres?sslmode=require&schema=public';
  process.stdout.write(url);
})();
")

echo "▶  Running prisma db push against production…"
DATABASE_URL="$DB_URL" npx prisma db push --accept-data-loss

echo "✅  Schema pushed successfully."
