#!/usr/bin/env bash
# =============================================================================
# PropertyReach — Full deploy (backend + frontend)
#
# This is the main deploy script. Run it after every release.
#
# Usage:
#   bash scripts/deploy.sh [--skip-migrate] [--backend-only] [--frontend-only]
#
# Prerequisites — load backend/.env.production first:
#   source backend/.env.production
#
# Aurora DSQL: Step 1 runs npm run db:push:dsql + db:indexes:dsql (needs aws CLI + AURORA_DSQL_HOST).
# RDS (legacy): set DATABASE_URL and replace Step 1 with migrate-prod.sh manually.
#
# Example:
#   source backend/.env.production
#   bash scripts/deploy.sh
# =============================================================================
set -euo pipefail

SKIP_MIGRATE=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

for arg in "$@"; do
  case $arg in
    --skip-migrate)  SKIP_MIGRATE=true ;;
    --backend-only)  BACKEND_ONLY=true ;;
    --frontend-only) FRONTEND_ONLY=true ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           PropertyReach — Production Deploy                     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# ── Database schema (Aurora DSQL) ────────────────────────────────────────────
if [[ "$SKIP_MIGRATE" == "false" && "$FRONTEND_ONLY" == "false" ]]; then
  if [[ "${AURORA_DSQL_IAM_AUTH:-}" == "true" ]] || { [[ -n "${AURORA_DSQL_HOST:-}" ]] && [[ -z "${DATABASE_URL:-}" ]]; }; then
    echo "─── Step 1/3: Aurora DSQL — Prisma db push + async indexes ─────────"
    cd "$ROOT_DIR/backend"
    npm run db:push:dsql
    npm run db:indexes:dsql
    cd "$ROOT_DIR"
    echo ""
  elif [[ -n "${DATABASE_URL:-}" ]]; then
    echo "─── Step 1/3: Prisma migrate (RDS / DATABASE_URL) ───────────────────"
    bash "$ROOT_DIR/scripts/migrate-prod.sh"
    echo ""
  else
    echo "─── Step 1/3: Skipped — set AURORA_DSQL_IAM_AUTH=true or DATABASE_URL ─"
    echo ""
  fi
fi

# ── Backend ──────────────────────────────────────────────────────────────────
if [[ "$FRONTEND_ONLY" == "false" ]]; then
  echo "─── Step 2/3: Backend (Lambda) ───────────────────────────────────────"
  bash "$ROOT_DIR/scripts/deploy-backend.sh"
  echo ""
fi

# ── Frontend ─────────────────────────────────────────────────────────────────
if [[ "$BACKEND_ONLY" == "false" ]]; then
  echo "─── Step 3/3: Frontend (S3 + CloudFront) ─────────────────────────────"
  bash "$ROOT_DIR/scripts/deploy-frontend.sh"
  echo ""
fi

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  ✅  Deploy complete!                                           ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
