#!/usr/bin/env bash
# =============================================================================
# deploy-prod.sh — Full production deployment for Kaboo Homes
#
# Prerequisites:
#   1. Fill in all REPLACE_ME values in backend/.env.production.prod
#   2. AWS CLI configured (or export AWS_ACCESS_KEY_ID / SECRET_ACCESS_KEY)
#   3. Node 20+ and npm installed
#
# Usage:
#   bash scripts/deploy-prod.sh              # deploy everything
#   bash scripts/deploy-prod.sh --backend    # backend only
#   bash scripts/deploy-prod.sh --frontend   # frontend only
#   bash scripts/deploy-prod.sh --env-only   # update Lambda env vars only
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env.production.prod"

# ── Load env ──────────────────────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "❌  $ENV_FILE not found. Copy from template and fill in all REPLACE_ME values."
  exit 1
fi

set -o allexport
source "$ENV_FILE"
set +o allexport

# ── Validate required fields ──────────────────────────────────────────────────
REQUIRED_VARS=(
  PROD_LAMBDA_FUNCTION PROD_S3_API_BUCKET PROD_S3_WEB_BUCKET
  AURORA_DSQL_HOST JWT_SECRET SETTINGS_ENCRYPTION_KEY
  CORS_ORIGIN SERVER_PUBLIC_URL
)
MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if [[ "${!VAR:-}" == *"REPLACE_ME"* ]] || [[ -z "${!VAR:-}" ]]; then
    echo "❌  Missing or unfilled: $VAR"
    MISSING=1
  fi
done
[[ $MISSING -eq 1 ]] && echo "Fix the above in $ENV_FILE and re-run." && exit 1

DEPLOY_BACKEND=false
DEPLOY_FRONTEND=false
ENV_ONLY=false

if [[ $# -eq 0 ]]; then
  DEPLOY_BACKEND=true
  DEPLOY_FRONTEND=true
else
  for arg in "$@"; do
    case $arg in
      --backend)   DEPLOY_BACKEND=true ;;
      --frontend)  DEPLOY_FRONTEND=true ;;
      --env-only)  ENV_ONLY=true ;;
    esac
  done
fi

AWS_REGION="${AWS_REGION:-ap-southeast-2}"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Kaboo Homes — PRODUCTION DEPLOYMENT    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# BACKEND
# ══════════════════════════════════════════════════════════════════════════════
if [[ "$DEPLOY_BACKEND" == true || "$ENV_ONLY" == true ]]; then

  if [[ "$ENV_ONLY" == false ]]; then
    echo "▶  Building backend TypeScript..."
    cd "$ROOT_DIR/backend"
    NODE_ENV=development npm ci
    npm run build

    echo "▶  Installing production dependencies..."
    npm ci --omit=dev

    echo "▶  Packaging Lambda zip..."
    ZIP_PATH="/tmp/kaboohomes-prod-backend.zip"
    rm -f "$ZIP_PATH"
    zip -r "$ZIP_PATH" dist/ node_modules/ prisma/ package.json > /dev/null
    echo "   Zip: $(du -sh "$ZIP_PATH" | cut -f1)"

    ZIP_SIZE_BYTES=$(wc -c < "$ZIP_PATH" | tr -d ' ')
    DIRECT_UPLOAD_LIMIT=69000000  # ~66 MB, safely under Lambda's 70 MB limit

    if [ "$ZIP_SIZE_BYTES" -gt "$DIRECT_UPLOAD_LIMIT" ]; then
      echo "▶  Zip is $(du -sh "$ZIP_PATH" | cut -f1) — staging via S3 (exceeds direct-upload limit)..."
      S3_KEY="lambda-deploys/kaboohomes-prod-backend-$(date +%Y%m%d%H%M%S).zip"
      aws s3 cp "$ZIP_PATH" "s3://$PROD_S3_API_BUCKET/$S3_KEY" --region "$AWS_REGION"
      aws lambda update-function-code \
        --function-name "$PROD_LAMBDA_FUNCTION" \
        --s3-bucket "$PROD_S3_API_BUCKET" \
        --s3-key "$S3_KEY" \
        --region "$AWS_REGION" \
        --no-cli-pager \
        --query '{State:State,LastUpdateStatus:LastUpdateStatus}'
    else
      echo "▶  Uploading zip directly to Lambda..."
      aws lambda update-function-code \
        --function-name "$PROD_LAMBDA_FUNCTION" \
        --zip-file "fileb://$ZIP_PATH" \
        --region "$AWS_REGION" \
        --no-cli-pager \
        --query '{State:State,LastUpdateStatus:LastUpdateStatus}'
    fi

    echo "▶  Waiting for Lambda update to complete..."
    aws lambda wait function-updated \
      --function-name "$PROD_LAMBDA_FUNCTION" \
      --region "$AWS_REGION"
  fi

  echo "▶  Updating Lambda environment variables..."
  ENV_JSON=$(cat <<ENVJSON
{
  "Variables": {
    "NODE_ENV": "production",
    "PORT": "3001",
    "SERVER_PUBLIC_URL": "${SERVER_PUBLIC_URL}",
    "OPENAPI_SERVER_URL": "${OPENAPI_SERVER_URL}",
    "CORS_ORIGIN": "${CORS_ORIGIN}",
    "AURORA_DSQL_IAM_AUTH": "true",
    "AURORA_DSQL_HOST": "${AURORA_DSQL_HOST}",
    "AURORA_DSQL_REGION": "${AURORA_DSQL_REGION}",
    "AURORA_DSQL_TOKEN_EXPIRES_SEC": "${AURORA_DSQL_TOKEN_EXPIRES_SEC}",
    "JWT_SECRET": "${JWT_SECRET}",
    "JWT_EXPIRES_IN": "${JWT_EXPIRES_IN}",
    "SUPER_ADMIN_MOBILE": "${SUPER_ADMIN_MOBILE}",
    "SUPER_ADMIN_OTP": "${SUPER_ADMIN_OTP}",
    "TWILIO_ACCOUNT_SID": "${TWILIO_ACCOUNT_SID:-}",
    "TWILIO_AUTH_TOKEN": "${TWILIO_AUTH_TOKEN:-}",
    "TWILIO_PHONE_NUMBER": "${TWILIO_PHONE_NUMBER:-}",
    "OTP_DEV_ALLOW_NO_TWILIO": "${OTP_DEV_ALLOW_NO_TWILIO:-false}",
    "S3_BUCKET": "${S3_BUCKET}",
    "S3_REGION": "${S3_REGION}",
    "S3_PUBLIC_URL_PREFIX": "${S3_PUBLIC_URL_PREFIX}",
    "PUBLIC_LISTINGS_API_ENABLED": "true",
    "API_DOCS_ENABLED": "false",
    "EXPOSE_ADMIN_API_INFO": "false",
    "LOG_HTTP": "false",
    "LOG_STACK": "false",
    "APP_SETUP_SECRET": "${APP_SETUP_SECRET}",
    "SETTINGS_ENCRYPTION_KEY": "${SETTINGS_ENCRYPTION_KEY}",
    "SITE_NAME": "${SITE_NAME:-Kaboo Homes}",
    "SITE_TAGLINE": "${SITE_TAGLINE:-New Zealand Premier Property Portal}",
    "SITE_PRIMARY_COLOR": "${SITE_PRIMARY_COLOR:-#0d5c63}",
    "SITE_LOGO_URL": "${SITE_LOGO_URL:-}",
    "SITE_URL": "${SITE_URL:-https://kaboohomes.com}",
    "SMTP_HOST": "${SMTP_HOST:-}",
    "SMTP_PORT": "${SMTP_PORT:-587}",
    "SMTP_SECURE": "${SMTP_SECURE:-false}",
    "SMTP_USER": "${SMTP_USER:-}",
    "SMTP_PASS": "${SMTP_PASS:-}",
    "EMAIL_FROM": "${EMAIL_FROM:-noreply@kaboohomes.com}",
    "EMAIL_FROM_NAME": "${EMAIL_FROM_NAME:-Kaboo Homes}",
    "ENQUIRY_NOTIFY_EMAIL": "${ENQUIRY_NOTIFY_EMAIL:-}"
  }
}
ENVJSON
)
  echo "$ENV_JSON" > /tmp/prod-lambda-env.json
  aws lambda update-function-configuration \
    --function-name "$PROD_LAMBDA_FUNCTION" \
    --environment "file:///tmp/prod-lambda-env.json" \
    --region "$AWS_REGION" \
    --no-cli-pager \
    --query '{LastUpdateStatus:LastUpdateStatus}'
  rm -f /tmp/prod-lambda-env.json

  echo "✅  Backend deployed to $PROD_LAMBDA_FUNCTION"
