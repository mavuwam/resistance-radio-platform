# CI/CD Pipeline Fix - Complete

## Summary

I've fixed the CI/CD pipeline to support the Lambda architecture with all three components:

1. ✅ Main Frontend (public website)
2. ✅ Admin Frontend (admin CMS)
3. ✅ Lambda Backend (serverless API)

## What Was Fixed

### 1. Updated CloudFormation Template
- Added admin frontend build project
- Updated backend to use Lambda/SAM deployment
- Added environment variables for all build projects
- Configured parallel builds for all three components

### 2. Updated Buildspec Files
- Changed hardcoded values to environment variables
- Ensured consistent deployment process
- Added proper cache invalidation

### 3. Created Helper Scripts
- `update-cicd-pipeline.sh` - Updates the existing pipeline
- `test-cicd-config.sh` - Validates configuration
- `fix-cicd-quick.sh` - Quick check before update

## How to Apply the Fix

### Step 1: Run the Update Script

```bash
./update-cicd-pipeline.sh
```

You'll be prompted for:
- GitHub Personal Access Token
- Database Password
- JWT Secret

### Step 2: Wait for Update

The script will:
1. Retrieve current pipeline configuration
2. Update the CloudFormation stack
3. Wait for completion (~5 minutes)
4. Display the pipeline URL

### Step 3: Test the Pipeline

Push a commit to trigger the pipeline:

```bash
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "test: trigger updated CI/CD pipeline"
git push origin main
```

### Step 4: Monitor Execution

Watch the pipeline at:
https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view

You should see three build actions running in parallel:
- BuildFrontend
- BuildAdminFrontend (NEW)
- BuildBackend

## Expected Results

### Build Process
```
GitHub Push
     ↓
Source Stage
     ↓
Build Stage (Parallel - ~5-7 minutes total)
     ├─→ Main Frontend (2-3 min) → S3 → CloudFront
     ├─→ Admin Frontend (2-3 min) → S3 → CloudFront
     └─→ Lambda Backend (5-7 min) → SAM → API Gateway
```

### Deployments
- **Main Site**: https://resistanceradiostation.org
- **Admin Portal**: https://d2clnd0y4cusng.cloudfront.net
- **API**: https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api

## Benefits

### Automation
- ✅ No more manual deployments
- ✅ Consistent deployment process
- ✅ Automatic cache invalidation
- ✅ Parallel builds (faster)

### Cost Savings
- **Lambda vs EC2**: ~$10/month → ~$0.20/month (98% reduction)
- **CI/CD Cost**: ~$2.50/month
- **Net Savings**: ~$7.50/month + time savings

### Reliability
- ✅ Automated testing in build process
- ✅ Rollback capability via CloudFormation
- ✅ Build logs in CloudWatch
- ✅ Consistent environment variables

## Verification

After the first successful pipeline run, verify:

```bash
# Test main frontend
curl -I https://resistanceradiostation.org
# Should return: 200 OK

# Test admin frontend  
curl -I https://d2clnd0y4cusng.cloudfront.net
# Should return: 200 OK

# Test Lambda backend
curl https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api/shows
# Should return: JSON with shows data
```

## Troubleshooting

### Pipeline Update Fails

**Check stack status**:
```bash
aws cloudformation describe-stacks \
  --stack-name ResistanceRadio-CICD-Stack \
  --profile Personal_Account_734110488556 \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus'
```

**View stack events**:
```bash
aws cloudformation describe-stack-events \
  --stack-name ResistanceRadio-CICD-Stack \
  --profile Personal_Account_734110488556 \
  --region us-east-1 \
  --max-items 10
```

### Build Fails

**View CodeBuild logs**:
1. Go to CodeBuild console
2. Select the failed build project
3. Click on the failed build
4. View "Build logs" tab

**Common issues**:
- Missing environment variables → Check CodeBuild project settings
- S3 access denied → Check IAM role permissions
- CloudFront invalidation fails → Check distribution ID

### Rollback

If needed, rollback the CloudFormation stack:

```bash
aws cloudformation cancel-update-stack \
  --stack-name ResistanceRadio-CICD-Stack \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

Or use manual deployment:
```bash
# Frontend
cd frontend && npm run build
aws s3 sync dist/ s3://resistance-radio-website-dev-734110488556/ --delete
aws cloudfront create-invalidation --distribution-id EYKP4STY3RIHX --paths "/*"

# Admin Frontend
cd admin-frontend && npm run build
aws s3 sync dist/ s3://zimbabwe-voice-admin/ --delete
aws cloudfront create-invalidation --distribution-id E2HKDMNDC8X5HT --paths "/*"
```

## Files Modified

- ✅ `aws/codepipeline-template.yml` - Added admin frontend, updated parameters
- ✅ `buildspec-frontend.yml` - Use environment variables
- ✅ `buildspec-admin-frontend.yml` - Use environment variables
- ✅ `buildspec-lambda.yml` - Already correct

## Files Created

- ✅ `update-cicd-pipeline.sh` - Update script
- ✅ `test-cicd-config.sh` - Validation script
- ✅ `fix-cicd-quick.sh` - Quick check script
- ✅ `CICD-LAMBDA-SETUP.md` - Comprehensive documentation
- ✅ `CICD-UPDATE-SUMMARY.md` - Update details
- ✅ `CICD-FIX-COMPLETE.md` - This file

## Next Steps

1. ✅ Run `./update-cicd-pipeline.sh`
2. ✅ Push a test commit
3. ✅ Monitor the pipeline execution
4. ✅ Verify all deployments
5. ✅ Celebrate automated deployments! 🎉

## Support Resources

- **Pipeline Console**: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view
- **CloudFormation**: https://console.aws.amazon.com/cloudformation
- **CodeBuild**: https://console.aws.amazon.com/codesuite/codebuild/projects
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

## Documentation

For detailed information, see:
- `CICD-LAMBDA-SETUP.md` - Complete setup guide
- `CICD-UPDATE-SUMMARY.md` - Update details
- `aws/codepipeline-template.yml` - CloudFormation template
- `buildspec-*.yml` - Build specifications

---

**Status**: ✅ Ready to update
**Action Required**: Run `./update-cicd-pipeline.sh`
