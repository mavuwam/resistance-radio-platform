import express, { Request, Response } from 'express';
import pool from '../db/connection';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { sendSubmissionConfirmation } from '../services/email';
import logger from '../utils/logger';

const router = express.Router();

// Rate limiting for form submissions (5 submissions per hour per IP)
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: { message: 'Too many submissions. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' } }
});

/**
 * POST /api/submissions/story - Submit a story
 */
router.post('/story',
  submissionLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('story_type').isIn(['personal_experience', 'community_issue', 'testimony', 'question', 'other']).withMessage('Invalid story type'),
    body('message').trim().notEmpty().withMessage('Story content is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, story_type, message } = req.body;

      const result = await pool.query(
        `INSERT INTO submissions (submission_type, submitter_name, submitter_email, content, metadata, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id`,
        ['story', name, email, message, JSON.stringify({ story_type, phone }), 'pending']
      );

      // Send confirmation email
      try {
        await sendSubmissionConfirmation(email, name, 'story');
      } catch (emailError) {
        logger.error('Failed to send confirmation email:', emailError);
        // Don't fail the submission if email fails
      }

      res.status(201).json({
        message: 'Story submitted successfully',
        submissionId: result.rows[0].id
      });
    } catch (error) {
      console.error('Error submitting story:', error);
      res.status(500).json({ error: { message: 'Failed to submit story', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * POST /api/submissions/volunteer - Submit volunteer application
 */
router.post('/volunteer',
  submissionLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('skills').optional().trim(),
    body('availability').optional().trim(),
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, skills, availability, message } = req.body;

      const result = await pool.query(
        `INSERT INTO submissions (submission_type, submitter_name, submitter_email, content, metadata, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id`,
        ['volunteer', name, email, message, JSON.stringify({ skills, availability, phone }), 'pending']
      );

      res.status(201).json({
        message: 'Volunteer application submitted successfully',
        submissionId: result.rows[0].id
      });
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      res.status(500).json({ error: { message: 'Failed to submit application', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * POST /api/submissions/contributor - Submit contributor pitch
 */
router.post('/contributor',
  submissionLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('contribution_type').isIn(['show_host', 'writer', 'researcher', 'expert', 'other']).withMessage('Invalid contribution type'),
    body('experience').optional().trim(),
    body('message').trim().notEmpty().withMessage('Pitch is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, contribution_type, experience, message } = req.body;

      const result = await pool.query(
        `INSERT INTO submissions (submission_type, submitter_name, submitter_email, content, metadata, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id`,
        ['contributor', name, email, message, JSON.stringify({ contribution_type, experience, phone }), 'pending']
      );

      res.status(201).json({
        message: 'Contributor pitch submitted successfully',
        submissionId: result.rows[0].id
      });
    } catch (error) {
      console.error('Error submitting contributor pitch:', error);
      res.status(500).json({ error: { message: 'Failed to submit pitch', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * POST /api/submissions/contact - Submit contact form
 */
router.post('/contact',
  submissionLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').isIn(['general', 'feedback', 'technical', 'content', 'partnership', 'press', 'other']).withMessage('Invalid subject'),
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;

      const result = await pool.query(
        `INSERT INTO submissions (submission_type, submitter_name, submitter_email, subject, content, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id`,
        ['contact', name, email, subject, message, 'pending']
      );

      res.status(201).json({
        message: 'Message sent successfully',
        submissionId: result.rows[0].id
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({ error: { message: 'Failed to send message', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * POST /api/submissions/newsletter - Subscribe to newsletter
 */
router.post('/newsletter',
  submissionLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').optional().trim()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, name } = req.body;

      // Check if already subscribed
      const existing = await pool.query(
        'SELECT id, is_confirmed FROM newsletter_subscribers WHERE email = $1',
        [email]
      );

      if (existing.rows.length > 0) {
        if (existing.rows[0].is_confirmed) {
          return res.status(409).json({
            error: { message: 'Email already subscribed', code: 'ALREADY_SUBSCRIBED' }
          });
        } else {
          return res.status(200).json({
            message: 'Subscription pending confirmation. Please check your email.'
          });
        }
      }

      // Insert new subscriber
      await pool.query(
        `INSERT INTO newsletter_subscribers (email, name, is_confirmed, subscribed_at)
         VALUES ($1, $2, $3, NOW())`,
        [email, name || null, false]
      );

      // TODO: Send confirmation email

      res.status(201).json({
        message: 'Subscription successful! Please check your email to confirm.'
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      res.status(500).json({ error: { message: 'Failed to subscribe', code: 'SERVER_ERROR' } });
    }
  }
);

export default router;
