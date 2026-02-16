# Troubleshooting Guide

## Common Issues and Solutions

### Build Issues

#### Backend Build Fails

**Problem**: TypeScript compilation errors

**Solution**:
```bash
cd backend
npm install
npm run build
```

Check for:
- Missing dependencies: `npm install`
- TypeScript version: `npm list typescript`
- Environment variables: Copy `.env.example` to `.env`

#### Frontend Build Fails

**Problem**: Vite build errors

**Solution**:
```bash
cd frontend
npm install
npm run build
```

Common fixes:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf dist .vite`
- Check Node version: `node --version` (should be 18+)

### Database Issues

#### Cannot Connect to Database

**Problem**: `ECONNREFUSED` or connection timeout

**Solution**:
1. Check database is running:
   ```bash
   psql -h localhost -U postgres -d resistance_radio_dev
   ```

2. Verify environment variables:
   ```bash
   echo $DB_HOST
   echo $DB_PORT
   echo $DB_NAME
   ```

3. Check database credentials in `.env`

4. For AWS RDS:
   - Verify security group allows your IP
   - Check VPC settings
   - Ensure database is publicly accessible (if needed)

#### Migration Fails

**Problem**: Migration script errors

**Solution**:
```bash
cd backend
npm run migrate
```

If fails:
1. Check database connection
2. Verify migration file syntax
3. Check if migrations already ran:
   ```sql
   SELECT * FROM schema_migrations;
   ```
4. Manually run SQL if needed:
   ```bash
   psql -h host -U user -d database -f src/db/schema.sql
   ```

### Server Issues

#### Backend Server Won't Start

**Problem**: Port already in use or startup errors

**Solution**:
1. Check if port 3000 is in use:
   ```bash
   lsof -i :3000
   ```

2. Kill existing process:
   ```bash
   kill -9 <PID>
   ```

3. Change port in `.env`:
   ```
   PORT=3001
   ```

4. Check logs:
   ```bash
   npm start 2>&1 | tee server.log
   ```

#### Frontend Dev Server Won't Start

**Problem**: Port 5173 in use

**Solution**:
1. Kill existing process:
   ```bash
   lsof -i :5173
   kill -9 <PID>
   ```

2. Or use different port:
   ```bash
   npm run dev -- --port 5174
   ```

### Authentication Issues

#### Login Fails

**Problem**: Invalid credentials or token errors

**Solution**:
1. Verify user exists in database:
   ```sql
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

2. Check JWT_SECRET in `.env`

3. Clear browser cookies and localStorage

4. Check password hash:
   ```sql
   SELECT password_hash FROM users WHERE email = 'user@example.com';
   ```

#### Token Expired

**Problem**: 401 Unauthorized after some time

**Solution**:
- Tokens expire after 24 hours
- Log in again to get new token
- Implement token refresh (future feature)

#### CORS Errors

**Problem**: Cross-origin request blocked

**Solution**:
1. Check FRONTEND_URL in backend `.env`:
   ```
   FRONTEND_URL=http://localhost:5173
   ```

2. Verify CORS configuration in `backend/src/index.ts`

3. For production, update to production URL:
   ```
   FRONTEND_URL=https://resistanceradio.org
   ```

### File Upload Issues

#### Upload Fails

**Problem**: File too large or wrong format

**Solution**:
1. Check file size limits:
   - Audio: 100MB max
   - Images: 5MB max
   - Documents: 10MB max

2. Verify file format:
   - Audio: MP3 only
   - Images: JPG, PNG, WebP
   - Documents: PDF, DOC, DOCX

3. Check AWS S3 credentials in `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_S3_MEDIA_BUCKET=your_bucket
   ```

4. Verify S3 bucket permissions

#### Audio Player Not Working

**Problem**: Audio won't play or stream fails

**Solution**:
1. Check audio file URL is accessible
2. Verify CORS headers on S3 bucket
3. Check browser console for errors
4. Test with different audio file
5. Verify HLS stream URL for live broadcasts

### Deployment Issues

#### AWS Deployment Fails

**Problem**: CloudFormation or deployment script errors

**Solution**:
1. Check AWS credentials:
   ```bash
   aws sts get-caller-identity --profile Personal_Account_734110488556
   ```

2. Verify region:
   ```bash
   aws configure get region --profile Personal_Account_734110488556
   ```

3. Check CloudFormation stack status:
   ```bash
   aws cloudformation describe-stacks --stack-name resistance-radio
   ```

4. View stack events:
   ```bash
   aws cloudformation describe-stack-events --stack-name resistance-radio
   ```

#### CloudFront Not Updating

**Problem**: Changes not visible after deployment

