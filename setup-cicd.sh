#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Resistance Radio CI/CD Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Configuration
AWS_PROFILE="Personal_Account_734110488556"
AWS_REGION="us-east-1"
AWS_ACCOUNT="734110488556"
STACK_NAME="resistance-radio-pipeline"

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

if ! command -v gh &> /dev/null; then
    echo -e "${RED}✗ GitHub CLI (gh) not installed${NC}"
    echo "  Install: brew install gh"
    exit 1
fi
echo -e "${GREEN}✓ GitHub CLI installed${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI installed${NC}"

if ! gh auth status &> /dev/null; then
    echo -e "${RED}✗ Not authenticated with GitHub${NC}"
    echo "  Run: gh auth login"
    exit 1
fi
echo -e "${GREEN}✓ GitHub authenticated${NC}"

if ! aws sts get-caller-identity --profile $AWS_PROFILE &> /dev/null; then
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials configured${NC}"

echo ""

# Step 2: Create GitHub repository
echo -e "${BLUE}Step 2: Creating GitHub repository...${NC}"

REPO_NAME="resistance-radio-platform"
DESCRIPTION="Zimbabwe Voice - Advocacy platform and community radio station empowering citizens to defend democracy"

# Check if repo already exists
if gh repo view "$REPO_NAME" &> /dev/null; then
    echo -e "${YELLOW}Repository already exists${NC}"
    GITHUB_USER=$(gh api user -q .login)
else
    gh repo create "$REPO_NAME" \
        --public \
        --description "$DESCRIPTION" \
        --source=. \
        --remote=origin

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Repository created${NC}"
        GITHUB_USER=$(gh api user -q .login)
    else
        echo -e "${RED}✗ Failed to create repository${NC}"
        exit 1
    fi
fi

GITHUB_REPO="$GITHUB_USER/$REPO_NAME"
echo -e "${GREEN}Repository: https://github.com/$GITHUB_REPO${NC}"
echo ""

# Step 3: Generate GitHub token
echo -e "${BLUE}Step 3: GitHub Personal Access Token${NC}"
echo ""
echo -e "${YELLOW}You need a GitHub Personal Access Token with these permissions:${NC}"
echo "  - repo (Full control of private repositories)"
echo "  - admin:repo_hook (Full control of repository hooks)"
echo ""
echo "Generate one at: https://github.com/settings/tokens/new"
echo ""
read -sp "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}✗ Token is required${NC}"
    exit 1
fi
echo ""

# Step 4: Check EC2 instance
echo -e "${BLUE}Step 4: Verifying EC2 instance configuration...${NC}"

EC2_INSTANCE_ID="i-07f7e8accc4b07682"

# Check if instance has correct tag
INSTANCE_TAG=$(aws ec2 describe-tags \
    --filters "Name=resource-id,Values=$EC2_INSTANCE_ID" "Name=key,Values=Name" \
    --query 'Tags[0].Value' \
    --output text \
    --profile $AWS_PROFILE \
    --region $AWS_REGION 2>/dev/null || echo "")

if [ "$INSTANCE_TAG" != "resistance-radio-backend" ]; then
    echo -e "${YELLOW}⚠ Adding Name tag to EC2 instance...${NC}"
    aws ec2 create-tags \
        --resources $EC2_INSTANCE_ID \
        --tags Key=Name,Value=resistance-radio-backend \
        --profile $AWS_PROFILE \
        --region $AWS_REGION
    echo -e "${GREEN}✓ Tag added${NC}"
else
    echo -e "${GREEN}✓ EC2 instance has correct tag${NC}"
fi

echo ""

# Step 5: Deploy CloudFormation stack
echo -e "${BLUE}Step 5: Deploying AWS CodePipeline infrastructure...${NC}"
echo ""
echo "This will create:"
echo "  - CodePipeline for CI/CD"
echo "  - CodeBuild projects (frontend & backend)"
echo "  - CodeDeploy application"
echo "  - S3 bucket for artifacts"
echo "  - IAM roles and policies"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Setup cancelled"
    exit 0
fi

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
echo -e "${YELLOW}Waiting for stack creation (this takes 5-10 minutes)...${NC}"

aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --profile $AWS_PROFILE \
    --region $AWS_REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Stack created successfully${NC}"
else
    echo -e "${RED}✗ Stack creation failed${NC}"
    echo "Check CloudFormation console for details"
    exit 1
fi

echo ""

# Step 6: Get stack outputs
echo -e "${BLUE}Step 6: Getting pipeline information...${NC}"

PIPELINE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`PipelineUrl`].OutputValue' \
    --output text \
    --profile $AWS_PROFILE \
    --region $AWS_REGION)

echo -e "${GREEN}✓ Pipeline URL: $PIPELINE_URL${NC}"
echo ""

# Step 7: Push code to GitHub
echo -e "${BLUE}Step 7: Pushing code to GitHub...${NC}"

# Check if origin exists
if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}Remote 'origin' already exists, updating...${NC}"
    git remote set-url origin "https://github.com/$GITHUB_REPO.git"
else
    git remote add origin "https://github.com/$GITHUB_REPO.git"
fi

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
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. The pipeline is now running automatically"
echo "2. Monitor progress at: $PIPELINE_URL"
echo "3. Future pushes to 'main' branch will trigger automatic deployments"
echo ""
echo -e "${YELLOW}Pipeline Stages:${NC}"
echo "  1. Source: Pull code from GitHub"
echo "  2. Build: Build frontend & backend (parallel)"
echo "  3. Deploy: Deploy to S3/CloudFront & EC2"
echo ""
echo -e "${YELLOW}Deployment Targets:${NC}"
echo "  - Frontend: S3 + CloudFront (https://resistanceradiostation.org)"
echo "  - Backend: EC2 (https://api.resistanceradiostation.org)"
echo ""
echo "Check CODEPIPELINE-SETUP.md for troubleshooting and monitoring tips"
echo ""
