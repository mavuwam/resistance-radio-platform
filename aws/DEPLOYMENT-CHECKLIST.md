# Resistance Radio Station - Deployment Checklist

## Pre-Deployment Checklist

- [x] AWS CLI configured with Personal_Account_734110488556 profile
- [x] AWS account verified (734110488556)
- [x] Deployment scripts created and executable
- [x] Documentation prepared
- [ ] Review estimated costs (~$37/month for dev)
- [ ] Confirm deployment environment (dev/staging/prod)

## Deployment Checklist

### Phase 1: Run Deployment Script

- [ ] Navigate to aws directory: `cd aws`
- [ ] Run deployment: `./deploy-resistance-radio.sh dev`
- [ ] Monitor deployment progress (25-40 minutes)
- [ ] Note down CloudFront URL from output
- [ ] Note down EC2 IP address from output
- [ ] Note down RDS endpoint from output
- [ ] Save SSH key location: `~/.ssh/resistance-radio-key-dev.pem`

### Phase 2: Verify Infrastructure

- [ ] Check S3 buckets created:
  ```bash
  aws s3 ls --profile Personal_Account_734110488556 | grep resistance-radio
  ```

- [ ] Check RDS database running:
  ```bash
  aws rds describe-db-instances \
      --db-instance-identifier resistance-radio-db-dev \
      --profile Personal_Account_734110488556 \
      --region us-east-1
  ```

- [ ] Check EC2 instance running:
  ```bash
  aws ec2 describe-instances \
      --filters "Name=tag:Name,Values=resistance-radio-api-dev" \
      --profile Personal_Account_734110488556 \
      --region us-east-1
  ```

- [ ] Check CloudFront distribution deployed:
  ```bash
  aws cloudfront list-distributions \
      --query "DistributionList.Items[?Comment=='Resistance Radio Station dev']" \
      --profile Personal_Account_734110488556
  ```

### Phase 3: Deploy Backend Code

- [ ] SSH to EC2 instance:
  ```bash
  ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@YOUR_EC2_IP
  ```

- [ ] Navigate to app directory:
  ```bash
  cd /opt/resistance-radio
  ```

- [ ] Clone/upload your code:
  ```bash
  git clone YOUR_REPO_URL .
  # OR upload via scp
  ```

- [ ] Install dependencies:
  ```bash
  npm install
  ```

- [ ] Get database credentials:
  ```bash
  aws secretsmanager get-secret-value \
      --secret-id resistance-radio-db-credentials-dev \
      --query SecretString \
      --output text > .env
  ```

- [ ] Add additional environment variables to .env:
  ```bash
  echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
  echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
  ```

- [ ] Build backend:
  ```bash
  npm run build
  ```

- [ ] Run database migrations:
  ```bash
  npm run migrate
  ```

- [ ] Start with PM2:
  ```bash
  pm2 start dist/index.js --name resistance-radio-api
  pm2 save
  pm2 startup
  ```

- [ ] Verify backend is running:
  ```bash
  curl http://localhost:5000/health
  ```

### Phase 4: Test Application

- [ ] Access website via CloudFront URL
- [ ] Verify homepage loads
- [ ] Test navigation menu
- [ ] Check API connectivity
- [ ] Test audio player (if content available)
- [ ] Test form submissions
- [ ] Verify responsive design on mobile

### Phase 5: Configure Custom Domain (Optional)

- [ ] Purchase/configure domain name
- [ ] Request SSL certificate in ACM:
  ```bash
  aws acm request-certificate \
      --domain-name resistanceradio.org \
      --subject-alternative-names www.resistanceradio.org api.resistanceradio.org \
      --validation-method DNS \
      --profile Personal_Account_734110488556 \
      --region us-east-1
  ```

- [ ] Add DNS validation records
- [ ] Wait for certificate validation
- [ ] Update CloudFront distribution with custom domain
- [ ] Configure Route 53 DNS records
- [ ] Test custom domain access

### Phase 6: Configure Email Service

#### Option A: AWS SES

- [ ] Verify domain in SES:
  ```bash
  aws ses verify-domain-identity \
      --domain resistanceradio.org \
      --profile Personal_Account_734110488556 \
      --region us-east-1
  ```

