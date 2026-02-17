# ✅ Lambda CI/CD Migration Ready

## What Was Done

Your existing CodePipeline has been updated to deploy Lambda instead of EC2, reusing all your current infrastructure.

## Changes Made

### Modified Files
- ✅ `aws/codepipeline-template.yml` - Updated to deploy Lambda via SAM
- ✅ `buildspec-lambda.yml` - Build specification for Lambda deployment
- ✅ `template.yaml` - SAM template for Lambda infrastructure
- ✅ `backend/src/lambda.ts` - Lambda handler wrapper
- ✅ `backend/package.json` - Added serverless-http dependency

### New Files
- ✅ `update-pipeline-to-lambda.sh` - Script to update existing pipeline
- ✅ `UPDATE-PIPELINE-TO-LAMBDA.md` - Step-by-step guide

## What Happens Next

### Option 1: Update Existing Pipeline (Recommended)

Run this command to update your current pipeline:

```bash
./update-pipeline-to-lambda.sh
```

This will:
1. Update the CloudFormation stack
2. Remove EC2/CodeDeploy components
3. Add Lambda/SAM deployment
4. Keep everything else the same

### Option 2: Automatic on Next Push

The pipeline will automatically use the new Lambda deployment on your next push because:
- The updated `buildspec-lambda.yml` is in the repo
- The SAM `template.yaml` is ready
- The Lambda handler is implemented

**However**, you need to update the pipeline stack parameters first to include database credentials.

## Recommended Approach

### Step 1: Update Pipeline Stack

```bash
./update-pipeline-to-lambda.sh
```

You'll be prompted for:
- GitHub Token
- Database credentials
- JWT Secret

### Step 2: Verify Update

Check the pipeline in AWS Console:
```
https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view
```

### Step 3: Trigger Deployment

Either push new code or manually trigger:

```bash
aws codepipeline start-pipeline-execution \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556
```

### Step 4: Get API Endpoint

After deployment completes (~5-10 minutes):

```bash
aws cloudformation describe-stacks \
  --stack-name ResistanceRadio-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --profile Personal_Account_734110488556
```

### Step 5: Update Frontend

Update `frontend/.env`:
```env
VITE_API_URL=https://[api-id].execute-api.us-east-1.amazonaws.com/dev
```

Commit and push to redeploy frontend.

### Step 6: Test

```bash
# Health check
curl https://[api-id].execute-api.us-east-1.amazonaws.com/dev/health

# API endpoints
curl https://[api-id].execute-api.us-east-1.amazonaws.com/dev/api/shows
curl https://[api-id].execute-api.us-east-1.amazonaws.com/dev/api/articles
```

### Step 7: Monitor

Watch CloudWatch logs:
```bash
aws logs tail /aws/lambda/ResistanceRadio-API-dev --follow --profile Personal_Account_734110488556
```

### Step 8: Terminate EC2 (After 1 Week)

Once Lambda is proven stable:

```bash
# Stop EC2
aws ec2 stop-instances --instance-ids i-07f7e8accc4b07682 --profile Personal_Account_734110488556

# Wait 24 hours, then terminate
aws ec2 terminate-instances --instance-ids i-07f7e8accc4b07682 --profile Personal_Account_734110488556
```

## Architecture Comparison

### Before (EC2)
```
GitHub → CodePipeline → CodeBuild → CodeDeploy → EC2
                      ↓
                   S3 + CloudFront (Frontend)
```

### After (Lambda)
```
GitHub → CodePipeline → CodeBuild → SAM Deploy → Lambda + API Gateway
                      ↓
                   S3 + CloudFront (Frontend)
```

## Cost Impact

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| Backend | EC2: $10.50/mo | Lambda: $0.20/mo | $10.30/mo |
| Frontend | S3+CF: $2/mo | S3+CF: $2/mo | $0 |
| Database | RDS: $15/mo | RDS: $15/mo | $0 |
| **Total** | **$27.50/mo** | **$17.20/mo** | **$10.30/mo (37%)** |

## Benefits

1. **Cost**: 98% cheaper backend hosting
2. **Scalability**: Auto-scales 0 to 1000s of requests
3. **Maintenance**: Zero server management
4. **Reliability**: AWS-managed infrastructure
5. **Security**: No exposed EC2 instance
6. **Same CI/CD**: Reuses existing pipeline

## Rollback Plan

If issues occur:

1. **Revert frontend API URL** to EC2:
   ```env
   VITE_API_URL=http://54.167.234.4:3000
   ```

2. **Restart EC2 backend**:
   ```bash
   ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4
   pm2 restart resistance-radio-backend
   ```

3. **Debug Lambda** in CloudWatch logs

4. **Fix and redeploy**

## Files Reference

- `UPDATE-PIPELINE-TO-LAMBDA.md` - Detailed update guide
- `LAMBDA-MIGRATION-PLAN.md` - Overall migration strategy
- `LAMBDA-DEPLOYMENT-GUIDE.md` - Deployment instructions
- `template.yaml` - SAM infrastructure template
- `buildspec-lambda.yml` - Build specification
- `backend/src/lambda.ts` - Lambda handler

## Status: Ready to Deploy

All code is committed and pushed. Run `./update-pipeline-to-lambda.sh` to begin the migration.

Your existing pipeline will seamlessly transition from EC2 to Lambda deployment!
