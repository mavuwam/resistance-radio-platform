#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

GITHUB_TOKEN="$1"
AWS_PROFILE="Personal_Account_734110488556"
AWS_REGION="us-east-1"
STACK_NAME="resistance-radio-pipeline"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Resistance Radio CI/CD Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get GitHub username
echo -e "${BLUE}Getting GitHub user info...${NC}"
GITHUB_USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login": *"[^"]*"' | sed 's/"login": *"\([^"]*\)"/\1/')

if [ -z "$GITHUB_USER" ]; then
    echo -e "${RED}✗ Failed to get GitHub user. Check your token.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ GitHub user: $GITHUB_USER${NC}"
echo ""

# Create GitHub repository
REPO_NAME="resistance-radio-platform"
GITHUB_REPO="$GITHUB_USER/$REPO_NAME"

echo -e "${BLUE}Creating GitHub repository...${NC}"

REPO_RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO_NAME\",\"description\":\"Zimbabwe Voice - Advocacy platform and community radio station\",\"private\":false}")

if echo "$REPO_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Repository created: https://github.com/$GITHUB_REPO${NC}"
elif echo "$REPO_RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}Repository already exists${NC}"
else
    echo -e "${RED}✗ Failed to create repository${NC}"
    echo "$REPO_RESPONSE"
    exit 1
fi

echo ""

# Add EC2 tag
echo -e "${BLUE}Verifying EC2 instance configuration...${NC}"
EC2_INSTANCE_ID="i-07f7e8accc4b07682"

aws ec2 create-tags \
    --resources $EC2_INSTANCE_ID \
    --tags Key=Name,Value=resistance-radio-backend \
    --profile $AWS_PROFILE \
    --region $AWS_REGION 2>/dev/null || true

echo -e "${GREEN}✓ EC2 instance tagged${NC}"
echo ""

# Deploy CloudFormation stack
echo -e "${BLUE}Deploying AWS CodePipeline infrastructure...${NC}"
echo ""
echo "This will create:"
echo "  - CodePipeline for CI/CD"
echo "  - CodeBuild projects (frontend & backend)"
echo "  - CodeDeploy application"
echo "  - S3 bucket for artifacts"
echo "  - IAM roles and policies"
echo ""

echo -e "${YELLOW}Creating CloudFormation stack...${NC}"

aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://aws/codepipeline-template.yml \
    --parameters \
        ParameterKey=GitHubRepo,ParameterValue=$GITHUB_REPO \
        ParameterKey=GitHubBranch,ParameterValue=main \
        ParameterKey=GitHubToken,ParameterValue=$GITHUB_TOKEN \
    --capabilities CAPABILITY_NAMED_IAM \
    --profile $AWS_PROFILE \
    --region $AWS_REGION

echo ""
echo -e "${YELLOW}Waiting for stack creation (5-10 minutes)...${NC}"

aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --profile $AWS_PROFILE \
    --region $AWS_REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Stack created successfully${NC}"
else
    echo -e "${RED}✗ Stack creation failed${NC}"
    exit 1
fi

echo ""

# Get pipeline URL
PIPELINE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`PipelineUrl`].OutputValue' \
    --output text \
    --profile $AWS_PROFILE \
    --region $AWS_REGION)

echo -e "${GREEN}✓ Pipeline URL: $PIPELINE_URL${NC}"
echo ""

# Push code to GitHub
echo -e "${BLUE}Pushing code to GitHub...${NC}"

git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_REPO.git"
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Code pushed to GitHub${NC}"
else
    echo -e "${RED}✗ Failed to push code${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}✓ GitHub Repository:${NC} https://github.com/$GITHUB_REPO"
echo -e "${GREEN}✓ Pipeline URL:${NC} $PIPELINE_URL"
echo ""
echo -e "${YELLOW}The pipeline is now running!${NC}"
echo "Monitor progress at: $PIPELINE_URL"
echo ""
echo "Future pushes to 'main' branch will trigger automatic deployments."
echo ""

