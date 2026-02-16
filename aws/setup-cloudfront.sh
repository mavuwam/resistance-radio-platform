#!/bin/bash

# Create CloudFront distribution for Resistance Radio Station

source "$(dirname "$0")/resistance-radio-config.sh"

echo "Setting up CloudFront CDN..."

# Get S3 website endpoint
S3_WEBSITE_ENDPOINT="${S3_WEBSITE_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
S3_MEDIA_ENDPOINT="${S3_MEDIA_BUCKET}.s3.${AWS_REGION}.amazonaws.com"

# Create CloudFront Origin Access Identity
OAI_COMMENT="${PROJECT_NAME}-oai-${ENVIRONMENT}"

# Check if OAI exists
OAI_ID=$(aws cloudfront list-cloud-front-origin-access-identities \
    --query "CloudFrontOriginAccessIdentityList.Items[?Comment=='${OAI_COMMENT}'].Id | [0]" \
    --output text \
    --profile ${AWS_PROFILE} 2>/dev/null)

if [ "${OAI_ID}" == "None" ] || [ -z "${OAI_ID}" ]; then
    echo "Creating CloudFront Origin Access Identity..."
    OAI_ID=$(aws cloudfront create-cloud-front-origin-access-identity \
        --cloud-front-origin-access-identity-config \
            "CallerReference=$(date +%s),Comment=${OAI_COMMENT}" \
        --query 'CloudFrontOriginAccessIdentity.Id' \
        --output text \
        --profile ${AWS_PROFILE})
    echo "✓ OAI created: ${OAI_ID}"
else
    echo "✓ OAI already exists: ${OAI_ID}"
fi

# Create CloudFront distribution configuration
DISTRIBUTION_CONFIG=$(cat <<EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "Resistance Radio Station ${ENVIRONMENT}",
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 2,
        "Items": [
            {
                "Id": "S3-Website",
                "DomainName": "${S3_WEBSITE_ENDPOINT}",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            },
            {
                "Id": "S3-Media",
                "DomainName": "${S3_MEDIA_ENDPOINT}",
                "S3OriginConfig": {
                    "OriginAccessIdentity": "origin-access-identity/cloudfront/${OAI_ID}"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-Website",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "CacheBehaviors": {
        "Quantity": 1,
        "Items": [
            {
                "PathPattern": "/media/*",
                "TargetOriginId": "S3-Media",
                "ViewerProtocolPolicy": "redirect-to-https",
                "AllowedMethods": {
                    "Quantity": 2,
                    "Items": ["GET", "HEAD"],
                    "CachedMethods": {
                        "Quantity": 2,
                        "Items": ["GET", "HEAD"]
                    }
                },
                "ForwardedValues": {
                    "QueryString": false,
                    "Cookies": {
                        "Forward": "none"
                    }
                },
                "MinTTL": 0,
                "DefaultTTL": 86400,
                "MaxTTL": 31536000,
                "Compress": true
            }
        ]
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
        "CloudFrontDefaultCertificate": true,
        "MinimumProtocolVersion": "TLSv1.2_2021"
    }
}
EOF
)

# Check if distribution already exists
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Resistance Radio Station ${ENVIRONMENT}'].Id | [0]" \
    --output text \
    --profile ${AWS_PROFILE} 2>/dev/null)

if [ "${DISTRIBUTION_ID}" == "None" ] || [ -z "${DISTRIBUTION_ID}" ]; then
    echo "Creating CloudFront distribution..."
    echo "${DISTRIBUTION_CONFIG}" > /tmp/cf-config.json
    
    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config file:///tmp/cf-config.json \
        --query 'Distribution.Id' \
        --output text \
        --profile ${AWS_PROFILE})
    
    rm /tmp/cf-config.json
    
    echo "✓ CloudFront distribution created: ${DISTRIBUTION_ID}"
    echo "Waiting for distribution to deploy (this may take 15-20 minutes)..."
else
    echo "✓ CloudFront distribution already exists: ${DISTRIBUTION_ID}"
fi

# Get distribution domain name
DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution \
    --id ${DISTRIBUTION_ID} \
    --query 'Distribution.DomainName' \
    --output text \
    --profile ${AWS_PROFILE})

# Update S3 bucket policy to allow CloudFront OAI access
BUCKET_POLICY=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontOAI",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${OAI_ID}"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${S3_MEDIA_BUCKET}/*"
        }
    ]
}
EOF
)

echo "${BUCKET_POLICY}" | aws s3api put-bucket-policy \
    --bucket ${S3_MEDIA_BUCKET} \
    --policy file:///dev/stdin \
    --profile ${AWS_PROFILE}

echo ""
echo "=========================================="
echo "CloudFront CDN Setup Complete"
echo "=========================================="
echo "Distribution ID: ${DISTRIBUTION_ID}"
echo "Domain Name: ${DISTRIBUTION_DOMAIN}"
echo "Origin Access Identity: ${OAI_ID}"
echo ""
echo "Website URL: https://${DISTRIBUTION_DOMAIN}"
echo "=========================================="
