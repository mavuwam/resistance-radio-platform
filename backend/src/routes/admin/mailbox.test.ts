import request from 'supertest';
import app from '../../index';
import pool from '../../db/connection';
import { generateToken } from '../../middleware/auth';

describe('Admin Mailbox API', () => {
  let testAdminUserId: number;
  let testEmailAddressId: number;
  let testEmailId: number;
  let authToken: string;

  beforeAll(async () => {
    // Create a test admin user
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      ['test-admin-mailbox-api@example.com', 'dummy-hash', 'Test Admin', 'administrator']
    );
    testAdminUserId = userResult.rows[0].id;

    // Generate auth token
    authToken = generateToken(testAdminUserId.toString(), 'test-admin-mailbox-api@example.com', 'administrator');

    // Create a test admin email address
    const emailResult = await pool.query(
      `INSERT INTO admin_email_addresses (admin_user_id, email_address, is_primary, is_active, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (email_address) DO UPDATE SET admin_user_id = $1
       RETURNING id`,
      [testAdminUserId, 'test-admin-api@resistanceradio.org', true, true]
    );
    testEmailAddressId = emailResult.rows[0].id;

    // Create a test email
    const testEmailResult = await pool.query(
      `INSERT INTO admin_emails (
        admin_user_id, from_address, from_name, to_address, subject, 
        body_text, body_html, status, is_starred, received_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
      RETURNING id`,
      [
        testAdminUserId,
        'sender@example.com',
        'Test Sender',
        'test-admin-api@resistanceradio.org',
        'Test Email Subject',
        'This is a test email body',
        '<p>This is a test email body</p>',
        'unread',
        false
      ]
    );
    testEmailId = testEmailResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM admin_emails WHERE admin_user_id = $1', [testAdminUserId]);
    await pool.query('DELETE FROM admin_email_addresses WHERE id = $1', [testEmailAddressId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testAdminUserId]);
    await pool.end();
  });

  describe('GET /api/admin/mailbox', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/mailbox')
        .expect(401);

      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should return paginated emails for authenticated user', async () => {
      const response = await request(app)
        .get('/api/admin/mailbox')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('emails');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('unreadCount');
      expect(Array.isArray(response.body.emails)).toBe(true);
      expect(response.body.emails.length).toBeGreaterThan(0);
    });

    it('should filter emails by status', async () => {
      const response = await request(app)
        .get('/api/admin/mailbox?status=unread')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.emails.every((email: any) => email.status === 'unread')).toBe(true);
    });

    it('should search emails', async () => {
      const response = await request(app)
        .get('/api/admin/mailbox?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.emails.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/admin/mailbox/:id', () => {
    it('should return 404 for non-existent email', async () => {
      const response = await request(app)
        .get('/api/admin/mailbox/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error.code).toBe('EMAIL_NOT_FOUND');
    });

    it('should return email detail and mark as read', async () => {
      const response = await request(app)
        .get(`/api/admin/mailbox/${testEmailId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testEmailId);
      expect(response.body.fromAddress).toBe('sender@example.com');
      expect(response.body.subject).toBe('Test Email Subject');
      expect(response.body).toHaveProperty('bodyText');
      expect(response.body).toHaveProperty('bodyHtml');
    });
  });

  describe('PATCH /api/admin/mailbox/:id/status', () => {
    it('should update email status', async () => {
      const response = await request(app)
        .patch(`/api/admin/mailbox/${testEmailId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'archived' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.email.status).toBe('archived');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .patch(`/api/admin/mailbox/${testEmailId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_STATUS');
    });
  });

  describe('PATCH /api/admin/mailbox/:id/star', () => {
    it('should toggle star status', async () => {
      const response = await request(app)
        .patch(`/api/admin/mailbox/${testEmailId}/star`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isStarred: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.email.isStarred).toBe(true);
    });
  });

  describe('POST /api/admin/mailbox/bulk', () => {
    it('should perform bulk operations', async () => {
      const response = await request(app)
        .post('/api/admin/mailbox/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ emailIds: [testEmailId], action: 'mark_read' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.updatedCount).toBeGreaterThan(0);
    });

    it('should reject invalid action', async () => {
      const response = await request(app)
        .post('/api/admin/mailbox/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ emailIds: [testEmailId], action: 'invalid' })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
  });

  describe('GET /api/admin/mailbox/unread-count', () => {
    it('should return unread count', async () => {
      const response = await request(app)
        .get('/api/admin/mailbox/unread-count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('unreadCount');
      expect(typeof response.body.unreadCount).toBe('number');
    });
  });

  describe('Email Address Management', () => {
    it('should list user email addresses', async () => {
      const response = await request(app)
        .get('/api/admin/mailbox/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.addresses).toBeDefined();
      expect(Array.isArray(response.body.addresses)).toBe(true);
      expect(response.body.addresses.length).toBeGreaterThan(0);
    });

    it('should add new email address', async () => {
      const response = await request(app)
        .post('/api/admin/mailbox/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ emailAddress: 'new-test@resistanceradio.org', isPrimary: false })
        .expect(201);

      expect(response.body.emailAddress).toBe('new-test@resistanceradio.org');
      
      // Clean up
      await pool.query('DELETE FROM admin_email_addresses WHERE email_address = $1', ['new-test@resistanceradio.org']);
    });

    it('should reject duplicate email address', async () => {
      const response = await request(app)
        .post('/api/admin/mailbox/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ emailAddress: 'test-admin-api@resistanceradio.org', isPrimary: false })
        .expect(400);

      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should delete email address', async () => {
      // Create a temporary address
      const tempResult = await pool.query(
        `INSERT INTO admin_email_addresses (admin_user_id, email_address, is_primary, is_active, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id`,
        [testAdminUserId, 'temp-delete@resistanceradio.org', false, true]
      );
      const tempId = tempResult.rows[0].id;

      const response = await request(app)
        .delete(`/api/admin/mailbox/addresses/${tempId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
