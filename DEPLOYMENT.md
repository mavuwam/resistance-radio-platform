# Deployment Guide

## Overview

Resistance Radio can be deployed on multiple platforms. This guide covers AWS (current), Vercel/Railway, and Netlify/Render configurations.

## Current Deployment (AWS)

### Infrastructure
- **Frontend**: CloudFront CDN + S3
- **Backend**: EC2 instance
- **Database**: RDS PostgreSQL
- **Media Storage**: S3 + CloudFront
- **Region**: us-east-1

### Deployed Resources
- CloudFront Distribution: `EYKP4STY3RIHX` (dxbqjcig99tjb.cloudfront.net)
- EC2 Instance: `i-07f7e8accc4b07682` (54.167.234.4)
- RDS Database: `resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com`
- S3 Buckets:
  - Media: `resistance-radio-media-dev-734110488556`
  - Website: `resistance-radio-website-dev-734110488556`
  - Backup: `resistance-radio-backup-dev-734110488556`

### Deployment Steps

#### 1. Frontend Deployment

```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://resistance-radio-website-dev-734110488556 \
  --profile Personal_Account_734110488556 \
  --region us-east-1 \
  --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id EYKP4STY3RIHX \
  --paths "/*" \
  --profile Personal_Account_734110488556
```

#### 2. Backend Deployment

```bash
# SSH into EC2
ssh -i ~/.ssh/your-key.pem ec2-user@54.167.234.4

# Pull latest code
cd /var/www/resistance-radio/backend
git pull origin main

# Install dependencies
npm install

# Build TypeScript
npm run build

# Restart PM2
pm2 restart resistance-radio-backend
pm2 save
```

#### 3. Database Migrations

```bash
# Run migrations
npm run migrate

# Seed data (if needed)
npm run seed
```

## Alternative Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Vercel Frontend Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ],
     "env": {
       "VITE_API_URL": "@api_url",
       "VITE_ANALYTICS_ENABLED": "@analytics_enabled",
       "VITE_SENTRY_DSN": "@sentry_dsn"
     }
   }
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Add all VITE_* variables

#### Railway Backend Setup

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Create railway.json**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "npm run build"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Deploy**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

4. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

5. **Configure Environment Variables**
   - Railway Dashboard → Variables
   - Add all environment variables from .env.example

### Option 2: Netlify (Frontend) + Render (Backend)

#### Netlify Frontend Setup

1. **Create netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Deploy via Git**
   - Connect GitHub repository
   - Configure build settings
   - Add environment variables

3. **Or Deploy via CLI**
   ```bash
   npm install -g netlify-cli
   cd frontend
   netlify deploy --prod
   ```

#### Render Backend Setup

1. **Create render.yaml**
   ```yaml
   services:
     - type: web
       name: resistance-radio-backend
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 3000
         - key: DATABASE_URL
           fromDatabase:
             name: resistance-radio-db
             property: connectionString
   
   databases:
     - name: resistance-radio-db
       databaseName: resistance_radio
       user: resistance_radio_user
   ```

2. **Deploy via Dashboard**
   - Connect GitHub repository
   - Select render.yaml
   - Add environment variables
   - Deploy

## Environment Variables

### Frontend (.env.production)

```bash
# API
VITE_API_URL=https://api.resistanceradio.org

# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=plausible
VITE_PLAUSIBLE_DOMAIN=resistanceradio.org

# Error Tracking
VITE_SENTRY_DSN=https://your_key@sentry.io/project_id
```

### Backend (.env.production)

```bash
# Server
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://resistanceradio.org

# Database
DB_HOST=your-db-host.rds.amazonaws.com
DB_PORT=5432
DB_NAME=resistance_radio
DB_USER=resistance_radio_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_very_secure_jwt_secret_change_this
JWT_EXPIRES_IN=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_MEDIA_BUCKET=resistance-radio-media-prod
CDN_URL=https://media.resistanceradio.org

# Email
EMAIL_FROM=noreply@resistanceradio.org
EMAIL_FROM_NAME=Resistance Radio
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# Monitoring
SENTRY_DSN=https://your_key@sentry.io/project_id
LOG_LEVEL=info
```

## SSL/TLS Certificates

### AWS CloudFront

1. **Request Certificate in ACM**
   ```bash
   aws acm request-certificate \
     --domain-name resistanceradio.org \
     --subject-alternative-names www.resistanceradio.org \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Validate Domain**
   - Add CNAME records to DNS
   - Wait for validation

3. **Attach to CloudFront**
   - CloudFront → Distribution → Edit
   - Alternate Domain Names: resistanceradio.org
   - SSL Certificate: Select ACM certificate

### Vercel

- Automatic SSL with Let's Encrypt
- Custom domains: Add in Project Settings
- DNS configuration provided

### Netlify

- Automatic SSL with Let's Encrypt
- Custom domains: Add in Domain Settings
- DNS configuration provided

### Railway/Render

- Automatic SSL with Let's Encrypt
- Custom domains: Add in Settings
- CNAME record required

## Database Setup

### AWS RDS (Current)

```bash
# Connection string
postgresql://username:password@resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com:5432/resistance_radio_dev
```

### Railway PostgreSQL

```bash
# Automatically provisioned
# Connection string available in dashboard
railway variables
```

### Render PostgreSQL

```bash
# Automatically provisioned
# Connection string: $DATABASE_URL
```

### Supabase (Alternative)

1. Create project at https://supabase.com
2. Get connection string
3. Run migrations
4. Configure environment variables

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Build
        run: cd frontend && npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
      
      - name: Deploy to S3
        run: |
          aws s3 sync frontend/dist/ s3://your-bucket --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Build
        run: cd backend && npm run build
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/resistance-radio/backend
            git pull
            npm install
            npm run build
            pm2 restart resistance-radio-backend
```

## Health Checks

### Backend Health Endpoint

```
GET /health
Response: { "status": "ok", "timestamp": "..." }
```

### Monitoring

- UptimeRobot: Check every 5 minutes
- Sentry: Error tracking
- CloudWatch: AWS metrics
- Plausible: Analytics

## Rollback Procedure

### Frontend

```bash
# Revert to previous version
aws s3 sync s3://backup-bucket/previous-version/ s3://website-bucket/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Backend

```bash
# SSH into server
ssh ec2-user@your-server

# Revert git commit
git revert HEAD
npm install
npm run build
pm2 restart resistance-radio-backend
```

### Database

```bash
# Restore from backup
pg_restore -h your-db-host -U username -d database_name backup_file.dump
```

## Performance Optimization

### Frontend
- Gzip compression enabled
- Asset caching (1 year)
- Code splitting
- Lazy loading
- Image optimization

### Backend
- Gzip compression
- API response caching (5 minutes)
- Connection pooling
- Query optimization

### CDN
- CloudFront edge locations
- Cache hit ratio >80%
- Origin shield enabled

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API rate limiting enabled
- [ ] CORS configured
- [ ] Security headers set
- [ ] Input sanitization enabled
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection

## Troubleshooting

### Frontend not loading
1. Check CloudFront distribution status
2. Verify S3 bucket permissions
3. Check DNS configuration
4. Review browser console errors

### Backend errors
1. Check server logs: `pm2 logs`
2. Verify database connection
3. Check environment variables
4. Review Sentry errors

### Database connection issues
1. Verify security group rules
2. Check database credentials
3. Test connection: `psql -h host -U user -d database`
4. Review RDS logs

## Support

For deployment issues:
- Check logs: `pm2 logs` or platform dashboard
- Review Sentry errors
- Contact platform support
- Consult documentation

## Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Render Documentation](https://render.com/docs)
