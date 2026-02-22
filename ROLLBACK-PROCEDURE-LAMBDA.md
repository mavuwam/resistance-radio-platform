# Lambda Migration Rollback Procedure

## When to Rollback

Execute rollback if any of the following occur:

- Error rate exceeds 5%
- Response times increase by >50% compared to EC2
- Critical functionality is broken
- Database connection issues
- User-reported critical bugs
- Lambda costs significantly exceed estimates

## Rollback Overview

**Estimated Time:** 10 minutes  
**EC2 Fallback:** Instance `i-07f7e8accc4b07682` (currently running)  
**EC2 Endpoint:** `https://api.resistanceradiostation.org/api`

## Method 1: Automated Rollback via CI/CD (Recommended)

### Step 1: Update Environment File

```bash
# Edit frontend/.env.production
# Change from Lambda endpoint to EC2 endpoint
```

Update the file to:
```env
# Production API URL - EC2 Backend (ROLLBACK)
VITE_API_URL=https://api.resistanceradiostation.org/api
```

### Step 2: Commit and Push

```bash
git add frontend/.env.production
git commit -m "ROLLBACK: Revert to EC2 backend endpoint

- Reverting from Lambda to EC2 due to [REASON]
- EC2 endpoint: https://api.resistanceradiostation.org/api
- Lambda endpoint was: https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev/api
- Rollback initiated: [DATE/TIME]"

git push origin main
```

### Step 3: Monitor Pipeline

1. Watch CodePipeline execution in AWS Console
2. Verify CodeBuild completes successfully (~3-5 minutes)
3. Confirm S3 deployment
4. Wait for CloudFront invalidation (~5-10 minutes)

### Step 4: Verify Rollback

```bash
# Check production website
curl -I https://resistanceradiostation.org

# Verify requests go to EC2 (check browser network tab)
# Should see requests to api.resistanceradiostation.org
```

### Step 5: Test Functionality

- Load homepage
- Browse shows and episodes
- Read articles
- Test events and resources
- Verify admin login works
- Check error rates return to normal

### Step 6: Document Rollback

Record in `LAMBDA-MIGRATION-COMPLETE.md`:
- Rollback timestamp
- Reason for rollback
- Issues encountered with Lambda
- Next steps for remediation

## Method 2: Manual Rollback (If Pipeline Unavailable)

### Step 1: Build Frontend Locally

```bash
cd frontend

# Create production environment file with EC2 endpoint
echo "VITE_API_URL=https://api.resistanceradiostation.org/api" > .env.production

# Build frontend
npm run build
```

### Step 2: Upload to S3

```bash
# Sync build to S3 bucket
aws s3 sync dist/ s3://resistance-radio-website-dev-734110488556/ --delete

# Verify upload
aws s3 ls s3://resistance-radio-website-dev-734110488556/
```

### Step 3: Invalidate CloudFront Cache

```bash
# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id EYKP4STY3RIHX \
  --paths "/*"

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id EYKP4STY3RIHX \
  --id [INVALIDATION_ID]
```

### Step 4: Verify Rollback

```bash
# Wait 5-10 minutes for CloudFront propagation
# Then test production website
curl https://resistanceradiostation.org

# Check that EC2 endpoint is being used
```

### Step 5: Commit Changes to Git

```bash
# After manual rollback, commit the environment file change
git add frontend/.env.production
git commit -m "ROLLBACK: Manual revert to EC2 backend endpoint"
git push origin main
```

## Method 3: Emergency DNS Rollback (Last Resort)

If both methods above fail, update DNS to point directly to EC2:

1. Access DNS provider (e.g., Route 53, Cloudflare)
2. Update `api.resistanceradiostation.org` A record to EC2 IP
3. Wait for DNS propagation (5-30 minutes)
4. Verify traffic routes to EC2

**Note:** This method is not recommended as it bypasses CloudFront and may impact performance.

## Post-Rollback Actions

### Immediate
1. ✅ Verify all functionality restored
2. ✅ Confirm error rates return to normal
3. ✅ Check response times are acceptable
4. ✅ Monitor user feedback

### Short-term
1. Investigate root cause of Lambda issues
2. Document lessons learned
3. Plan remediation steps
4. Test fixes in staging environment
5. Schedule retry of Lambda migration

### Communication
1. Notify stakeholders of rollback
2. Provide status updates
3. Share timeline for resolution
4. Document incident report

## Rollback Verification Checklist

- [ ] Production website loads correctly
- [ ] API requests go to EC2 endpoint (verify in browser network tab)
- [ ] Shows page displays content
- [ ] Articles page displays content
- [ ] Episodes page works
- [ ] Events page works
- [ ] Resources page works
- [ ] Admin login functions
- [ ] Admin dashboard loads
- [ ] Content management works
- [ ] Error rate < 1%
- [ ] Response times normal
- [ ] No user complaints

## Troubleshooting

### Issue: CloudFront Still Serves Old Content

**Solution:**
```bash
# Force invalidation of all paths
aws cloudfront create-invalidation \
  --distribution-id EYKP4STY3RIHX \
  --paths "/*"

# Wait 10-15 minutes
# Clear browser cache
# Test in incognito mode
```

### Issue: Pipeline Fails to Deploy

**Solution:**
- Use Method 2 (Manual Rollback)
- Check CodeBuild logs for errors
- Verify IAM permissions
- Check S3 bucket access

### Issue: EC2 Instance Not Responding

**Solution:**
```bash
# Check EC2 instance status
aws ec2 describe-instances --instance-ids i-07f7e8accc4b07682

# If stopped, start it
aws ec2 start-instances --instance-ids i-07f7e8accc4b07682

# Wait 2-3 minutes for startup
# SSH to instance and check backend service
ssh ec2-user@[EC2_IP]
pm2 status
pm2 restart resistance-radio-backend
```

### Issue: Database Connection Problems

**Solution:**
- Verify RDS instance is running
- Check security group rules
- Verify database credentials
- Test connection from EC2 instance

## Prevention for Next Attempt

Before retrying Lambda migration:

1. **Test in staging environment first**
2. **Implement gradual rollout** (e.g., 10% traffic to Lambda)
3. **Set up comprehensive monitoring** (CloudWatch alarms)
4. **Define clear success metrics**
5. **Have automated rollback triggers**
6. **Schedule during low-traffic period**
7. **Have team available for monitoring**

## Contact Information

**AWS Console:** https://console.aws.amazon.com/  
**CloudWatch Logs:** `/aws/lambda/ResistanceRadio-API-dev`  
**Sentry Dashboard:** [Your Sentry URL]  
**EC2 Instance:** `i-07f7e8accc4b07682`

---

**Last Updated:** February 22, 2026  
**Rollback Tested:** No (to be tested if needed)  
**Estimated Rollback Time:** 10 minutes
