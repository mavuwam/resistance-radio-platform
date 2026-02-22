import express, { Request, Response } from 'express';
import pool from '../db/connection';
import logger from '../utils/logger';
import { AdminEmail } from '../models/AdminEmail';
import { sanitizeEmailHtml } from '../utils/sanitize';

const router = express.Router();

/**
 * Email webhook payload interface
 */
interface EmailWebhookPayload {
  from: string;
  to: string;
  cc?: string[];
  subject: string;
  text?: string;
  html?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  receivedAt?: string;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Parse email address from "Name <email@example.com>" format
 */
function parseEmailAddress(emailString: string): { address: string; name?: string } {
  // Decode HTML entities first (in case input was sanitized)
  const decoded = decodeHtmlEntities(emailString);
  
  const match = decoded.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^["']|["']$/g, ''),
      address: match[2].trim()
    };
  }
  return { address: decoded.trim() };
}



/**
 * Parse SendGrid Inbound Parse webhook format
 */
function parseSendGridWebhook(req: Request): EmailWebhookPayload {
  const body = req.body;
  return {
    from: body.from || '',
    to: body.to || '',
    cc: body.cc ? body.cc.split(',').map((e: string) => e.trim()) : [],
    subject: body.subject || '(No Subject)',
    text: body.text || '',
    html: body.html || '',
    messageId: body.headers ? body.headers['Message-ID'] : undefined,
    inReplyTo: body.headers ? body.headers['In-Reply-To'] : undefined,
    references: body.headers && body.headers['References'] 
      ? body.headers['References'].split(/\s+/) 
      : []
  };
}

/**
 * Parse Mailgun Routes webhook format
 */
function parseMailgunWebhook(req: Request): EmailWebhookPayload {
  const body = req.body;
  return {
    from: body.sender || body.from || '',
    to: body.recipient || body.to || '',
    cc: body.cc ? body.cc.split(',').map((e: string) => e.trim()) : [],
    subject: body.subject || '(No Subject)',
    text: body['body-plain'] || body.text || '',
    html: body['body-html'] || body.html || '',
    messageId: body['Message-Id'] || body.messageId,
    inReplyTo: body['In-Reply-To'] || body.inReplyTo,
    references: body['References'] ? body['References'].split(/\s+/) : []
  };
}

/**
 * Parse AWS SES webhook format (via SNS)
 */
function parseSESWebhook(req: Request): EmailWebhookPayload {
  try {
    const message = typeof req.body.Message === 'string' 
      ? JSON.parse(req.body.Message) 
      : req.body;
    
    const mail = message.mail || message;
    const content = message.content || {};
    const commonHeaders = mail.commonHeaders || {};
    
    return {
      from: (commonHeaders.from && commonHeaders.from[0]) || mail.source || '',
      to: (commonHeaders.to && commonHeaders.to[0]) || (mail.destination && mail.destination[0]) || '',
      cc: commonHeaders.cc || [],
      subject: commonHeaders.subject || mail.subject || '(No Subject)',
      text: content.text || '',
      html: content.html || '',
      messageId: mail.messageId || commonHeaders.messageId,
      inReplyTo: commonHeaders.inReplyTo,
      references: commonHeaders.references || []
    };
  } catch (error) {
    logger.error('Failed to parse SES webhook:', error);
    throw new Error('Invalid SES webhook format');
  }
}

/**
 * Detect email service provider and parse webhook payload
 */
function detectAndParseWebhook(req: Request): EmailWebhookPayload {
  // Check for SendGrid headers
  if (req.headers['user-agent']?.includes('SendGrid')) {
    return parseSendGridWebhook(req);
  }
  
  // Check for Mailgun signature header
  if (req.headers['x-mailgun-signature'] || req.body.signature) {
    return parseMailgunWebhook(req);
  }
  
  // Check for AWS SNS message
  if (req.body.Type === 'Notification' || req.body.Message) {
    return parseSESWebhook(req);
  }
  
  // Default: try to parse as generic format
  const body = req.body;
  return {
    from: body.from || body.sender || '',
    to: body.to || body.recipient || '',
    cc: body.cc ? (Array.isArray(body.cc) ? body.cc : body.cc.split(',').map((e: string) => e.trim())) : [],
    subject: body.subject || '(No Subject)',
    text: body.text || body['body-plain'] || '',
    html: body.html || body['body-html'] || '',
    messageId: body.messageId || body['Message-Id'],
    inReplyTo: body.inReplyTo || body['In-Reply-To'],
    references: body.references || []
  };
}

