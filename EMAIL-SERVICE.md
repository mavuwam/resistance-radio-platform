# Email Service Documentation

## Overview

Resistance Radio uses Nodemailer for email delivery, supporting multiple SMTP providers including Gmail, SendGrid, AWS SES, and custom SMTP servers.

## Configuration

### Environment Variables

```bash
# Email Configuration
EMAIL_FROM=noreply@resistanceradio.org
EMAIL_FROM_NAME=Resistance Radio
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=https://resistanceradio.org
```

### Supported Providers

#### 1. Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password  # Use App Password, not regular password
```

**Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `SMTP_PASS`

#### 2. SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

**Setup:**
1. Create SendGrid account: https://sendgrid.com
2. Generate API key with Mail Send permissions
3. Use "apikey" as username and API key as password

#### 3. AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_username
SMTP_PASS=your_ses_smtp_password
```

**Setup:**
1. Verify your domain in AWS SES
2. Create SMTP credentials in SES console
3. Move out of sandbox mode for production

#### 4. Custom SMTP
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=your_username
SMTP_PASS=your_password
```

## Email Templates

### 1. Newsletter Subscription Confirmation

**Trigger:** User subscribes to newsletter  
**Function:** `sendNewsletterConfirmation(email, confirmToken)`

**Features:**
- Confirmation link with token
- Branded header and footer
- Clear call-to-action button
- Security notice

### 2. Form Submission Confirmation

**Trigger:** User submits story/volunteer/contributor/contact form  
**Function:** `sendSubmissionConfirmation(email, name, submissionType)`

**Features:**
- Personalized greeting
- Submission type acknowledgment
- Expected response time (3-5 business days)
- Contact information

### 3. Submission Status Notification

**Trigger:** Admin approves or rejects submission  
**Function:** `sendSubmissionStatusNotification(email, name, submissionType, status, feedback)`

**Features:**
- Status badge (approved/rejected)
- Optional feedback from admin
- Next steps information
- Branded design

### 4. Welcome Email

**Trigger:** New user registration  
**Function:** `sendWelcomeEmail(email, name)`

**Features:**
- Personalized welcome message
- Quick links to key sections
- Community introduction
- Call-to-action buttons

### 5. Password Reset

**Trigger:** User requests password reset  
**Function:** `sendPasswordResetEmail(email, resetToken)`

**Features:**
- Secure reset link with token
- 1-hour expiration notice
- Security warning
- Clear instructions

## Usage Examples

### Backend Integration

```typescript
import {
  sendSubmissionConfirmation,
  sendSubmissionStatusNotification,
  sendNewsletterConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail
} from '../services/email';

// After form submission
try {
  await sendSubmissionConfirmation(email, name, 'story');
} catch (error) {
  logger.error('Failed to send confirmation email:', error);
  // Don't fail the submission if email fails
}

// After admin approval
try {
  await sendSubmissionStatusNotification(
    email,
    name,
    'volunteer',
    'approved',
    'Great application! We'll be in touch soon.'
  );
} catch (error) {
  logger.error('Failed to send status notification:', error);
}
```

### Error Handling

Emails are sent asynchronously and failures are logged but don't block the main operation:

```typescript
try {
  await sendEmail({ to, subject, html });
  logger.info(`Email sent to ${to}: ${subject}`);
} catch (error) {
  logger.error(`Failed to send email to ${to}:`, error);
  throw error;
}
```

## Email Design

### Brand Colors
- Deep Black: #0d0d0d
- Burnt Orange: #ff6b35
- Gold: #f7b731
- White: #ffffff

### Layout Structure
```html
<div class="container">
  <div class="header">
    <!-- Logo and tagline -->
  </div>
  <div class="content">
    <!-- Main email content -->
  </div>
  <div class="footer">
    <!-- Copyright and links -->
  </div>
</div>
```

### Responsive Design
- Max width: 600px
- Mobile-friendly buttons
- Readable font sizes
- Proper spacing

## Testing

### Local Testing

Use a service like Mailtrap for development:

```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
```

### Test Email Sending

```typescript
import { sendEmail } from './services/email';

// Test basic email
await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello World</h1>'
});
```

### Verify Transporter

The email service automatically verifies the SMTP configuration on startup:

```
Email service is ready
```

If configuration is invalid:
```
Email transporter verification failed: [error details]
```

## Monitoring

### Logs

All email operations are logged:

```
INFO: Email sent to user@example.com: Welcome to Resistance Radio!
ERROR: Failed to send email to user@example.com: Connection timeout
```

### Metrics to Track

1. **Delivery Rate**: Percentage of successfully sent emails
2. **Bounce Rate**: Percentage of emails that bounce
3. **Open Rate**: Percentage of emails opened (requires tracking pixels)
4. **Click Rate**: Percentage of links clicked

### CloudWatch Integration (AWS SES)

```typescript
// Track email metrics
const metrics = {
  sent: 0,
  delivered: 0,
  bounced: 0,
  complained: 0
};
```

## Best Practices

### 1. Email Content
- Keep subject lines under 50 characters
- Use clear, actionable CTAs
- Include plain text version
- Test on multiple email clients

### 2. Deliverability
- Verify sender domain (SPF, DKIM, DMARC)
- Maintain clean email list
- Monitor bounce rates
- Avoid spam trigger words

### 3. Security
- Never send passwords in emails
- Use secure tokens with expiration
- Validate email addresses
- Rate limit email sending

### 4. Performance
- Send emails asynchronously
- Use email queues for bulk sending
- Implement retry logic
- Cache email templates

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**
   ```bash
   # Test connection
   telnet smtp.gmail.com 587
   ```

2. **Verify environment variables**
   ```bash
   echo $SMTP_HOST
   echo $SMTP_USER
   ```

3. **Check logs**
   ```bash
   tail -f backend/logs/error.log
   ```

### Emails Going to Spam

1. **Verify domain authentication**
   - Add SPF record
   - Configure DKIM
   - Set up DMARC

2. **Check content**
   - Avoid spam trigger words
   - Balance text/image ratio
   - Include unsubscribe link

3. **Monitor reputation**
   - Check sender score
   - Review bounce rates
   - Monitor complaint rates

### Slow Email Delivery

1. **Use email queue**
   - Implement Bull or similar
   - Process emails in background
   - Retry failed sends

2. **Optimize SMTP connection**
   - Reuse connections
   - Use connection pooling
   - Increase timeout limits

## Migration Guide

### From SendGrid to AWS SES

1. **Verify domain in SES**
2. **Create SMTP credentials**
3. **Update environment variables**
4. **Test email sending**
5. **Monitor for 24 hours**
6. **Deactivate SendGrid**

### From Gmail to Custom SMTP

1. **Set up email server**
2. **Configure DNS records**
3. **Update environment variables**
4. **Test thoroughly**
5. **Monitor delivery rates**

## Future Enhancements

1. **Email Queue System**
   - Bull or BullMQ for job processing
   - Retry failed emails
   - Priority queues

2. **Email Templates Engine**
   - Handlebars or EJS templates
   - Dynamic content injection
   - Multi-language support

3. **Advanced Analytics**
   - Open tracking
   - Click tracking
   - Conversion tracking

4. **Bulk Email Support**
   - Newsletter campaigns
   - Batch processing
   - Unsubscribe management

5. **Email Preferences**
   - User notification settings
   - Frequency controls
   - Category preferences

## Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/guides/email-design/)
