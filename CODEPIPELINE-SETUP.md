# AWS CodePipeline Setup Guide

This guide will help you set up a complete CI/CD pipeline for the Resistance Radio platform using AWS CodePipeline, CodeBuild, and CodeDeploy.

## Architecture Overview

```
GitHub → CodePipeline → CodeBuild (Frontend + Backend) → Deploy
                                                        ↓
                                            Frontend: S3 + CloudFront
                                            Backend: EC2 via CodeDeploy
```

## Prerequisites

### 1. GitHub Repository
- Create a GitHub repository for this project
- Generate a personal access token with `repo` and `admin:repo_hook` permissions
  - Go to GitHub Settings → Developer settings → Personal access tokens
  - Generate new token (classic)
  - Select scopes: `repo`, `admin:repo_hook`

### 2. AWS Account Setup
- AWS Account: 734110488556
- Region: us-east-1
- AWS CLI configured with profile: `Personal_Account_734110488556`

### 3. EC2 Instance Configuration

Your EC2 instance needs the CodeDeploy agent installed:

```bash
# SSH into your EC2 instance
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4

# Install CodeDeploy agent
sudo yum update -y
sudo yum install -y ruby wget

cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

# Start CodeDeploy agent
sudo service codedeploy-agent start

# Verify it's running
sudo service codedeploy-agent status
```

### 4. EC2 Instance IAM Role

