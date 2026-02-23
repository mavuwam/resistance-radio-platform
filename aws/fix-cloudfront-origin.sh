#!/bin/bash

# Fix CloudFront distribution to point to website bucket instead of media bucket
# This script updates the CloudFront distribution EYKP4STY3RIHX to use the correct origin

set -e

DISTRIBUTION_ID="EYKP4STY3RIHX"
AWS_PROFILE="Personal_Account_734110488556"
WEBSITE_BUCKET="resistance-radio-website-dev-734110488556"
AWS_REGION="us-east-1"

echo "=========================================="
echo "Fixing CloudFront Distribution Origin"
echo "=========================================="
echo "Distribution ID: ${DISTRIBUTION_ID}"
echo "New Origin: ${WEBSITE_BUCKET}"
echo ""

# Get current distribution configuration
echo "Fetching current distribution configuration..."
aws cloudfront get-distribution-config \
    --id ${DISTRIBUTION_ID} \
    --profile ${AWS_PROFILE} \
    --output json > /tmp/cf-config-current.json

# Extract ETag for update
ETAG=$(cat /tmp/cf-config-current.json | jq -r '.ETag')
echo "Current ETag: ${ETAG}"

# Update the origin to point to website bucket
echo "Updating origin to website bucket..."
cat /tmp/cf-config-current.json | jq --arg bucket "${WEBSITE_BUCKET}.s3.${AWS_REGION}.amazonaws.com" \
    '.DistributionConfig.Origins.Items[0].DomainName = $bucket | 
     .DistributionConfig.Origins.Items[0].S3OriginConfig = {"OriginAccessIdentity": ""} |
     del(.DistributionConfig.Origins.Items[0].CustomOriginConfig) |
     .DistributionConfig' > /tmp/cf-config-updated.json

# Verify the change
NEW_ORIGIN=$(cat /tmp/cf-config-updated.json | jq -r '.Origins.Items[0].DomainName')
echo "New origin will be: ${NEW_ORIGIN}"

# Update the distribution
echo ""
echo "Updating CloudFront distribution..."
aws cloudfront update-distribution \
    --id ${DISTRIBUTION_ID} \
    --distribution-config file:///tmp/cf-config-updated.json \
    --if-match ${ETAG} \
    --profile ${AWS_PROFILE} \
    --output json > /tmp/cf-update-result.json

NEW_ETAG=$(cat /tmp/cf-update-result.json | jq -r '.ETag')
STATUS=$(cat /tmp/cf-update-result.json | jq -r '.Distribution.Status')

echo "✓ Distribution updated successfully"
echo "New ETag: ${NEW_ETAG}"
echo "Status: ${STATUS}"

# Create invalidation to clear cache
echo ""
echo "Creating cache invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id ${DISTRIBUTION_ID} \
    --paths "/*" \
    --profile ${AWS_PROFILE} \
    --query 'Invalidation.Id' \
    --output text)

echo "✓ Invalidation created: ${INVALIDATION_ID}"

# Clean up temp files
rm -f /tmp/cf-config-current.json /tmp/cf-config-updated.json /tmp/cf-update-result.json

echo ""
echo "=========================================="
echo "CloudFront Fix Complete!"
echo "=========================================="
echo "Distribution ID: ${DISTRIBUTION_ID}"
echo "Origin: ${WEBSITE_BUCKET}"
echo "Invalidation ID: ${INVALIDATION_ID}"
echo ""
echo "Note: Distribution update takes 15-20 minutes to deploy globally"
echo "Website will be available at: https://resistanceradiostation.org"
echo "=========================================="
