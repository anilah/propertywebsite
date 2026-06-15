#!/usr/bin/env bash
# =============================================================================
# Build backend and create propertyreach-lambda.zip for manual upload to AWS Lambda.
#
# Includes: dist/, prisma/schema.prisma, package.json, package-lock.json, node_modules
# (matches what Serverless packages; Prisma schema has binaryTargets for Linux Lambda.)
#
# Prerequisites: Node 20+, same as normal backend build.
#
# Usage (from repo root or backend/):
#   cd backend && bash scripts/package-lambda-zip.sh
#   cd backend && bash scripts/package-lambda-zip.sh /path/to/out.zip
#
# After zip: upload in Lambda console or aws lambda update-function-code --zip-file ...
# Set handler to:  dist/lambda.handler
# Configure env vars / IAM role separately (see docs/DEPLOYMENT.md).
# =============================================================================
set -euo pipefail

BACKEND="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BACKEND"

OUT_ZIP="${1:-$BACKEND/propertyreach-lambda.zip}"
if [[ "$OUT_ZIP" != /* ]]; then
  OUT_ZIP="$BACKEND/$OUT_ZIP"
fi

echo "==================================================================="
echo " PropertyReach — Manual Lambda ZIP"
echo " Output: $OUT_ZIP"
echo "==================================================================="

echo ""
echo "▶ npm ci"
npm ci

echo ""
echo "▶ prisma generate + tsc"
npm run build

echo ""
echo "▶ npm prune --omit=dev  (smaller archive; runtime uses dist/ + @prisma/client)"
npm prune --omit=dev

echo ""
echo "▶ Creating zip..."
rm -f "$OUT_ZIP"
zip -rq "$OUT_ZIP" \
  dist \
  prisma/schema.prisma \
  package.json \
  package-lock.json \
  node_modules

echo ""
echo "✅  Done: $OUT_ZIP"
ls -lh "$OUT_ZIP"
echo ""
echo "Lambda settings:"
echo "  Runtime     : Node.js 20.x"
echo "  Handler     : dist/lambda.handler"
echo "  Architecture: x86_64 (matches serverless.yml — use arm64 only if you package for arm)"
echo ""
echo "Tip: Prefer  serverless deploy  so API Gateway, IAM, and env are managed for you."
