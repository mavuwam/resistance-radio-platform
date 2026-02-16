# Resistance Radio Station - AWS Deployment Guide

## Overview

This guide covers the complete deployment of the Resistance Radio Station website to your AWS Personal Account (734110488556).

## Prerequisites

- AWS CLI configured with profile `Personal_Account_734110488556`
- Node.js 18+ installed
- PostgreSQL client installed (for database operations)
- Sufficient AWS permissions (root account access confirmed)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CloudFront CDN                        │
│              (Global Content Delivery)                   │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             │                            │
    ┌────────▼────────┐          ┌───────▼────────┐
    │   S3 Website    │          │   S3 Media     │
    │   (Frontend)    │          │   (Audio/Img)  │
    └─────────────────┘          └────────────────┘
                                          │
                                          │
                                 ┌────────▼────────┐
                                 │   EC2 Backend   │
                                 │   (Node.js API) │
                                 └────────┬────────┘
                                          │
                                 ┌────────▼────────┐
                                 │  RDS PostgreSQL │
                                 │   (Database)    │
                                 └─────────────────┘
```

## AWS Resources Created

### S3 Buckets
1. **Media Bucket**: `resistance-radio-media-{env}-734110488556`
   - Stores audio files, images, and media content
   - CORS enabled for cross-origin access
   - Versioning enabled
   - Lifecycle policy: Delete old versions after 90 days

2. **Website Bucket**: `resistance-radio-website-{env}-734110488556`
   - Hosts static frontend (React SPA)
   - Website hosting enabled
   - Served via CloudFront

3. **Backup Bucket**: `resistance-radio-backup-{env}-734110488556`
   - Stores database backups
   - Lifecycle policy: Delete backups after 30 days

### RDS Database
- **Engine**: PostgreSQL 14.10
- **Instance Class**: 
  - Dev: db.t3.micro
  - Prod: db.t3.small
- **Storage**: 
  - Dev: 20 GB
  - Prod: 50 GB
- **Backup Retention**: 
  - Dev: 3 days
  - Prod: 7 days
- **Encryption**: Enabled
- **Public Access**: Enabled (restrict in production)

### CloudFront Distribution
- **Origins**: 
  - S3 Website (frontend)
  - S3 Media (audio/images)
- **Cache Behaviors**: Optimized for static content
- **SSL**: CloudFront default certificate (upgrade to custom domain)
- **Error Pages**: SPA-friendly (404/403 → index.html)

### EC2 Instance
- **AMI**: Amazon Linux 2023
- **Instance Type**:
  - Dev: t3.micro
  - Prod: t3.small
- **Software**: Node.js 18, PM2, Nginx, PostgreSQL client
- **IAM Role**: Access to S3, Secrets Manager, CloudWatch
- **Security Group**: Ports 22, 80, 443, 5000

## Deployment Steps

### Quick Start (Automated)

```bash
# Navigate to aws directory
cd aws

# Run master deployment script
./deploy-resistance-radio.sh dev

# For production
./deploy-resistance-radio.sh prod
```

### Manual Step-by-Step Deployment

#### 1. Setup S3 Buckets

```bash
cd aws
./setup-s3-buckets.sh dev
```

This creates three S3 buckets with appropriate policies and configurations.

#### 2. Setup RDS Database

```bash
./setup-rds-database.sh dev
```

This creates:
- RDS PostgreSQL instance
- Security group
- DB subnet group
- Stores credentials in AWS Secrets Manager
- Creates `.env.dev` file in backend directory

**Note**: Database creation takes 5-10 minutes.

#### 3. Setup CloudFront CDN

```bash
./setup-cloudfront.sh dev
```

This creates:
- CloudFront distribution
- Origin Access Identity (OAI)
- Cache behaviors for website and media
- Custom error responses for SPA

**Note**: CloudFront deployment takes 15-20 minutes.

#### 4. Setup EC2 Backend

```bash
./setup-backend-ec2.sh dev
```

This creates:
- EC2 instance with Node.js environment
- Security group
- IAM role and instance profile
- SSH key pair
- Nginx reverse proxy configuration

#### 5. Deploy Application

```bash
./deploy-full-stack.sh dev
```

This:
- Builds backend and frontend
- Runs database migrations
- Deploys frontend to S3
- Invalidates CloudFront cache

## Post-Deployment Configuration

### 1. Deploy Backend Code to EC2

```bash
# Get EC2 public IP
EC2_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=resistance-radio-api-dev" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1)

# SSH into instance
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@${EC2_IP}

# On EC2 instance:
cd /opt/resistance-radio

# Clone repository or upload code
# Install dependencies
npm install

# Get database credentials from Secrets Manager
aws secretsmanager get-secret-value \
    --secret-id resistance-radio-db-credentials-dev \
    --query SecretString \
    --output text > .env