fi

# ══════════════════════════════════════════════════════════════════════════════
# FRONTEND
# ══════════════════════════════════════════════════════════════════════════════
if [[ "$DEPLOY_FRONTEND" == true && "$ENV_ONLY" == false ]]; then

  echo ""
  echo "▶  Building frontend..."
  cd "$ROOT_DIR/web"

  # Inject production API URL for the frontend build — must include /api suffix
  echo "VITE_API_BASE_URL=${SERVER_PUBLIC_URL}/api" > .env.production.local
  npm run build
  rm -f .env.production.local

  echo "▶  Syncing to S3..."
  aws s3 sync dist/ "s3://${PROD_S3_WEB_BUCKET}/" \
    --delete \
    --no-progress \
    --region "$AWS_REGION" \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "index.html" \
    --exclude "sw.js" \
    --exclude "workbox-*.js" \
    --exclude "manifest.webmanifest"

  # HTML + service worker must never be cached — stale SW was pinning the mobile shell on desktop
  aws s3 cp dist/index.html "s3://${PROD_S3_WEB_BUCKET}/index.html" \
    --region "$AWS_REGION" \
    --cache-control "no-cache,no-store,must-revalidate" \
    --content-type "text/html"
  aws s3 cp dist/sw.js "s3://${PROD_S3_WEB_BUCKET}/sw.js" \
    --region "$AWS_REGION" \
    --cache-control "no-cache,no-store,must-revalidate" \
    --content-type "application/javascript"
  aws s3 sync dist/ "s3://${PROD_S3_WEB_BUCKET}/" \
    --region "$AWS_REGION" \
    --no-progress \
    --exclude "*" \
    --include "workbox-*.js" \
    --include "manifest.webmanifest" \
    --cache-control "no-cache,no-store,must-revalidate"

  echo "▶  Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$PROD_CF_WEB_DISTRIBUTION" \
    --paths "/*" "/index.html" "/sw.js" \
    --no-cli-pager \
    --query 'Invalidation.{Id:Id,Status:Status}'

  echo "✅  Frontend deployed to $PROD_S3_WEB_BUCKET"
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅  PRODUCTION DEPLOYMENT COMPLETE     ║"
echo "║   Site: https://kaboohomes.com           ║"
echo "╚══════════════════════════════════════════╝"
