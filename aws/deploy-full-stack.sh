#!/bin/bash

# Full deployment script for Resistance Radio Station

source "$(dirname "$0")/resistance-radio-config.sh"

echo "=========================================="
echo "Resistance Radio Station - Full Deployment"
echo "=========================================="
echo "Environment: ${ENVIRONMENT}"
echo "AWS Account: ${AWS_ACCOUNT_ID}"
echo "AWS Region: ${AWS_REGION}"
echo "=========================================="
echo ""

# Step 1: Setup S3 Buckets
echo "Step 1: Setting up S3 buckets..."
bash "$(dirname "$0")/setup-s3-buckets.sh"
echo ""

# Step 2: Setup RDS Database
echo "Step 2: Setting up RDS database..."
bash "$(dirname "$0")/setup-rds-database.sh"
echo ""

# Step 3: Setup CloudFront CDN
echo "Step 3: Setting up CloudFront CDN..."
bash "$(dirname "$0")/setup-cloudfront.sh"
echo ""

# Step 4: Build and deploy backend
echo "Step 4: Building backend..."
cd backend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Build backend
echo "Building backend..."
npm run build

echo "✓ Backend built successfully"
cd ..

# Step 5: Build and deploy frontend
echo "Step 5: Building frontend..."
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=https://api.resistanceradio.org
VITE_MEDIA_URL=https://$(aws cloudfront get-distribution --id $(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Resistance Radio Station ${ENVIRONMENT}'].Id | [0]" --output text --profile ${AWS_PROFILE}) --query 'Distribution.DomainName' --output text --profile ${AWS_PROFILE})/media
VITE_ENVIRONMENT=${ENVIRONMENT}
EOF

# Build frontend
echo "Building frontend..."
npm run build

# Deploy to S3
echo "Deploying frontend to S3..."
aws s3 sync dist/ "s3://${S3_WEBSITE_BUCKET}/" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --profile ${AWS_PROFILE}

# Upload index.html with no-cache
aws s3 cp dist/index.html "s3://${S3_WEBSITE_BUCKET}/index.html" \
    --cache-control "no-cache" \
    --profile ${AWS_PROFILE}

echo "✓ Frontend deployed successfully"
cd ..

# Step 6: Invalidate CloudFront cache
echo "Step 6: Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Resistance Radio Station ${ENVIRONMENT}'].Id | [0]" \
    --output text \
    --profile ${AWS_PROFILE})

if [ "${DISTRIBUTION_ID}" != "None" ] && [ -n "${DISTRIBUTION_ID}" ]; then
    aws cloudfront create-invalidation \
        --distribution-id ${DISTRIBUTION_ID} \
        --paths "/*" \
        --profile ${AWS_PROFILE}
    echo "✓ CloudFront cache invalidated"
fi

# Get final URLs
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id ${DISTRIBUTION_ID} \
    --query 'Distribution.DomainName' \
    --output text \
    --profile ${AWS_PROFILE})

DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier ${RDS_INSTANCE_ID} \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION})

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo "Website URL: https://${CLOUDFRONT_DOMAIN}"
echo "Media Bucket: ${S3_MEDIA_BUCKET}"
echo "Database: ${DB_ENDPOINT}"
echo ""
echo "Next steps:"
echo "1. Configure your custom domain (if applicable)"
echo "2. Set up SSL certificate in ACM"
echo "3. Configure backend API deployment (EC2/ECS/Lambda)"
echo "4. Set up monitoring and alerts"
echo "=========================================="