# Start application with PM2
pm2 start dist/index.js --name resistance-radio-api
pm2 save
pm2 startup
```

### 2. Configure Custom Domain

```bash
# Request SSL certificate in ACM
aws acm request-certificate \
    --domain-name resistanceradio.org \
    --subject-alternative-names www.resistanceradio.org api.resistanceradio.org \
    --validation-method DNS \
    --profile Personal_Account_734110488556 \
    --region us-east-1

# Update CloudFront distribution with custom domain
# Update Route 53 DNS records
```

### 3. Configure Email Service

#### Option A: AWS SES

```bash
# Verify domain
aws ses verify-domain-identity \
    --domain resistanceradio.org \
    --profile Personal_Account_734110488556 \
    --region us-east-1

# Request production access (if needed)
```

#### Option B: SendGrid

1. Sign up for SendGrid account
2. Create API key
3. Add to Secrets Manager:

```bash
aws secretsmanager create-secret \
    --name resistance-radio-sendgrid-key-dev \
    --secret-string '{"apiKey":"YOUR_SENDGRID_API_KEY"}' \
    --profile Personal_Account_734110488556 \
    --region us-east-1
```

### 4. Setup Monitoring

```bash
# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
    --alarm-name resistance-radio-high-cpu \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --profile Personal_Account_734110488556 \
    --region us-east-1

# Setup CloudWatch Logs for application
# Configure SNS for alerts
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DB_HOST=xxx.rds.amazonaws.com
DB_PORT=5432
DB_NAME=resistance_radio_dev
DB_USER=radio_admin
DB_PASSWORD=xxx

# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=734110488556
S3_MEDIA_BUCKET=resistance-radio-media-dev-734110488556
S3_BACKUP_BUCKET=resistance-radio-backup-dev-734110488556

# Application
NODE_ENV=development
PORT=5000
JWT_SECRET=xxx
SESSION_SECRET=xxx

# Email
SENDGRID_API_KEY=xxx
# OR
SES_REGION=us-east-1

# Frontend URL
FRONTEND_URL=https://xxx.cloudfront.net
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://api.resistanceradio.org
VITE_MEDIA_URL=https://xxx.cloudfront.net/media
VITE_ENVIRONMENT=production
```

## Database Management

### Run Migrations

```bash
cd backend
npm run migrate
```

### Create Backup

```bash
# Manual backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup.sql

# Upload to S3
aws s3 cp backup.sql s3://resistance-radio-backup-dev-734110488556/manual/backup-$(date +%Y%m%d).sql \
    --profile Personal_Account_734110488556
```

### Restore from Backup

```bash
# Download backup
aws s3 cp s3://resistance-radio-backup-dev-734110488556/manual/backup-20260211.sql backup.sql \
    --profile Personal_Account_734110488556

# Restore
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
```

## Troubleshooting

### CloudFront Not Serving Updated Content

```bash
# Invalidate cache
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Resistance Radio Station dev'].Id | [0]" \
    --output text \
    --profile Personal_Account_734110488556)

aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --profile Personal_Account_734110488556
```

### Database Connection Issues

```bash
# Check security group rules
# Verify RDS is publicly accessible
# Test connection from EC2
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### EC2 Backend Not Responding

```bash
# SSH into instance
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@$EC2_IP

# Check PM2 status
pm2 status
pm2 logs

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```

## Cost Estimation

### Monthly Costs (Development)

- RDS db.t3.micro: ~$15
- EC2 t3.micro: ~$8
- S3 storage (50GB): ~$1
- CloudFront (100GB transfer): ~$8
- Data transfer: ~$5
- **Total**: ~$37/month

### Monthly Costs (Production)

- RDS db.t3.small: ~$30
- EC2 t3.small: ~$15
- S3 storage (200GB): ~$5
- CloudFront (500GB transfer): ~$40
- Data transfer: ~$20
- **Total**: ~$110/month

## Security Checklist

- [ ] Restrict RDS security group to EC2 only
- [ ] Enable MFA on AWS account
- [ ] Rotate database passwords regularly
- [ ] Use AWS Secrets Manager for all credentials
- [ ] Enable CloudTrail for audit logging
- [ ] Configure WAF rules for CloudFront
- [ ] Set up VPC for production environment
- [ ] Enable GuardDuty for threat detection
- [ ] Regular security patches on EC2
- [ ] Implement least privilege IAM policies

## Maintenance

### Regular Tasks

- **Daily**: Monitor CloudWatch metrics
- **Weekly**: Review application logs
- **Monthly**: Review AWS costs, update dependencies
- **Quarterly**: Security audit, backup testing

## Support

For issues or questions:
- Check CloudWatch Logs
- Review deployment logs
- Contact AWS Support (if needed)

## Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
