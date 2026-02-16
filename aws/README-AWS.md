# AWS Deployment Guide

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   aws --version
   aws configure list
   ```

2. **Docker installed**
   ```bash
   docker --version
   ```

3. **Node.js and npm installed**
   ```bash
   node --version
   npm --version
   ```

## Quick Deploy

Run the automated deployment script:

```bash
./deploy-aws.sh
```

This script will:
1. ✅ Create all AWS infrastructure (VPC, RDS, ECS, ALB, S3, CloudFront)
2. ✅ Build and push Docker image to ECR
3. ✅ Deploy backend to ECS Fargate
4. ✅ Build and deploy frontend to S3 + CloudFront
5. ✅ Configure all networking and security groups

**Estimated time:** 15-20 minutes

## What Gets Created

### Infrastructure
- **VPC** with public and private subnets across 2 availability zones
- **RDS PostgreSQL** (db.t3.micro) in private subnets
- **ECS Fargate** cluster with auto-scaling
- **Application Load Balancer** for backend API
- **ECR** repository for Docker images
- **S3 bucket** for frontend static files
- **CloudFront** CDN for global distribution
- **Secrets Manager** for secure credential storage
- **CloudWatch Logs** for monitoring

### Estimated Monthly Cost
- **Free Tier Eligible:** ~$0-5/month (first year)
- **After Free Tier:** ~$25-35/month
  - RDS db.t3.micro: ~$15/month
  - ECS Fargate (1 task): ~$10/month
  - ALB: ~$16/month (but free tier covers 750 hours)
  - S3 + CloudFront: ~$1-2/month
  - Data transfer: Variable

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Deploy Infrastructure

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation-template.yaml \
  --stack-name zimbabwe-voice-production \
  --parameter-overrides \
    Environment=production \
    DBPassword=YOUR_SECURE_PASSWORD \
    JWTSecret=YOUR_SECURE_JWT_SECRET \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### 2. Build and Push Docker Image

```bash
# Get ECR repository URI
ECR_REPO=$(aws cloudformation describe-stacks \
  --stack-name zimbabwe-voice-production \
  --query 'Stacks[0].Outputs[?OutputKey==`ECRRepositoryURI`].OutputValue' \
  --output text)

# Build image
docker build -t zimbabwe-voice-backend:latest .

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_REPO

# Tag and push
docker tag zimbabwe-voice-backend:latest $ECR_REPO:latest
docker push $ECR_REPO:latest
```

### 3. Update ECS Service

```bash
aws ecs update-service \
  --cluster production-zimbabwe-voice-cluster \
  --service production-backend-service \
  --force-new-deployment \
  --region us-east-1
```

### 4. Run Database Migrations

```bash
# Get task ID
TASK_ID=$(aws ecs list-tasks \
  --cluster production-zimbabwe-voice-cluster \
  --service-name production-backend-service \
  --query 'taskArns[0]' \
  --output text \
  --region us-east-1 | cut -d'/' -f3)

# Run migration (requires ECS Exec enabled)
aws ecs execute-command \
  --cluster production-zimbabwe-voice-cluster \
  --task $TASK_ID \
  --container backend \
  --interactive \
  --command "npm run migrate --workspace=backend" \
  --region us-east-1
```

### 5. Deploy Frontend

```bash
# Get backend URL
BACKEND_URL=$(aws cloudformation describe-stacks \
  --stack-name zimbabwe-voice-production \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text)

# Build frontend
cd frontend
npm install
VITE_API_URL="${BACKEND_URL}/api" npm run build

# Deploy to S3
aws s3 sync dist s3://production-zimbabwe-voice-frontend --delete

# Invalidate CloudFront
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?DomainName=='production-zimbabwe-voice-frontend.s3.amazonaws.com']].Id" \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## Post-Deployment

### 1. Get Your URLs

