# Update Existing Pipeline to Deploy Lambda

## Overview

This guide updates your existing CodePipeline to deploy Lambda instead of EC2, reusing all existing infrastructure.

## What Changes

### Removed
- ❌ CodeDeploy application and deployment group
- ❌ EC2 deployment stage
- ❌ CodeDeploy service role

### Added
- ✅ Lambda deployment via SAM in CodeBuild
- ✅ Database credentials as environment variables
- ✅ PowerUserAccess for CodeBuild (needed for CloudFormation/Lambda)

### Kept
- ✅ Same CodePipeline
- ✅ Same artifact bucket
- ✅ Same GitHub webhook
- ✅ Frontend build and deployment (unchanged)

## Update Steps

### Step 1: Update the Pipeline Stack

Run the update command with your existing stack:

```bash
aws cloudformation update-stack \
  --stack-name ResistanceRadio-Pipeline \
  --template-body file://aws/codepipeline-template.yml \
  --parameters \
    ParameterKey=GitHubRepo,ParameterValue=mavuwam/resistance-radio-platform \
    ParameterKey=GitHubBranch,ParameterValue=main \
    ParameterKey=GitHubToken,ParameterValue=YOUR_GITHUB_TOKEN \
    ParameterKey=DBHost,ParameterValue=resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com \
    ParameterKey=DBName,ParameterValue=resistance_radio \
    ParameterKey=DBUser,ParameterValue=postgres \
    ParameterKey=DBPassword,ParameterValue=YOUR_DB_PASSWORD \
    ParameterKey=JWTSecret,ParameterValue=YOUR_JWT_SECRET \
    ParameterKey=S3BucketFrontend,ParameterValue=resistance-radio-website-dev-734110488556 \
    ParameterKey=CloudFrontDistributionId,ParameterValue=EYKP4STY3RIHX \
    ParameterKey=ViteApiUrl,ParameterValue=https://api.resistanceradiostation.org \
    ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Step 2: Wait for Stack Update

Monitor the update:

```bash
aws cloudformation wait stack-update-complete \
  --stack-name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Step 3: Trigger Pipeline

The pipeline will automatically trigger on the next push, or manually:

```bash
aws codepipeline start-pipeline-execution \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Step 4: Monitor Deployment

Watch the pipeline:
```
https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view
```

The backend build will now:
1. Install dependencies
2. Build TypeScript
3. Run SAM build
4. Deploy Lambda via SAM

### Step 5: Get API Gateway Endpoint

After successful deployment:

```bash
aws cloudformation describe-stacks \
  --stack-name ResistanceRadio-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --profile Personal_Account_734110488556
```

### Step 6: Update Frontend API URL

Update `frontend/.env`:

```env
VITE_API_URL=https://[api-id].execute-api.us-east-1.amazonaws.com/dev
```

Commit and push to redeploy frontend with new API endpoint.

### Step 7: Test Lambda Deployment

```bash
# Health check
curl https://[api-id].execute-api.us-east-1.amazonaws.com/dev/health

# Test API
curl https://[api-id].execute-api.us-east-1.amazonaws.com/dev/api/shows
```

### Step 8: Terminate EC2 (After Verification)

Once Lambda is stable for 1 week:

```bash
# Stop EC2
aws ec2 stop-instances \
  --instance-ids i-07f7e8accc4b07682 \
  --profile Personal_Account_734110488556

# Wait 24 hours, then terminate
aws ec2 terminate-instances \
  --instance-ids i-07f7e8accc4b07682 \
  --profile Personal_Account_734110488556
```

## Rollback

If issues occur, revert the stack:

```bash
aws cloudformation cancel-update-stack \
  --stack-name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556
```

Or manually revert frontend API_URL to EC2:
```env
VITE_API_URL=http://54.167.234.4:3000
```

## Cost Savings

- **Before**: EC2 $10.50/month
- **After**: Lambda $0.20/month
- **Savings**: 98% ($10.30/month)

## Next Push Will Deploy Lambda

The updated pipeline is ready. Your next `git push` will automatically deploy to Lambda!
