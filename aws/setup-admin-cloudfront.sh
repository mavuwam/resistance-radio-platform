#!/bin/bash

# Setup Admin CloudFront Distribution for Zimbabwe Voice Admin Portal
# This script creates and configures CloudFront for the admin frontend

set -e

# Configuration
AWS_PROFILE="Personal_Account_734110488556"
AWS_REGION="us-east-1"
BUCKET_NAME="zimbabwe-voice-admin"
DOMAIN_NAME="admin.resistanceradiostation.org"
ACCOUNT_ID="734110488556"

echo "========================================="
echo "Admin CloudFront Distribution Setup"
echo "========================================="
echo ""
echo "Bucket: $BUCKET_NAME"
echo "Domain: $DOMAIN_NAME"
echo "Profile: $AWS_PROFILE"
echo ""

# Step 1: Create Origin Access Identity (OAI)
echo "Creating CloudFront Origin Access Identity..."
OAI_OUTPUT=$(aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
    "CallerReference=$(date +%s),Comment=Admin Portal OAI" \
  --profile "$AWS_PROFILE" \
  --output json)

OAI_ID=$(echo "$OAI_OUTPUT" | jq -r '.CloudFrontOriginAccessIdentity.Id')
OAI_S3_CANONICAL_USER_ID=$(echo "$OAI_OUTPUT" | jq -r '.CloudFrontOriginAccessIdentity.S3CanonicalUserId')

echo "✓ OAI created: $OAI_ID"

# Step 2: Update S3 bucket policy with OAI
echo "Updating S3 bucket policy..."
cat > /tmp/admin-bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAI",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity $OAI_ID"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket "$BUCKET_NAME" \
  --policy file:///tmp/admin-bucket-policy.json \
  --profile "$AWS_PROFILE"

echo "✓ Bucket policy updated"

# Step 3: Request ACM certificate (if not exists)
echo ""
echo "========================================="
echo "SSL Certificate Setup"
echo "========================================="
echo ""
echo "Checking for existing certificate for $DOMAIN_NAME..."

CERT_ARN=$(aws acm list-certificates \
  --region us-east-1 \
  --profile "$AWS_PROFILE" \
  --query "CertificateSummaryList[?DomainName=='$DOMAIN_NAME'].CertificateArn" \
  --output text)

if [ -z "$CERT_ARN" ]; then
  echo "No existing certificate found. Requesting new certificate..."
  echo ""
  echo "IMPORTANT: You need to request an ACM certificate manually:"
  echo "1. Go to AWS Certificate Manager (us-east-1 region)"
  echo "2. Request a public certificate for: $DOMAIN_NAME"
  echo "3. Validate via DNS (add CNAME record to your domain)"
  echo "4. Wait for certificate to be issued"
  echo "5. Re-run this script with the certificate ARN"
  echo ""
  read -p "Enter certificate ARN (or press Enter to skip): " CERT_ARN
  
  if [ -z "$CERT_ARN" ]; then
    echo "Skipping CloudFront creation. Please request certificate first."
    exit 0
  fi
else
  echo "✓ Found existing certificate: $CERT_ARN"
fi

# Step 4: Create CloudFront distribution
echo ""
echo "Creating CloudFront distribution..."

cat > /tmp/admin-cloudfront-config.json <<EOF
{
  "CallerReference": "admin-portal-$(date +%s)",
  "Comment": "Zimbabwe Voice Admin Portal",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/$OAI_ID"
        }
      }
    ]
  },
  "DefaultRootObject": "index.html",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Aliases": {
    "Quantity": 1,
    "Items": ["$DOMAIN_NAME"]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "$CERT_ARN",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "PriceClass": "PriceClass_100",
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true
}
EOF

DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution \
  --distribution-config file:///tmp/admin-cloudfront-config.json \
  --profile "$AWS_PROFILE" \
  --output json)

DISTRIBUTION_ID=$(echo "$DISTRIBUTION_OUTPUT" | jq -r '.Distribution.Id')
DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_OUTPUT" | jq -r '.Distribution.DomainName')

echo "✓ CloudFront distribution created"
echo ""
echo "Distribution ID: $DISTRIBUTION_ID"
echo "Distribution Domain: $DISTRIBUTION_DOMAIN"

# Clean up temp files
rm -f /tmp/admin-bucket-policy.json /tmp/admin-cloudfront-config.json

echo ""
echo "========================================="
echo "Admin CloudFront Setup Complete!"
echo "========================================="
echo ""
echo "Distribution ID: $DISTRIBUTION_ID"
echo "CloudFront Domain: $DISTRIBUTION_DOMAIN"
echo "Custom Domain: $DOMAIN_NAME"
echo ""
echo "Next Steps:"
echo "1. Wait for CloudFront distribution to deploy (15-20 minutes)"
echo "2. Add CNAME record in your DNS:"
echo "   Type: CNAME"
echo "   Name: admin"
echo "   Value: $DISTRIBUTION_DOMAIN"
echo "3. Test access: https://$DOMAIN_NAME"
echo "4. Update GitHub secrets with ADMIN_DISTRIBUTION_ID=$DISTRIBUTION_ID"
echo ""
