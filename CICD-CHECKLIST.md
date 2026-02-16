# CI/CD Setup Checklist

Use this checklist to ensure everything is ready before running the setup.

## ✅ Pre-Setup Checklist

### 1. GitHub CLI
- [ ] GitHub CLI installed (`brew install gh`)
- [ ] Authenticated with GitHub (`gh auth login`)
- [ ] Can access your GitHub account (`gh auth status`)

### 2. AWS Configuration
- [ ] AWS CLI installed
- [ ] Profile configured: `Personal_Account_734110488556`
- [ ] Can access AWS account (`aws sts get-caller-identity --profile Personal_Account_734110488556`)

### 3. GitHub Personal Access Token
- [ ] Generated at https://github.com/settings/tokens/new
- [ ] Has `repo` permission (Full control of private repositories)
- [ ] Has `admin:repo_hook` permission (Full control of repository hooks)
- [ ] Token copied and ready to paste

### 4. EC2 Instance
- [ ] Instance ID: `i-07f7e8accc4b07682`
- [ ] Instance is running
- [ ] Can SSH to instance: `ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4`

### 5. Code Ready
- [ ] All changes committed to git
- [ ] On `main` branch (`git branch --show-current`)
- [ ] No uncommitted changes (`git status`)

## 🚀 Setup Steps

### Step 1: Run Setup Script
```bash
./setup-cicd.sh
```

### Step 2: Provide Information When Prompted
- [ ] GitHub Personal Access Token (paste when prompted)
- [ ] Confirm pipeline creation (type `yes`)

### Step 3: Wait for Completion
- [ ] CloudFormation stack creation (5-10 minutes)
- [ ] Code pushed to GitHub
- [ ] Pipeline URL displayed

## ✅ Post-Setup Verification

### 1. GitHub Repository
- [ ] Repository created: https://github.com/YOUR_USERNAME/resistance-radio-platform
- [ ] Code is visible in repository
- [ ] Webhook configured (Settings → Webhooks)

### 2. AWS Resources Created
- [ ] CodePipeline: `ResistanceRadio-Pipeline`
  ```bash
  aws codepipeline get-pipeline \
    --name ResistanceRadio-Pipeline \
    --profile Personal_Account_734110488556 \
    --region us-east-1
  ```

- [ ] CodeBuild Projects:
  - `ResistanceRadio-Frontend-Build`
  - `ResistanceRadio-Backend-Build`
  ```bash
  aws codebuild list-projects \
    --profile Personal_Account_734110488556 \
    --region us-east-1
  ```

- [ ] CodeDeploy Application: `ResistanceRadio-App`
  ```bash
  aws deploy list-applications \
    --profile Personal_Account_734110488556 \
    --region us-east-1
  ```

- [ ] S3 Artifacts Bucket: `resistance-radio-pipeline-artifacts-734110488556`
  ```bash
  aws s3 ls --profile Personal_Account_734110488556 | grep pipeline-artifacts
  ```

### 3. Pipeline Execution
- [ ] Pipeline started automatically
- [ ] Source stage completed (green)
- [ ] Build stage in progress or completed
- [ ] Deploy stage in progress or completed

Check status:
```bash
aws codepipeline get-pipeline-state \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### 4. EC2 Instance
- [ ] CodeDeploy agent running
  ```bash
  ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4 \
    "sudo service codedeploy-agent status"
  ```

- [ ] Tag added: `Name=resistance-radio-backend`
  ```bash
  aws ec2 describe-tags \
    --filters "Name=resource-id,Values=i-07f7e8accc4b07682" \
    --profile Personal_Account_734110488556 \
    --region us-east-1
  ```

### 5. Application Deployment
- [ ] Frontend deployed to S3
  ```bash
  aws s3 ls s3://resistance-radio-website-dev-734110488556/ \
    --profile Personal_Account_734110488556
  ```

- [ ] CloudFront cache invalidated
- [ ] Backend deployed to EC2
  ```bash
  ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4 \
    "pm2 status"
  ```

### 6. Website Verification
- [ ] Frontend accessible: https://resistanceradiostation.org
- [ ] API accessible: https://api.resistanceradiostation.org/api/health
- [ ] Admin login works: https://resistanceradiostation.org/admin
- [ ] No console errors in browser

## 🔧 Troubleshooting

### Setup Script Fails

**GitHub CLI not authenticated:**
```bash
gh auth login
```

**AWS credentials not configured:**
```bash
aws configure --profile Personal_Account_734110488556
```

**Repository already exists:**
- Delete existing repo on GitHub
- Or use existing repo and skip creation step

### Pipeline Fails

**Build Stage Fails:**
1. Check CodeBuild logs in AWS Console
2. Verify buildspec files are correct
3. Check environment variables

**Deploy Stage Fails:**
1. SSH to EC2 and check CodeDeploy agent:
   ```bash
   sudo service codedeploy-agent status
   sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log
   ```

2. Check deployment scripts have execute permissions:
   ```bash
   ls -la /opt/resistance-radio/backend/scripts/
   ```

3. Verify IAM role attached to EC2 instance

**Application Not Starting:**
1. SSH to EC2
2. Check PM2 logs:
   ```bash
   pm2 logs resistance-radio-backend
   ```
3. Check environment variables:
   ```bash
   cat /opt/resistance-radio/backend/.env
   ```

### CodeDeploy Agent Not Running

Install CodeDeploy agent on EC2:
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4

sudo yum update -y
sudo yum install -y ruby wget
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo service codedeploy-agent start
sudo service codedeploy-agent status
```

## 📊 Monitoring

### View Pipeline Status
AWS Console → CodePipeline → ResistanceRadio-Pipeline

Or via CLI:
```bash
aws codepipeline get-pipeline-state \
  --name ResistanceRadio-Pipeline \
  --profile Personal_Account_734110488556 \
  --region us-east-1 \
  --query 'stageStates[*].[stageName,latestExecution.status]' \
  --output table
```

### View Build Logs
AWS Console → CodeBuild → Build History → Select Build → Logs

### View Deployment Logs
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log
```

### View Application Logs
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4
pm2 logs resistance-radio-backend
```

## 🎉 Success Criteria

All of these should be true:
- ✅ GitHub repository created and code pushed
- ✅ CloudFormation stack created successfully
- ✅ Pipeline exists and is running
- ✅ First pipeline execution completed successfully
- ✅ Frontend deployed to S3 and accessible
- ✅ Backend deployed to EC2 and running
- ✅ Website loads without errors
- ✅ API responds to health check
- ✅ Admin login works

## 🔄 Next Deployment

After successful setup, future deployments are automatic:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Pipeline triggers automatically!
```

Monitor at: AWS Console → CodePipeline → ResistanceRadio-Pipeline

## 📚 Additional Resources

- [CICD-QUICK-START.md](CICD-QUICK-START.md) - Quick reference guide
- [CODEPIPELINE-SETUP.md](CODEPIPELINE-SETUP.md) - Detailed documentation
- [README.md](README.md) - Project overview

## 🆘 Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review CloudFormation events in AWS Console
3. Check CodeBuild logs for build errors
4. Check CodeDeploy logs for deployment errors
5. SSH to EC2 and check application logs

---

**Ready?** Run: `./setup-cicd.sh`