/**
 * Find admin user by email address
 */
async function findAdminUserByEmail(emailAddress: string): Promise<number | null> {
  try {
    const result = await pool.query(
      `SELECT admin_user_id 
       FROM admin_email_addresses 
       WHERE email_address = $1 AND is_active = true
       LIMIT 1`,
      [emailAddress.toLowerCase()]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].admin_user_id;
    }
    
    return null;
  } catch (error) {
    logger.error('Error finding admin user by email:', error);
    throw error;
  }
}

/**
 * Get default admin mailbox user ID
 */
async function getDefaultAdminUserId(): Promise<number> {
  try {
    // Find the first admin user with role 'administrator'
    const result = await pool.query(
      `SELECT id 
       FROM users 
       WHERE role = 'administrator' 
       ORDER BY id ASC 
       LIMIT 1`
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
    
    throw new Error('No default admin user found');
  } catch (error) {
    logger.error('Error getting default admin user:', error);
    throw error;
  }
}

/**
 * POST /api/mailbox/webhook - Receive incoming emails from email service provider
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Parse webhook payload based on provider
    const payload = detectAndParseWebhook(req);
    
    // Validate required fields
    if (!payload.from || !payload.to) {
      logger.warn('Webhook missing required fields:', { from: payload.from, to: payload.to });
      return res.status(400).json({
        error: {
          message: 'Missing required fields: from and to',
          code: 'MISSING_REQUIRED_FIELDS'
        }
      });
    }
    
    // Parse from address
    const fromParsed = parseEmailAddress(payload.from);
    const toParsed = parseEmailAddress(payload.to);
    
    // Find admin user by recipient email address
    let adminUserId = await findAdminUserByEmail(toParsed.address);
    
    // Fallback to default admin mailbox if no match found
    if (!adminUserId) {
      logger.info(`No admin user found for ${toParsed.address}, using default mailbox`);
      adminUserId = await getDefaultAdminUserId();
    }
    
    // Decode and sanitize HTML content
    const decodedHtml = payload.html ? decodeHtmlEntities(payload.html) : null;
    const sanitizedHtml = decodedHtml ? sanitizeEmailHtml(decodedHtml) : null;
    
    // Insert email record into database
    const result = await pool.query(
      `INSERT INTO admin_emails (
        admin_user_id,
        from_address,
        from_name,
        to_address,
        cc_addresses,
        subject,
        body_text,
        body_html,
        status,
        message_id,
        in_reply_to,
        "references",
        received_at,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING id`,
      [
        adminUserId,
        fromParsed.address,
        fromParsed.name || null,
        toParsed.address,
        payload.cc || [],
        payload.subject,
        payload.text || null,
        sanitizedHtml,
        'unread',
        payload.messageId || null,
        payload.inReplyTo || null,
        payload.references || [],
        payload.receivedAt ? new Date(payload.receivedAt) : new Date()
      ]
    );
    
    const emailId = result.rows[0].id;
    
    logger.info(`Email received and stored: ID ${emailId}, from ${fromParsed.address}, to ${toParsed.address}, assigned to admin user ${adminUserId}`);
    
    // Return success response
    res.status(200).json({
      success: true,
      emailId
    });
    
  } catch (error) {
    logger.error('Error processing email webhook:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      logger.error('Error details:', { message: error.message, stack: error.stack });
    }
    
    // Return 200 to prevent email service provider from retrying
    // Log the error for manual investigation
    res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal processing error'
    });
  }
});

export default router;
