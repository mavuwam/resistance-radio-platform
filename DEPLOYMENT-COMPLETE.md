# Resistance Radio Station - Deployment Complete! 🎉

## ✅ Infrastructure Successfully Deployed

Your Resistance Radio Station infrastructure is now live on AWS!

**Deployment Date**: February 11, 2026
**Environment**: Development
**AWS Account**: 734110488556
**Region**: us-east-1 (N. Virginia)

---

## 📦 Resources Created

### 1. S3 Buckets

| Bucket | Purpose | Status |
|--------|---------|--------|
| `resistance-radio-media-dev-734110488556` | Audio files & images | ✅ Created |
| `resistance-radio-website-dev-734110488556` | Frontend hosting | ✅ Created |
| `resistance-radio-backup-dev-734110488556` | Database backups | ✅ Created |

### 2. RDS PostgreSQL Database

- **Instance ID**: `resistance-radio-db-dev`
- **Engine**: PostgreSQL 14.20
- **Instance Class**: db.t3.micro
- **Storage**: 20 GB (encrypted)
- **Endpoint**: `resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com:5432`
- **Database**: `resistance_radio_dev`
- **Username**: `radio_admin`
- **Password**: Stored in AWS Secrets Manager
- **Secret Name**: `resistance-radio-db-credentials-dev`
- **Status**: ✅ Available

**Connection String**:
```
postgresql://radio_admin:ZiPXyCrvsnZwKZV4q80QyWkiA@resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com:5432/resistance_radio_dev
```

### 3. CloudFront CDN

- **Distribution ID**: `EYKP4STY3RIHX`
- **Domain**: `dxbqjcig99tjb.cloudfront.net`
- **Origin Access Identity**: `E3K5RFMI3L3LLQ`
- **Status**: ✅ Deployed
- **Website URL**: https://dxbqjcig99tjb.cloudfront.net

### 4. EC2 Backend Instance

- **Instance ID**: `i-07f7e8accc4b07682`
- **Instance Type**: t3.micro
- **AMI**: Amazon Linux 2023
- **Public IP**: `54.167.234.4`
- **Security Group**: `sg-0076f2d6b0057f2b3`
- **SSH Key**: `/Users/mavuwam/.ssh/resistance-radio-key-dev.pem`
- **Status**: ✅ Running

**SSH Command**:
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4
```

**API URL**: http://54.167.234.4

---

## ✅ HTTPS API Setup Complete

**API Endpoint**: https://api.resistanceradiostation.org
**SSL Certificate**: Let's Encrypt (expires May 15, 2026)
**Auto-renewal**: Enabled via certbot timer
**Status**: ✅ Operational

The backend API is now accessible via HTTPS with a valid SSL certificate. The frontend has been rebuilt and deployed with the new HTTPS API URL.

---

## 🚀 Next Steps

### 1. Deploy Backend Code to EC2

```bash
# SSH to EC2 instance
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4

# Once connected, navigate to app directory
cd /opt/resistance-radio

# Clone your repository
git clone YOUR_REPO_URL .

# Install dependencies
npm install

# Get database credentials from Secrets Manager
aws secretsmanager get-secret-value \
    --secret-id resistance-radio-db-credentials-dev \
    --query SecretString \
    --output text > .env

# Add additional environment variables
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
echo "NODE_ENV=development" >> .env
echo "PORT=5000" >> .env

# Build the backend
npm run build

# Run database migrations
npm run migrate

# Start with PM2
pm2 start dist/index.js --name resistance-radio-api
pm2 save
pm2 startup

# Verify it's running
pm2 status
curl http://localhost:5000/health
```

### 2. Build and Deploy Frontend

```bash
# On your local machine
cd frontend

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=http://54.167.234.4:5000
VITE_MEDIA_URL=https://dxbqjcig99tjb.cloudfront.net/media
VITE_ENVIRONMENT=development
EOF

# Build frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://resistance-radio-website-dev-734110488556/ \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --profile Personal_Account_734110488556

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://resistance-radio-website-dev-734110488556/index.html \
    --cache-control "no-cache" \
    --profile Personal_Account_734110488556

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id EYKP4STY3RIHX \
    --paths "/*" \
    --profile Personal_Account_734110488556
