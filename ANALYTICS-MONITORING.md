# Analytics & Monitoring Guide

## Overview

Resistance Radio uses a privacy-focused analytics and monitoring stack:
- **Analytics**: Plausible Analytics (recommended) or Google Analytics
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot or similar

## Analytics

### Plausible Analytics (Recommended)

**Why Plausible?**
- Privacy-focused, GDPR compliant
- No cookies, no personal data collection
- Lightweight script (<1KB)
- Simple, beautiful dashboard
- Open source

**Setup:**

1. Create account at https://plausible.io
2. Add your domain: `resistanceradio.org`
3. Configure environment variables:

```bash
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=plausible
VITE_PLAUSIBLE_DOMAIN=resistanceradio.org
```

**Tracked Events:**
- Page views (automatic)
- Audio plays
- Audio pauses
- Audio completions
- Form submissions
- File downloads
- Search queries
- Social shares
- Newsletter signups
- Outbound link clicks

### Google Analytics (Alternative)

**Setup:**

1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (G-XXXXXXXXXX)
3. Configure environment variables:

```bash
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_PROVIDER=ga
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Privacy Settings:**
- IP anonymization enabled
- Cookie flags: SameSite=None;Secure
- No personally identifiable information (PII) collected

### Custom Event Tracking

```typescript
import { trackEvent, trackAudioPlay, trackFormSubmission } from './services/analytics';

// Track custom event
trackEvent('button_click', {
  button_name: 'subscribe',
  location: 'header'
});

// Track audio play
trackAudioPlay('Episode 1', 'The Resistance Show');

// Track form submission
trackFormSubmission('volunteer');
```

### Available Tracking Functions

```typescript
// Page views
trackPageView(path: string, title?: string)

// Custom events
trackEvent(eventName: string, properties?: Record<string, any>)

// Audio events
trackAudioPlay(episodeTitle: string, showTitle?: string)
trackAudioPause(episodeTitle: string, currentTime: number)
trackAudioComplete(episodeTitle: string)

// User actions
trackFormSubmission(formType: string)
trackDownload(fileName: string, fileType: string)
trackSearch(query: string, resultsCount: number)
trackSocialShare(platform: string, contentType: string, contentTitle: string)
trackNewsletterSignup()
trackOutboundLink(url: string)
```

## Error Tracking (Sentry)

### Setup

1. Create account at https://sentry.io
2. Create new project (Node.js for backend, React for frontend)
3. Get DSN from project settings
4. Configure environment variables:

**Backend:**
```bash
SENTRY_DSN=https://your_key@sentry.io/project_id
```

**Frontend:**
```bash
VITE_SENTRY_DSN=https://your_key@sentry.io/project_id
```

### Features

**Backend:**
- Automatic error capture
- Performance monitoring
- Profiling
- Request tracking
- Breadcrumbs
- User context
- Sensitive data filtering

**Frontend:**
- Automatic error capture
- Performance monitoring
- Session replay
- User interactions
- Network requests
- Console logs
- Sensitive data filtering

### Usage

```typescript
import { captureException, captureMessage, setUser } from './services/sentry';

// Capture exception
try {
  // risky operation
} catch (error) {
  captureException(error, {
    context: 'user_action',
    action: 'submit_form'
  });
}

// Capture message
captureMessage('Important event occurred', 'warning');

// Set user context
setUser({
  id: user.id,
  username: user.username
});
```

### Privacy & Security

**Filtered Data:**
- Authorization headers
- Cookies
- Passwords
- Tokens
- Email addresses
- IP addresses

**Ignored Errors:**
- Network request failures
- Fetch errors
- Abort errors
- ResizeObserver errors

### Performance Monitoring

**Sample Rates:**
- Production: 10% of transactions
- Development: 100% of transactions

**Tracked Operations:**
- HTTP requests
- Database queries
- External API calls
- File operations

## Uptime Monitoring

### UptimeRobot (Recommended)

**Setup:**

1. Create account at https://uptimerobot.com
2. Add monitors:
   - Website: https://resistanceradio.org
   - API: https://api.resistanceradio.org/health
   - Admin: https://resistanceradio.org/admin

**Configuration:**
- Check interval: 5 minutes
- Monitor type: HTTP(s)
- Alert contacts: Email, SMS, Slack

**Health Check Endpoint:**
```
GET /health
Response: { "status": "ok", "timestamp": "2026-02-11T..." }
```

### Alternative: Pingdom

1. Create account at https://pingdom.com
2. Add uptime checks
3. Configure alerts
4. Set up status page

## Monitoring Dashboard

### Key Metrics

**Analytics:**
- Daily active users
- Page views
- Episode plays
- Form submissions
- Bounce rate
- Average session duration

**Performance:**
- Response time
- Error rate
- Uptime percentage
- API latency
- Database query time

**Errors:**
- Error count by type
- Error rate trend
- Most common errors
- Affected users
- Error resolution time

### Alerts

**Critical Alerts:**
- Site down (>5 minutes)
- Error rate >5%
- API response time >2s
- Database connection failures

**Warning Alerts:**
- Error rate >1%
- API response time >1s
- High memory usage
- High CPU usage

## Implementation Examples

### Track Audio Player Events

```typescript
// In AudioPlayer component
import { trackAudioPlay, trackAudioPause, trackAudioComplete } from '../services/analytics';