```bash
aws cloudformation describe-stacks \
  --stack-name zimbabwe-voice-production \
  --query 'Stacks[0].Outputs'
```

### 2. Test the Application

```bash
# Test backend health
BACKEND_URL=$(aws cloudformation describe-stacks \
  --stack-name zimbabwe-voice-production \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text)

curl $BACKEND_URL/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Seed Database (Optional)

```bash
# Connect to ECS task and run seed
aws ecs execute-command \
  --cluster production-zimbabwe-voice-cluster \
  --task $TASK_ID \
  --container backend \
  --interactive \
  --command "npm run seed --workspace=backend" \
  --region us-east-1
```

## Monitoring

### View Logs

```bash
# Backend logs
aws logs tail /ecs/production-zimbabwe-voice --follow --region us-east-1
```

### Check Service Status

```bash
aws ecs describe-services \
  --cluster production-zimbabwe-voice-cluster \
  --services production-backend-service \
  --region us-east-1
```

### Database Connection

```bash
# Get DB endpoint
DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name zimbabwe-voice-production \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text)

echo "Database endpoint: $DB_ENDPOINT"
```

## Updating the Application

### Update Backend

```bash
# Build new image
docker build -t zimbabwe-voice-backend:latest .

# Push to ECR
docker tag zimbabwe-voice-backend:latest $ECR_REPO:latest
docker push $ECR_REPO:latest

# Force new deployment
aws ecs update-service \
  --cluster production-zimbabwe-voice-cluster \
  --service production-backend-service \
  --force-new-deployment \
  --region us-east-1
```

### Update Frontend

```bash
cd frontend
npm run build
aws s3 sync dist s3://production-zimbabwe-voice-frontend --delete
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## Scaling

### Scale ECS Tasks

```bash
aws ecs update-service \
  --cluster production-zimbabwe-voice-cluster \
  --service production-backend-service \
  --desired-count 2 \
  --region us-east-1
```

### Upgrade Database

```bash
aws rds modify-db-instance \
  --db-instance-identifier production-zimbabwe-voice-db \
  --db-instance-class db.t3.small \
  --apply-immediately \
  --region us-east-1
```

## Cleanup (Delete Everything)

⚠️ **WARNING:** This will delete all resources and data!

```bash
# Empty S3 bucket first
aws s3 rm s3://production-zimbabwe-voice-frontend --recursive

# Delete CloudFormation stack
aws cloudformation delete-stack \
  --stack-name zimbabwe-voice-production \
  --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name zimbabwe-voice-production \
  --region us-east-1
```

## Troubleshooting

### ECS Task Won't Start

```bash
# Check task logs
aws ecs describe-tasks \
  --cluster production-zimbabwe-voice-cluster \
  --tasks $TASK_ID \
  --region us-east-1
```

### Database Connection Issues

- Check security groups allow ECS → RDS on port 5432
- Verify DB credentials in Secrets Manager
- Check VPC and subnet configuration

### Frontend Not Loading

- Verify S3 bucket policy allows public read
- Check CloudFront distribution status
- Ensure VITE_API_URL is set correctly during build

## Support

For issues:
1. Check CloudWatch Logs: `/ecs/production-zimbabwe-voice`
2. Review CloudFormation events in AWS Console
3. Verify all outputs from CloudFormation stack

## Security Best Practices

- ✅ Database in private subnets
- ✅ Secrets stored in AWS Secrets Manager
- ✅ HTTPS enforced via CloudFront
- ✅ Security groups restrict access
- ✅ IAM roles follow least privilege
- ✅ CloudWatch logging enabled
- ✅ Automated backups for RDS

## Next Steps

1. **Custom Domain:** Add Route 53 and ACM certificate
2. **CI/CD:** Set up GitHub Actions or CodePipeline
3. **Monitoring:** Configure CloudWatch alarms
4. **Backups:** Verify RDS backup schedule
5. **WAF:** Add AWS WAF for DDoS protection
