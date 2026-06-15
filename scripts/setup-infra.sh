#!/usr/bin/env bash
# =============================================================================
# PropertyReach — One-time AWS infrastructure setup
#
# Run this ONCE before your first deployment to create:
#   • S3 — frontend static assets (React/Vite build target)
#   • CloudFront — CDN in front of the frontend bucket
#   • S3 — uploads bucket (listing photos, profile images; presigned PUT from browser)
#
# Not created here (separate / automatic):
#   • S3 — Lambda deployment zip (created by Serverless/CloudFormation on first deploy)
#   • Lambda + API Gateway — backend (serverless deploy)
#   • Aurora DSQL — database (provision in AWS Console; IAM auth from Lambda)
#
# Prerequisites:
#   aws cli v2 installed and configured (aws configure)
#   jq installed (brew install jq / apt install jq)
#
# Usage:
#   export AWS_REGION=ap-southeast-2
#   export APP_DOMAIN=propertyreach.co.nz   # or leave blank to use CloudFront URL
#   bash scripts/setup-infra.sh
# =============================================================================
set -euo pipefail

REGION="${AWS_REGION:-ap-southeast-2}"
STAGE="${STAGE:-prod}"
APP_NAME="propertyreach"

FRONTEND_BUCKET="${APP_NAME}-frontend-${STAGE}"
UPLOADS_BUCKET="${APP_NAME}-uploads-${STAGE}"

echo "==================================================================="
echo " PropertyReach AWS Infrastructure Setup"
echo " Region : $REGION"
echo " Stage  : $STAGE"
echo "==================================================================="
echo ""

# ── 1. Frontend S3 bucket ─────────────────────────────────────────────────────
echo "▶ Creating frontend S3 bucket: $FRONTEND_BUCKET"
if aws s3api head-bucket --bucket "$FRONTEND_BUCKET" 2>/dev/null; then
  echo "  ✓ Already exists"
else
  aws s3api create-bucket \
    --bucket "$FRONTEND_BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" \
    --no-cli-pager

  # Block all public access (CloudFront uses OAC/OAI instead)
  aws s3api put-public-access-block \
    --bucket "$FRONTEND_BUCKET" \
    --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
    --no-cli-pager

  echo "  ✓ Created"
fi

# ── 2. Uploads S3 bucket ─────────────────────────────────────────────────────
echo "▶ Creating uploads S3 bucket: $UPLOADS_BUCKET"
if aws s3api head-bucket --bucket "$UPLOADS_BUCKET" 2>/dev/null; then
  echo "  ✓ Already exists"
else
  aws s3api create-bucket \
    --bucket "$UPLOADS_BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION" \
    --no-cli-pager

  # Block public access (serve via CloudFront or presigned URLs)
  aws s3api put-public-access-block \
    --bucket "$UPLOADS_BUCKET" \
    --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
    --no-cli-pager

  # CORS — allow presigned PUT from any origin (restrict in prod to your domain)
  aws s3api put-bucket-cors \
    --bucket "$UPLOADS_BUCKET" \
    --cors-configuration '{
      "CORSRules": [{
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["PUT", "GET"],
        "AllowedHeaders": ["Content-Type", "Content-Length"],
        "MaxAgeSeconds": 3000
      }]
    }' \
    --no-cli-pager

  echo "  ✓ Created (CORS configured)"
fi

# ── 3. CloudFront distribution for frontend ───────────────────────────────────
echo "▶ Creating CloudFront distribution for $FRONTEND_BUCKET"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CF_COMMENT="PropertyReach frontend (${STAGE})"

EXISTING_CF=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='${CF_COMMENT}'].Id" \
  --output text 2>/dev/null || echo "")

if [[ -n "$EXISTING_CF" && "$EXISTING_CF" != "None" ]]; then
  CF_DOMAIN=$(aws cloudfront get-distribution \
    --id "$EXISTING_CF" \
    --query "Distribution.DomainName" \
    --output text)
  echo "  ✓ Already exists: https://$CF_DOMAIN"
  echo "  Distribution ID : $EXISTING_CF"