Your EC2 instance needs an IAM role with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::resistance-radio-pipeline-artifacts-734110488556/*",
        "arn:aws:s3:::resistance-radio-pipeline-artifacts-734110488556"
      ]
    }
  ]
}
```

### 5. EC2 Instance Tags

Add this tag to your EC2 instance:
- Key: `Name`
- Value: `resistance-radio-backend`

## Quick Setup (Automated)

### Step 1: Make setup script executable
```bash
chmod +x aws/setup-codepipeline.sh
```

### Step 2: Run the setup script
```bash
./aws/setup-codepipeline.sh
```

The script will prompt you for:
- GitHub repository (format: username/repo-name)
- GitHub branch (default: main)
- GitHub personal access token

### Step 3: Push code to GitHub
```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push code
git push -u origin main
```

The pipeline will automatically trigger!

## Manual Setup (Step by Step)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create repository (e.g., `resistance-radio-platform`)
3. Don't initialize with README

### Step 2: Deploy CloudFormation Stack

```bash
aws cloudformation create-stack \
  --stack-name resistance-radio-pipeline \
  --template-body file://aws/codepipeline-template.yml \
  --parameters \
      ParameterKey=GitHubRepo,ParameterValue=YOUR_USERNAME/YOUR_REPO \
      ParameterKey=GitHubBranch,ParameterValue=main \
      ParameterKey=GitHubToken,ParameterValue=YOUR_GITHUB_TOKEN \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Step 3: Wait for Stack Creation

```bash
aws cloudformation wait stack-create-complete \
  --stack-name resistance-radio-pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Step 4: Get Pipeline URL

```bash
aws cloudformation describe-stacks \
  --stack-name resistance-radio-pipeline \
  --query 'Stacks[0].Outputs[?OutputKey==`PipelineUrl`].OutputValue' \
  --output text \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Step 5: Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Pipeline Stages

### 1. Source Stage
- Monitors GitHub repository for changes
- Triggers automatically on push to main branch
- Uses GitHub webhook for instant notifications

### 2. Build Stage (Parallel)

#### Frontend Build
- Installs dependencies
- Builds React application with Vite
- Environment variables injected:
  - `VITE_API_URL=https://api.resistanceradiostation.org/api`
- Syncs to S3 bucket
- Invalidates CloudFront cache
- Duration: ~3-5 minutes

#### Backend Build
- Installs production dependencies
- Compiles TypeScript to JavaScript
- Creates deployment package
- Duration: ~2-3 minutes

### 3. Deploy Stage

#### Backend Deployment (CodeDeploy)
- Stops existing application
- Backs up current deployment
- Deploys new version
- Runs database migrations
- Restarts application with PM2
- Validates service health
- Duration: ~2-3 minutes

## Build Specifications

### Frontend (`buildspec-frontend.yml`)
- Runtime: Node.js 18
- Build command: `npm run build`
- Output: Static files to S3
- Cache: node_modules

### Backend (`buildspec-backend.yml`)
- Runtime: Node.js 18
- Build command: `npm run build`
- Output: Deployment package (zip)
- Cache: node_modules

## Deployment Scripts

Located in `scripts/` directory:

1. **before_install.sh**
   - Stops running application
   - Creates backup of current deployment
   - Maintains last 5 backups

2. **after_install.sh**
   - Sets correct file permissions
   - Installs dependencies if needed
   - Runs database migrations

3. **start_application.sh**
   - Starts/restarts PM2 process
   - Saves PM2 configuration

4. **validate_service.sh**
   - Checks PM2 process status
   - Validates application health
   - Verifies port listening

## Monitoring and Troubleshooting

### View Pipeline Status
```bash
aws codepipeline get-pipeline-state \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### View Build Logs
1. Go to AWS Console → CodeBuild
2. Select build project
3. Click on build execution
4. View logs in CloudWatch

### View Deployment Logs
```bash
# On EC2 instance
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log
```

### Common Issues

#### Build Fails
- Check CodeBuild logs in CloudWatch
- Verify buildspec.yml syntax
- Check environment variables

#### Deployment Fails
- Verify CodeDeploy agent is running on EC2
- Check EC2 instance has correct IAM role
- Verify EC2 instance has correct tag
- Check deployment scripts have execute permissions

#### Application Not Starting
- SSH to EC2 and check PM2 logs: `pm2 logs resistance-radio-backend`
- Check application logs: `tail -f /opt/resistance-radio/backend/logs/*.log`
- Verify environment variables in `/opt/resistance-radio/backend/.env`

## Environment Variables

### Frontend (Set in CodeBuild)
- `VITE_API_URL`: Backend API URL
- `VITE_SENTRY_DSN`: Sentry error tracking (optional)
- `VITE_ANALYTICS_ENABLED`: Enable analytics (optional)

### Backend (Set on EC2)
Located in `/opt/resistance-radio/backend/.env`:
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `PORT`: Application port (5000)
- `FRONTEND_URL`: Frontend URL for CORS
- `AWS_*`: AWS credentials for S3
- `SMTP_*`: Email service credentials

## Cost Estimation

### Monthly Costs (Approximate)
- CodePipeline: $1/month (1 active pipeline)
- CodeBuild: ~$5-10/month (based on build minutes)
- CodeDeploy: Free for EC2 deployments
- S3 (artifacts): ~$1-2/month
- CloudWatch Logs: ~$1-2/month

**Total: ~$8-15/month**

## Rollback Procedure

### Automatic Rollback
CodeDeploy automatically rolls back if deployment fails.

### Manual Rollback
```bash
# SSH to EC2
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4

# List backups
ls -la /opt/resistance-radio/backups/

# Restore backup
cd /opt/resistance-radio
sudo rm -rf backend
sudo cp -r backups/backend_TIMESTAMP backend
sudo chown -R ec2-user:ec2-user backend

# Restart application
cd backend
pm2 restart resistance-radio-backend
```

## Cleanup

To delete the pipeline and all resources:

```bash
aws cloudformation delete-stack \
  --stack-name resistance-radio-pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

## Next Steps

1. ✅ Set up pipeline (you're here!)
2. Configure branch protection rules on GitHub
3. Add automated testing stage
4. Set up staging environment
5. Configure deployment notifications (SNS/Slack)
6. Add manual approval stage for production
7. Set up monitoring and alerting

## Support

For issues or questions:
- Check AWS CodePipeline console for pipeline status
- Review CloudWatch logs for build/deployment details
- Check EC2 instance logs for application issues
