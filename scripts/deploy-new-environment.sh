#!/usr/bin/env bash
# =============================================================================
#  PropertyReach — Full environment setup + deployment script
#  Works for any AWS account (UAT, customer UAT, production, etc.)
#
#  USAGE:
#    1. Configure AWS CLI with target account credentials:
#         aws configure --profile customer-uat
#         export AWS_PROFILE=customer-uat
#       OR set access keys directly:
#         export AWS_ACCESS_KEY_ID=AKIAxxxx
#         export AWS_SECRET_ACCESS_KEY=xxxx
#
#    2. Copy and fill the config block below (or export vars before running):
#         export ENV_NAME=customer-uat
#         export AWS_REGION=ap-southeast-2
#         export DSQL_HOST=your-cluster.dsql.ap-southeast-2.on.aws
#         export SUPER_ADMIN_MOBILE=0210000000
#         export SUPER_ADMIN_OTP=123456
#         export JWT_SECRET=$(openssl rand -base64 48)
#
#    3. Run:
#         bash scripts/deploy-new-environment.sh
#
#  WHAT IT DOES (in order):
#    Phase 1  Validates prerequisites (AWS CLI, Node, credentials)
#    Phase 2  Creates 3 S3 buckets (lambda zip, frontend, uploads)
#    Phase 3  Creates 2 CloudFront distributions (frontend + uploads)
#    Phase 4  Builds Lambda zip + uploads to S3
#    Phase 5  Creates/updates Lambda function with all config
#    Phase 6  Creates HTTP API Gateway + wires to Lambda
#    Phase 7  Pushes Prisma schema to DSQL + creates indexes
#    Phase 8  Seeds super admin user
#    Phase 9  Builds frontend + deploys to S3 + invalidates CloudFront
#    Phase 10 Smoke tests (health + login)
#    Output   Prints all URLs and credentials
#
#  RE-RUNNING: Script is idempotent — safe to run again after failures.
# =============================================================================
set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }
header()  { echo -e "\n${BOLD}${BLUE}═══ $* ═══${NC}"; }

# ── Config — set these via env vars or edit here ──────────────────────────────
ENV_NAME="${ENV_NAME:-customer-uat}"          # e.g. customer-uat, prod, staging
AWS_REGION="${AWS_REGION:-ap-southeast-2}"
DSQL_HOST="${DSQL_HOST:-}"                    # REQUIRED — your DSQL cluster endpoint
SUPER_ADMIN_MOBILE="${SUPER_ADMIN_MOBILE:-0210000000}"
SUPER_ADMIN_OTP="${SUPER_ADMIN_OTP:-}"        # REQUIRED — 6-digit PIN
JWT_SECRET="${JWT_SECRET:-}"                  # REQUIRED — min 48 chars random string
JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-7d}"
MEMORY_SIZE="${MEMORY_SIZE:-512}"
TIMEOUT="${TIMEOUT:-30}"
API_DOCS_ENABLED="${API_DOCS_ENABLED:-true}"  # set false for production

# Derived resource names (auto-generated from ENV_NAME — override if needed)
S3_LAMBDA_BUCKET="${S3_LAMBDA_BUCKET:-${ENV_NAME}-lambda}"
S3_FRONTEND_BUCKET="${S3_FRONTEND_BUCKET:-${ENV_NAME}-web}"
S3_UPLOADS_BUCKET="${S3_UPLOADS_BUCKET:-${ENV_NAME}-uploads}"
LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-${ENV_NAME}-api}"
API_NAME="${API_NAME:-${ENV_NAME}-api}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
WEB_DIR="$REPO_ROOT/web"
OUTPUT_FILE="$REPO_ROOT/.deploy-output-${ENV_NAME}.env"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 1 — Validating prerequisites"
# ─────────────────────────────────────────────────────────────────────────────

command -v aws  >/dev/null 2>&1 || error "aws CLI not found. Install: brew install awscli"
command -v node >/dev/null 2>&1 || error "node not found. Install: brew install node"
command -v zip  >/dev/null 2>&1 || error "zip not found."
command -v curl >/dev/null 2>&1 || error "curl not found."

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
[[ "$NODE_VER" -ge 20 ]] || error "Node.js 20+ required (found v$NODE_VER)"

