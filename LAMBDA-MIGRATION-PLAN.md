# Lambda Migration Plan: EC2 to Serverless

## Overview

Migrating from EC2 to AWS Lambda + API Gateway for cost optimization and better scalability.

## Architecture Comparison

### Current (EC2)
```
CloudFront → S3 (Frontend)
API Requests → EC2 (Express API) → RDS PostgreSQL
File Uploads → S3
```

### New (Serverless)
```
CloudFront → S3 (Frontend)
API Requests → API Gateway → Lambda Functions → RDS PostgreSQL
File Uploads → S3
```

## Migration Strategy

### Phase 1: Preparation (No Downtime)
1. Create Lambda-compatible Express wrapper
2. Set up SAM template for infrastructure
3. Deploy Lambda stack alongside EC2
4. Test Lambda endpoints

### Phase 2: Cutover (Minimal Downtime)
1. Update API Gateway custom domain
2. Switch frontend API_URL to API Gateway
3. Monitor Lambda performance
4. Keep EC2 running as backup

### Phase 3: Cleanup
1. Verify Lambda stability (1 week)
2. Terminate EC2 instance
3. Remove EC2-related CI/CD components

## Key Changes Required

### 1. Lambda Handler Wrapper
- Wrap Express app with `serverless-http`
- Handle API Gateway event format
- Manage cold starts

### 2. Database Connection Pooling
- Use RDS Proxy for connection management
- Implement connection reuse across Lambda invocations
- Handle Lambda concurrency limits

### 3. Environment Variables
- Move from .env to Lambda environment variables
- Use AWS Systems Manager Parameter Store for secrets
- Configure VPC access for RDS

### 4. File Upload Handling
- Direct S3 uploads with presigned URLs
- Remove multer middleware (not needed)
- Client-side upload to S3

### 5. CI/CD Pipeline Updates
- Replace CodeDeploy with SAM deploy
- Update buildspec for Lambda packaging
- Add Lambda-specific tests

## Cost Comparison

### Current EC2 Costs
- EC2 t2.micro: ~$8.50/month
- Data transfer: ~$2/month
- **Total: ~$10.50/month**

### Projected Lambda Costs
- API Gateway: $3.50 per million requests
- Lambda: $0.20 per million requests
- Estimated traffic: 50K requests/month
- **Total: ~$0.20/month** (98% savings)

### Additional Costs (Both Architectures)
- RDS PostgreSQL: ~$15/month
- S3 Storage: ~$1/month
- CloudFront: ~$1/month

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install --save-dev serverless-http aws-sam-cli
npm install --save aws-lambda
```

### Step 2: Create Lambda Handler
Create `backend/src/lambda.ts` to wrap Express app

### Step 3: Create SAM Template
Define Lambda functions, API Gateway, and permissions

### Step 4: Update Database Connection
Implement connection pooling for Lambda

### Step 5: Deploy Lambda Stack
```bash
sam build
sam deploy --guided
```

### Step 6: Test Lambda Endpoints
Verify all routes work correctly

### Step 7: Update Frontend API URL
Point to API Gateway endpoint

### Step 8: Monitor and Optimize
- Watch CloudWatch metrics
- Optimize cold starts
- Tune memory allocation

## Rollback Plan

If issues occur:
1. Revert frontend API_URL to EC2
2. Keep Lambda stack for debugging
3. Fix issues and retry cutover

## Timeline

- **Day 1**: Setup Lambda infrastructure (Steps 1-3)
- **Day 2**: Deploy and test Lambda (Steps 4-6)
- **Day 3**: Cutover to Lambda (Step 7)
- **Week 1**: Monitor and optimize (Step 8)
- **Week 2**: Terminate EC2 if stable

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Cold starts | Provisioned concurrency for critical endpoints |
| Database connections | Use RDS Proxy |
| Increased latency | Monitor and optimize Lambda memory |
| API Gateway limits | Request limit increases if needed |
| Complex debugging | Enhanced CloudWatch logging |

## Success Criteria

- ✅ All API endpoints functional
- ✅ Response times < 500ms (p95)
- ✅ Zero data loss
- ✅ Cost reduction > 80%
- ✅ No user-facing errors

## Next Steps

1. Review and approve this plan
2. Begin Phase 1 implementation
3. Schedule cutover window
