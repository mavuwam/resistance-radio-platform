# Launch Checklist

## Pre-Launch Checklist

Use this checklist to ensure everything is ready before launching the Resistance Radio Station website to production.

### 1. Environment Configuration

#### Backend Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT` set correctly
- [ ] `FRONTEND_URL` set to production domain
- [ ] `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` configured
- [ ] `JWT_SECRET` set to strong, unique value (not default)
- [ ] `JWT_EXPIRES_IN` configured
- [ ] `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` set
- [ ] `AWS_S3_MEDIA_BUCKET` configured
- [ ] `CDN_URL` set to CloudFront distribution
- [ ] `EMAIL_FROM`, `EMAIL_FROM_NAME` configured
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` set
- [ ] `SENTRY_DSN` configured for error tracking
- [ ] `LOG_LEVEL=info` for production

#### Frontend Environment Variables
- [ ] `VITE_API_URL` set to production API
- [ ] `VITE_ANALYTICS_ENABLED=true`
- [ ] `VITE_ANALYTICS_PROVIDER` configured
- [ ] `VITE_PLAUSIBLE_DOMAIN` or `VITE_GA_MEASUREMENT_ID` set
- [ ] `VITE_SENTRY_DSN` configured

### 2. Database

- [ ] Production database created
- [ ] Database migrations run successfully
- [ ] Seed data loaded (if needed)
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Database credentials secured
- [ ] Database accessible from application server
- [ ] Database performance optimized (indexes, etc.)

### 3. AWS Infrastructure

#### S3 Buckets
- [ ] Media bucket created
- [ ] Website bucket created (if using S3 for frontend)
- [ ] Backup bucket created
- [ ] Bucket policies configured
- [ ] CORS configured on media bucket
- [ ] Lifecycle policies set (optional)

#### CloudFront
- [ ] Distribution created
- [ ] Custom domain configured
- [ ] SSL certificate attached
- [ ] Cache behaviors configured
- [ ] Origin settings correct
- [ ] Error pages configured

#### RDS
- [ ] Database instance running
- [ ] Security groups configured
- [ ] Automated backups enabled
- [ ] Multi-AZ enabled (for high availability)
- [ ] Performance Insights enabled (optional)

#### EC2 (if using)
- [ ] Instance running
- [ ] Security groups configured
- [ ] SSH key pair secured
- [ ] PM2 configured for process management
- [ ] Auto-restart on failure configured
- [ ] System monitoring enabled

### 4. Domain and DNS

- [ ] Domain registered
- [ ] DNS records configured:
  - [ ] A record for main domain
  - [ ] CNAME for www subdomain
  - [ ] CNAME for CloudFront distribution
  - [ ] MX records for email (if applicable)
  - [ ] TXT records for domain verification
- [ ] DNS propagation complete (check with `dig` or `nslookup`)

### 5. SSL/TLS Certificates

- [ ] SSL certificate issued
- [ ] Certificate validated
- [ ] Certificate attached to CloudFront/Load Balancer
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Certificate auto-renewal configured

### 6. Security

#### Application Security
- [ ] All secrets rotated from defaults
- [ ] JWT secret is strong and unique
- [ ] Database passwords are strong
- [ ] AWS credentials secured
- [ ] Environment variables not committed to git
- [ ] `.env` files in `.gitignore`

#### Network Security
- [ ] Security groups configured (least privilege)
- [ ] Firewall rules set
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Security headers enabled (Helmet)
- [ ] CSRF protection enabled
- [ ] Input sanitization enabled

#### Access Control
- [ ] Admin accounts created
- [ ] Default passwords changed
- [ ] User roles configured
- [ ] SSH access restricted
- [ ] Database access restricted

### 7. Email Service

- [ ] Email service configured (SendGrid, AWS SES, etc.)
- [ ] Sender email verified
- [ ] Email templates tested
- [ ] Confirmation emails working
- [ ] Notification emails working
- [ ] Newsletter subscription working
- [ ] Email deliverability tested
- [ ] SPF/DKIM records configured (if applicable)

### 8. Media and Content

- [ ] Initial content uploaded:
  - [ ] Shows created
  - [ ] Episodes uploaded
  - [ ] Articles published
  - [ ] Events added
  - [ ] Resources uploaded
- [ ] Images optimized
- [ ] Audio files optimized
- [ ] CDN caching working
- [ ] Media accessible via CDN URLs

### 9. Monitoring and Analytics

#### Error Tracking
- [ ] Sentry configured for backend
- [ ] Sentry configured for frontend
- [ ] Error notifications set up
- [ ] Test errors captured correctly

#### Analytics
- [ ] Analytics service configured (Plausible or Google Analytics)
- [ ] Tracking code installed
- [ ] Custom events configured
- [ ] Test pageviews tracked
- [ ] Goals/conversions set up (optional)

#### Uptime Monitoring
- [ ] Uptime monitoring service configured (UptimeRobot, Pingdom, etc.)
- [ ] Health check endpoint working (`/health`)
- [ ] Alert notifications configured
- [ ] Response time monitoring enabled

#### Logging
- [ ] Application logs configured
- [ ] Log rotation enabled
- [ ] Centralized logging set up (optional)
- [ ] Log retention policy set

### 10. Performance

- [ ] Frontend build optimized
- [ ] Code splitting working
- [ ] Lazy loading implemented
- [ ] Images optimized and compressed
- [ ] Gzip compression enabled
- [ ] Browser caching configured
- [ ] CDN caching configured
- [ ] Database queries optimized
- [ ] API response times acceptable (<500ms)

#### Performance Testing
- [ ] Lighthouse audit run (score >90)
- [ ] PageSpeed Insights checked
- [ ] Load testing performed (optional)
- [ ] Mobile performance tested

### 11. SEO

- [ ] Meta tags on all pages
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Schema.org structured data added
- [ ] Sitemap.xml generated and accessible
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] 404 page configured
- [ ] URL structure clean and descriptive

#### SEO Testing
- [ ] Google Search Console configured
- [ ] Sitemap submitted to Google
- [ ] Bing Webmaster Tools configured (optional)
- [ ] Social media preview tested

### 12. Accessibility

- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation working
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Alt text on all images
- [ ] Semantic HTML used
- [ ] Screen reader tested (NVDA, JAWS, or VoiceOver)
- [ ] Forms accessible
- [ ] Error messages clear and accessible

### 13. Browser and Device Testing

#### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet (optional)

#### Responsive Design
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1920px+)

### 14. Functionality Testing

#### Public Features
- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] Audio player works (live and on-demand)
- [ ] Shows page displays correctly
- [ ] Episodes page displays correctly
- [ ] Articles page displays correctly
- [ ] Events page displays correctly
- [ ] Resources page displays correctly
- [ ] Contact form submits successfully
- [ ] Newsletter subscription works
- [ ] Search functionality works (if implemented)
- [ ] Social sharing works

#### Admin Features
- [ ] Admin login works
- [ ] Dashboard displays correctly
- [ ] Show management works (create, edit, delete)
- [ ] Episode upload works
- [ ] Article management works
- [ ] Event management works
- [ ] Resource management works
- [ ] Submission review works
- [ ] File uploads work
- [ ] Admin logout works

### 15. Backup and Recovery

- [ ] Database backup strategy defined
- [ ] Automated backups configured
- [ ] Backup restoration tested
- [ ] Media files backed up
- [ ] Code repository backed up (GitHub)
- [ ] Recovery procedures documented
- [ ] Rollback plan prepared

### 16. Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Content management guide created
- [ ] Deployment guide updated
- [ ] Troubleshooting guide created
- [ ] Environment variables documented
- [ ] Architecture diagram created (optional)

### 17. Legal and Compliance

- [ ] Privacy Policy published
- [ ] Terms of Use published
- [ ] Cookie policy (if applicable)
- [ ] GDPR compliance (if applicable)
- [ ] Copyright notices
- [ ] License information
- [ ] Contact information visible

### 18. Communication

- [ ] Launch announcement prepared
- [ ] Social media posts scheduled
- [ ] Email to subscribers drafted
- [ ] Press release prepared (optional)
- [ ] Support channels ready
- [ ] FAQ page created (optional)

### 19. Post-Launch Monitoring

- [ ] Monitor error rates (first 24 hours)
- [ ] Check server resources (CPU, memory, disk)
- [ ] Monitor response times
- [ ] Check for broken links
- [ ] Review user feedback
- [ ] Monitor social media mentions
- [ ] Check analytics for traffic patterns

### 20. Final Checks

- [ ] All team members notified of launch
- [ ] Support team briefed
- [ ] Emergency contacts list prepared
- [ ] Rollback plan ready
- [ ] Celebration planned! 🎉

## Launch Day Procedure

### 1 Hour Before Launch
1. Final backup of database
2. Verify all services running
3. Check monitoring dashboards
4. Prepare rollback plan
5. Brief team on launch procedure

### Launch Time
1. Deploy frontend to production
2. Deploy backend to production
3. Run database migrations (if any)
4. Invalidate CDN cache
5. Verify site is accessible
6. Test critical user flows
7. Monitor error rates

### 1 Hour After Launch
1. Check error tracking (Sentry)
2. Review server logs
3. Monitor analytics
4. Check social media
5. Respond to any issues immediately

### 24 Hours After Launch
1. Review performance metrics
2. Check for any errors or issues
3. Gather user feedback
4. Make minor adjustments if needed
5. Celebrate successful launch! 🎊

## Emergency Contacts

- **Technical Lead**: [Name] - [Email] - [Phone]
- **DevOps**: [Name] - [Email] - [Phone]
- **AWS Support**: [Account Number] - [Support Plan]
- **Domain Registrar**: [Provider] - [Support Contact]
- **Email Service**: [Provider] - [Support Contact]

## Rollback Plan

If critical issues arise:

1. **Immediate**: Revert to previous version
   ```bash
   git revert HEAD
   npm run build
   npm run deploy
   ```

2. **Database**: Restore from backup
   ```bash
   pg_restore -h host -U user -d database backup.dump
   ```

3. **Notify**: Inform team and users of issue

4. **Investigate**: Identify root cause

5. **Fix**: Implement fix in development

6. **Test**: Thoroughly test fix

7. **Redeploy**: Deploy fixed version

## Success Criteria

Launch is considered successful when:
- [ ] Site is accessible and loading quickly
- [ ] No critical errors in Sentry
- [ ] All core features working
- [ ] Server resources within normal range
- [ ] Positive user feedback
- [ ] Analytics tracking correctly

---

**Launch Date**: _______________
**Launched By**: _______________
**Status**: _______________

