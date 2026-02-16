# Multi-Environment Deployment System

Automated AWS deployment system for testing multiple frontend theme variations of the Zimbabwe Voice platform. This system creates isolated test environments (S3 + CloudFront) for each theme, enabling side-by-side comparison without affecting production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Workflow Overview](#workflow-overview)
- [Detailed Usage](#detailed-usage)
- [Cost Information](#cost-information)
- [Troubleshooting](#troubleshooting)
- [Safety Features](#safety-features)

## Prerequisites

Before using these deployment scripts, ensure you have:

### Required Tools

1. **AWS CLI** (version 2.x or later)
   ```bash
   # Check if installed
   aws --version
   
   # Install on macOS
   brew install awscli
   
   # Install on Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

2. **jq** (JSON processor)
   ```bash
   # Check if installed
   jq --version
   
   # Install on macOS
   brew install jq
   
   # Install on Linux
   sudo apt-get install jq  # Debian/Ubuntu
   sudo yum install jq      # RHEL/CentOS
   ```

### AWS Configuration

1. **Configure AWS Profile**
   ```bash
   aws configure --profile Personal_Account_734110488556
   ```
   
   You'll be prompted for:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `us-east-1`
   - Default output format: `json`

2. **Verify Credentials**
   ```bash
   aws sts get-caller-identity --profile Personal_Account_734110488556
   ```

### Required Permissions

Your AWS user/role needs the following permissions:
- S3: `CreateBucket`, `DeleteBucket`, `PutObject`, `DeleteObject`, `PutBucketPolicy`, `PutBucketWebsite`
- CloudFront: `CreateDistribution`, `GetDistribution`, `UpdateDistribution`, `DeleteDistribution`, `CreateInvalidation`
- IAM: `GetUser` (for credential validation)

## Quick Start

```bash
# 1. Navigate to deployment directory
cd aws/deployment

# 2. Create test infrastructure (S3 buckets + CloudFront distributions)
./setup-test-environments.sh

# 3. Build all theme variations
cd ../..
npm run build:all-themes

# 4. Deploy all themes to test environments
cd aws/deployment
./deploy-all-themes.sh

# 5. Visit the CloudFront URLs to test each theme
# URLs are displayed after deployment and saved in test-urls.txt

# 6. Clean up when done (removes all test resources)
./cleanup-test-environments.sh
```

## Workflow Overview

The deployment system follows a four-phase workflow:

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 1: Setup                            │
│  Creates AWS infrastructure for all test environments        │
│  • 5 S3 buckets (one per theme)                             │
│  • 5 CloudFront distributions (one per theme)               │
│  • Bucket policies and website hosting configuration        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Phase 2: Build                            │
│  Builds all theme variations locally                         │
│  • Creates frontend/dist-{theme-name}/ directories          │
│  • Each build contains complete static site                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Phase 3: Deploy                           │
│  Uploads theme builds to S3 and invalidates CloudFront      │
│  • Syncs files to S3 with correct content-types            │
│  • Invalidates CloudFront cache for fresh content          │
│  • Validates deployment success                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Phase 4: Test                             │
│  Visit CloudFront URLs to compare themes                     │
│  • Each theme accessible at unique CloudFront URL           │
│  • Test functionality, design, and user experience          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Phase 5: Cleanup                          │
│  Removes all test infrastructure to stop costs              │
│  • Empties and deletes S3 buckets                           │
│  • Disables and deletes CloudFront distributions            │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Usage

### Configuration

All deployment settings are in `config.json`:

```json
{
  "aws": {
    "profile": "Personal_Account_734110488556",
    "region": "us-east-1"
  },
  "naming": {
    "prefix": "zv-test",
    "production_bucket": "resistance-radio-website-dev-734110488556",
    "production_cloudfront": "EYKP4STY3RIHX"
  },
  "themes": [
    {
      "name": "engagement-centric",
      "buildDir": "frontend/dist-engagement-centric"
    },
    // ... more themes
  ]
}
```

**Key Configuration Fields:**
- `aws.profile`: AWS CLI profile name (must be configured)
- `aws.region`: AWS region for all resources (us-east-1)
- `naming.prefix`: Prefix for test resource names (zv-test)
- `naming.production_bucket`: Production S3 bucket (PROTECTED)
- `naming.production_cloudfront`: Production CloudFront ID (PROTECTED)
- `themes`: Array of theme definitions with names and build directories

### Setup Infrastructure

Creates all AWS resources needed for test environments.

```bash
./setup-test-environments.sh
```

**What it does:**
1. Validates configuration and AWS credentials
2. Creates 5 S3 buckets with static website hosting enabled
3. Configures bucket policies for public read access
4. Creates 5 CloudFront distributions pointing to S3 buckets
5. Waits for CloudFront distributions to deploy (can take 15-20 minutes)
6. Saves CloudFront URLs to `test-urls.txt`

**Output:**
```
=========================================
  Setup Test Environments
=========================================

✓ Configuration loaded successfully
✓ AWS credentials validated

=========================================
  Setting up: engagement-centric
=========================================
✓ Created S3 bucket: zv-test-engagement-centric
✓ Configured bucket policy for: zv-test-engagement-centric
✓ Created CloudFront distribution: E1ABC2DEF3GHIJ

[... similar output for other themes ...]

=========================================
  Test Environment URLs
=========================================

engagement-centric: https://d1abc2def3ghij.cloudfront.net
informational-hub: https://d2abc3def4ghij.cloudfront.net
multimedia-experience: https://d3abc4def5ghij.cloudfront.net
community-driven: https://d4abc5def6ghij.cloudfront.net
accessible-responsive: https://d5abc6def7ghij.cloudfront.net

✓ Setup complete! URLs saved to: test-urls.txt
```

**Notes:**
- Script is idempotent - safe to run multiple times
- Skips resources that already exist
- CloudFront deployment can take 15-20 minutes

### Deploy Single Theme

Deploys one theme to its test environment.

```bash
./deploy-theme.sh <theme-name>

# Examples:
./deploy-theme.sh engagement-centric
./deploy-theme.sh community-driven
```

**What it does:**
1. Validates theme name and build directory
2. Checks that S3 bucket and CloudFront distribution exist
3. Uploads all files from build directory to S3
4. Sets appropriate content-type headers (HTML, CSS, JS, images)
5. Creates CloudFront cache invalidation
6. Validates deployment success
7. Outputs CloudFront URL

**Output:**
```
=========================================
  Deploy Theme: engagement-centric
=========================================

✓ Configuration loaded successfully
✓ AWS credentials validated
✓ Theme found: engagement-centric -> /path/to/frontend/dist-engagement-centric
✓ Build directory validated
✓ Target bucket found: zv-test-engagement-centric
✓ CloudFront distribution found: E1ABC2DEF3GHIJ
✓ Files uploaded successfully
✓ Deployment validation passed
✓ Cache invalidation created: I1ABC2DEF3GHIJ
✓ Cache invalidation completed

=========================================
  Deployment Complete!
=========================================

✓ Theme 'engagement-centric' deployed successfully

CloudFront URL: https://d1abc2def3ghij.cloudfront.net

ℹ The site should be accessible within a few minutes
ℹ Cache invalidation may take up to 15 minutes to fully propagate
```

**Common Use Cases:**
- Deploy a single theme after making changes
- Redeploy a theme that failed during batch deployment
- Update one theme without affecting others

### Deploy All Themes

Deploys all themes to their test environments in sequence.

```bash
./deploy-all-themes.sh
```

**What it does:**
1. Validates configuration and AWS credentials
2. Deploys each theme sequentially using `deploy-theme.sh`
3. Continues deploying remaining themes if one fails
4. Collects all CloudFront URLs
5. Displays summary of successful and failed deployments

**Output:**
```
=========================================
  Deploy All Themes
=========================================

✓ Configuration loaded successfully
✓ AWS credentials validated
ℹ Found 5 theme(s) to deploy

[... deployment output for each theme ...]

=========================================
  Deployment Summary
=========================================

✓ Successfully deployed 5 theme(s):

  ✓ engagement-centric
    URL: https://d1abc2def3ghij.cloudfront.net

  ✓ informational-hub
    URL: https://d2abc3def4ghij.cloudfront.net

  ✓ multimedia-experience
    URL: https://d3abc4def5ghij.cloudfront.net

  ✓ community-driven
    URL: https://d4abc5def6ghij.cloudfront.net

  ✓ accessible-responsive
    URL: https://d5abc6def7ghij.cloudfront.net

=========================================
  Total: 5 themes
  Success: 5
  Failed: 0
=========================================
```

**Error Handling:**
- If a theme fails, deployment continues with remaining themes
- Failed themes are listed in the summary
- Exit code is non-zero if any deployment failed
- Retry failed themes individually with `deploy-theme.sh`

### Cleanup Infrastructure

Removes all test infrastructure to stop AWS costs.

```bash
./cleanup-test-environments.sh

# Dry-run mode (see what would be deleted without deleting)
./cleanup-test-environments.sh --dry-run
```

**What it does:**
1. Lists all test S3 buckets (matching naming pattern)
2. Lists all test CloudFront distributions (by comment/tags)
3. Confirms deletion with user (unless --dry-run)
4. Empties all S3 buckets (deletes all objects)
5. Deletes all S3 buckets
6. Disables all CloudFront distributions
7. Waits for distributions to be disabled (can take 10-15 minutes)
8. Deletes all CloudFront distributions

**Output:**
```
=========================================
Test Environment Cleanup
=========================================

✓ Configuration loaded successfully

Production resources (PROTECTED):
  - Bucket: resistance-radio-website-dev-734110488556
  - CloudFront: EYKP4STY3RIHX

ℹ Finding test S3 buckets...
Test buckets found:
  - zv-test-engagement-centric
  - zv-test-informational-hub
  - zv-test-multimedia-experience
  - zv-test-community-driven
  - zv-test-accessible-responsive

ℹ Finding test CloudFront distributions...
Test distributions found:
  - E1ABC2DEF3GHIJ
  - E2ABC3DEF4GHIJ
  - E3ABC4DEF5GHIJ
  - E4ABC5DEF6GHIJ
  - E5ABC6DEF7GHIJ

Are you sure you want to delete all test resources? (yes/no): yes

=========================================
Deleting S3 Buckets
=========================================

✓ Bucket emptied: zv-test-engagement-centric
✓ Bucket deleted: zv-test-engagement-centric
[... similar for other buckets ...]

=========================================
Deleting CloudFront Distributions
=========================================

✓ Distribution disabled: E1ABC2DEF3GHIJ
✓ Distribution is disabled and deployed: E1ABC2DEF3GHIJ
✓ Distribution deleted: E1ABC2DEF3GHIJ
[... similar for other distributions ...]

=========================================
Cleanup Summary
=========================================

✓ S3 buckets deleted: 5
  ✓ zv-test-engagement-centric
  ✓ zv-test-informational-hub
  ✓ zv-test-multimedia-experience
  ✓ zv-test-community-driven
  ✓ zv-test-accessible-responsive

✓ CloudFront distributions deleted: 5
  ✓ E1ABC2DEF3GHIJ
  ✓ E2ABC3DEF4GHIJ
  ✓ E3ABC4DEF5GHIJ
  ✓ E4ABC5DEF6GHIJ
  ✓ E5ABC6DEF7GHIJ

✓ All test resources cleaned up successfully!
```

**Safety Features:**
- Requires explicit "yes" confirmation
- Protects production resources (will never delete)
- Dry-run mode available for preview
- Reports any resources that fail to delete with manual cleanup instructions

## Cost Information

### Estimated Costs

Running 5 test environments for **1 week**:

| Service | Usage | Cost |
|---------|-------|------|
| S3 Storage | 5 builds × 50MB × 1 week | ~$0.01 |
| S3 Requests | 5 × 1,000 PUT requests | ~$0.03 |
| CloudFront Data Transfer | Minimal testing traffic | ~$0.10 |
| CloudFront Requests | ~1,000 page views | ~$0.01 |
| **Total** | | **~$0.15/week** |

### Cost Breakdown

**S3 Storage (Standard Class)**
- $0.023 per GB per month
- 5 builds × 50MB = 250MB = 0.25GB
- Weekly cost: 0.25GB × $0.023 × (7/30) = $0.001

**S3 Requests**
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests
- Deployment uploads: ~5,000 files = $0.025
- Testing downloads: ~1,000 requests = $0.0004

**CloudFront (PriceClass_100 - US/Europe)**
- Data transfer: $0.085 per GB for first 10TB
- HTTP requests: $0.0075 per 10,000 requests
- Minimal testing: ~1GB transfer + 10,000 requests = $0.10

**CloudFront Invalidations**
- First 1,000 paths per month: FREE
- Additional paths: $0.005 per path
- Our usage: ~5 invalidations × 1 path = FREE

### Cost Optimization Tips

1. **Delete Immediately After Testing**
   ```bash
   # Run cleanup as soon as comparison is complete
   ./cleanup-test-environments.sh
   ```
   - Stops all ongoing costs
   - Most important cost-saving measure

2. **Use Minimal Test Traffic**
   - Only visit each theme once or twice
   - Avoid automated testing that generates many requests
   - Don't share URLs publicly

3. **Optimize Build Sizes**
   ```bash
   # Check build sizes before deploying
   du -sh frontend/dist-*
   ```
   - Smaller builds = lower storage and transfer costs
   - Remove unnecessary assets from test builds

4. **Use PriceClass_100**
   - Already configured in `config.json`
   - Cheapest CloudFront price class (US/Europe only)
   - Sufficient for testing purposes

5. **Batch Your Testing**
   - Set up all environments once
   - Test all themes in one session
   - Clean up immediately after
   - Avoid multiple setup/cleanup cycles

### Monitoring Costs

Check your AWS costs:

```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --profile Personal_Account_734110488556

# View costs by service
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --profile Personal_Account_734110488556
```

Or use the AWS Console:
- Navigate to AWS Cost Explorer
- Filter by service (S3, CloudFront)
- Filter by tags (Environment=test)

## Troubleshooting

### Common Issues

#### 1. AWS CLI Not Found

**Error:**
```
ERROR: AWS Credentials - AWS CLI not installed
```

**Solution:**
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

#### 2. jq Not Found

**Error:**
```
ERROR: Configuration - Config file not found
```
(Actually caused by jq not being installed)

**Solution:**
```bash
# macOS
brew install jq

# Linux (Debian/Ubuntu)
sudo apt-get install jq

# Linux (RHEL/CentOS)
sudo yum install jq

# Verify installation
jq --version
```

#### 3. AWS Profile Not Configured

**Error:**
```
ERROR: AWS Credentials - Profile not configured
```

**Solution:**
```bash
# Configure the profile
aws configure --profile Personal_Account_734110488556

# Enter when prompted:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json

# Verify configuration
aws sts get-caller-identity --profile Personal_Account_734110488556
```

#### 4. Build Directory Not Found

**Error:**
```
ERROR: Deployment - Build directory not found
Details: Directory 'frontend/dist-engagement-centric' does not exist
```

**Solution:**
```bash
# Build all themes
npm run build:all-themes

# Or build specific theme
npm run build:engagement-centric

# Verify builds exist
ls -la frontend/dist-*
```

#### 5. S3 Bucket Not Found

**Error:**
```
ERROR: Deployment - S3 bucket not found
Details: Bucket 'zv-test-engagement-centric' does not exist
```

**Solution:**
```bash
# Run setup script to create infrastructure
./setup-test-environments.sh

# Verify buckets were created
aws s3 ls --profile Personal_Account_734110488556 | grep zv-test
```

#### 6. CloudFront Distribution Still Deploying

**Error:**
```
⚠ Distribution E1ABC2DEF3GHIJ is still deploying (timeout reached)
```

**Solution:**
- This is a warning, not an error
- CloudFront distributions can take 15-20 minutes to deploy
- Check status manually:
  ```bash
  aws cloudfront get-distribution \
    --id E1ABC2DEF3GHIJ \
    --profile Personal_Account_734110488556 \
    --query 'Distribution.Status'
  ```
- Wait for status to be "Deployed" before deploying content

#### 7. Cleanup Fails - Bucket Not Empty

**Error:**
```
✗ Failed to delete bucket: zv-test-engagement-centric
```

**Solution:**
```bash
# Manually empty the bucket
aws s3 rm s3://zv-test-engagement-centric --recursive \
  --profile Personal_Account_734110488556

# Delete the bucket
aws s3api delete-bucket \
  --bucket zv-test-engagement-centric \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

#### 8. Cleanup Fails - Distribution Still Enabled

**Error:**
```
✗ Failed to delete distribution: E1ABC2DEF3GHIJ
```

**Solution:**
```bash
# Get distribution config
aws cloudfront get-distribution-config \
  --id E1ABC2DEF3GHIJ \
  --profile Personal_Account_734110488556 \
  > dist-config.json

# Extract ETag
ETAG=$(jq -r '.ETag' dist-config.json)

# Disable distribution (edit config.json to set Enabled: false)
jq '.DistributionConfig.Enabled = false' dist-config.json > dist-config-updated.json

# Update distribution
aws cloudfront update-distribution \
  --id E1ABC2DEF3GHIJ \
  --distribution-config file://dist-config-updated.json \
  --if-match "$ETAG" \
  --profile Personal_Account_734110488556

# Wait 10-15 minutes for distribution to be disabled
# Then delete
aws cloudfront delete-distribution \
  --id E1ABC2DEF3GHIJ \
  --if-match <new-etag> \
  --profile Personal_Account_734110488556
```

#### 9. Permission Denied Errors

**Error:**
```
An error occurred (AccessDenied) when calling the CreateBucket operation
```

**Solution:**
- Verify your AWS user has required permissions
- Check IAM policies for S3 and CloudFront access
- Contact AWS administrator to grant permissions

#### 10. Production Resource Protection

**Error:**
```
CRITICAL ERROR: Production Resource Protection
Details: Attempted to delete production resource 'resistance-radio-website-dev-734110488556'
```

**Solution:**
- This is a safety feature, not a bug
- The script correctly prevented modification of production resources
- If you need to modify production, use separate deployment scripts
- Never modify `config.json` production resource identifiers

### Debug Mode

Enable verbose output for troubleshooting:

```bash
# Run with bash debug mode
bash -x ./setup-test-environments.sh

# Or add to script temporarily
set -x  # Enable debug output
set +x  # Disable debug output
```

### Getting Help

If you encounter issues not covered here:

1. Check script output for specific error messages
2. Verify all prerequisites are installed and configured
3. Check AWS Console for resource status
4. Review `config.json` for correct settings
5. Try dry-run mode to preview operations: `./cleanup-test-environments.sh --dry-run`

## Safety Features

### Production Resource Protection

The deployment system includes multiple layers of protection to prevent accidental modification of production resources:

1. **Configuration-Based Protection**
   - Production bucket and CloudFront IDs defined in `config.json`
   - All scripts check resources against production identifiers
   - Operations blocked if resource matches production

2. **Naming Convention Enforcement**
   - Test resources use `zv-test-*` prefix
   - Production resources use different naming
   - Cleanup only targets resources matching test pattern

3. **Explicit Validation**
   - `protect_production_resource()` function in all scripts
   - Checks before create, deploy, delete operations
   - Exits immediately if production resource detected

4. **User Confirmation**
   - Cleanup script requires explicit "yes" confirmation
   - Dry-run mode available for preview
   - Lists all resources before deletion

### Error Handling

All scripts follow consistent error handling:

- **Fail Fast**: Validate inputs before AWS operations
- **Descriptive Messages**: Clear error messages with actionable solutions
- **Non-Zero Exit Codes**: All failures exit with status 1
- **Partial State Recovery**: Scripts are re-runnable after failures
- **Idempotent Operations**: Safe to run multiple times

### Validation Checks

Scripts perform extensive validation:

- Configuration file exists and is valid JSON
- All required configuration fields present
- AWS CLI installed and accessible
- AWS credentials valid and not expired
- Build directories exist and contain required files
- S3 buckets and CloudFront distributions exist before deployment
- Files successfully uploaded to S3
- CloudFront invalidations complete successfully

## Advanced Usage

### Custom Configuration

Create a custom configuration file:

```bash
# Copy default config
cp config.json config-custom.json

# Edit custom config
vim config-custom.json

# Use custom config (set CONFIG_FILE environment variable)
CONFIG_FILE=config-custom.json ./setup-test-environments.sh
```

### Deploying Subset of Themes

Deploy only specific themes:

```bash
# Deploy two themes
./deploy-theme.sh engagement-centric
./deploy-theme.sh community-driven

# Or modify config.json temporarily to include only desired themes
```

### Parallel Deployment

Deploy themes in parallel for faster deployment:

```bash
# Deploy all themes in parallel (use with caution)
for theme in engagement-centric informational-hub multimedia-experience community-driven accessible-responsive; do
  ./deploy-theme.sh "$theme" &
done
wait

echo "All deployments complete"
```

**Note:** Parallel deployment may hit AWS API rate limits. Use sequential deployment for reliability.

### Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: Deploy Test Environments

on:
  push:
    branches: [feature/theme-testing]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Install dependencies
        run: |
          sudo apt-get install -y jq
          npm install
      
      - name: Build all themes
        run: npm run build:all-themes
      
      - name: Deploy all themes
        run: |
          cd aws/deployment
          ./deploy-all-themes.sh
```

## File Structure

```
aws/deployment/
├── README.md                      # This file
├── config.json                    # Configuration file
├── setup-test-environments.sh     # Create infrastructure
├── deploy-theme.sh                # Deploy single theme
├── deploy-all-themes.sh           # Deploy all themes
├── cleanup-test-environments.sh   # Remove infrastructure
├── test-urls.txt                  # Generated CloudFront URLs
└── lib/
    └── utils.sh                   # Shared utility functions
```

## Related Documentation

- [AWS Deployment Guide](../DEPLOYMENT-GUIDE.md) - Production deployment
- [Theme Development Guide](../../DESIGN-THEMES-GUIDE.md) - Creating themes
- [Cost Analysis](../../COST-ANALYSIS.md) - Detailed cost breakdown
- [Project Structure](../../.kiro/steering/structure.md) - Repository organization

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review script output for error messages
3. Verify prerequisites are correctly installed
4. Check AWS Console for resource status
5. Contact platform administrator

---

**Last Updated:** 2024
**Version:** 1.0.0
**Maintained By:** Zimbabwe Voice Platform Team
