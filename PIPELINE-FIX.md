# Lambda Migration - Pipeline Fix

## Issue
The CodeBuild project `app-build-project` was using a generic buildspec that didn't deploy to S3.

## Fix Applied
Updated the CodeBuild project to use `buildspec-frontend.yml` which includes:
- Frontend build with Lambda endpoint
- S3 sync to `resistance-radio-website-dev-734110488556`
- CloudFront cache invalidation

## Deployment
This commit will trigger the CI/CD pipeline to:
1. Build the frontend with Lambda endpoint configured
2. Deploy to S3
3. Invalidate CloudFront cache
4. Make the site live with Lambda backend

## Expected Result
Production site at https://resistanceradiostation.org will use Lambda backend at:
`https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api`

## Cost Savings
98% reduction: ~$10.50/month (EC2) → ~$0.20/month (Lambda)
