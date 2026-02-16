# Resistance Radio Station - AWS Deployment Summary

## ✅ Deployment Configuration Complete

Your AWS deployment infrastructure for the Resistance Radio Station is now fully configured and ready to deploy!

## What Was Created

### AWS Deployment Scripts (in `aws/` directory)

1. **Master Deployment Script**
   - `deploy-resistance-radio.sh` - One-command deployment for everything

2. **Individual Setup Scripts**
   - `setup-s3-buckets.sh` - Creates media, website, and backup buckets
   - `setup-rds-database.sh` - Creates PostgreSQL database
   - `setup-cloudfront.sh` - Creates CDN distribution
   - `setup-backend-ec2.sh` - Creates backend API server
   - `deploy-full-stack.sh` - Builds and deploys application

3. **Configuration**
   - `resistance-radio-config.sh` - Central configuration file

4. **Documentation**
   - `README.md` - Overview and quick start
   - `DEPLOYMENT-GUIDE.md` - Comprehensive deployment guide
   - `QUICK-START.md` - Quick reference for common tasks

## Your AWS Account Details

- **Account ID**: 734110488556
- **Profile Name**: Personal_Account_734110488556
- **Region**: us-east-1 (N. Virginia)
- **Access Level**: Root account (full access)

## Ready to Deploy!

### Option 1: Deploy Everything (Recommended)

```bash
cd aws
./deploy-resistance-radio.sh dev
```

This will create:
- ✅ 3 S3 buckets (media, website, backups)
- ✅ RDS PostgreSQL database
- ✅ CloudFront CDN distribution
- ✅ EC2 instance for backend API
- ✅ All security groups and IAM roles
- ✅ Deploy frontend to S3

**Time**: 25-40 minutes
**Cost**: ~$37/month (dev environment)

### Option 2: Deploy Step-by-Step

```bash
cd aws

# Step 1: Create S3 buckets (1-2 min)
./setup-s3-buckets.sh dev

# Step 2: Create database (5-10 min)
./setup-rds-database.sh dev

# Step 3: Create CDN (15-20 min)
./setup-cloudfront.sh dev

# Step 4: Create backend server (3-5 min)
./setup-backend-ec2.sh dev

# Step 5: Deploy application
./deploy-full-stack.sh dev
```

## What Happens During Deployment

### Phase 1: Infrastructure Setup (20-30 minutes)

1. **S3 Buckets Created**
   - `resistance-radio-media-dev-734110488556` - For audio files and images
   - `resistance-radio-website-dev-734110488556` - For frontend hosting
   - `resistance-radio-backup-dev-734110488556` - For database backups

2. **RDS Database Created**
   - PostgreSQL 14.10
   - Instance: db.t3.micro
   - Storage: 20 GB (encrypted)
   - Credentials stored in AWS Secrets Manager

3. **CloudFront Distribution Created**
   - Global CDN for fast content delivery
   - HTTPS enabled
   - Custom error pages for SPA

4. **EC2 Instance Created**
   - Amazon Linux 2023
   - Instance: t3.micro
   - Pre-configured with Node.js, PM2, Nginx
   - SSH key saved to `~/.ssh/resistance-radio-key-dev.pem`

### Phase 2: Application Deployment (5-10 minutes)

1. **Backend Built**
   - Dependencies installed
   - TypeScript compiled
   - Database migrations run

2. **Frontend Built**
   - React app compiled
   - Assets optimized
   - Deployed to S3

3. **CloudFront Cache Invalidated**
   - Ensures latest content is served

## After Deployment

You'll receive output with:
- ✅ Website URL (CloudFront domain)
- ✅ API server IP address
- ✅ Database endpoint
- ✅ SSH command for backend access
- ✅ All resource IDs

### Example Output:
```
==========================================
Deployment Complete!
==========================================
Website URL: https://d1234567890.cloudfront.net
API Server: http://3.123.45.67
Database: resistance-radio-db-dev.abc123.us-east-1.rds.amazonaws.com
SSH: ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@3.123.45.67
==========================================
```

