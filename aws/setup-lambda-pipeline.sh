#!/bin/bash

# Setup Lambda CI/CD Pipeline for Resistance Radio Platform
# This replaces the EC2-based pipeline with Lambda deployment

set -e

# Configuration
STACK_NAME="ResistanceRadio-Lambda-Pipeline"
TEMPLATE_FILE="aws/lambda-pipeline-template.yml"
AWS_REGION="us-east-1"
AWS_PROFILE="Personal_Account_734110488556"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "Lambda CI/CD Pipeline Setup"
echo "========================================="

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile ${AWS_PROFILE} &> /dev/null; then
    echo -e "${RED}Error: AWS CLI not configured for profile ${AWS_PROFILE}${NC}"
    exit 1
fi

# Get parameters
echo -e "${YELLOW}Enter deployment parameters:${NC}"

read -sp "GitHub Token: " GITHUB_TOKEN
echo
read -p "Database Host [resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com]: " DB_HOST
DB_HOST=${DB_HOST:-resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com}

read -p "Database Name [resistance_radio]: " DB_NAME
DB_NAME=${DB_NAME:-resistance_radio}

read -p "Database User [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Database Password: " DB_PASSWORD
echo

read -sp "JWT Secret: " JWT_SECRET
echo

read -p "Frontend URL [https://resistanceradiostation.org]: " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-https://resistanceradiostation.org}

read -p "S3 Bucket Name [resistance-radio-website-dev-734110488556]: " S3_BUCKET
S3_BUCKET=${S3_BUCKET:-resistance-radio-website-dev-734110488556}

echo -e "\n${YELLOW}Deploying CloudFormation stack...${NC}"

aws cloudformation deploy \
    --template-file ${TEMPLATE_FILE} \
    --stack-name ${STACK_NAME} \
    --parameter-overrides \
        GitHubToken=${GITHUB_TOKEN} \
        GitHubOwner=mavuwam \
        GitHubRepo=resistance-radio-platform \
        GitHubBranch=main \
        Environment=dev \
        DBHost=${DB_HOST} \
        DBName=${DB_NAME} \
        DBUser=${DB_USER} \
        DBPassword=${DB_PASSWORD} \
        JWTSecret=${JWT_SECRET} \
        FrontendURL=${FRONTEND_URL} \
        S3BucketName=${S3_BUCKET} \
    --capabilities CAPABILITY_NAMED_IAM \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION}

echo -e "${GREEN}Pipeline deployed successfully!${NC}"

# Get outputs
echo -e "\n${YELLOW}Pipeline Details:${NC}"
aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

PIPELINE_URL=$(aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`PipelineUrl`].OutputValue' \
    --output text)

echo -e "\n${GREEN}Pipeline URL: ${PIPELINE_URL}${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Push code to GitHub to trigger the pipeline"
echo "2. Monitor the pipeline execution in AWS Console"
echo "3. Once deployed, get the API Gateway endpoint from Lambda stack outputs"
echo "4. Update frontend/.env with new API endpoint"
echo "5. After verification, terminate the EC2 instance"

echo -e "\n${YELLOW}To get the API endpoint after deployment:${NC}"
echo "aws cloudformation describe-stacks --stack-name ResistanceRadio-dev --query 'Stacks[0].Outputs[?OutputKey==\`ApiEndpoint\`].OutputValue' --output text --profile ${AWS_PROFILE}"