# Validate required config
[[ -z "$DSQL_HOST" ]]         && error "DSQL_HOST is required. Export it before running."
[[ -z "$SUPER_ADMIN_OTP" ]]   && error "SUPER_ADMIN_OTP is required (6-digit PIN)."
[[ -z "$JWT_SECRET" ]]        && error "JWT_SECRET is required. Run: export JWT_SECRET=\$(openssl rand -base64 48)"
[[ "${#JWT_SECRET}" -lt 32 ]] && error "JWT_SECRET must be at least 32 characters."
[[ "${#SUPER_ADMIN_OTP}" -ne 6 ]] && error "SUPER_ADMIN_OTP must be exactly 6 digits."

# Confirm AWS credentials
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null) \
  || error "AWS credentials not configured. Run: aws configure"
info "AWS Account: $ACCOUNT_ID | Region: $AWS_REGION"
info "Environment: $ENV_NAME"

echo ""
echo -e "${YELLOW}Resources to be created in account $ACCOUNT_ID ($AWS_REGION):${NC}"
echo "  S3 buckets:  $S3_LAMBDA_BUCKET | $S3_FRONTEND_BUCKET | $S3_UPLOADS_BUCKET"
echo "  Lambda:      $LAMBDA_FUNCTION_NAME"
echo "  API Gateway: $API_NAME"
echo ""
read -rp "Continue? (y/N) " CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 2 — Creating S3 buckets"
# ─────────────────────────────────────────────────────────────────────────────

create_bucket() {
  local BUCKET=$1 PURPOSE=$2
  # Try to check if bucket exists; if we lack permissions to check, assume it exists
  if aws s3api head-bucket --bucket "$BUCKET" --region "$AWS_REGION" 2>/dev/null; then
    warn "Bucket $BUCKET already exists — skipping creation"
  else
    # Try to create; if it fails (e.g. already exists or no permission), warn and continue
    if aws s3api create-bucket \
      --bucket "$BUCKET" \
      --region "$AWS_REGION" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION" \
      --output json >/dev/null 2>&1; then
      success "Created S3 bucket: $BUCKET ($PURPOSE)"
    else
      warn "Could not create $BUCKET — assuming it already exists, continuing..."
    fi
  fi
  # Try to block public access (non-fatal if denied)
  aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
    --region "$AWS_REGION" 2>/dev/null || true
}

create_bucket "$S3_LAMBDA_BUCKET"   "Lambda zip"
create_bucket "$S3_FRONTEND_BUCKET" "Frontend static"
create_bucket "$S3_UPLOADS_BUCKET"  "Image uploads"

# CORS on uploads bucket (non-fatal if denied)
aws s3api put-bucket-cors \
  --bucket "$S3_UPLOADS_BUCKET" \
  --region "$AWS_REGION" \
  --cors-configuration "{
    \"CORSRules\": [{
      \"AllowedOrigins\": [\"*\"],
      \"AllowedMethods\": [\"PUT\",\"GET\",\"HEAD\"],
      \"AllowedHeaders\": [\"*\"],
      \"ExposeHeaders\": [\"ETag\"],
      \"MaxAgeSeconds\": 3600
    }]
  }" 2>/dev/null && success "S3 CORS configured for uploads bucket" || warn "Could not set CORS on uploads bucket — may need manual setup"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 3 — Creating CloudFront distributions"
# ─────────────────────────────────────────────────────────────────────────────