```

### 3. Access Your Website

Visit: https://dxbqjcig99tjb.cloudfront.net

**Note**: A placeholder "Coming Soon" page has been deployed. You'll see this until you deploy the full frontend application.

### 4. Configure Email Service (Optional)

Choose AWS SES or SendGrid for sending emails.

**AWS SES**:
```bash
aws ses verify-domain-identity \
    --domain resistanceradio.org \
    --profile Personal_Account_734110488556 \
    --region us-east-1
```

**SendGrid**:
1. Sign up at sendgrid.com
2. Create API key
3. Store in Secrets Manager:
```bash
aws secretsmanager create-secret \
    --name resistance-radio-sendgrid-key-dev \
    --secret-string '{"apiKey":"YOUR_SENDGRID_API_KEY"}' \
    --profile Personal_Account_734110488556 \
    --region us-east-1
```

### 5. Set Up Monitoring

```bash
# Create CloudWatch alarm for high CPU
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
    --dimensions Name=InstanceId,Value=i-07f7e8accc4b07682 \
    --profile Personal_Account_734110488556 \
    --region us-east-1
```

---

## 💰 Cost Estimate

**Monthly Costs (Development Environment)**:
- RDS db.t3.micro: ~$15
- EC2 t3.micro: ~$8
- S3 storage (50GB): ~$1
- CloudFront (100GB transfer): ~$8
- Data transfer: ~$5
- **Total**: ~$37/month

---

## 🔐 Security Credentials

### Database Credentials
Stored in AWS Secrets Manager: `resistance-radio-db-credentials-dev`

**Retrieve credentials**:
```bash
aws secretsmanager get-secret-value \
    --secret-id resistance-radio-db-credentials-dev \
    --query SecretString \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1 | jq .
```

### SSH Key
Location: `~/.ssh/resistance-radio-key-dev.pem`
Permissions: 400 (read-only for owner)

---

## 📊 Quick Access Commands

### Get Website URL
```bash
echo "https://dxbqjcig99tjb.cloudfront.net"
```

### Get API URL
```bash
echo "http://54.167.234.4"
```

### Get Database Endpoint
```bash
echo "resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com:5432"
```

### SSH to Backend
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4
```

### Check EC2 Status
```bash
aws ec2 describe-instances \
    --instance-ids i-07f7e8accc4b07682 \
    --query 'Reservations[0].Instances[0].State.Name' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1
```

### Check RDS Status
```bash
aws rds describe-db-instances \
    --db-instance-identifier resistance-radio-db-dev \
    --query 'DBInstances[0].DBInstanceStatus' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1
```

---

## 🛠️ Troubleshooting

### Can't SSH to EC2
```bash
# Check instance is running
aws ec2 describe-instances --instance-ids i-07f7e8accc4b07682 \
    --profile Personal_Account_734110488556 --region us-east-1

# Verify key permissions
chmod 400 ~/.ssh/resistance-radio-key-dev.pem

# Check security group allows SSH from your IP
```

### Can't Connect to Database
```bash
# Test from EC2 instance
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4
psql -h resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com \
     -U radio_admin -d resistance_radio_dev
```

### Website Not Loading
```bash
# Check CloudFront distribution status
aws cloudfront get-distribution \
    --id EYKP4STY3RIHX \
    --query 'Distribution.Status' \
    --output text \
    --profile Personal_Account_734110488556

# Invalidate cache
aws cloudfront create-invalidation \
    --distribution-id EYKP4STY3RIHX \
    --paths "/*" \
    --profile Personal_Account_734110488556
```

---

## 📚 Documentation

- **DEPLOYMENT-GUIDE.md** - Comprehensive deployment guide
- **QUICK-START.md** - Quick reference for common tasks
- **DEPLOYMENT-CHECKLIST.md** - Step-by-step checklist
- **aws/README.md** - AWS deployment overview

---

## 🎯 What's Next?

1. ✅ Infrastructure deployed
2. ⏳ Deploy backend code to EC2
3. ⏳ Build and deploy frontend
4. ⏳ Configure custom domain
5. ⏳ Set up email service
6. ⏳ Configure monitoring
7. ⏳ Add content (shows, episodes, articles)
8. ⏳ Test all functionality
9. ⏳ Deploy to production

---

## 🆘 Need Help?

- Check the documentation in `aws/DEPLOYMENT-GUIDE.md`
- Review logs on EC2: `pm2 logs`
- Check CloudWatch Logs
- AWS Support: https://console.aws.amazon.com/support/

---

**Congratulations! Your Resistance Radio Station infrastructure is live!** 🎉

Next step: Deploy your backend code to EC2 and build the frontend.
