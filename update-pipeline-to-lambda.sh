#!/bin/bash

# Update existing CodePipeline to deploy Lambda instead of EC2
# This script updates the ResistanceRadio-Pipeline stack

set -e

STACK_NAME="ResistanceRadio-Pipeline"
AWS_REGION="us-east-1"
AWS_PROFILE="Personal_Account_734110488556"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "Update Pipeline to Lambda Deployment"
echo "========================================="

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile ${AWS_PROFILE} &> /dev/null; then
    echo -e "${RED}Error: AWS CLI not configured for profile ${AWS_PROFILE}${NC}"
    exit 1
fi

# Check if stack exists
if ! aws cloudformation describe-stacks --stack-name ${STACK_NAME} --profile ${AWS_PROFILE} --region ${AWS_REGION} &> /dev/null; then
    echo -e "${RED}Error: Stack ${STACK_NAME} does not exist${NC}"
    echo "Run ./aws/setup-codepipeline.sh first to create the pipeline"
    exit 1
fi

echo -e "${YELLOW}This will update your existing pipeline to deploy Lambda instead of EC2${NC}"
echo -e "${YELLOW}The following will be removed:${NC}"
echo "  - CodeDeploy application"
echo "  - EC2 deployment stage"
echo ""
echo -e "${YELLOW}The following will be added:${NC}"
echo "  - Lambda deployment via SAM"
echo "  - Database credentials for Lambda"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 1
fi

# Get parameters
echo -e "\n${YELLOW}Enter deployment parameters:${NC}"

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

echo -e "\n${YELLOW}Updating CloudFormation stack...${NC}"

aws cloudformation update-stack \
    --stack-name ${STACK_NAME} \
    --template-body file://aws/codepipeline-template.yml \
    --parameters \
        ParameterKey=GitHubRepo,ParameterValue=mavuwam/resistance-radio-platform \
        ParameterKey=GitHubBranch,ParameterValue=main \
        ParameterKey=GitHubToken,ParameterValue=${GITHUB_TOKEN} \
        ParameterKey=DBHost,ParameterValue=${DB_HOST} \
        ParameterKey=DBName,ParameterValue=${DB_NAME} \
        ParameterKey=DBUser,ParameterValue=${DB_USER} \
        ParameterKey=DBPassword,ParameterValue=${DB_PASSWORD} \
        ParameterKey=JWTSecret,ParameterValue=${JWT_SECRET} \
        ParameterKey=S3BucketFrontend,ParameterValue=resistance-radio-website-dev-734110488556 \
        ParameterKey=CloudFrontDistributionId,ParameterValue=EYKP4STY3RIHX \
        ParameterKey=ViteApiUrl,ParameterValue=https://api.resistanceradiostation.org \
        ParameterKey=Environment,ParameterValue=dev \
    --capabilities CAPABILITY_NAMED_IAM \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION}

echo -e "${YELLOW}Waiting for stack update to complete...${NC}"

aws cloudformation wait stack-update-complete \
    --stack-name ${STACK_NAME} \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION}

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Pipeline Updated Successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Push code to GitHub to trigger Lambda deployment"
echo "2. Monitor pipeline: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/${STACK_NAME}/view"
echo "3. After deployment, get API endpoint:"
echo "   aws cloudformation describe-stacks --stack-name ResistanceRadio-dev --query 'Stacks[0].Outputs[?OutputKey==\`ApiEndpoint\`].OutputValue' --output text --profile ${AWS_PROFILE}"
echo "4. Update frontend/.env with new API endpoint"
echo "5. After 1 week of stability, terminate EC2 instance"

echo -e "\n${GREEN}Your next git push will deploy to Lambda!${NC}"
