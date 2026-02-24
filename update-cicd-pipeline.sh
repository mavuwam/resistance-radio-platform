#!/bin/bash

# Update CI/CD Pipeline for Lambda Architecture
# This script updates the existing CodePipeline stack to support Lambda backend and admin frontend

set -e

PROFILE="Personal_Account_734110488556"
REGION="us-east-1"
STACK_NAME="ResistanceRadio-CICD-Stack"

echo "=========================================="
echo "Updating CI/CD Pipeline for Lambda"
echo "=========================================="
echo ""

# Check if stack exists
echo "Checking if stack exists..."
STACK_EXISTS=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION \
  --query 'Stacks[0].StackName' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$STACK_EXISTS" == "NOT_FOUND" ]; then
  echo "❌ Stack $STACK_NAME does not exist."
  echo "Please create the stack first using setup-cicd.sh"
  exit 1
fi

echo "✅ Stack found: $STACK_NAME"
echo ""

# Get current parameters
echo "Retrieving current stack parameters..."
GITHUB_REPO=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION \
  --query 'Stacks[0].Parameters[?ParameterKey==`GitHubRepo`].ParameterValue' \
  --output text)

GITHUB_BRANCH=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION \
  --query 'Stacks[0].Parameters[?ParameterKey==`GitHubBranch`].ParameterValue' \
  --output text)

echo "GitHub Repo: $GITHUB_REPO"
echo "GitHub Branch: $GITHUB_BRANCH"
echo ""

# Prompt for GitHub token (required for update)
read -sp "Enter GitHub Personal Access Token: " GITHUB_TOKEN
echo ""

# Prompt for database credentials
read -sp "Enter Database Password: " DB_PASSWORD
echo ""

read -sp "Enter JWT Secret: " JWT_SECRET
echo ""

echo ""
echo "Updating CloudFormation stack..."
echo "This will add:"
echo "  - Admin Frontend build project"
echo "  - Updated Lambda backend deployment"
echo "  - Parallel build execution for all three components"
echo ""

aws cloudformation update-stack \
  --stack-name $STACK_NAME \
  --template-body file://aws/codepipeline-template.yml \
  --parameters \
    ParameterKey=GitHubRepo,ParameterValue=$GITHUB_REPO \
    ParameterKey=GitHubBranch,ParameterValue=$GITHUB_BRANCH \
    ParameterKey=GitHubToken,ParameterValue=$GITHUB_TOKEN \
    ParameterKey=DBHost,ParameterValue=resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com \
    ParameterKey=DBName,ParameterValue=resistance_radio \
    ParameterKey=DBUser,ParameterValue=postgres \
    ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD \
    ParameterKey=JWTSecret,ParameterValue=$JWT_SECRET \
    ParameterKey=S3BucketFrontend,ParameterValue=resistance-radio-website-dev-734110488556 \
    ParameterKey=S3BucketAdmin,ParameterValue=zimbabwe-voice-admin \
    ParameterKey=CloudFrontDistributionId,ParameterValue=EYKP4STY3RIHX \
    ParameterKey=AdminCloudFrontDistributionId,ParameterValue=E2HKDMNDC8X5HT \
    ParameterKey=ViteApiUrl,ParameterValue=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api \
    ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile $PROFILE \
  --region $REGION

echo ""
echo "Waiting for stack update to complete..."
aws cloudformation wait stack-update-complete \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION

echo ""
echo "=========================================="
echo "✅ Pipeline Update Complete!"
echo "=========================================="
echo ""

# Get pipeline URL
PIPELINE_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --profile $PROFILE \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`PipelineUrl`].OutputValue' \
  --output text)

echo "Pipeline URL: $PIPELINE_URL"
echo ""
echo "The pipeline now includes:"
echo "  ✅ Main Frontend (React app)"
echo "  ✅ Admin Frontend (Admin CMS)"
echo "  ✅ Lambda Backend (SAM deployment)"
echo ""
echo "All three components will build and deploy in parallel on every push to $GITHUB_BRANCH"
echo ""
echo "Next steps:"
echo "  1. Push a commit to trigger the pipeline"
echo "  2. Monitor the pipeline at: $PIPELINE_URL"
echo "  3. Verify all three deployments succeed"
echo ""
