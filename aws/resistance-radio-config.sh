#!/bin/bash

# Resistance Radio Station - AWS Configuration
# Account: Personal_Account_734110488556
# Region: us-east-1

set -e

# Configuration
export AWS_PROFILE="Personal_Account_734110488556"
export AWS_REGION="us-east-1"
export AWS_ACCOUNT_ID="734110488556"
export PROJECT_NAME="resistance-radio"
export ENVIRONMENT="${1:-dev}"  # dev, staging, or prod

# Resource naming
export S3_MEDIA_BUCKET="${PROJECT_NAME}-media-${ENVIRONMENT}-${AWS_ACCOUNT_ID}"
export S3_WEBSITE_BUCKET="${PROJECT_NAME}-website-${ENVIRONMENT}-${AWS_ACCOUNT_ID}"
export S3_BACKUP_BUCKET="${PROJECT_NAME}-backup-${ENVIRONMENT}-${AWS_ACCOUNT_ID}"
export RDS_INSTANCE_ID="${PROJECT_NAME}-db-${ENVIRONMENT}"
export DB_NAME="resistance_radio_${ENVIRONMENT}"
export DB_USERNAME="radio_admin"
export CLOUDFRONT_DISTRIBUTION="${PROJECT_NAME}-cdn-${ENVIRONMENT}"

# Application configuration
export BACKEND_PORT="5000"
export FRONTEND_PORT="3000"

echo "=========================================="
echo "Resistance Radio Station - AWS Setup"
echo "=========================================="
echo "Environment: ${ENVIRONMENT}"
echo "AWS Account: ${AWS_ACCOUNT_ID}"
echo "AWS Region: ${AWS_REGION}"
echo "AWS Profile: ${AWS_PROFILE}"
echo "=========================================="