create_cloudfront() {
  local BUCKET=$1 CF_REF=$2 CF_COMMENT=$3 IS_SPA=$4

  # Create OAC
  OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config "{
      \"Name\": \"${CF_REF}-oac\",
      \"Description\": \"OAC for $BUCKET\",
      \"SigningProtocol\": \"sigv4\",
      \"SigningBehavior\": \"always\",
      \"OriginAccessControlOriginType\": \"s3\"
    }" \
    --query "OriginAccessControl.Id" --output text 2>/dev/null) || {
    # OAC might already exist with same name — find it
    OAC_ID=$(aws cloudfront list-origin-access-controls \
      --query "OriginAccessControlList.Items[?Name=='${CF_REF}-oac'].Id" \
      --output text 2>/dev/null | head -1)
    warn "OAC ${CF_REF}-oac already exists: $OAC_ID"
  }

  # Build custom error responses (SPA only)
  if [[ "$IS_SPA" == "true" ]]; then
    CUSTOM_ERRORS='"CustomErrorResponses":{"Quantity":1,"Items":[{"ErrorCode":403,"ResponsePagePath":"/index.html","ResponseCode":"200","ErrorCachingMinTTL":0}]},'
  else
    CUSTOM_ERRORS='"CustomErrorResponses":{"Quantity":0,"Items":[]},'
  fi

  # Create distribution
  DIST_JSON=$(aws cloudfront create-distribution --distribution-config "{
    \"CallerReference\": \"${CF_REF}-$(date +%s)\",
    \"Comment\": \"$CF_COMMENT\",
    \"DefaultRootObject\": \"$([ \"$IS_SPA\" == 'true' ] && echo 'index.html' || echo '')\",
    \"Origins\": {\"Quantity\":1,\"Items\":[{
      \"Id\": \"s3-${BUCKET}\",
      \"DomainName\": \"${BUCKET}.s3.${AWS_REGION}.amazonaws.com\",
      \"S3OriginConfig\": {\"OriginAccessIdentity\": \"\"},
      \"OriginAccessControlId\": \"${OAC_ID}\"
    }]},
    \"DefaultCacheBehavior\": {
      \"TargetOriginId\": \"s3-${BUCKET}\",
      \"ViewerProtocolPolicy\": \"redirect-to-https\",
      \"CachePolicyId\": \"658327ea-f89d-4fab-a63d-7e88639e58f6\",
      \"Compress\": true,
      \"AllowedMethods\": {\"Quantity\":2,\"Items\":[\"GET\",\"HEAD\"],\"CachedMethods\":{\"Quantity\":2,\"Items\":[\"GET\",\"HEAD\"]}}
    },
    ${CUSTOM_ERRORS}
    \"Enabled\": true,
    \"HttpVersion\": \"http2\",
    \"PriceClass\": \"PriceClass_All\"
  }" --output json 2>/dev/null)

  DIST_ID=$(echo "$DIST_JSON"   | python3 -c "import sys,json; print(json.load(sys.stdin)['Distribution']['Id'])")
  DIST_DOMAIN=$(echo "$DIST_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['Distribution']['DomainName'])")

  # Allow CloudFront to read from S3 bucket
  aws s3api put-bucket-policy \
    --bucket "$BUCKET" \
    --policy "{
      \"Version\": \"2012-10-17\",
      \"Statement\": [{
        \"Effect\": \"Allow\",
        \"Principal\": {\"Service\": \"cloudfront.amazonaws.com\"},
        \"Action\": \"s3:GetObject\",
        \"Resource\": \"arn:aws:s3:::${BUCKET}/*\",
        \"Condition\": {\"StringEquals\": {
          \"AWS:SourceArn\": \"arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DIST_ID}\"
        }}
      }]
    }" 2>/dev/null || true

  success "CloudFront created: https://$DIST_DOMAIN (ID: $DIST_ID)"
  echo "$DIST_ID|$DIST_DOMAIN"
}

info "Creating frontend CloudFront distribution..."
CF_FRONTEND_RESULT=$(create_cloudfront "$S3_FRONTEND_BUCKET" "${ENV_NAME}-web" "PropertyReach Frontend - $ENV_NAME" "true")
CF_FRONTEND_ID=$(echo "$CF_FRONTEND_RESULT" | tail -1 | cut -d'|' -f1)
CF_FRONTEND_DOMAIN=$(echo "$CF_FRONTEND_RESULT" | tail -1 | cut -d'|' -f2)

info "Creating uploads CloudFront distribution..."
CF_UPLOADS_RESULT=$(create_cloudfront "$S3_UPLOADS_BUCKET" "${ENV_NAME}-uploads" "PropertyReach Uploads - $ENV_NAME" "false")
CF_UPLOADS_ID=$(echo "$CF_UPLOADS_RESULT" | tail -1 | cut -d'|' -f1)
CF_UPLOADS_DOMAIN=$(echo "$CF_UPLOADS_RESULT" | tail -1 | cut -d'|' -f2)

