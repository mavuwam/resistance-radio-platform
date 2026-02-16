# Rollback Guide

## Overview

This guide explains how to rollback your backend deployment if issues arise after a CI/CD pipeline deployment.

## Backup Strategy

Every deployment automatically creates a backup before deploying new code:
- Location: `/opt/resistance-radio/backups/`
- Format: `backend_YYYYMMDD_HHMMSS`
- Retention: Last 5 backups are kept automatically

Additionally, your original manual deployment has been backed up to:
- `/opt/resistance-radio/backups/manual_deployment_20260217_010850`

## Rollback Script

A rollback script is available on your EC2 instance at:
```
/opt/resistance-radio/rollback.sh
```

### Usage

**1. List available backups:**
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4 "/opt/resistance-radio/rollback.sh list"
```

**2. Rollback to original manual deployment:**
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4 "/opt/resistance-radio/rollback.sh manual"
```

**3. Rollback to a specific backup:**
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4 "/opt/resistance-radio/rollback.sh backup backend_20260217_010850"
```

## Manual Rollback Process

If the rollback script is unavailable, follow these steps:

### Step 1: Stop Current Deployment
```bash
ssh -i ~/.ssh/resistance-radio-key-dev.pem ec2-user@54.167.234.4
pm2 stop resistance-radio-backend
```

### Step 2: Restore from Backup
```bash
# List available backups
ls -lah /opt/resistance-radio/backups/

# Choose a backup and restore
sudo rm -rf /opt/resistance-radio/backend
sudo cp -r /opt/resistance-radio/backups/backend_YYYYMMDD_HHMMSS /opt/resistance-radio/backend
sudo chown -R ec2-user:ec2-user /opt/resistance-radio/backend
```

### Step 3: Restart Application
```bash
cd /opt/resistance-radio/backend
pm2 restart resistance-radio-backend
pm2 save
```

### Step 4: Verify
```bash
pm2 status
curl http://localhost:5000/api/shows
```

## CodeDeploy Rollback

You can also rollback through AWS CodeDeploy console:

1. Go to [CodeDeploy Console](https://console.aws.amazon.com/codesuite/codedeploy/applications/ResistanceRadio-App/deployment-groups/ResistanceRadio-DeploymentGroup)
2. Select the deployment group: `ResistanceRadio-DeploymentGroup`
3. Click on the failed deployment
4. Click "Roll back" button
5. CodeDeploy will automatically restore the previous successful deployment

## Verification Checklist

After any rollback, verify:

- [ ] PM2 shows backend as "online"
- [ ] API responds: `curl http://localhost:5000/api/shows`
- [ ] Website loads: https://resistanceradiostation.org
- [ ] Admin panel accessible: https://resistanceradiostation.org/admin
- [ ] Check logs: `pm2 logs resistance-radio-backend --lines 50`

## Current Deployment Status

- **Active Backend**: `resistance-radio-backend` (deployed via CI/CD pipeline)
- **Backup Location**: `/opt/resistance-radio/backups/manual_deployment_20260217_010850`
- **Pipeline**: Automatic deployment on push to `main` branch

## Emergency Contacts

If rollback fails:
1. Check PM2 logs: `pm2 logs resistance-radio-backend`
2. Check CodeDeploy logs: `sudo tail -100 /var/log/aws/codedeploy-agent/codedeploy-agent.log`
3. Check application logs: `tail -100 /opt/resistance-radio/backend/logs/error.log`

## Preventing Issues

To minimize the need for rollbacks:

1. **Test locally** before pushing to main branch
2. **Monitor deployments** in CodePipeline console
3. **Check logs** immediately after deployment
4. **Verify API** endpoints after each deployment
5. **Keep backups** - don't delete old backups manually

## Related Documentation

- [CI/CD Setup Guide](CODEPIPELINE-SETUP.md)
- [CI/CD Quick Start](CICD-QUICK-START.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
