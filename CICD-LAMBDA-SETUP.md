# CI/CD Pipeline Setup for Lambda Architecture

## Overview

This document describes the automated CI/CD pipeline for the Resistance Radio platform using AWS Lambda backend architecture.

## Architecture

The pipeline deploys three components in parallel:

1. **Main Frontend** - Public-facing React application
2. **Admin Frontend** - Admin CMS React application  
3. **Lambda Backend** - Serverless Express API using AWS SAM

## Pipeline Components

### AWS Services Used

- **AWS CodePipeline** - Orchestrates the CI/CD workflow
- **AWS CodeBuild** - Builds and deploys each component
- **AWS CloudFormation** - Infrastructure as Code for pipeline setup
- **Amazon S3** - Hosts frontend applications and pipeline artifacts
- **Amazon CloudFront** - CDN for frontend delivery
- **AWS Lambda** - Serverless backend runtime
- **Amazon API Gateway** - HTTP API for Lambda functions

### Build Projects

#### 1. Main Frontend Build
- **Buildspec**: `buildspec-frontend.yml`
- **Source**: `frontend/` directory
- **Output**: Static files deployed to S3
- **S3 Bucket**: `resistance-radio-website-dev-734110488556`
- **CloudFront**: `EYKP4STY3RIHX`
- **Build Time**: ~2-3 minutes

#### 2. Admin Frontend Build
- **Buildspec**: `buildspec-admin-frontend.yml`
- **Source**: `admin-frontend/` directory
- **Output**: Static files deployed to S3
- **S3 Bucket**: `zimbabwe-voice-admin`
- **CloudFront**: `E2HKDMNDC8X5HT`
- **Build Time**: ~2-3 minutes

#### 3. Lambda Backend Build
- **Buildspec**: `buildspec-lambda.yml`
- **Source**: `backend/` directory + `template.yaml`
- **Output**: Lambda function deployed via SAM
- **Stack Name**: `resistance-radio-backend-dev`
- **API Gateway**: Auto-generated HTTP API
- **Build Time**: ~5-7 minutes

## Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Source Stage                         │
│                    (GitHub Repository)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        Build Stage                           │
│                    (Parallel Execution)                      │
├──────────────────┬──────────────────┬──────────────────────┤
│  Main Frontend   │  Admin Frontend  │   Lambda Backend     │
│   CodeBuild      │    CodeBuild     │     CodeBuild        │
│                  │                  │                      │
│  • npm install   │  • npm install   │  • npm install       │
│  • npm build     │  • npm build     │  • sam build         │
│  • S3 sync       │  • S3 sync       │  • sam deploy        │
│  • CF invalidate │  • CF invalidate │  • API Gateway       │
└──────────────────┴──────────────────┴──────────────────────┘
```

## Setup Instructions

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **GitHub Repository** with the code
3. **GitHub Personal Access Token** with `repo` and `admin:repo_hook` permissions
4. **AWS CLI** configured with profile `Personal_Account_734110488556`
5. **Existing Infrastructure**:
   - RDS PostgreSQL database
   - S3 buckets for frontend hosting
   - CloudFront distributions

### Initial Setup (First Time)

If you haven't created the pipeline yet:

```bash
# Run the setup script
./setup-cicd.sh
```

This will prompt you for:
- GitHub repository (e.g., `username/repo-name`)
- GitHub branch (e.g., `main`)
- GitHub personal access token
- Database credentials
- JWT secret

### Updating Existing Pipeline

If you already have a pipeline and want to update it for Lambda:

```bash
# Run the update script
./update-cicd-pipeline.sh
```

This will:
- Add the admin frontend build project
- Update backend to use Lambda/SAM deployment
- Configure parallel builds for all three components

## Environment Variables

### Frontend Build Environment

```bash
VITE_API_URL=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api
S3_BUCKET=resistance-radio-website-dev-734110488556
CLOUDFRONT_DISTRIBUTION_ID=EYKP4STY3RIHX
```

### Admin Frontend Build Environment

```bash
VITE_API_URL=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api
S3_BUCKET=zimbabwe-voice-admin
CLOUDFRONT_DISTRIBUTION_ID=E2HKDMNDC8X5HT
```

### Lambda Backend Build Environment

```bash
ENVIRONMENT=dev
DB_HOST=resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com
DB_NAME=resistance_radio
DB_USER=postgres
DB_PASSWORD=<secure-password>
JWT_SECRET=<secure-secret>
FRONTEND_URL=https://resistanceradiostation.org
S3_BUCKET_NAME=resistance-radio-website-dev-734110488556
```

## Triggering the Pipeline

### Automatic Triggers

The pipeline automatically triggers on:
- Push to the configured branch (default: `main`)
- Pull request merge to the configured branch

### Manual Trigger

You can manually trigger the pipeline from the AWS Console:

1. Go to [CodePipeline Console](https://console.aws.amazon.com/codesuite/codepipeline/pipelines)
2. Select `ResistanceRadio-Pipeline`
3. Click "Release change"

## Monitoring

### Pipeline Status

View pipeline execution status:
```bash
aws codepipeline get-pipeline-state \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Build Logs