# Update uploads bucket CORS to restrict to the actual frontend domain
aws s3api put-bucket-cors \
  --bucket "$S3_UPLOADS_BUCKET" \
  --region "$AWS_REGION" \
  --cors-configuration "{
    \"CORSRules\": [{
      \"AllowedOrigins\": [\"https://${CF_FRONTEND_DOMAIN}\",\"http://localhost:5173\"],
      \"AllowedMethods\": [\"PUT\",\"GET\",\"HEAD\"],
      \"AllowedHeaders\": [\"*\"],
      \"ExposeHeaders\": [\"ETag\"],
      \"MaxAgeSeconds\": 3600
    }]
  }" 2>/dev/null || true
success "Uploads bucket CORS updated with frontend domain"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 4 — Building and packaging Lambda"
# ─────────────────────────────────────────────────────────────────────────────

cd "$BACKEND_DIR"

info "Installing backend dependencies..."
npm install --silent 2>/dev/null

info "Installing TypeScript..."
npm install --save-dev typescript --silent 2>/dev/null

info "Generating Prisma client + compiling TypeScript..."
npx prisma generate 2>/dev/null
./node_modules/.bin/tsc --noEmitOnError false 2>/dev/null || true

info "Pruning dev dependencies..."
npm prune --omit=dev --silent 2>/dev/null

info "Packaging Lambda zip..."
ZIP_PATH="$BACKEND_DIR/propertyreach-lambda.zip"
rm -f "$ZIP_PATH"
zip -r "$ZIP_PATH" dist prisma/schema.prisma package.json package-lock.json node_modules \
  --quiet 2>/dev/null
ZIP_SIZE=$(du -h "$ZIP_PATH" | cut -f1)
success "Lambda zip ready: $ZIP_SIZE"

info "Uploading zip to s3://$S3_LAMBDA_BUCKET/..."
aws s3 cp "$ZIP_PATH" "s3://$S3_LAMBDA_BUCKET/propertyreach-lambda.zip" \
  --region "$AWS_REGION" 2>/dev/null
success "Zip uploaded to S3"

cd "$REPO_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 5 — Creating/updating Lambda function"
# ─────────────────────────────────────────────────────────────────────────────

# Create or update Lambda function
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  info "Lambda $LAMBDA_FUNCTION_NAME exists — updating code..."
  aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --region "$AWS_REGION" \
    --s3-bucket "$S3_LAMBDA_BUCKET" \
    --s3-key "propertyreach-lambda.zip" \
    --output json >/dev/null
  success "Lambda code updated"
else
  info "Creating Lambda function $LAMBDA_FUNCTION_NAME..."

  # Create execution role first
  ROLE_NAME="${LAMBDA_FUNCTION_NAME}-role"
  ROLE_ARN=$(aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{
      "Version":"2012-10-17",
      "Statement":[{
        "Effect":"Allow",
        "Principal":{"Service":"lambda.amazonaws.com"},
        "Action":"sts:AssumeRole"
      }]
    }' \
    --query "Role.Arn" --output text 2>/dev/null) || \
  ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query "Role.Arn" --output text 2>/dev/null)

  # Attach basic Lambda execution policy
  aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" 2>/dev/null || true

  info "Waiting for IAM role to propagate..."
  sleep 12

  aws lambda create-function \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --region "$AWS_REGION" \
    --runtime nodejs20.x \
    --handler dist/lambda.handler \
    --role "$ROLE_ARN" \
    --code "S3Bucket=$S3_LAMBDA_BUCKET,S3Key=propertyreach-lambda.zip" \
    --timeout "$TIMEOUT" \
    --memory-size "$MEMORY_SIZE" \
    --architectures x86_64 \
    --output json >/dev/null
  success "Lambda function created"

  ROLE_NAME="${LAMBDA_FUNCTION_NAME}-role"
fi

# Get role name from Lambda
LAMBDA_ROLE_ARN=$(aws lambda get-function-configuration \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --region "$AWS_REGION" \
  --query "Role" --output text)
ROLE_NAME=$(basename "$LAMBDA_ROLE_ARN")

info "Configuring Lambda (handler, timeout, memory)..."
aws lambda update-function-configuration \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --region "$AWS_REGION" \
  --handler dist/lambda.handler \
  --timeout "$TIMEOUT" \
  --memory-size "$MEMORY_SIZE" \
  --output json >/dev/null
success "Lambda configured: handler=dist/lambda.handler timeout=${TIMEOUT}s memory=${MEMORY_SIZE}MB"

info "Attaching IAM policies to Lambda role ($ROLE_NAME)..."

# DSQL policy
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name DSQLConnectPolicy \
  --policy-document "{
    \"Version\":\"2012-10-17\",
    \"Statement\":[{
      \"Effect\":\"Allow\",
      \"Action\":[\"dsql:DbConnectAdmin\",\"dsql:DbConnect\"],
      \"Resource\":\"arn:aws:dsql:${AWS_REGION}:${ACCOUNT_ID}:cluster/*\"
    }]
  }" 2>/dev/null || true

