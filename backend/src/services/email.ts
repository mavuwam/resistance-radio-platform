import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@resistanceradio.org';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Resistance Radio';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://resistanceradio.org';

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    logger.error('Email transporter verification failed:', error);
  } else {
    logger.info('Email service is ready');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Newsletter subscription confirmation email
 */
export async function sendNewsletterConfirmation(email: string, confirmToken: string): Promise<void> {
  const confirmUrl = `${FRONTEND_URL}/newsletter/confirm?token=${confirmToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0d0d0d; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #ffffff; }
        .button { display: inline-block; padding: 12px 30px; background: #ff6b35; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Resistance Radio</h1>
          <p>Broadcasting courage. Amplifying truth.</p>
        </div>
        <div class="content">
          <h2>Confirm Your Newsletter Subscription</h2>
          <p>Thank you for subscribing to the Resistance Radio newsletter!</p>
          <p>To complete your subscription, please click the button below:</p>
          <a href="${confirmUrl}" class="button">Confirm Subscription</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${confirmUrl}</p>
          <p>If you didn't request this subscription, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Resistance Radio. All rights reserved.</p>
          <p>Where citizens speak, and power learns to listen.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Confirm Your Newsletter Subscription - Resistance Radio',
    html
  });
}

/**
 * Form submission confirmation email
 */
export async function sendSubmissionConfirmation(
  email: string,
  name: string,
  submissionType: string
): Promise<void> {
  const typeLabels: Record<string, string> = {
    story: 'Story Submission',
    volunteer: 'Volunteer Application',
    contributor: 'Contributor Pitch',
    contact: 'Contact Form'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0d0d0d; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #ffffff; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Resistance Radio</h1>
        </div>
        <div class="content">
          <h2>Thank You, ${name}!</h2>
          <p>We've received your ${typeLabels[submissionType] || 'submission'}.</p>
          <p>Our team will review it carefully and get back to you within 3-5 business days.</p>
          <p>We appreciate your interest in Resistance Radio and your commitment to amplifying truth and courage.</p>
          <p>If you have any questions, feel free to contact us at <a href="mailto:info@resistanceradio.org">info@resistanceradio.org</a>.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Resistance Radio. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `${typeLabels[submissionType]} Received - Resistance Radio`,
    html
  });
}

/**
 * Submission status notification email (approved/rejected)
 */
export async function sendSubmissionStatusNotification(
  email: string,
  name: string,
  submissionType: string,
  status: 'approved' | 'rejected',
  feedback?: string
): Promise<void> {
  const typeLabels: Record<string, string> = {
    story: 'Story Submission',
    volunteer: 'Volunteer Application',
    contributor: 'Contributor Pitch',
    contact: 'Contact Form'
  };

  const statusMessages = {
    approved: {
      title: 'Great News!',
      message: `Your ${typeLabels[submissionType]} has been approved!`,
      color: '#5cb85c'
    },
    rejected: {
      title: 'Update on Your Submission',
      message: `Thank you for your ${typeLabels[submissionType]}. After careful review, we're unable to move forward at this time.`,
      color: '#d9534f'
    }
  };

  const statusInfo = statusMessages[status];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0d0d0d; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #ffffff; }
        .status-badge { display: inline-block; padding: 8px 16px; background: ${statusInfo.color}; color: #ffffff; border-radius: 4px; margin: 10px 0; }
        .feedback { background: #f9f9f9; padding: 15px; border-left: 3px solid #ff6b35; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Resistance Radio</h1>
        </div>
        <div class="content">
          <h2>${statusInfo.title}</h2>
          <div class="status-badge">${status.toUpperCase()}</div>
          <p>Dear ${name},</p>
          <p>${statusInfo.message}</p>
          ${feedback ? `
            <div class="feedback">
              <strong>Feedback from our team:</strong>
              <p>${feedback}</p>
            </div>
          ` : ''}
          ${status === 'approved' ? `
            <p>We'll be in touch soon with next steps. Thank you for being part of the Resistance Radio community!</p>
          ` : `
            <p>We encourage you to stay connected with us and consider submitting again in the future.</p>
          `}
          <p>If you have any questions, please contact us at <a href="mailto:info@resistanceradio.org">info@resistanceradio.org</a>.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Resistance Radio. All rights reserved.</p>
          <p>Where citizens speak, and power learns to listen.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `${typeLabels[submissionType]} ${status === 'approved' ? 'Approved' : 'Update'} - Resistance Radio`,
    html
  });
}

/**
 * Welcome email for new users
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0d0d0d; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #ffffff; }
        .button { display: inline-block; padding: 12px 30px; background: #ff6b35; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Resistance Radio!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Thank you for joining the Resistance Radio community!</p>
          <p>We're a justice-oriented radio station amplifying truth, courage, and community across Zimbabwe and the diaspora.</p>
          <h3>What's Next?</h3>
          <ul>
            <li>Explore our <a href="${FRONTEND_URL}/shows">shows</a> and discover powerful voices</li>
            <li>Listen <a href="${FRONTEND_URL}/listen">live</a> or catch up on-demand</li>
            <li>Read our latest <a href="${FRONTEND_URL}/news">news and insights</a></li>
            <li>Get involved by <a href="${FRONTEND_URL}/get-involved">sharing your story</a></li>
          </ul>
          <a href="${FRONTEND_URL}" class="button">Visit Resistance Radio</a>
          <p>Together, we amplify the voices that need to be heard.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Resistance Radio. All rights reserved.</p>
          <p>Where citizens speak, and power learns to listen.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Resistance Radio!',
    html
  });
}

/**
 * Password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0d0d0d; color: #ffffff; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background: #ffffff; }
        .button { display: inline-block; padding: 12px 30px; background: #ff6b35; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .warning { background: #fff3cd; padding: 15px; border-left: 3px solid #f7b731; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Resistance Radio</h1>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <div class="warning">
            <strong>Security Notice:</strong>
            <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2026 Resistance Radio. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request - Resistance Radio',
    html
  });
}
