# CI/CD Quick Start Guide

This guide will help you set up the complete CI/CD pipeline in under 10 minutes.

## Prerequisites

1. **GitHub CLI** - Install if not already installed:
   ```bash
   brew install gh
   ```

2. **Authenticate with GitHub**:
   ```bash
   gh auth login
   ```
   - Choose: GitHub.com
   - Choose: HTTPS
   - Authenticate with your browser

3. **AWS CLI** - Already configured with profile `Personal_Account_734110488556`

## One-Command Setup

Run this single command to set up everything:

```bash
./setup-cicd.sh
```

This automated script will:
1. ✓ Check all prerequisites
2. ✓ Create GitHub repository: `resistance-radio-platform`
3. ✓ Prompt for GitHub Personal Access Token
4. ✓ Verify EC2 instance configuration
5. ✓ Deploy AWS CodePipeline infrastructure
6. ✓ Push code to GitHub
7. ✓ Trigger first pipeline run

## What You'll Need

### GitHub Personal Access Token

When prompted, you'll need a token with these permissions:
- `repo` (Full control of private repositories)
- `admin:repo_hook` (Full control of repository hooks)

**Generate token here:** https://github.com/settings/tokens/new

Steps:
1. Click "Generate new token (classic)"
2. Name it: "Resistance Radio CI/CD"
3. Select scopes: `repo` and `admin:repo_hook`
4. Click "Generate token"
5. Copy the token (you won't see it again!)

## What Gets Created

### GitHub
- Public repository: `your-username/resistance-radio-platform`
- Webhook for automatic pipeline triggers

### AWS Resources
- **CodePipeline**: `ResistanceRadio-Pipeline`
- **CodeBuild Projects**: 
  - `ResistanceRadio-Frontend-Build`
  - `ResistanceRadio-Backend-Build`
- **CodeDeploy Application**: `ResistanceRadio-App`
- **S3 Bucket**: `resistance-radio-pipeline-artifacts-734110488556`
- **IAM Roles**: For CodePipeline, CodeBuild, and CodeDeploy

### Cost
Approximately $8-15/month for the CI/CD infrastructure

## Pipeline Flow

```
GitHub Push → CodePipeline → Build (Frontend + Backend) → Deploy
                                                          ↓
                                              Frontend: S3 + CloudFront
                                              Backend: EC2 via CodeDeploy
```

### Deployment Targets
- **Frontend**: https://resistanceradiostation.org
- **Backend**: https://api.resistanceradiostation.org

## After Setup

### Monitor Pipeline
View pipeline status:
```bash
aws codepipeline get-pipeline-state \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

Or visit the AWS Console URL provided at the end of setup.

### Make Changes
Simply push to the `main` branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

The pipeline will automatically:
1. Detect the push via webhook
2. Build frontend and backend
3. Deploy to production
4. Complete in ~10-15 minutes

### View Logs
- **Build logs**: AWS Console → CodeBuild → Build History
- **Deploy logs**: SSH to EC2 and check `/var/log/aws/codedeploy-agent/`
- **Application logs**: SSH to EC2 and run `pm2 logs resistance-radio-backend`

## Troubleshooting

### Pipeline Fails at Build Stage
- Check CodeBuild logs in AWS Console
- Verify `buildspec-frontend.yml` and `buildspec-backend.yml` are correct

### Pipeline Fails at Deploy Stage
- SSH to EC2: `ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4`
- Check CodeDeploy agent: `sudo service codedeploy-agent status`
- View deployment logs: `sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log`

### Application Not Starting After Deploy
- SSH to EC2
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs resistance-radio-backend`
- Check environment variables: `cat /opt/resistance-radio/backend/.env`

## Manual Operations

### Restart Pipeline Manually
```bash
aws codepipeline start-pipeline-execution \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Rollback Deployment
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
cd backend
pm2 restart resistance-radio-backend
```

### Delete Pipeline
```bash
aws cloudformation delete-stack \
  --stack-name resistance-radio-pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

## EC2 Instance Requirements

Your EC2 instance needs:

1. **CodeDeploy Agent** - Install if not present:
   ```bash
   sudo yum update -y
   sudo yum install -y ruby wget
   cd /home/ec2-user
   wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
   chmod +x ./install
   sudo ./install auto
   sudo service codedeploy-agent start
   ```

2. **IAM Role** - Attached to EC2 instance with permissions to:
   - Read from S3 artifacts bucket
   - Write logs to CloudWatch

3. **Tag** - `Name=resistance-radio-backend` (script adds this automatically)

## Environment Variables

### Frontend (Set in CodeBuild)
Already configured in `buildspec-frontend.yml`:
- `VITE_API_URL=https://api.resistanceradiostation.org/api`

### Backend (Set on EC2)
Located at `/opt/resistance-radio/backend/.env`:
- Database credentials
- JWT secret
- AWS credentials
- SMTP credentials

These are NOT managed by the pipeline - they persist on the EC2 instance.

## Security Notes

- GitHub token is stored in AWS Secrets Manager (encrypted)
- Pipeline artifacts are encrypted at rest in S3
- IAM roles follow least-privilege principle
- All deployments are logged and auditable

## Support

For detailed documentation, see:
- `CODEPIPELINE-SETUP.md` - Complete setup guide
- `appspec.yml` - CodeDeploy configuration
- `buildspec-frontend.yml` - Frontend build specification
- `buildspec-backend.yml` - Backend build specification
- `scripts/` - Deployment scripts

## Next Steps

After successful setup:
1. ✓ Configure branch protection rules on GitHub
2. ✓ Add automated testing stage to pipeline
3. ✓ Set up staging environment
4. ✓ Configure deployment notifications (SNS/Slack)
5. ✓ Add manual approval stage for production
6. ✓ Set up monitoring and alerting

---

**Ready to start?** Run: `./setup-cicd.sh`
