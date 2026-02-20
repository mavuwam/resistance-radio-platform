# Admin Portal Only - Safe Deployment Guide

## Overview

This guide deploys ONLY the admin portal without touching the live public website. The public site at resistanceradiostation.org will remain completely unchanged.

## What Gets Deployed

✅ **New Infrastructure**:
- New S3 bucket: `zimbabwe-voice-admin`
- New CloudFront distribution for admin.resistanceradiostation.org
- New DNS record: admin.resistanceradiostation.org

✅ **Backend Update** (Safe - only adds CORS origin):
- Adds admin.resistanceradiostation.org to allowed origins
- Existing public site CORS remains unchanged

❌ **NOT Touched**:
- Public website S3 bucket
- Public CloudFront distribution
- Public website code
- Public DNS records

## Prerequisites

- AWS CLI configured with profile: `Personal_Account_734110488556`
- Access to DNS provider (to add CNAME record)
- GitHub repository access (for CI/CD setup)

## Step 1: Create Admin Infrastructure

### 1.1 Create Admin S3 Bucket

```bash
cd aws
./setup-admin-s3-bucket.sh
```

This creates a NEW bucket separate from the public site.

### 1.2 Create Admin CloudFront Distribution

```bash
./setup-admin-cloudfront.sh
```

**Note**: You'll need to request an SSL certificate for admin.resistanceradiostation.org in AWS Certificate Manager first.

To request certificate:
1. Go to AWS Certificate Manager (us-east-1 region)
2. Click "Request certificate"
3. Enter domain: `admin.resistanceradiostation.org`
4. Choose DNS validation
5. Add the CNAME record to your DNS
6. Wait for validation (5-30 minutes)
7. Copy the certificate ARN
8. Run the CloudFront script again with the ARN

### 1.3 Configure DNS

Add CNAME record in your DNS provider:

```
Type: CNAME
Name: admin
Value: [CloudFront domain from script output]
TTL: 300
```

## Step 2: Update Backend CORS (Safe)

The backend changes are already in the code. You just need to update the environment variable:

### Option A: Update Lambda Environment Variable (Recommended)

```bash
aws lambda update-function-configuration \
  --function-name ResistanceRadioAPI \
  --environment Variables="{
    ADMIN_FRONTEND_URL=https://admin.resistanceradiostation.org,
    FRONTEND_URL=https://resistanceradiostation.org,
    [... other existing variables ...]
  }" \
  --profile Personal_Account_734110488556
```

### Option B: Redeploy Backend

If you prefer to redeploy the backend:

1. Update `backend/.env` with:
   ```
   ADMIN_FRONTEND_URL=https://admin.resistanceradiostation.org
   ```

2. Deploy backend (this won't affect the public frontend)

## Step 3: Build and Deploy Admin App

### 3.1 Create Admin Environment File

Create `admin-frontend/.env.production`:

```bash
VITE_API_URL=https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev
VITE_ENVIRONMENT=production
```

### 3.2 Build Admin App

```bash
cd admin-frontend
npm run build
```

### 3.3 Deploy to S3

```bash
aws s3 sync dist/ s3://zimbabwe-voice-admin \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --profile Personal_Account_734110488556

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://zimbabwe-voice-admin/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html" \
  --profile Personal_Account_734110488556
```

### 3.4 Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id [ADMIN_DISTRIBUTION_ID] \
  --paths "/*" \
  --profile Personal_Account_734110488556
```

## Step 4: Test Admin Portal

1. Wait 5-10 minutes for CloudFront to deploy
2. Visit: https://admin.resistanceradiostation.org
3. Try logging in with admin credentials
4. Test creating/editing content
5. Verify API calls work

## Step 5: Set Up CI/CD (Optional)

To enable automatic deployments for admin changes:

### 5.1 Add GitHub Secrets

Only add these NEW secrets (don't touch existing ones):

```
ADMIN_DISTRIBUTION_ID=[from CloudFront setup]
ADMIN_SENTRY_DSN=[optional, for error tracking]
```

### 5.2 Update Deploy Workflow

The workflow is already created at `.github/workflows/deploy-admin.yml`. It will:
- Only trigger on changes to `admin-frontend/` or `shared/`
- NOT trigger on changes to `frontend/`
- Deploy only to admin S3 bucket

## Verification Checklist

After deployment, verify:

- [ ] Admin portal loads at https://admin.resistanceradiostation.org
- [ ] Login works
- [ ] Can view shows, episodes, articles, etc.
- [ ] Can create/edit content
- [ ] File uploads work
- [ ] Public site still works at https://resistanceradiostation.org (unchanged)

## Rollback Plan

If something goes wrong with the admin portal:

1. The public site is unaffected - it continues working
2. To rollback admin:
   ```bash
   # Delete admin CloudFront distribution
   aws cloudfront delete-distribution \
     --id [ADMIN_DISTRIBUTION_ID] \
     --profile Personal_Account_734110488556
   
   # Delete admin S3 bucket
   aws s3 rb s3://zimbabwe-voice-admin --force \
     --profile Personal_Account_734110488556
   ```

3. Remove DNS CNAME record for admin subdomain

## Troubleshooting

### Admin portal shows CORS errors

Check backend CORS configuration includes admin subdomain:
```bash
aws lambda get-function-configuration \
  --function-name ResistanceRadioAPI \
  --query 'Environment.Variables.ADMIN_FRONTEND_URL' \
  --profile Personal_Account_734110488556
```

### Admin portal shows 403 errors

Check CloudFront distribution is deployed:
```bash
aws cloudfront get-distribution \
  --id [ADMIN_DISTRIBUTION_ID] \
  --query 'Distribution.Status' \
  --profile Personal_Account_734110488556
```

### Can't access admin portal

1. Check DNS propagation: `nslookup admin.resistanceradiostation.org`
2. Check SSL certificate is validated
3. Check CloudFront distribution status

## Summary

This deployment:
- ✅ Creates NEW admin infrastructure
- ✅ Deploys admin portal to new subdomain
- ✅ Safely updates backend CORS
- ❌ Does NOT touch public website
- ❌ Does NOT modify public infrastructure
- ❌ Does NOT change public code

The public site at resistanceradiostation.org remains completely unchanged and unaffected.