- [ ] Add DNS records for verification
- [ ] Request production access (if needed)
- [ ] Configure SES in backend .env

#### Option B: SendGrid

- [ ] Sign up for SendGrid account
- [ ] Create API key
- [ ] Store in Secrets Manager:
  ```bash
  aws secretsmanager create-secret \
      --name resistance-radio-sendgrid-key-dev \
      --secret-string '{"apiKey":"YOUR_KEY"}' \
      --profile Personal_Account_734110488556 \
      --region us-east-1
  ```

- [ ] Configure SendGrid in backend .env

### Phase 7: Set Up Monitoring

- [ ] Create CloudWatch alarm for high CPU:
  ```bash
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
  ```

- [ ] Create alarm for database connections
- [ ] Create alarm for disk space
- [ ] Set up SNS topic for notifications
- [ ] Configure CloudWatch Logs for application
- [ ] Set up log retention policies

### Phase 8: Security Hardening

- [ ] Restrict RDS security group to EC2 only
- [ ] Enable MFA on AWS account
- [ ] Review IAM policies
- [ ] Enable CloudTrail logging
- [ ] Configure AWS Config rules
- [ ] Set up GuardDuty
- [ ] Review S3 bucket policies
- [ ] Enable VPC Flow Logs

### Phase 9: Backup Configuration

- [ ] Verify RDS automated backups enabled
- [ ] Test database backup:
  ```bash
  aws rds create-db-snapshot \
      --db-instance-identifier resistance-radio-db-dev \
      --db-snapshot-identifier resistance-radio-manual-backup-$(date +%Y%m%d) \
      --profile Personal_Account_734110488556 \
      --region us-east-1
  ```

- [ ] Configure S3 lifecycle policies
- [ ] Test backup restoration process
- [ ] Document backup procedures

### Phase 10: Documentation

- [ ] Document custom domain configuration
- [ ] Document email service setup
- [ ] Document monitoring setup
- [ ] Create runbook for common issues
- [ ] Document deployment process
- [ ] Create disaster recovery plan

## Post-Deployment Checklist

- [ ] All services running and accessible
- [ ] Monitoring and alerts configured
- [ ] Backups verified
- [ ] Security hardening complete
- [ ] Documentation updated
- [ ] Team trained on deployment process
- [ ] Incident response plan in place

## Production Deployment Checklist

Before deploying to production:

- [ ] All dev/staging testing complete
- [ ] Performance testing done
- [ ] Security audit completed
- [ ] Backup and recovery tested
- [ ] Monitoring and alerts configured
- [ ] Custom domain configured
- [ ] SSL certificate installed
- [ ] Email service configured and tested
- [ ] Content uploaded and verified
- [ ] Legal pages reviewed
- [ ] Privacy policy updated
- [ ] Terms of service finalized
- [ ] Launch plan documented
- [ ] Rollback plan prepared
- [ ] Team briefed on launch

## Ongoing Maintenance Checklist

### Daily
- [ ] Check CloudWatch metrics
- [ ] Review application logs
- [ ] Monitor error rates

### Weekly
- [ ] Review AWS costs
- [ ] Check backup status
- [ ] Review security alerts
- [ ] Update content as needed

### Monthly
- [ ] Update dependencies
- [ ] Review and optimize costs
- [ ] Security patch updates
- [ ] Performance optimization review

### Quarterly
- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Capacity planning review
- [ ] Documentation update

## Emergency Contacts

- AWS Support: https://console.aws.amazon.com/support/
- Account ID: 734110488556
- Region: us-east-1

## Useful Commands Reference

### Get all resource information
```bash
# Website URL
aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Resistance Radio Station dev'].DomainName | [0]" \
    --output text \
    --profile Personal_Account_734110488556

# EC2 IP
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=resistance-radio-api-dev" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1

# Database endpoint
aws rds describe-db-instances \
    --db-instance-identifier resistance-radio-db-dev \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1

# Database credentials
aws secretsmanager get-secret-value \
    --secret-id resistance-radio-db-credentials-dev \
    --query SecretString \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1 | jq .
```

---

**Status**: Ready for deployment
**Last Updated**: $(date)
**Environment**: Development
