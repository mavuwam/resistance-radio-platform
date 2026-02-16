#!/bin/bash

# Master deployment script for Resistance Radio Station
# Usage: ./deploy-resistance-radio.sh [dev|staging|prod]

set -e

ENVIRONMENT="${1:-dev}"

echo "=========================================="
echo "Resistance Radio Station"
echo "AWS Deployment Script"
echo "=========================================="
echo ""
echo "Environment: ${ENVIRONMENT}"
echo "AWS Account: Personal_Account_734110488556"
echo "AWS Region: us-east-1"
echo ""
echo "This script will:"
echo "1. Create S3 buckets for media, website, and backups"
echo "2. Create RDS PostgreSQL database"
echo "3. Create CloudFront CDN distribution"
echo "4. Create EC2 instance for backend API"
echo "5. Deploy frontend to S3"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Make all scripts executable
chmod +x "${SCRIPT_DIR}"/*.sh

echo ""
echo "=========================================="
echo "Phase 1: Infrastructure Setup"
echo "=========================================="
echo ""

# Setup S3 buckets
echo "Creating S3 buckets..."
bash "${SCRIPT_DIR}/setup-s3-buckets.sh" ${ENVIRONMENT}
echo ""

# Setup RDS database
echo "Creating RDS database..."
bash "${SCRIPT_DIR}/setup-rds-database.sh" ${ENVIRONMENT}
echo ""

# Setup CloudFront
echo "Creating CloudFront distribution..."
bash "${SCRIPT_DIR}/setup-cloudfront.sh" ${ENVIRONMENT}
echo ""

# Setup EC2 backend
echo "Creating EC2 instance for backend..."
bash "${SCRIPT_DIR}/setup-backend-ec2.sh" ${ENVIRONMENT}
echo ""

echo "=========================================="
echo "Phase 2: Application Deployment"
echo "=========================================="
echo ""

# Deploy full stack
echo "Deploying application..."
bash "${SCRIPT_DIR}/deploy-full-stack.sh" ${ENVIRONMENT}
echo ""

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Your Resistance Radio Station is now deployed!"
echo ""
echo "Next steps:"
echo "1. Configure your custom domain"
echo "2. Set up SSL certificate in AWS Certificate Manager"
echo "3. Update CloudFront distribution with custom domain"
echo "4. Deploy backend code to EC2 instance"
echo "5. Run database migrations"
echo "6. Configure email service (SES/SendGrid)"
echo "7. Set up monitoring and alerts"
echo ""
echo "For detailed information, check the output above."
echo "=========================================="
