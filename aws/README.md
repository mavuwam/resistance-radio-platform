# Resistance Radio Station - AWS Deployment

## Overview

Complete AWS deployment configuration for the Resistance Radio Station website on your Personal AWS Account (734110488556).

## Files Created

### Configuration
- `resistance-radio-config.sh` - Central configuration for all deployment scripts
- `DEPLOYMENT-GUIDE.md` - Comprehensive deployment documentation
- `QUICK-START.md` - Quick reference for common tasks
- `README.md` - This file

### Deployment Scripts
- `deploy-resistance-radio.sh` - **Master deployment script** (run this first)
- `setup-s3-buckets.sh` - Creates S3 buckets for media, website, and backups
- `setup-rds-database.sh` - Creates PostgreSQL database
- `setup-cloudfront.sh` - Creates CloudFront CDN distribution
- `setup-backend-ec2.sh` - Creates EC2 instance for backend API
- `deploy-full-stack.sh` - Builds and deploys frontend and backend

## Quick Start

### Deploy Everything (Recommended)

```bash
cd aws
./deploy-resistance-radio.sh dev
```

This single command will:
1. ✅ Create all S3 buckets
2. ✅ Create RDS PostgreSQL database
3. ✅ Create CloudFront distribution
4. ✅ Create EC2 instance for backend
5. ✅ Deploy frontend to S3
6. ✅ Configure all security groups and IAM roles

**Time**: ~25-40 minutes

### Deploy Individual Components

```bash
# Just S3 buckets
./setup-s3-buckets.sh dev

# Just database
./setup-rds-database.sh dev

# Just CDN
./setup-cloudfront.sh dev

# Just backend server
./setup-backend-ec2.sh dev

# Just deploy application
./deploy-full-stack.sh dev
```

## AWS Resources

### Account Information
- **Account ID**: 734110488556
- **Profile**: Personal_Account_734110488556
- **Region**: us-east-1 (N. Virginia)

### Resources Created

| Type | Name | Purpose |
|------|------|---------|
| S3 | resistance-radio-media-{env}-734110488556 | Audio files, images |
| S3 | resistance-radio-website-{env}-734110488556 | Frontend static files |
| S3 | resistance-radio-backup-{env}-734110488556 | Database backups |
| RDS | resistance-radio-db-{env} | PostgreSQL 14.10 |
| EC2 | resistance-radio-api-{env} | Node.js backend |
| CloudFront | Distribution | Global CDN |
| Secrets Manager | resistance-radio-db-credentials-{env} | DB credentials |
| Security Groups | Multiple | Network security |
| IAM Roles | resistance-radio-ec2-role-{env} | EC2 permissions |

## Environments

The deployment supports three environments:

- **dev** - Development environment (default)
  - Smaller instances (t3.micro)
  - Lower costs (~$37/month)
  - Shorter backup retention

- **staging** - Staging environment
  - Medium instances
  - Production-like setup

- **prod** - Production environment
  - Larger instances (t3.small)
  - Higher costs (~$110/month)
  - Longer backup retention

## Architecture

```
Internet
   │
   ▼
CloudFront CDN (Global)
   │
   ├─────────────┬─────────────┐
   │             │             │
   ▼             ▼             ▼
S3 Website   S3 Media    EC2 Backend
(Frontend)   (Assets)    (Node.js API)
                              │
                              ▼
                         RDS PostgreSQL
                         (Database)
```

## Cost Breakdown

### Development Environment (~$37/month)
- RDS db.t3.micro: $15
- EC2 t3.micro: $8
- S3 storage: $1
- CloudFront: $8
- Data transfer: $5

### Production Environment (~$110/month)
- RDS db.t3.small: $30
- EC2 t3.small: $15
- S3 storage: $5
- CloudFront: $40
- Data transfer: $20

## Security Features

✅ All S3 buckets encrypted at rest (AES-256)
✅ RDS database encrypted
✅ HTTPS enforced via CloudFront
✅ Security groups restrict access
✅ IAM roles follow least privilege
✅ Credentials stored in Secrets Manager
✅ Versioning enabled on S3 buckets
✅ Automated backups configured

## Post-Deployment Tasks

After running the deployment script:

1. **Configure Custom Domain**
   - Request SSL certificate in ACM
   - Update CloudFront with custom domain
   - Configure Route 53 DNS

2. **Deploy Backend Code**
   - SSH to EC2 instance
   - Clone/upload application code
   - Install dependencies
   - Start with PM2

3. **Run Database Migrations**
   ```bash
   cd backend
   npm run migrate
   ```

4. **Configure Email Service**
   - Set up AWS SES or SendGrid
   - Add credentials to Secrets Manager

5. **Set Up Monitoring**
   - Configure CloudWatch alarms
   - Set up SNS notifications
   - Enable CloudWatch Logs

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

### SSH to Backend
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=resistance-radio-api-dev" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1)
```

### Deploy Frontend Update
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://resistance-radio-website-dev-734110488556/ \
    --delete \
    --profile Personal_Account_734110488556
```

## Documentation

- **QUICK-START.md** - Quick reference guide
- **DEPLOYMENT-GUIDE.md** - Comprehensive deployment documentation
- **AWS Console** - https://console.aws.amazon.com/

## Troubleshooting

### Deployment fails
- Check AWS CLI is configured: `aws sts get-caller-identity --profile Personal_Account_734110488556`
- Verify you have sufficient permissions
- Check AWS service limits

### Can't access website
- Wait for CloudFront deployment (15-20 minutes)
- Check CloudFront distribution status
- Verify S3 bucket has content

### Database connection issues
- Check security group rules
- Verify RDS is publicly accessible
- Test from EC2 instance first

### Backend not responding
- SSH to EC2 and check PM2: `pm2 status`
- Check nginx: `sudo systemctl status nginx`
- Review logs: `pm2 logs`

## Support

For detailed help, see:
- `DEPLOYMENT-GUIDE.md` - Full documentation
- `QUICK-START.md` - Common tasks
- AWS Documentation - https://docs.aws.amazon.com/

## Next Steps

1. Run the deployment: `./deploy-resistance-radio.sh dev`
2. Wait for completion (~25-40 minutes)
3. Follow post-deployment tasks
4. Test the application
5. Configure custom domain
6. Deploy to production when ready

---

**Ready to deploy?**

```bash
cd aws
./deploy-resistance-radio.sh dev
```
