#!/bin/bash

# Zimbabwe Voice - AWS Deployment Script
# This script deploys the application to AWS using CloudFormation

set -e

echo "🇿🇼 Zimbabwe Voice - AWS Deployment"
echo "===================================="
echo ""

# Configuration
STACK_NAME="zimbabwe-voice-production"
REGION="us-east-1"
ENVIRONMENT="production"
AWS_PROFILE="Personal_Account_734110488556"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
aws sts get-caller-identity --profile $AWS_PROFILE > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ AWS credentials not configured. Please run 'aws configure'"
    exit 1
fi

echo "✓ AWS credentials verified"
echo ""

# Generate secure secrets
echo "Generating secure secrets..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
echo "✓ Secrets generated"
echo ""

# Deploy CloudFormation stack
echo "Deploying CloudFormation stack..."
echo "This will take 10-15 minutes..."
echo ""

aws --profile Personal_Account_734110488556 cloudformation deploy \
  --template-file aws/cloudformation-simple.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
    DBPassword="$DB_PASSWORD" \
    JWTSecret="$JWT_SECRET" \
  --capabilities CAPABILITY_IAM \
  --region $REGION

if [ $? -ne 0 ]; then
    echo "❌ CloudFormation deployment failed"
    exit 1
fi

echo "✓ CloudFormation stack deployed"
echo ""

# Get stack outputs
echo "Retrieving stack outputs..."
ECR_REPO=$(aws --profile Personal_Account_734110488556 cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryURI`].OutputValue' \
  --output text)

BACKEND_URL=$(aws --profile Personal_Account_734110488556 cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text)

FRONTEND_URL=$(aws --profile Personal_Account_734110488556 cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
  --output text)

DB_ENDPOINT=$(aws --profile Personal_Account_734110488556 cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text)

echo "✓ Stack outputs retrieved"
echo ""

# Build and push Docker image
echo "Building Docker image..."
docker build -t zimbabwe-voice-backend:latest .

echo "✓ Docker image built"
echo ""

echo "Logging into ECR..."
aws --profile Personal_Account_734110488556 ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO

echo "✓ Logged into ECR"
echo ""

echo "Tagging and pushing image to ECR..."
docker tag zimbabwe-voice-backend:latest $ECR_REPO:latest
docker push $ECR_REPO:latest

echo "✓ Image pushed to ECR"
echo ""

# Run database migrations
echo "Running database migrations..."
echo "Note: This requires the ECS task to be running. Waiting 60 seconds..."
sleep 60

# Get ECS cluster and task info
CLUSTER_NAME="${ENVIRONMENT}-zimbabwe-voice-cluster"
SERVICE_NAME="${ENVIRONMENT}-backend-service"

# Force new deployment to use the new image
echo "Forcing ECS service update..."
aws --profile Personal_Account_734110488556 ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment \
  --region $REGION > /dev/null

echo "✓ ECS service updated"
echo ""

echo "Waiting for service to stabilize (this may take 2-3 minutes)..."
aws --profile Personal_Account_734110488556 ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION

echo "✓ Service is stable"
echo ""

# Build frontend
echo "Building frontend..."
cd frontend
npm install
VITE_API_URL="${BACKEND_URL}/api" npm run build
cd ..

echo "✓ Frontend built"
echo ""

# Deploy frontend to S3
echo "Deploying frontend to S3..."
BUCKET_NAME="${ENVIRONMENT}-zimbabwe-voice-frontend"

aws --profile Personal_Account_734110488556 s3 sync frontend/dist s3://$BUCKET_NAME --delete --region $REGION

echo "✓ Frontend deployed to S3"
echo ""

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws --profile Personal_Account_734110488556 cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?DomainName=='${BUCKET_NAME}.s3.amazonaws.com']].Id" \
  --output text \
  --region $REGION)

if [ ! -z "$DISTRIBUTION_ID" ]; then
    aws --profile Personal_Account_734110488556 cloudfront create-invalidation \
      --distribution-id $DISTRIBUTION_ID \
      --paths "/*" \
      --region $REGION > /dev/null
    echo "✓ CloudFront cache invalidated"
else
    echo "⚠ Could not find CloudFront distribution"
fi

echo ""
echo "===================================="
echo "✅ Deployment Complete!"
echo "===================================="
echo ""
echo "📝 Important Information:"
echo ""
echo "Backend API URL: $BACKEND_URL"
echo "Frontend URL: https://$FRONTEND_URL"
echo ""
echo "🔐 Secrets (SAVE THESE SECURELY):"
echo "Database Password: $DB_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
echo ""
echo "⚠️  IMPORTANT: You still need to run database migrations!"
echo ""
echo "To run migrations, execute this command:"
echo ""
echo "aws --profile Personal_Account_734110488556 ecs execute-command \\"
echo "  --cluster $CLUSTER_NAME \\"
echo "  --task <TASK_ID> \\"
echo "  --container backend \\"
echo "  --interactive \\"
echo "  --command 'npm run migrate --workspace=backend' \\"
echo "  --region $REGION"
echo ""
echo "To get the TASK_ID, run:"
echo "aws --profile Personal_Account_734110488556 ecs list-tasks --cluster $CLUSTER_NAME --region $REGION"
echo ""
echo "🎉 Your Zimbabwe Voice platform is now live!"
echo "Share this URL with Zimbabweans: https://$FRONTEND_URL"
echo ""
