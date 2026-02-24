#!/bin/bash

# Test CI/CD Pipeline Configuration
# Validates buildspec files and CloudFormation template

set -e

PROFILE="Personal_Account_734110488556"
REGION="us-east-1"

echo "=========================================="
echo "Testing CI/CD Pipeline Configuration"
echo "=========================================="
echo ""

# Test 1: Validate CloudFormation template
echo "1. Validating CloudFormation template..."
aws cloudformation validate-template \
  --template-body file://aws/codepipeline-template.yml \
  --profile $PROFILE \
  --region $REGION > /dev/null

if [ $? -eq 0 ]; then
  echo "   ✅ CloudFormation template is valid"
else
  echo "   ❌ CloudFormation template validation failed"
  exit 1
fi
echo ""

# Test 2: Check buildspec files exist
echo "2. Checking buildspec files..."
BUILDSPECS=("buildspec-frontend.yml" "buildspec-admin-frontend.yml" "buildspec-lambda.yml")

for buildspec in "${BUILDSPECS[@]}"; do
  if [ -f "$buildspec" ]; then
    echo "   ✅ $buildspec exists"
  else
    echo "   ❌ $buildspec not found"
    exit 1
  fi
done
echo ""

# Test 3: Verify S3 buckets exist
echo "3. Verifying S3 buckets..."
BUCKETS=("resistance-radio-website-dev-734110488556" "zimbabwe-voice-admin")

for bucket in "${BUCKETS[@]}"; do
  aws s3 ls s3://$bucket --profile $PROFILE --region $REGION > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "   ✅ Bucket $bucket exists"
  else
    echo "   ❌ Bucket $bucket not found"
    exit 1
  fi
done
echo ""

# Test 4: Verify CloudFront distributions
echo "4. Verifying CloudFront distributions..."
DISTRIBUTIONS=("EYKP4STY3RIHX" "E2HKDMNDC8X5HT")

for dist in "${DISTRIBUTIONS[@]}"; do
  aws cloudfront get-distribution --id $dist --profile $PROFILE > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "   ✅ Distribution $dist exists"
  else
    echo "   ❌ Distribution $dist not found"
    exit 1
  fi
done
echo ""

# Test 5: Check SAM template
echo "5. Checking SAM template..."
if [ -f "template.yaml" ]; then
  echo "   ✅ template.yaml exists"
  
  # Validate SAM template
  sam validate --template template.yaml > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "   ✅ SAM template is valid"
  else
    echo "   ⚠️  SAM template validation failed (may need AWS credentials)"
  fi
else
  echo "   ❌ template.yaml not found"
  exit 1
fi
echo ""

# Test 6: Check if pipeline exists
echo "6. Checking existing pipeline..."
PIPELINE_EXISTS=$(aws codepipeline get-pipeline \
  --name ResistanceRadio-Pipeline \
  --profile $PROFILE \
  --region $REGION \
  --query 'pipeline.name' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$PIPELINE_EXISTS" == "ResistanceRadio-Pipeline" ]; then
  echo "   ✅ Pipeline exists: ResistanceRadio-Pipeline"
  
  # Get pipeline status
  STATUS=$(aws codepipeline get-pipeline-state \
    --name ResistanceRadio-Pipeline \
    --profile $PROFILE \
    --region $REGION \
    --query 'stageStates[0].latestExecution.status' \
    --output text 2>/dev/null || echo "UNKNOWN")
  
  echo "   📊 Latest execution status: $STATUS"
else
  echo "   ⚠️  Pipeline does not exist yet (run setup-cicd.sh to create)"
fi
echo ""

# Test 7: Check Lambda stack
echo "7. Checking Lambda stack..."
STACK_EXISTS=$(aws cloudformation describe-stacks \
  --stack-name resistance-radio-backend-dev \
  --profile $PROFILE \
  --region $REGION \
  --query 'Stacks[0].StackName' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$STACK_EXISTS" == "resistance-radio-backend-dev" ]; then
  echo "   ✅ Lambda stack exists: resistance-radio-backend-dev"
  
  # Get stack status
  STACK_STATUS=$(aws cloudformation describe-stacks \
    --stack-name resistance-radio-backend-dev \
    --profile $PROFILE \
    --region $REGION \
    --query 'Stacks[0].StackStatus' \
    --output text)
  
  echo "   📊 Stack status: $STACK_STATUS"
  
  # Get API URL
  API_URL=$(aws cloudformation describe-stacks \
    --stack-name resistance-radio-backend-dev \
    --profile $PROFILE \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text 2>/dev/null || echo "NOT_FOUND")
  
  if [ "$API_URL" != "NOT_FOUND" ]; then
    echo "   🔗 API URL: $API_URL"
  fi
else
  echo "   ⚠️  Lambda stack does not exist yet"
fi
echo ""

echo "=========================================="
echo "✅ Configuration Test Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✅ CloudFormation template is valid"
echo "  ✅ All buildspec files exist"
echo "  ✅ S3 buckets are accessible"
echo "  ✅ CloudFront distributions exist"
echo "  ✅ SAM template exists"
echo ""
echo "Next steps:"
if [ "$PIPELINE_EXISTS" == "NOT_FOUND" ]; then
  echo "  1. Run ./setup-cicd.sh to create the pipeline"
else
  echo "  1. Run ./update-cicd-pipeline.sh to update the pipeline"
fi
echo "  2. Push a commit to trigger the pipeline"
echo "  3. Monitor at: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view"
echo ""
