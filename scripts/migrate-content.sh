#!/usr/bin/env bash
# migrate-content.sh — Create content_posts table + seed default guides on Aurora DSQL
# Requires AWS credentials with DSQL access (same as used for Lambda deploys).
# Usage: bash scripts/migrate-content.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env.production.prod"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌  $ENV_FILE not found"
  exit 1
fi

set -o allexport
source "$ENV_FILE"
set +o allexport

cd "$ROOT_DIR/backend"

echo "▶  Installing dependencies..."
NODE_ENV=development npm ci --silent

echo "▶  Building TypeScript..."
npm run build

echo "▶  Running content migration..."
node dist/scripts/migrateContent.js

echo ""
echo "✅  Done"