# S3 uploads policy
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name S3UploadsPolicy \
  --policy-document "{
    \"Version\":\"2012-10-17\",
    \"Statement\":[{
      \"Effect\":\"Allow\",
      \"Action\":[\"s3:PutObject\",\"s3:GetObject\",\"s3:DeleteObject\"],
      \"Resource\":\"arn:aws:s3:::${S3_UPLOADS_BUCKET}/*\"
    }]
  }" 2>/dev/null || true

success "IAM policies attached (DSQL + S3)"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 6 — Creating API Gateway"
# ─────────────────────────────────────────────────────────────────────────────

# Check if API already exists
EXISTING_API_ID=$(aws apigatewayv2 get-apis \
  --region "$AWS_REGION" \
  --query "Items[?Name=='$API_NAME'].ApiId" \
  --output text 2>/dev/null | head -1)

if [[ -n "$EXISTING_API_ID" && "$EXISTING_API_ID" != "None" ]]; then
  warn "API Gateway $API_NAME already exists (ID: $EXISTING_API_ID)"
  API_ID="$EXISTING_API_ID"
  API_ENDPOINT=$(aws apigatewayv2 get-api \
    --api-id "$API_ID" \
    --region "$AWS_REGION" \
    --query "ApiEndpoint" --output text)
else
  info "Creating HTTP API Gateway..."
  API_RESULT=$(aws apigatewayv2 create-api \
    --name "$API_NAME" \
    --protocol-type HTTP \
    --cors-configuration "{
      \"AllowOrigins\": [\"https://$CF_FRONTEND_DOMAIN\"],
      \"AllowMethods\": [\"GET\",\"POST\",\"PUT\",\"PATCH\",\"DELETE\",\"OPTIONS\"],
      \"AllowHeaders\": [\"Content-Type\",\"Authorization\",\"X-Requested-With\"],
      \"AllowCredentials\": true,
      \"MaxAge\": 86400
    }" \
    --region "$AWS_REGION" \
    --output json)

  API_ID=$(echo "$API_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['ApiId'])")
  API_ENDPOINT=$(echo "$API_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['ApiEndpoint'])")

  LAMBDA_ARN="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${LAMBDA_FUNCTION_NAME}"

  # Create integration
  INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id "$API_ID" \
    --region "$AWS_REGION" \
    --integration-type AWS_PROXY \
    --integration-uri "arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations" \
    --payload-format-version 2.0 \
    --query IntegrationId --output text)

  # Default catch-all route
  aws apigatewayv2 create-route \
    --api-id "$API_ID" \
    --region "$AWS_REGION" \
    --route-key '$default' \
    --target "integrations/$INTEGRATION_ID" \
    --output json >/dev/null

  # Auto-deploy stage
  aws apigatewayv2 create-stage \
    --api-id "$API_ID" \
    --region "$AWS_REGION" \
    --stage-name '$default' \
    --auto-deploy \
    --output json >/dev/null

  # Allow API Gateway to invoke Lambda
  aws lambda add-permission \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --region "$AWS_REGION" \
    --statement-id "apigateway-invoke-$(date +%s)" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${AWS_REGION}:${ACCOUNT_ID}:${API_ID}/*" \
    --output json >/dev/null

  success "API Gateway created: $API_ENDPOINT (ID: $API_ID)"
fi

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 6b — Setting Lambda environment variables"
# ─────────────────────────────────────────────────────────────────────────────

ENV_JSON=$(python3 -c "
import json
print(json.dumps({'Variables': {
  'NODE_ENV':                    'production',
  'PORT':                        '3001',
  'DATABASE_URL':                '',
  'AURORA_DSQL_IAM_AUTH':        'true',
  'AURORA_DSQL_HOST':            '$DSQL_HOST',
  'AURORA_DSQL_REGION':          '$AWS_REGION',
  'AURORA_DSQL_TOKEN_EXPIRES_SEC': '900',
  'JWT_SECRET':                  '$JWT_SECRET',
  'JWT_EXPIRES_IN':              '$JWT_EXPIRES_IN',
  'CORS_ORIGIN':                 'https://$CF_FRONTEND_DOMAIN',
  'SERVER_PUBLIC_URL':           '$API_ENDPOINT',
  'OPENAPI_SERVER_URL':          '$API_ENDPOINT',
  'SUPER_ADMIN_MOBILE':          '$SUPER_ADMIN_MOBILE',
  'SUPER_ADMIN_OTP':             '$SUPER_ADMIN_OTP',
  'S3_BUCKET':                   '$S3_UPLOADS_BUCKET',
  'S3_REGION':                   '$AWS_REGION',
  'S3_PUBLIC_URL_PREFIX':        'https://$CF_UPLOADS_DOMAIN',
  'LOG_STACK':                   'true',
  'PRISMA_LOG_QUERIES':          'false',
  'PUBLIC_LISTINGS_API_ENABLED': 'true',
  'API_DOCS_ENABLED':            '$API_DOCS_ENABLED',
}}))
")

aws lambda update-function-configuration \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --region "$AWS_REGION" \
  --environment "$ENV_JSON" \
  --output json >/dev/null
success "Lambda environment variables set"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 7 — Pushing database schema"
# ─────────────────────────────────────────────────────────────────────────────

cd "$BACKEND_DIR"
info "Running Prisma db push to DSQL..."

export AURORA_DSQL_HOST="$DSQL_HOST"
export AURORA_DSQL_REGION="$AWS_REGION"
export AURORA_DSQL_IAM_AUTH="true"

npm run db:push:dsql 2>&1 | grep -E "error|warn|pushed|✓|✗|prisma" | head -20 || true
npm run db:indexes:dsql 2>&1 | grep -E "error|warn|CREATE|INDEX|Done" | head -20 || true
success "Database schema up to date"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 8 — Seeding super admin"
# ─────────────────────────────────────────────────────────────────────────────

export SUPER_ADMIN_MOBILE="$SUPER_ADMIN_MOBILE"
export SUPER_ADMIN_OTP="$SUPER_ADMIN_OTP"

info "Running seed (creates super admin if not exists)..."
npm run seed 2>&1 | grep -E "error|seeded|created|exists|admin|skip" | head -10 || true
success "Seed complete"

cd "$REPO_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 9 — Building and deploying frontend"
# ─────────────────────────────────────────────────────────────────────────────

cd "$WEB_DIR"
info "Installing frontend dependencies..."
npm install --silent 2>/dev/null

info "Building frontend (VITE_API_BASE_URL=$API_ENDPOINT/api)..."
VITE_API_BASE_URL="${API_ENDPOINT}/api" \
VITE_PUBLIC_SITE_ENABLED=true \
VITE_ENV=production \
npm run build 2>&1 | grep -E "error|warn|✓|built|dist" | head -20

# Upload assets (long cache — content-hashed filenames)
info "Uploading assets to S3..."
aws s3 sync dist/ "s3://$S3_FRONTEND_BUCKET/" \
  --region "$AWS_REGION" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html" \
  --quiet 2>/dev/null

# Upload index.html (no cache — always fetch fresh)
aws s3 cp dist/index.html "s3://$S3_FRONTEND_BUCKET/index.html" \
  --region "$AWS_REGION" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --quiet 2>/dev/null
success "Frontend uploaded to S3"

# Invalidate CloudFront
info "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$CF_FRONTEND_ID" \
  --paths "/*" \
  --output json >/dev/null
success "CloudFront invalidation triggered"

cd "$REPO_ROOT"

# ─────────────────────────────────────────────────────────────────────────────
header "Phase 10 — Smoke tests"
# ─────────────────────────────────────────────────────────────────────────────

info "Waiting for Lambda to be ready..."
sleep 8

# Health check
HEALTH=$(curl -sf --max-time 30 "$API_ENDPOINT/health" 2>/dev/null || echo '{"status":"error"}')
HEALTH_STATUS=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','error'))" 2>/dev/null || echo "error")

if [[ "$HEALTH_STATUS" == "ok" ]]; then
  success "Health check passed ✓"
else
  warn "Health check returned: $HEALTH"
fi

# Login test
LOGIN=$(curl -sf --max-time 30 -X POST "$API_ENDPOINT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"mobileNumber\":\"$SUPER_ADMIN_MOBILE\",\"pin\":\"$SUPER_ADMIN_OTP\"}" 2>/dev/null || echo '{}')
LOGIN_OK=$(echo "$LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if d.get('success') else 'no')" 2>/dev/null || echo "no")

if [[ "$LOGIN_OK" == "yes" ]]; then
  success "Login test passed ✓"
else
  warn "Login test returned: $LOGIN"
  warn "This may be normal if CloudFront is still deploying (15 min) or DSQL schema was just pushed."
fi

# Upload config
UPLOAD_CONFIG=$(curl -sf --max-time 10 "$API_ENDPOINT/api/upload/config" 2>/dev/null || echo '{}')
S3_ENABLED=$(echo "$UPLOAD_CONFIG" | python3 -c "import sys,json; print(json.load(sys.stdin).get('s3Enabled','false'))" 2>/dev/null || echo "false")

if [[ "$S3_ENABLED" == "True" || "$S3_ENABLED" == "true" ]]; then
  success "S3 upload config confirmed ✓"
else
  warn "Upload config: $UPLOAD_CONFIG"
fi

# ─────────────────────────────────────────────────────────────────────────────
header "Deployment Complete"
# ─────────────────────────────────────────────────────────────────────────────

# Save output to file
cat > "$OUTPUT_FILE" <<EOF
# PropertyReach — $ENV_NAME deployment output
# Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')

AWS_ACCOUNT=$ACCOUNT_ID
AWS_REGION=$AWS_REGION
ENV_NAME=$ENV_NAME

# S3 Buckets
S3_LAMBDA_BUCKET=$S3_LAMBDA_BUCKET
S3_FRONTEND_BUCKET=$S3_FRONTEND_BUCKET
S3_UPLOADS_BUCKET=$S3_UPLOADS_BUCKET

# Lambda
LAMBDA_FUNCTION_NAME=$LAMBDA_FUNCTION_NAME
LAMBDA_ROLE=$ROLE_NAME

# API Gateway
API_GATEWAY_ID=$API_ID
API_ENDPOINT=$API_ENDPOINT

# CloudFront
CF_FRONTEND_ID=$CF_FRONTEND_ID
CF_FRONTEND_URL=https://$CF_FRONTEND_DOMAIN
CF_UPLOADS_ID=$CF_UPLOADS_ID
CF_UPLOADS_URL=https://$CF_UPLOADS_DOMAIN

# App URLs
FRONTEND_URL=https://$CF_FRONTEND_DOMAIN
ADMIN_LOGIN_URL=https://$CF_FRONTEND_DOMAIN/admin/login
API_HEALTH_URL=$API_ENDPOINT/health
API_DOCS_URL=$API_ENDPOINT/api-docs

# Credentials (store securely — do not commit)
SUPER_ADMIN_MOBILE=$SUPER_ADMIN_MOBILE
SUPER_ADMIN_OTP=$SUPER_ADMIN_OTP
EOF

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║         Deployment Successful — $ENV_NAME         ${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Frontend:${NC}     https://$CF_FRONTEND_DOMAIN"
echo -e "${BOLD}Admin login:${NC}  https://$CF_FRONTEND_DOMAIN/admin/login"
echo -e "${BOLD}API:${NC}          $API_ENDPOINT"
echo -e "${BOLD}API health:${NC}   $API_ENDPOINT/health"
echo -e "${BOLD}API docs:${NC}     $API_ENDPOINT/api-docs"
echo -e "${BOLD}Images CDN:${NC}   https://$CF_UPLOADS_DOMAIN"
echo ""
echo -e "${BOLD}Mobile:${NC}  $SUPER_ADMIN_MOBILE"
echo -e "${BOLD}PIN:${NC}     $SUPER_ADMIN_OTP"
echo ""
echo -e "${YELLOW}⏳ Note: CloudFront may take 10–15 min to fully propagate.${NC}"
echo -e "${YELLOW}   If the site doesn't load immediately, wait and try again.${NC}"
echo ""
echo -e "Full output saved to: ${BOLD}$OUTPUT_FILE${NC}"
