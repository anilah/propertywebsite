#!/usr/bin/env bash
# =============================================================================
# PropertyReach — Build React app and deploy to S3 + invalidate CloudFront
#
# Prerequisites:
#   • aws cli v2 configured
#   • VITE_API_BASE_URL set in web/.env.production  (e.g. https://api.propertyreach.co.nz/api)
#   • S3_FRONTEND_BUCKET and CF_DISTRIBUTION_ID exported (or passed as args)
#
# Usage:
#   export S3_FRONTEND_BUCKET=propertyreach-frontend-prod
#   export CF_DISTRIBUTION_ID=EXXXXXXXXXXXXX
#   bash scripts/deploy-frontend.sh
#
# Or inline:
#   S3_FRONTEND_BUCKET=my-bucket CF_DISTRIBUTION_ID=EXXXX bash scripts/deploy-frontend.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"

S3_BUCKET="${S3_FRONTEND_BUCKET:?'S3_FRONTEND_BUCKET is required'}"
CF_ID="${CF_DISTRIBUTION_ID:?'CF_DISTRIBUTION_ID is required'}"
REGION="${AWS_REGION:-ap-southeast-2}"

echo "==================================================================="
echo " PropertyReach — Frontend Deploy"
echo " S3 Bucket       : $S3_BUCKET"
echo " CloudFront ID   : $CF_ID"
echo "==================================================================="

# 1. Check that production env file exists
if [[ ! -f "$WEB_DIR/.env.production" ]]; then
  echo ""
  echo "❌  $WEB_DIR/.env.production not found."
  echo "   Copy web/.env.production.example and fill in VITE_API_BASE_URL."
  exit 1
fi

echo ""
echo "▶ Installing frontend dependencies…"
cd "$WEB_DIR"
npm ci

echo ""
echo "▶ Building React app for production…"
npm run build

echo ""
echo "▶ Syncing dist/ to s3://$S3_BUCKET …"
# Upload assets (JS/CSS) with long cache headers
aws s3 sync dist/ "s3://$S3_BUCKET" \
  --delete \
  --region "$REGION" \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --no-cli-pager

# Upload index.html with no-cache so users always get the latest shell
aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" \
  --region "$REGION" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html" \
  --no-cli-pager

echo ""
echo "▶ Invalidating CloudFront cache…"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CF_ID" \
  --paths "/*" \
  --query "Invalidation.Id" \
  --output text \
  --no-cli-pager)

echo "  Invalidation ID: $INVALIDATION_ID"
echo "  (Usually completes in 1–3 minutes)"

echo ""
echo "✅  Frontend deployed."
echo ""
CF_DOMAIN=$(aws cloudfront get-distribution \
  --id "$CF_ID" \
  --query "Distribution.DomainName" \
  --output text \
  --no-cli-pager 2>/dev/null || echo "check AWS console")
echo "   Live URL: https://$CF_DOMAIN"
