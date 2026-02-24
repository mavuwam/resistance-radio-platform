# Quick Start: CI/CD Pipeline Update

## TL;DR

Run this command to fix the CI/CD pipeline:

```bash
./update-cicd-pipeline.sh
```

Then push a commit to test:

```bash
git commit --allow-empty -m "test: trigger CI/CD"
git push origin main
```

Monitor at: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/ResistanceRadio-Pipeline/view

---

## What This Does

✅ Adds admin frontend to pipeline  
✅ Updates backend to Lambda deployment  
✅ Enables parallel builds  
✅ Automates all deployments  

## Before vs After

### Before
- ❌ Manual deployments
- ❌ No admin frontend in pipeline
- ❌ EC2 backend (expensive)
- ❌ Sequential builds

### After
- ✅ Automated deployments
- ✅ All three components in pipeline
- ✅ Lambda backend (98% cheaper)
- ✅ Parallel builds (faster)

## Pipeline Flow

```
Push → GitHub
  ↓
Source Stage
  ↓
Build Stage (Parallel)
  ├─→ Main Frontend → S3 → CloudFront
  ├─→ Admin Frontend → S3 → CloudFront
  └─→ Lambda Backend → SAM → API Gateway
```

## Cost

- **CI/CD**: ~$2.50/month
- **Lambda**: ~$0.20/month
- **Total**: ~$2.70/month
- **Savings vs EC2**: ~$7.50/month

## Troubleshooting

### Update fails?
```bash
# Check stack status
aws cloudformation describe-stacks \
  --stack-name ResistanceRadio-CICD-Stack \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### Build fails?
1. Go to CodeBuild console
2. Click failed build
3. View logs

### Need to rollback?
```bash
aws cloudformation cancel-update-stack \
  --stack-name ResistanceRadio-CICD-Stack \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

## More Info

- Full docs: `CICD-LAMBDA-SETUP.md`
- Update details: `CICD-UPDATE-SUMMARY.md`
- Complete guide: `CICD-FIX-COMPLETE.md`
