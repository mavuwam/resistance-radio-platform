#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Resistance Radio CI/CD Pipeline Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}ERROR: AWS credentials not configured${NC}"
    echo "Please configure AWS CLI with: aws configure --profile Personal_Account_734110488556"
    exit 1
fi

echo -e "${YELLOW}This script will create:${NC}"
echo "  - CodePipeline for CI/CD"
echo "  - CodeBuild projects for frontend and backend"
echo "  - CodeDeploy application for backend deployment"
echo "  - S3 bucket for pipeline artifacts"
echo "  - IAM roles and policies"
echo ""

# Prompt for GitHub information
read -p "Enter your GitHub repository (format: username/repo-name): " GITHUB_REPO
read -p "Enter GitHub branch to track [main]: " GITHUB_BRANCH
GITHUB_BRANCH=${GITHUB_BRANCH:-main}
read -sp "Enter your GitHub personal access token: " GITHUB_TOKEN
echo ""

# Confirm before proceeding
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  GitHub Repo: $GITHUB_REPO"
echo "  GitHub Branch: $GITHUB_BRANCH"
echo "  AWS Account: 734110488556"
echo "  AWS Region: us-east-1"
echo ""
read -p "Proceed with pipeline creation? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Setup cancelled"
    exit 0
fi

# Create CloudFormation stack
echo ""
echo -e "${GREEN}Creating CloudFormation stack...${NC}"

STACK_NAME="resistance-radio-pipeline"

aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://aws/codepipeline-template.yml \
    --parameters \
        ParameterKey=GitHubRepo,ParameterValue=$GITHUB_REPO \
        ParameterKey=GitHubBranch,ParameterValue=$GITHUB_BRANCH \
        ParameterKey=GitHubToken,ParameterValue=$GITHUB_TOKEN \
    --capabilities CAPABILITY_NAMED_IAM \
    --profile Personal_Account_734110488556 \
    --region us-east-1

echo ""
echo -e "${YELLOW}Waiting for stack creation to complete...${NC}"
echo "This may take 5-10 minutes..."

aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --profile Personal_Account_734110488556 \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Pipeline created successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    # Get stack outputs
    PIPELINE_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`PipelineUrl`].OutputValue' \
        --output text \
        --profile Personal_Account_734110488556 \
        --region us-east-1)
    
    echo -e "${GREEN}Pipeline URL:${NC} $PIPELINE_URL"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Push your code to GitHub repository: $GITHUB_REPO"
    echo "2. The pipeline will automatically trigger on push to $GITHUB_BRANCH"
    echo "3. Monitor the pipeline at: $PIPELINE_URL"
    echo ""
    echo -e "${YELLOW}Note:${NC} Make sure your EC2 instance has:"
    echo "  - CodeDeploy agent installed"
    echo "  - Tag: Name=resistance-radio-backend"
    echo "  - IAM role with CodeDeploy permissions"
else
    echo -e "${RED}Stack creation failed${NC}"
    echo "Check CloudFormation console for details"
    exit 1
fi
