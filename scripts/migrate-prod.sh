#!/usr/bin/env bash
# =============================================================================
# PropertyReach — Run Prisma migrations against the production database
#
# Always run this BEFORE deploying a new backend version when there are
# schema changes.
#
# Usage:
#   export DATABASE_URL="postgresql://user:pass@host:5432/propertyreach?schema=public"
#   bash scripts/migrate-prod.sh
#
# Or load from a file:
#   source backend/.env.production && bash scripts/migrate-prod.sh
# =============================================================================
set -euo pipefail

cd "$(dirname "$0")/../backend"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL is not set."
  echo "   export DATABASE_URL='postgresql://user:pass@host:5432/propertyreach?schema=public'"
  exit 1
fi

echo "▶ Generating Prisma client…"
npx prisma generate

echo "▶ Running migrations against: $(echo "$DATABASE_URL" | sed 's/:\/\/.*@/:\/\/***@/')"
npx prisma migrate deploy

echo "✅  Migrations applied successfully."