## Next Steps After Deployment

### 1. Access Your Website
Visit the CloudFront URL provided in the deployment output.

### 2. Deploy Backend Code
```bash
# SSH to EC2 instance
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@YOUR_EC2_IP

# Navigate to app directory
cd /opt/resistance-radio

# Clone your repository or upload code
git clone YOUR_REPO_URL .

# Install dependencies
npm install

# Get database credentials
aws secretsmanager get-secret-value \
    --secret-id resistance-radio-db-credentials-dev \
    --query SecretString \
    --output text > .env

# Build and start
npm run build
pm2 start dist/index.js --name resistance-radio-api
pm2 save
pm2 startup
```

### 3. Configure Custom Domain (Optional)
```bash
# Request SSL certificate
aws acm request-certificate \
    --domain-name resistanceradio.org \
    --validation-method DNS \
    --profile Personal_Account_734110488556 \
    --region us-east-1

# Update CloudFront with custom domain
# Configure Route 53 DNS
```

### 4. Set Up Email Service
Choose AWS SES or SendGrid for sending emails (newsletters, notifications).

### 5. Configure Monitoring
Set up CloudWatch alarms for CPU, memory, disk usage, and application errors.

## Cost Breakdown

### Development Environment
- **Monthly**: ~$37
  - RDS db.t3.micro: $15
  - EC2 t3.micro: $8
  - S3 storage: $1
  - CloudFront: $8
  - Data transfer: $5

### Production Environment
- **Monthly**: ~$110
  - RDS db.t3.small: $30
  - EC2 t3.small: $15
  - S3 storage: $5
  - CloudFront: $40
  - Data transfer: $20

## Useful Commands

### Get Website URL
```bash
aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Resistance Radio Station dev'].DomainName | [0]" \
    --output text \
    --profile Personal_Account_734110488556
```

### Get Database Credentials
```bash
aws secretsmanager get-secret-value \
    --secret-id resistance-radio-db-credentials-dev \
    --query SecretString \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1 | jq .
```

### Deploy Frontend Update
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://resistance-radio-website-dev-734110488556/ \
    --delete \
    --profile Personal_Account_734110488556

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id $(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Resistance Radio Station dev'].Id | [0]" --output text --profile Personal_Account_734110488556) \
    --paths "/*" \
    --profile Personal_Account_734110488556
```

## Troubleshooting

### "Access Denied" Errors
```bash
# Verify AWS credentials
aws sts get-caller-identity --profile Personal_Account_734110488556
```

### CloudFront Not Updating
```bash
# Clear cache
aws cloudfront create-invalidation \
    --distribution-id YOUR_DIST_ID \
    --paths "/*" \
    --profile Personal_Account_734110488556
```

### Can't Connect to Database
- Check security group allows your IP
- Verify RDS is publicly accessible
- Test connection from EC2 instance

### Backend Not Responding
```bash
# SSH to EC2
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@YOUR_EC2_IP

# Check PM2 status
pm2 status
pm2 logs

# Check Nginx
sudo systemctl status nginx
```

## Documentation

All documentation is in the `aws/` directory:
- **README.md** - Overview and quick start
- **DEPLOYMENT-GUIDE.md** - Comprehensive guide (50+ pages)
- **QUICK-START.md** - Quick reference

## Security Features

✅ All data encrypted at rest
✅ HTTPS enforced
✅ Security groups configured
✅ IAM roles follow least privilege
✅ Credentials in Secrets Manager
✅ Automated backups enabled
✅ Versioning on S3 buckets

## Ready to Deploy?

```bash
cd aws
./deploy-resistance-radio.sh dev
```

Then sit back and watch the magic happen! ✨

---

**Questions?** Check the documentation in `aws/DEPLOYMENT-GUIDE.md`

**Need help?** All scripts have detailed logging and error messages.

**Want to clean up?** See `aws/QUICK-START.md` for cleanup commands.