**Solution**:
1. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id EYKP4STY3RIHX \
     --paths "/*"
   ```

2. Wait 5-10 minutes for propagation

3. Clear browser cache

4. Check CloudFront distribution status:
   ```bash
   aws cloudfront get-distribution --id EYKP4STY3RIHX
   ```

#### EC2 Instance Issues

**Problem**: Backend not responding

**Solution**:
1. SSH into instance:
   ```bash
   ssh -i ~/.ssh/key.pem ec2-user@54.167.234.4
   ```

2. Check PM2 status:
   ```bash
   pm2 status
   pm2 logs resistance-radio-backend
   ```

3. Restart application:
   ```bash
   pm2 restart resistance-radio-backend
   ```

4. Check system resources:
   ```bash
   top
   df -h
   free -m
   ```

### Email Issues

#### Emails Not Sending

**Problem**: SMTP errors or emails not received

**Solution**:
1. Verify SMTP credentials in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_app_password
   ```

2. Check email service status

3. Verify sender email is verified (for AWS SES)

4. Check spam folder

5. Review email logs:
   ```bash
   grep "email" backend/logs/combined.log
   ```

#### Newsletter Confirmation Not Working

**Problem**: Confirmation emails not sent

**Solution**:
1. Check email service configuration
2. Verify confirmation URL in email template
3. Check database for subscription record
4. Test email sending manually

### Performance Issues

#### Slow Page Load

**Problem**: Pages take long to load

**Solution**:
1. Check network tab in browser DevTools
2. Optimize images (compress, use WebP)
3. Enable CDN caching
4. Check database query performance
5. Review server logs for slow requests

#### High Memory Usage

**Problem**: Server running out of memory

**Solution**:
1. Check memory usage:
   ```bash
   free -m
   pm2 monit
   ```

2. Restart PM2:
   ```bash
   pm2 restart all
   ```

3. Increase EC2 instance size

4. Optimize database queries

5. Add database connection pooling

### Security Issues

#### Rate Limiting Triggered

**Problem**: Too many requests error

**Solution**:
- Wait for rate limit window to reset (15 minutes)
- Reduce request frequency
- Contact admin to adjust limits if needed

#### Suspicious Activity Detected

**Problem**: Security alerts or unusual behavior

**Solution**:
1. Check Sentry for errors
2. Review server logs:
   ```bash
   tail -f backend/logs/error.log
   ```
3. Check for failed login attempts
4. Rotate JWT secrets if compromised
5. Update passwords
6. Review user permissions

### Monitoring Issues

#### Sentry Not Tracking Errors

**Problem**: Errors not appearing in Sentry

**Solution**:
1. Verify SENTRY_DSN in `.env`:
   ```
   SENTRY_DSN=https://key@sentry.io/project
   ```

2. Check Sentry initialization in code

3. Test error tracking:
   ```javascript
   throw new Error('Test error');
   ```

4. Verify Sentry project settings

#### Analytics Not Working

**Problem**: No data in analytics dashboard

**Solution**:
1. Check analytics configuration:
   ```
   VITE_ANALYTICS_ENABLED=true
   VITE_ANALYTICS_PROVIDER=plausible
   VITE_PLAUSIBLE_DOMAIN=resistanceradio.org
   ```

2. Verify analytics script loads in browser

3. Check browser console for errors

4. Test with browser extensions disabled

5. Verify domain in analytics dashboard

## Debugging Tips

### Enable Debug Logging

Backend:
```bash
LOG_LEVEL=debug npm start
```

Frontend:
```javascript
localStorage.setItem('debug', '*');
```

### Check Logs

Backend logs:
```bash
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

PM2 logs:
```bash
pm2 logs resistance-radio-backend
```

### Database Debugging

Check connections:
```sql
SELECT * FROM pg_stat_activity;
```

Check table sizes:
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Network Debugging

Test API endpoint:
```bash
curl -X GET http://localhost:3000/api/shows
```

Test with authentication:
```bash
curl -X GET http://localhost:3000/api/admin/shows \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Check DNS:
```bash
nslookup resistanceradio.org
dig resistanceradio.org
```

### Browser Debugging

1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Check Application tab for localStorage/cookies
5. Use React DevTools for component debugging

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Review error messages carefully
3. Check server and browser logs
4. Search existing issues on GitHub
5. Try reproducing in a clean environment

### How to Report Issues

Include:
1. Error message (full stack trace)
2. Steps to reproduce
3. Environment details (OS, Node version, browser)
4. Relevant logs
5. Screenshots if applicable

### Contact Support

- Email: support@resistanceradio.org
- GitHub Issues: https://github.com/resistanceradio/issues
- Documentation: https://docs.resistanceradio.org

## Emergency Procedures

### Site Down

1. Check server status:
   ```bash
   curl -I https://resistanceradio.org
   ```

2. Check AWS services status

3. Review CloudWatch logs

4. Restart services:
   ```bash
   pm2 restart all
   ```

5. Rollback if needed (see DEPLOYMENT.md)

### Database Corruption

1. Stop application
2. Restore from backup:
   ```bash
   pg_restore -h host -U user -d database backup.dump
   ```
3. Verify data integrity
4. Restart application

### Security Breach

1. Immediately rotate all secrets
2. Review access logs
3. Disable compromised accounts
4. Notify users if needed
5. Document incident
6. Implement additional security measures

