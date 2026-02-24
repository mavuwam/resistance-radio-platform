# CI/CD Pipeline Update Summary

## Current Status

✅ **Pipeline exists**: `ResistanceRadio-Pipeline`
✅ **Current build actions**: 
  - BuildFrontend (main website)
  - BuildBackend (currently EC2, needs Lambda update)

❌ **Missing**: Admin Frontend build action

## What Needs to Be Fixed

### 1. Add Admin Frontend Build Project
The admin CMS needs its own build project to deploy to the separate S3 bucket and CloudFront distribution.

### 2. Update Backend to Lambda Deployment
The backend build needs to use SAM CLI to deploy to Lambda instead of EC2.

### 3. Update Environment Variables
All build projects need to use environment variables from CloudFormation parameters instead of hardcoded values.

## Changes Made

### Updated Files

1. **aws/codepipeline-template.yml**
   - Added `AdminFrontendBuildProject` resource
   - Added `S3BucketAdmin` parameter
   - Added `AdminCloudFrontDistributionId` parameter
   - Updated `ViteApiUrl` to include `/api` suffix
   - Added admin frontend build action to pipeline
   - Updated IAM permissions for all three build projects

2. **buildspec-frontend.yml**
   - Changed hardcoded S3 bucket to `${S3_BUCKET}` environment variable
   - Changed hardcoded CloudFront ID to `${CLOUDFRONT_DISTRIBUTION_ID}` environment variable

3. **buildspec-admin-frontend.yml**
   - Changed hardcoded S3 bucket to `${S3_BUCKET}` environment variable
   - Changed hardcoded CloudFront ID to `${CLOUDFRONT_DISTRIBUTION_ID}` environment variable

4. **buildspec-lambda.yml**
   - Already uses environment variables correctly
   - No changes needed

### New Files Created

1. **update-cicd-pipeline.sh** - Script to update the existing pipeline
2. **test-cicd-config.sh** - Script to validate configuration
3. **CICD-LAMBDA-SETUP.md** - Comprehensive documentation
4. **CICD-UPDATE-SUMMARY.md** - This file

## How to Apply the Update

### Option 1: Automated Update (Recommended)

Run the update script:

```bash
./update-cicd-pipeline.sh
```

This will prompt you for:
- GitHub Personal Access Token
- Database Password
- JWT Secret

The script will:
1. Retrieve current pipeline parameters
2. Update the CloudFormation stack
3. Wait for the update to complete
4. Display the pipeline URL

### Option 2: Manual Update via AWS Console

1. Go to [CloudFormation Console](https://console.aws.amazon.com/cloudformation)
2. Select stack: `ResistanceRadio-CICD-Stack`
3. Click "Update"
4. Choose "Replace current template"
5. Upload `aws/codepipeline-template.yml`
6. Update parameters:
   - `S3BucketAdmin`: `zimbabwe-voice-admin`
   - `AdminCloudFrontDistributionId`: `E2HKDMNDC8X5HT`
   - `ViteApiUrl`: `https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api`
7. Click through to update

### Option 3: AWS CLI Manual Update

```bash
aws cloudformation update-stack \
  --stack-name ResistanceRadio-CICD-Stack \
  --template-body file://aws/codepipeline-template.yml \
  --parameters \
    ParameterKey=GitHubRepo,UsePreviousValue=true \
    ParameterKey=GitHubBranch,UsePreviousValue=true \
    ParameterKey=GitHubToken,ParameterValue=<your-token> \
    ParameterKey=DBHost,UsePreviousValue=true \
    ParameterKey=DBName,UsePreviousValue=true \
    ParameterKey=DBUser,UsePreviousValue=true \
    ParameterKey=DBPassword,ParameterValue=<your-password> \
    ParameterKey=JWTSecret,ParameterValue=<your-secret> \
    ParameterKey=S3BucketFrontend,UsePreviousValue=true \
    ParameterKey=S3BucketAdmin,ParameterValue=zimbabwe-voice-admin \
    ParameterKey=CloudFrontDistributionId,UsePreviousValue=true \
    ParameterKey=AdminCloudFrontDistributionId,ParameterValue=E2HKDMNDC8X5HT \
    ParameterKey=ViteApiUrl,ParameterValue=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api \
    ParameterKey=Environment,UsePreviousValue=true \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

## After Update

### What Will Happen

1. **CloudFormation Update**: Creates new admin frontend build project
2. **Pipeline Update**: Adds third build action for admin frontend
3. **Parallel Builds**: All three components will build simultaneously

### Pipeline Execution Flow

```
Push to GitHub
      ↓
Source Stage (GitHub)
      ↓
Build Stage (Parallel)
      ├─→ Main Frontend → S3 → CloudFront
      ├─→ Admin Frontend → S3 → CloudFront
      └─→ Lambda Backend → SAM Deploy → API Gateway
```

### Testing the Pipeline

1. **Trigger the pipeline**:
   ```bash
   # Make a small change and push
   echo "# CI/CD Update" >> README.md
   git add README.md
   git commit -m "test: trigger CI/CD pipeline"
   git push origin main
   ```

2. **Monitor the pipeline**:
   - Go to: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view
   - Watch all three build actions execute in parallel
   - Check CloudWatch logs if any build fails

3. **Verify deployments**:
   ```bash
   # Test main frontend
   curl -I https://resistanceradiostation.org
   
   # Test admin frontend
   curl -I https://d2clnd0y4cusng.cloudfront.net
   
   # Test Lambda backend
   curl https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api/shows
   ```

## Expected Results

### Build Times
- Main Frontend: ~2-3 minutes
- Admin Frontend: ~2-3 minutes
- Lambda Backend: ~5-7 minutes
- **Total**: ~5-7 minutes (parallel execution)

### Cost Impact
- **Before**: Manual deployments (time cost)
- **After**: Automated deployments (~$2.50/month)
- **Lambda Savings**: ~$10/month (vs EC2)
- **Net Savings**: ~$7.50/month + time savings

## Rollback Plan

If the update causes issues:

1. **Rollback CloudFormation**:
   ```bash
   aws cloudformation cancel-update-stack \
     --stack-name ResistanceRadio-CICD-Stack \
     --profile Personal_Account_734110488556 \
     --region us-east-1
   ```

2. **Manual Deployment**:
   - Use existing manual deployment scripts
   - Frontend: `npm run build && aws s3 sync...`
   - Admin: `npm run build && aws s3 sync...`
   - Backend: Already on Lambda (no change needed)

## Troubleshooting

### Update Fails

**Error**: "No updates are to be performed"
- **Solution**: No changes detected, stack is already up to date

**Error**: "Parameter validation failed"
- **Solution**: Check all parameter values are correct

**Error**: "Insufficient permissions"
- **Solution**: Ensure IAM role has CloudFormation and CodeBuild permissions

### Build Fails After Update

**Frontend/Admin Build Fails**:
1. Check environment variables in CodeBuild project
2. Verify S3 bucket and CloudFront IDs are correct
3. Review CodeBuild logs in CloudWatch

**Lambda Build Fails**:
1. Check SAM template syntax
2. Verify database credentials
3. Check CloudFormation stack events

## Next Steps

1. ✅ Run `./update-cicd-pipeline.sh` to update the pipeline
2. ✅ Push a commit to trigger the pipeline
3. ✅ Monitor the first execution
4. ✅ Verify all three deployments succeed
5. ✅ Document any issues or improvements

## Support

- **Pipeline Console**: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view
- **CloudFormation Console**: https://console.aws.amazon.com/cloudformation
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups
- **Documentation**: See `CICD-LAMBDA-SETUP.md` for detailed information
