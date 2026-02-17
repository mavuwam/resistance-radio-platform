# Lambda Deployment Guide

## Overview

This guide covers deploying the Resistance Radio Platform to AWS Lambda using CI/CD pipeline automation.

## Architecture

```
GitHub Push → CodePipeline → CodeBuild → SAM Deploy → Lambda + API Gateway
                                      ↓
                                   S3 + CloudFront (Frontend)
```

## Prerequisites

- AWS CLI configured with profile `Personal_Account_734110488556`
- GitHub repository: `mavuwam/resistance-radio-platform`
- GitHub personal access token
- RDS PostgreSQL database running
- S3 bucket for media storage

## Deployment Steps

### Step 1: Setup Lambda CI/CD Pipeline

Run the setup script to create the CodePipeline infrastructure:

```bash
./aws/setup-lambda-pipeline.sh
```

This will prompt you for:
- GitHub Token
- Database credentials
- JWT Secret
- Frontend URL
- S3 Bucket name

### Step 2: Commit and Push Lambda Code

The Lambda migration files are already in your repository:
- `template.yaml` - SAM template for Lambda infrastructure
- `backend/src/lambda.ts` - Lambda handler wrapper
- `buildspec-lambda.yml` - CodeBuild specification
- `samconfig.toml` - SAM configuration

Push to GitHub to trigger the pipeline:

```bash
git add .
git commit -m "Migrate to Lambda serverless architecture"
git push origin main
```

### Step 3: Monitor Pipeline Execution

Watch the pipeline in AWS Console:
```
https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Lambda-Pipeline-Pipeline/view
```

The pipeline will:
1. Pull code from GitHub
2. Build backend TypeScript
3. Build frontend React app
4. Deploy Lambda functions via SAM
5. Deploy frontend to S3
6. Invalidate CloudFront cache

### Step 4: Get API Gateway Endpoint

After successful deployment, get the API endpoint:

```bash
aws cloudformation describe-stacks \
  --stack-name ResistanceRadio-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --profile Personal_Account_734110488556
```

### Step 5: Update Frontend Configuration

Update `frontend/.env` with the new API Gateway endpoint:

```env
VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

Commit and push to redeploy frontend:

```bash
git add frontend/.env
git commit -m "Update API endpoint to Lambda"
git push origin main
```

### Step 6: Test Lambda Deployment

Test the health endpoint:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-17T..."}
```

### Step 7: Verify All Endpoints

Test critical endpoints:

```bash
# Get shows
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/shows

# Get articles
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/articles

# Get events
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/events
```

### Step 8: Monitor CloudWatch Logs

View Lambda logs:

```bash
aws logs tail /aws/lambda/ResistanceRadio-API-dev \
  --follow \
  --profile Personal_Account_734110488556
```

### Step 9: Terminate EC2 Instance (After Verification)

Once Lambda is stable for 1 week:

1. Stop EC2 instance:
```bash
aws ec2 stop-instances \
  --instance-ids i-07f7e8accc4b07682 \
  --profile Personal_Account_734110488556
```

2. Wait 24 hours and verify no issues

3. Terminate EC2 instance:
```bash
aws ec2 terminate-instances \
  --instance-ids i-07f7e8accc4b07682 \
  --profile Personal_Account_734110488556
```

4. Delete old CodeDeploy application and EC2-based pipeline

## Cost Savings

### Before (EC2)
- EC2 t2.micro: $8.50/month
- Data transfer: $2/month
- **Total: $10.50/month**

### After (Lambda)
- API Gateway: ~$0.10/month (50K requests)
- Lambda: ~$0.10/month (50K requests)
- **Total: $0.20/month**

**Savings: 98% ($10.30/month)**

## Rollback Plan

If issues occur with Lambda:

1. Revert frontend API_URL to EC2:
```bash
# In frontend/.env
VITE_API_URL=http://54.167.234.4:3000
```

2. Restart EC2 backend:
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4
pm2 restart resistance-radio-backend
```

3. Debug Lambda issues in CloudWatch logs

4. Fix and redeploy Lambda

## Troubleshooting

### Lambda Cold Starts

If experiencing slow first requests:

1. Enable provisioned concurrency:
```bash
aws lambda put-provisioned-concurrency-config \
  --function-name ResistanceRadio-API-dev \
  --provisioned-concurrent-executions 1 \
  --profile Personal_Account_734110488556
```

### Database Connection Issues

Lambda may exhaust database connections. Solutions:

1. Use RDS Proxy (recommended):
```bash
# Create RDS Proxy via AWS Console
# Update Lambda to use proxy endpoint
```

2. Reduce Lambda concurrency:
```bash
aws lambda put-function-concurrency \
  --function-name ResistanceRadio-API-dev \
  --reserved-concurrent-executions 5 \
  --profile Personal_Account_734110488556
```

### API Gateway Timeout

If requests timeout (30s limit):

1. Optimize slow database queries
2. Add caching to frequently accessed data
3. Consider splitting into multiple Lambda functions

## Monitoring

### CloudWatch Metrics

Key metrics to monitor:
- Lambda Duration (should be < 1000ms)
- Lambda Errors (should be 0)
- Lambda Throttles (should be 0)
- API Gateway 4XX/5XX errors

### Alarms

Set up CloudWatch alarms:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --profile Personal_Account_734110488556
```

## Next Steps

1. ✅ Deploy Lambda pipeline
2. ✅ Test all endpoints
3. ✅ Monitor for 1 week
4. ✅ Terminate EC2
5. ✅ Update documentation
6. Consider adding:
   - RDS Proxy for connection pooling
   - CloudWatch dashboards
   - X-Ray tracing for debugging
   - API Gateway caching
   - Lambda@Edge for global performance