const handlePlay = () => {
  trackAudioPlay(episode.title, show.title);
  play();
};

const handlePause = () => {
  trackAudioPause(episode.title, currentTime);
  pause();
};

const handleEnded = () => {
  trackAudioComplete(episode.title);
};
```

### Track Form Submissions

```typescript
// In form component
import { trackFormSubmission } from '../services/analytics';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    await submitForm(formData);
    trackFormSubmission('story');
    showSuccess();
  } catch (error) {
    captureException(error);
    showError();
  }
};
```

### Track Social Shares

```typescript
// In share button
import { trackSocialShare } from '../services/analytics';

const handleShare = (platform: string) => {
  trackSocialShare(platform, 'article', article.title);
  window.open(shareUrl, '_blank');
};
```

## Data Privacy

### GDPR Compliance

**Plausible Analytics:**
- No cookies
- No personal data
- No cross-site tracking
- EU-hosted option available
- GDPR compliant by default

**Google Analytics:**
- IP anonymization enabled
- No PII collected
- Cookie consent required
- Data retention: 14 months

**Sentry:**
- Sensitive data filtered
- No email addresses
- No IP addresses
- User IDs only (no PII)

### Cookie Policy

**Analytics Cookies:**
- Plausible: None
- Google Analytics: _ga, _gid (with consent)

**Functional Cookies:**
- Session: auth_token
- Preferences: theme, language

### User Rights

Users can:
- Opt out of analytics
- Request data deletion
- Access collected data
- Withdraw consent

## Cost Optimization

### Plausible Pricing
- $9/month for 10k pageviews
- $19/month for 100k pageviews
- $99/month for 1M pageviews

### Sentry Pricing
- Free: 5k errors/month
- Team: $26/month for 50k errors
- Business: $80/month for 100k errors

### UptimeRobot Pricing
- Free: 50 monitors, 5-min checks
- Pro: $7/month, 1-min checks

## Troubleshooting

### Analytics Not Working

1. **Check environment variables**
   ```bash
   echo $VITE_ANALYTICS_ENABLED
   echo $VITE_ANALYTICS_PROVIDER
   ```

2. **Verify script loading**
   - Open browser DevTools
   - Check Network tab
   - Look for plausible.js or gtag.js

3. **Check console for errors**
   ```javascript
   console.log('Analytics initialized');
   ```

### Sentry Not Capturing Errors

1. **Verify DSN**
   ```bash
   echo $SENTRY_DSN
   ```

2. **Check initialization**
   ```
   Sentry error tracking initialized
   ```

3. **Test error capture**
   ```typescript
   throw new Error('Test error');
   ```

### Uptime Monitor False Positives

1. **Increase timeout**
   - Default: 30s
   - Recommended: 60s

2. **Check from multiple locations**
   - Enable multi-location checks

3. **Verify health endpoint**
   ```bash
   curl https://resistanceradio.org/health
   ```

## Best Practices

### Analytics
1. Track meaningful events only
2. Use descriptive event names
3. Include relevant context
4. Respect user privacy
5. Monitor data quality

### Error Tracking
1. Add context to errors
2. Set appropriate severity levels
3. Filter sensitive data
4. Group similar errors
5. Set up alerts

### Monitoring
1. Monitor critical paths
2. Set realistic thresholds
3. Test alert channels
4. Document runbooks
5. Review metrics regularly

## Resources

- [Plausible Documentation](https://plausible.io/docs)
- [Google Analytics 4](https://support.google.com/analytics)
- [Sentry Documentation](https://docs.sentry.io/)
- [UptimeRobot Guide](https://uptimerobot.com/help/)