View CodeBuild logs:
```bash
# Main Frontend
aws codebuild batch-get-builds \
  --ids <build-id> \
  --profile Personal_Account_734110488556 \
  --region us-east-1

# Admin Frontend
aws codebuild batch-get-builds \
  --ids <build-id> \
  --profile Personal_Account_734110488556 \
  --region us-east-1

# Lambda Backend
aws codebuild batch-get-builds \
  --ids <build-id> \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### CloudWatch Logs

- **CodeBuild Logs**: `/aws/codebuild/ResistanceRadio-*`
- **Lambda Logs**: `/aws/lambda/resistance-radio-backend-dev-*`

## Cost Optimization

### Current Costs (Estimated)

- **CodePipeline**: $1/month (1 active pipeline)
- **CodeBuild**: ~$0.005/minute × ~10 minutes/build × ~30 builds/month = ~$1.50/month
- **S3 Storage**: ~$0.023/GB × 1GB = ~$0.02/month
- **CloudFront**: Pay-as-you-go (minimal for dev)
- **Lambda**: Pay-per-request (minimal for dev)

**Total**: ~$2.50-3.00/month

### Cost Savings vs EC2

- **Old EC2 Backend**: ~$10.50/month
- **New Lambda Backend**: ~$0.20/month
- **Savings**: ~98% reduction

## Troubleshooting

### Build Failures

#### Frontend Build Fails

1. Check buildspec syntax: `buildspec-frontend.yml`
2. Verify S3 bucket exists and is accessible
3. Check CloudFront distribution ID is correct
4. Review CodeBuild logs for npm errors

#### Admin Frontend Build Fails

1. Check buildspec syntax: `buildspec-admin-frontend.yml`
2. Verify S3 bucket `zimbabwe-voice-admin` exists
3. Check CloudFront distribution ID `E2HKDMNDC8X5HT`
4. Review CodeBuild logs for npm errors

#### Lambda Backend Build Fails

1. Check SAM template: `template.yaml`
2. Verify buildspec syntax: `buildspec-lambda.yml`
3. Check database credentials are correct
4. Ensure SAM CLI is installed in CodeBuild
5. Review CloudFormation stack events

### Pipeline Stuck

If pipeline is stuck in "In Progress":

```bash
# Stop the execution
aws codepipeline stop-pipeline-execution \
  --pipeline-name ResistanceRadio-Pipeline \
  --pipeline-execution-id <execution-id> \
  --abandon \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Rollback

If a deployment causes issues:

1. **Frontend/Admin**: Deploy previous version manually
   ```bash
   # Use git to checkout previous version
   git checkout <previous-commit>
   
   # Build and deploy manually
   cd frontend && npm run build
   aws s3 sync dist/ s3://resistance-radio-website-dev-734110488556/ --delete
   aws cloudfront create-invalidation --distribution-id EYKP4STY3RIHX --paths "/*"
   ```

2. **Lambda Backend**: Rollback CloudFormation stack
   ```bash
   aws cloudformation rollback-stack \
     --stack-name resistance-radio-backend-dev \
     --profile Personal_Account_734110488556 \
     --region us-east-1
   ```

## Security Best Practices

1. **Secrets Management**
   - Store sensitive values in AWS Secrets Manager
   - Reference secrets in CodeBuild environment variables
   - Never commit secrets to Git

2. **IAM Permissions**
   - Use least-privilege IAM roles
   - Separate roles for CodePipeline and CodeBuild
   - Regularly audit permissions

3. **Build Artifacts**
   - Enable versioning on artifact bucket
   - Set lifecycle policy to delete old artifacts
   - Encrypt artifacts at rest

4. **Access Control**
   - Restrict pipeline modifications to admins
   - Enable CloudTrail logging for audit
   - Use MFA for sensitive operations

## Maintenance

### Regular Tasks

- **Weekly**: Review pipeline execution logs
- **Monthly**: Check build times and optimize if needed
- **Quarterly**: Review and update dependencies
- **Annually**: Rotate GitHub tokens and AWS credentials

### Updates

To update the pipeline configuration:

1. Modify `aws/codepipeline-template.yml`
2. Run `./update-cicd-pipeline.sh`
3. Test with a non-production branch first

## Support

For issues or questions:
1. Check CloudWatch logs for detailed error messages
2. Review AWS CodeBuild documentation
3. Check SAM CLI documentation for Lambda issues
4. Contact AWS Support for infrastructure issues

## References

- [AWS CodePipeline Documentation](https://docs.aws.amazon.com/codepipeline/)
- [AWS CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