else
  OAC_NAME="${APP_NAME}-oac-${STAGE}"
  OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config "{
      \"Name\": \"${OAC_NAME}\",
      \"Description\": \"OAC for ${FRONTEND_BUCKET}\",
      \"SigningProtocol\": \"sigv4\",
      \"SigningBehavior\": \"always\",
      \"OriginAccessControlOriginType\": \"s3\"
    }" \
    --query "OriginAccessControl.Id" \
    --output text \
    --no-cli-pager)

  DIST_JSON=$(aws cloudfront create-distribution --distribution-config "{
    \"CallerReference\": \"$(date +%s)\",
    \"Comment\": \"${CF_COMMENT}\",
    \"DefaultRootObject\": \"index.html\",
    \"Origins\": {
      \"Quantity\": 1,
      \"Items\": [{
        \"Id\": \"S3-${FRONTEND_BUCKET}\",
        \"DomainName\": \"${FRONTEND_BUCKET}.s3.${REGION}.amazonaws.com\",
        \"S3OriginConfig\": { \"OriginAccessIdentity\": \"\" },
        \"OriginAccessControlId\": \"${OAC_ID}\"
      }]
    },
    \"DefaultCacheBehavior\": {
      \"TargetOriginId\": \"S3-${FRONTEND_BUCKET}\",
      \"ViewerProtocolPolicy\": \"redirect-to-https\",
      \"AllowedMethods\": { \"Quantity\": 2, \"Items\": [\"GET\",\"HEAD\"] },
      \"CachePolicyId\": \"658327ea-f89d-4fab-a63d-7e88639e58f6\",
      \"Compress\": true,
      \"ForwardedValues\": {
        \"QueryString\": false,
        \"Cookies\": { \"Forward\": \"none\" }
      },
      \"MinTTL\": 0,
      \"TrustedSigners\": { \"Enabled\": false, \"Quantity\": 0 }
    },
    \"CustomErrorResponses\": {
      \"Quantity\": 1,
      \"Items\": [{
        \"ErrorCode\": 403,
        \"ResponsePagePath\": \"/index.html\",
        \"ResponseCode\": \"200\",
        \"ErrorCachingMinTTL\": 0
      }]
    },
    \"Enabled\": true,
    \"HttpVersion\": \"http2and3\",
    \"PriceClass\": \"PriceClass_All\"
  }" --no-cli-pager)

  CF_ID=$(echo "$DIST_JSON" | jq -r '.Distribution.Id')
  CF_DOMAIN=$(echo "$DIST_JSON" | jq -r '.Distribution.DomainName')

  # Attach bucket policy to allow CloudFront OAC to read from S3
  aws s3api put-bucket-policy \
    --bucket "$FRONTEND_BUCKET" \
    --policy "{
      \"Version\": \"2012-10-17\",
      \"Statement\": [{
        \"Sid\": \"AllowCloudFrontOAC\",
        \"Effect\": \"Allow\",
        \"Principal\": { \"Service\": \"cloudfront.amazonaws.com\" },
        \"Action\": \"s3:GetObject\",
        \"Resource\": \"arn:aws:s3:::${FRONTEND_BUCKET}/*\",
        \"Condition\": {
          \"StringEquals\": {
            \"AWS:SourceArn\": \"arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${CF_ID}\"
          }
        }
      }]
    }" \
    --no-cli-pager

  echo "  ✓ Created: https://$CF_DOMAIN"
  echo "  Distribution ID : $CF_ID"
  CF_DOMAIN_RESULT="$CF_DOMAIN"
fi

echo ""
echo "==================================================================="
echo " ✅  Infrastructure setup complete"
echo ""
echo " Note: Database is Aurora DSQL — already provisioned separately."
echo "       Set AURORA_DSQL_HOST in backend/.env.production."
echo ""
echo " Next steps:"
echo "  1. Fill CORS_ORIGIN in backend/.env.production with the CloudFront URL above"
echo "  2. Push schema:   cd backend && node scripts/prisma-dsql-push.mjs"
echo "  3. Deploy backend: bash scripts/deploy-backend.sh"
echo "  4. Deploy frontend: bash scripts/deploy-frontend.sh"
echo "==================================================================="
