# Lambda Migration Status

## ✅ Completed

All Lambda migration files have been created and pushed to GitHub.

## What Was Created

### Infrastructure Files
- ✅ `template.yaml` - SAM template defining Lambda, API Gateway, and permissions
- ✅ `samconfig.toml` - SAM configuration for easier deployments
- ✅ `aws/lambda-pipeline-template.yml` - CloudFormation template for CI/CD pipeline
- ✅ `aws/setup-lambda-pipeline.sh` - Script to deploy the pipeline

### Application Files
- ✅ `backend/src/lambda.ts` - Lambda handler wrapping Express app
- ✅ `buildspec-lambda.yml` - CodeBuild specification for Lambda deployment
- ✅ `backend/package.json` - Updated with serverless-http dependency

### Documentation
- ✅ `LAMBDA-MIGRATION-PLAN.md` - Comprehensive migration strategy
- ✅ `LAMBDA-DEPLOYMENT-GUIDE.md` - Step-by-step deployment instructions
- ✅ `deploy-lambda.sh` - Manual deployment script (alternative to CI/CD)

## Next Steps

### 1. Deploy Lambda CI/CD Pipeline

Run the setup script to create the pipeline infrastructure:

```bash
./aws/setup-lambda-pipeline.sh
```

You'll need:
- GitHub Token: (your GitHub personal access token)
- Database Host: `resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com`
- Database Name: `resistance_radio`
- Database User: `postgres`
- Database Password: (your RDS password)
- JWT Secret: (your JWT secret)
- Frontend URL: `https://resistanceradiostation.org`
- S3 Bucket: `resistance-radio-website-dev-734110488556`

### 2. Pipeline Will Auto-Deploy

Once the pipeline is created, it will automatically:
1. Detect the push to GitHub (already done)
2. Build the backend with TypeScript
3. Deploy Lambda functions via SAM
4. Build and deploy frontend to S3
5. Invalidate CloudFront cache

### 3. Get API Gateway Endpoint

After deployment completes (~5-10 minutes), get the endpoint:

```bash
aws cloudformation describe-stacks \
  --stack-name ResistanceRadio-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --profile Personal_Account_734110488556
```

### 4. Update Frontend

Update `frontend/.env`:
```env
VITE_API_URL=https://[your-api-id].execute-api.us-east-1.amazonaws.com/dev
```

Then commit and push to redeploy frontend.

### 5. Test Everything

```bash
# Health check
curl https://[your-api-id].execute-api.us-east-1.amazonaws.com/dev/health

# Test API endpoints
curl https://[your-api-id].execute-api.us-east-1.amazonaws.com/dev/api/shows
curl https://[your-api-id].execute-api.us-east-1.amazonaws.com/dev/api/articles
```

### 6. Monitor for 1 Week

Watch CloudWatch logs and metrics to ensure stability.

### 7. Terminate EC2 (After Verification)

Once Lambda is proven stable:

```bash
# Stop EC2
aws ec2 stop-instances --instance-ids i-07f7e8accc4b07682 --profile Personal_Account_734110488556

# Wait 24 hours, then terminate
aws ec2 terminate-instances --instance-ids i-07f7e8accc4b07682 --profile Personal_Account_734110488556
```

## Cost Impact

### Before (EC2)
- EC2 t2.micro: $8.50/month
- Data transfer: $2/month
- **Total: $10.50/month**

### After (Lambda)
- API Gateway: $0.10/month (50K requests)
- Lambda: $0.10/month (50K requests)
- **Total: $0.20/month**

### Savings
**98% reduction = $10.30/month saved**

## Architecture Comparison

### Old (EC2)
```
User → CloudFront → S3 (Frontend)
User → EC2 (Backend) → RDS
```

### New (Lambda)
```
User → CloudFront → S3 (Frontend)
User → API Gateway → Lambda → RDS
```

## Benefits

1. **Cost**: 98% cheaper for backend hosting
2. **Scalability**: Auto-scales from 0 to 1000s of requests
3. **Maintenance**: Zero server management
4. **Reliability**: AWS-managed infrastructure
5. **Security**: No exposed EC2 instance
6. **CI/CD**: Automated deployments via CodePipeline

## Rollback Plan

If issues occur:
1. Revert frontend API_URL to EC2: `http://54.167.234.4:3000`
2. Restart EC2 backend: `ssh ec2-user@54.167.234.4` then `pm2 restart resistance-radio-backend`
3. Debug Lambda in CloudWatch logs
4. Fix and redeploy

## Support

- Migration Plan: `LAMBDA-MIGRATION-PLAN.md`
- Deployment Guide: `LAMBDA-DEPLOYMENT-GUIDE.md`
- CloudWatch Logs: `/aws/lambda/ResistanceRadio-API-dev`
- Pipeline URL: Will be provided after setup

## Status: Ready to Deploy

All code is committed and pushed. Run the setup script to begin deployment.
