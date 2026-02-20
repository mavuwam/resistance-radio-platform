# GitHub Secrets Configuration

This document lists all required GitHub secrets for the CI/CD pipelines.

## Required Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### AWS Credentials

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

**How to get**: Create an IAM user with S3 and CloudFront permissions, or use existing credentials.

### API Configuration

```
VITE_API_URL
```

**Value**: `https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev`

**Description**: Backend API endpoint (without /api suffix)

### CloudFront Distribution IDs

```
CLOUDFRONT_DISTRIBUTION_ID
```

**Value**: `EYKP4STY3RIHX` (public website)

**Description**: CloudFront distribution ID for public website

```
ADMIN_DISTRIBUTION_ID
```

**Value**: Get from CloudFront console after running `aws/setup-admin-cloudfront.sh`

**Description**: CloudFront distribution ID for admin portal

### Sentry Error Tracking

```
VITE_SENTRY_DSN
```

**Value**: Your Sentry DSN for public website

**Description**: Sentry error tracking for public frontend

```
ADMIN_SENTRY_DSN
```

**Value**: Your Sentry DSN for admin portal (can be same or different project)

**Description**: Sentry error tracking for admin frontend

## Verification

After adding all secrets, verify they are configured:

1. Go to Settings → Secrets and variables → Actions
2. You should see all 7 secrets listed
3. Test by triggering a workflow manually

## Security Notes

- Never commit secrets to the repository
- Rotate AWS credentials regularly
- Use separate Sentry projects for admin and public apps for better error isolation
- Limit IAM user permissions to only what's needed (S3, CloudFront)

## Troubleshooting

If deployments fail:

1. Check that all secrets are set correctly
2. Verify AWS credentials have necessary permissions
3. Ensure CloudFront distribution IDs are correct
4. Check GitHub Actions logs for specific errors
