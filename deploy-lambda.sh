#!/bin/bash

# Deploy Resistance Radio Platform to AWS Lambda
# Usage: ./deploy-lambda.sh [environment]

set -e

ENVIRONMENT=${1:-dev}
STACK_NAME="ResistanceRadio-${ENVIRONMENT}"
AWS_REGION="us-east-1"
AWS_PROFILE="Personal_Account_734110488556"

echo "========================================="
echo "Deploying Resistance Radio to Lambda"
echo "Environment: ${ENVIRONMENT}"
echo "Stack: ${STACK_NAME}"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo -e "${RED}Error: AWS SAM CLI is not installed${NC}"
    echo "Install it with: brew install aws-sam-cli"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile ${AWS_PROFILE} &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not configured for profile ${AWS_PROFILE}${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

echo -e "${YELLOW}Step 2: Building backend TypeScript...${NC}"
cd backend
npm run build
cd ..

echo -e "${YELLOW}Step 3: Validating SAM template...${NC}"
sam validate --profile ${AWS_PROFILE} --region ${AWS_REGION}

echo -e "${YELLOW}Step 4: Building SAM application...${NC}"
sam build --profile ${AWS_PROFILE} --region ${AWS_REGION}

echo -e "${YELLOW}Step 5: Deploying to AWS...${NC}"

# Check if this is first deployment
if aws cloudformation describe-stacks --stack-name ${STACK_NAME} --profile ${AWS_PROFILE} --region ${AWS_REGION} &> /dev/null; then
    echo "Stack exists, updating..."
    sam deploy \
        --stack-name ${STACK_NAME} \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION} \
        --no-confirm-changeset \
        --no-fail-on-empty-changeset
else
    echo "First deployment, running guided setup..."
    sam deploy \
        --stack-name ${STACK_NAME} \
        --profile ${AWS_PROFILE} \
        --region ${AWS_REGION} \
        --guided
fi

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"

# Get outputs
echo -e "\n${YELLOW}Stack Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text)

echo -e "\n${GREEN}API Endpoint: ${API_ENDPOINT}${NC}"
echo -e "${YELLOW}Update your frontend VITE_API_URL to: ${API_ENDPOINT}${NC}"

# Test health endpoint
echo -e "\n${YELLOW}Testing health endpoint...${NC}"
if curl -s "${API_ENDPOINT}/health" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed!${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Update frontend/.env with new API endpoint"
echo "2. Test all API endpoints"
echo "3. Monitor CloudWatch logs for errors"
echo "4. Once stable, terminate EC2 instance"
