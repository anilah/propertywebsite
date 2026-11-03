#!/usr/bin/env bash
# =============================================================================
# PropertyReach — Deploy backend to AWS Lambda + API Gateway
#
# Uses the Serverless Framework (https://www.serverless.com/).
# Install once:  npm install -g serverless
#
# Usage:
#   source backend/.env.production          # load production env vars
#   bash scripts/deploy-backend.sh [stage]  # stage defaults to "prod"
# =============================================================================
set -euo pipefail

STAGE="${1:-prod}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "==================================================================="
echo " PropertyReach — Backend Deploy"
echo " Stage : $STAGE"
echo "==================================================================="

# 1. Build
echo ""
echo "▶ Installing dependencies…"
cd "$BACKEND_DIR"
npm ci --omit=dev

# Re-install devDependencies for build (prisma generate needs them)
npm install --include=dev

echo ""
echo "▶ Building TypeScript + generating Prisma client…"
npm run build

# 2. Deploy with Serverless Framework
echo ""
echo "▶ Deploying to AWS Lambda via Serverless Framework…"
serverless deploy --stage "$STAGE" --verbose

echo ""
echo "✅  Backend deployed."
echo ""
echo "   API Gateway URL is shown above as 'endpoint'"
echo "   Set this as VITE_API_BASE_URL in web/.env.production (append /api)"
echo "   Then re-run: bash scripts/deploy-frontend.sh"
