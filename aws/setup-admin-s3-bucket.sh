#!/bin/bash

# Setup Admin S3 Bucket for Zimbabwe Voice Admin Portal
# This script creates and configures the S3 bucket for the admin frontend

set -e

# Configuration
AWS_PROFILE="Personal_Account_734110488556"
AWS_REGION="us-east-1"
BUCKET_NAME="zimbabwe-voice-admin"
ACCOUNT_ID="734110488556"

echo "========================================="
echo "Admin S3 Bucket Setup"
echo "========================================="
echo ""
echo "Bucket: $BUCKET_NAME"
echo "Region: $AWS_REGION"
echo "Profile: $AWS_PROFILE"
echo ""

# Check if bucket already exists
if aws s3 ls "s3://$BUCKET_NAME" --profile "$AWS_PROFILE" 2>/dev/null; then
  echo "✓ Bucket $BUCKET_NAME already exists"
else
  echo "Creating S3 bucket..."
  aws s3 mb "s3://$BUCKET_NAME" \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE"
  echo "✓ Bucket created"
fi

# Enable versioning
echo "Enabling versioning..."
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled \
  --profile "$AWS_PROFILE"
echo "✓ Versioning enabled"

# Configure bucket for static website hosting
echo "Configuring static website hosting..."
aws s3 website "s3://$BUCKET_NAME" \
  --index-document index.html \
  --error-document index.html \
  --profile "$AWS_PROFILE"
echo "✓ Static website hosting configured"

# Block public access (CloudFront will access via OAI)
echo "Configuring public access block..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
  --profile "$AWS_PROFILE"
echo "✓ Public access blocked"

# Create bucket policy for CloudFront OAI
echo "Creating bucket policy..."
cat > /tmp/admin-bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAI",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity PLACEHOLDER"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

echo "✓ Bucket policy template created (update with OAI after CloudFront setup)"

# Enable server-side encryption
echo "Enabling server-side encryption..."
aws s3api put-bucket-encryption \
  --bucket "$BUCKET_NAME" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }' \
  --profile "$AWS_PROFILE"
echo "✓ Encryption enabled"

# Configure lifecycle policy for old versions
echo "Configuring lifecycle policy..."
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$BUCKET_NAME" \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    }]
  }' \
  --profile "$AWS_PROFILE"
echo "✓ Lifecycle policy configured"

# Add tags
echo "Adding tags..."
aws s3api put-bucket-tagging \
  --bucket "$BUCKET_NAME" \
  --tagging 'TagSet=[
    {Key=Project,Value=ZimbabweVoice},
    {Key=Environment,Value=Production},
    {Key=Application,Value=AdminPortal},
    {Key=ManagedBy,Value=Terraform}
  ]' \
  --profile "$AWS_PROFILE"
echo "✓ Tags added"

echo ""
echo "========================================="
echo "Admin S3 Bucket Setup Complete!"
echo "========================================="
echo ""
echo "Bucket Name: $BUCKET_NAME"
echo "Region: $AWS_REGION"
echo "Website Endpoint: http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo ""
echo "Next Steps:"
echo "1. Create CloudFront distribution (run setup-admin-cloudfront.sh)"
echo "2. Update bucket policy with CloudFront OAI"
echo "3. Configure DNS for admin.resistanceradiostation.org"
echo ""
