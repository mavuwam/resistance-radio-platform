# Resistance Radio Station - Quick Start

## One-Command Deployment

```bash
cd aws
./deploy-resistance-radio.sh dev
```

## What Gets Created

| Resource | Name | Purpose |
|----------|------|---------|
| S3 Bucket | `resistance-radio-media-dev-734110488556` | Audio files & images |
| S3 Bucket | `resistance-radio-website-dev-734110488556` | Frontend hosting |
| S3 Bucket | `resistance-radio-backup-dev-734110488556` | Database backups |
| RDS Instance | `resistance-radio-db-dev` | PostgreSQL database |
| EC2 Instance | `resistance-radio-api-dev` | Backend API server |
| CloudFront | Distribution | CDN for global delivery |
| Secrets Manager | `resistance-radio-db-credentials-dev` | Database credentials |

## Access Your Deployment

### Get Website URL
```bash
aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Resistance Radio Station dev'].DomainName | [0]" \
    --output text \
    --profile Personal_Account_734110488556
```

### Get API Server IP
```bash
aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=resistance-radio-api-dev" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1
```

### Get Database Endpoint
```bash
aws rds describe-db-instances \
    --db-instance-identifier resistance-radio-db-dev \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1
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

## SSH to Backend Server

```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=resistance-radio-api-dev" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text \
    --profile Personal_Account_734110488556 \
    --region us-east-1)
```

## Deploy Updates

### Frontend Only
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

### Backend Only
```bash
# SSH to EC2 and pull latest code
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@$EC2_IP
cd /opt/resistance-radio
git pull
npm install
npm run build
pm2 restart resistance-radio-api
```

## Cleanup (Delete Everything)

```bash
# Delete CloudFront distribution (must disable first)
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Resistance Radio Station dev'].Id | [0]" --output text --profile Personal_Account_734110488556)
aws cloudfront get-distribution-config --id $DIST_ID --profile Personal_Account_734110488556 > dist-config.json
# Edit dist-config.json to set Enabled: false
aws cloudfront update-distribution --id $DIST_ID --if-match $(jq -r .ETag dist-config.json) --distribution-config file://dist-config.json --profile Personal_Account_734110488556
aws cloudfront delete-distribution --id $DIST_ID --if-match $(aws cloudfront get-distribution --id $DIST_ID --query 'ETag' --output text --profile Personal_Account_734110488556) --profile Personal_Account_734110488556

# Delete EC2 instance
aws ec2 terminate-instances --instance-ids $(aws ec2 describe-instances --filters "Name=tag:Name,Values=resistance-radio-api-dev" --query 'Reservations[0].Instances[0].InstanceId' --output text --profile Personal_Account_734110488556 --region us-east-1) --profile Personal_Account_734110488556 --region us-east-1

# Delete RDS instance
aws rds delete-db-instance --db-instance-identifier resistance-radio-db-dev --skip-final-snapshot --profile Personal_Account_734110488556 --region us-east-1

# Delete S3 buckets (must empty first)
aws s3 rm s3://resistance-radio-media-dev-734110488556 --recursive --profile Personal_Account_734110488556
aws s3 rb s3://resistance-radio-media-dev-734110488556 --profile Personal_Account_734110488556

aws s3 rm s3://resistance-radio-website-dev-734110488556 --recursive --profile Personal_Account_734110488556
aws s3 rb s3://resistance-radio-website-dev-734110488556 --profile Personal_Account_734110488556

aws s3 rm s3://resistance-radio-backup-dev-734110488556 --recursive --profile Personal_Account_734110488556
aws s3 rb s3://resistance-radio-backup-dev-734110488556 --profile Personal_Account_734110488556

# Delete secrets
aws secretsmanager delete-secret --secret-id resistance-radio-db-credentials-dev --force-delete-without-recovery --profile Personal_Account_734110488556 --region us-east-1
```

## Estimated Deployment Time

- S3 Buckets: 1-2 minutes
- RDS Database: 5-10 minutes
- CloudFront: 15-20 minutes
- EC2 Instance: 3-5 minutes
- **Total**: ~25-40 minutes

## Next Steps After Deployment

1. ✅ Configure custom domain
2. ✅ Set up SSL certificate
3. ✅ Deploy backend code to EC2
4. ✅ Run database migrations
5. ✅ Configure email service (SES/SendGrid)
6. ✅ Set up monitoring and alerts
7. ✅ Test all functionality
8. ✅ Configure backups

## Troubleshooting

### "Access Denied" errors
```bash
# Verify AWS profile
aws sts get-caller-identity --profile Personal_Account_734110488556
```

### CloudFront not updating
```bash
# Clear cache
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*" --profile Personal_Account_734110488556
```

### Can't connect to database
```bash
# Check security group allows your IP
# Verify RDS is publicly accessible
# Test from EC2 instance
```

## Support

See `DEPLOYMENT-GUIDE.md` for detailed documentation.
