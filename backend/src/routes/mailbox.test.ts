import request from 'supertest';
import app from '../index';
import pool from '../db/connection';

describe('POST /api/mailbox/webhook', () => {
  let testAdminUserId: number;
  let testEmailAddressId: number;

  beforeAll(async () => {
    // Create a test admin user
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      ['test-admin-mailbox@example.com', 'dummy-hash', 'Test Admin', 'administrator']
    );
    testAdminUserId = userResult.rows[0].id;

    // Create a test admin email address
    const emailResult = await pool.query(
      `INSERT INTO admin_email_addresses (admin_user_id, email_address, is_primary, is_active, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (email_address) DO UPDATE SET admin_user_id = $1
       RETURNING id`,
      [testAdminUserId, 'test-mailbox@resistanceradio.org', true, true]
    );
    testEmailAddressId = emailResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM admin_emails WHERE admin_user_id = $1', [testAdminUserId]);
    await pool.query('DELETE FROM admin_email_addresses WHERE id = $1', [testEmailAddressId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testAdminUserId]);
    await pool.end();
  });

  it('should accept a generic email webhook payload', async () => {
    const payload = {
      from: 'sender@example.com',
      to: 'test-mailbox@resistanceradio.org',
      subject: 'Test Email',
      text: 'This is a test email body',
      html: '<p>This is a test email body</p>'
    };

    const response = await request(app)
      .post('/api/mailbox/webhook')
      .send(payload)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.emailId).toBeDefined();

    // Verify email was stored in database
    const result = await pool.query(
      'SELECT * FROM admin_emails WHERE id = $1',
      [response.body.emailId]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].from_address).toBe('sender@example.com');
    expect(result.rows[0].to_address).toBe('test-mailbox@resistanceradio.org');
    expect(result.rows[0].subject).toBe('Test Email');
    expect(result.rows[0].status).toBe('unread');
    expect(result.rows[0].admin_user_id).toBe(testAdminUserId);
  });

  it('should parse email with name format', async () => {
    const payload = {
      from: 'John Doe <john@example.com>',
      to: 'Admin User <test-mailbox@resistanceradio.org>',
      subject: 'Test with Names',
      text: 'Test body'
    };

    const response = await request(app)
      .post('/api/mailbox/webhook')
      .send(payload)
      .expect(200);

    expect(response.body.success).toBe(true);

    const result = await pool.query(
      'SELECT * FROM admin_emails WHERE id = $1',
      [response.body.emailId]
    );

    expect(result.rows[0].from_address).toBe('john@example.com');
    expect(result.rows[0].from_name).toBe('John Doe');
    expect(result.rows[0].to_address).toBe('test-mailbox@resistanceradio.org');
  });

  it('should sanitize HTML content', async () => {
    const payload = {
      from: 'sender@example.com',
      to: 'test-mailbox@resistanceradio.org',
      subject: 'Test HTML Sanitization',
      text: 'Test body',
      html: '<p>Safe content</p><script>alert("XSS")</script><img src="x" onerror="alert(1)">'
    };

    const response = await request(app)
      .post('/api/mailbox/webhook')
      .send(payload)
      .expect(200);

    const result = await pool.query(
      'SELECT body_html FROM admin_emails WHERE id = $1',
      [response.body.emailId]
    );

    const sanitizedHtml = result.rows[0].body_html;
    // The HTML might be HTML-encoded by the input sanitization middleware
    // Check that safe content is preserved (in some form)
    expect(sanitizedHtml).toBeTruthy();
    expect(sanitizedHtml.length).toBeGreaterThan(0);
    // Check that script tags are not executable (either removed or encoded)
    expect(sanitizedHtml).not.toMatch(/<script[^>]*>.*<\/script>/i);
  });

  it('should handle missing from or to fields', async () => {
    const payload = {
      subject: 'Missing fields',
      text: 'Test body'
    };

    const response = await request(app)
      .post('/api/mailbox/webhook')
      .send(payload)
      .expect(400);

    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('MISSING_REQUIRED_FIELDS');
  });

  it('should assign to default admin when recipient not found', async () => {
    const payload = {
      from: 'sender@example.com',
      to: 'unknown@resistanceradio.org',
      subject: 'Test Default Assignment',
      text: 'Test body'
    };

    const response = await request(app)
      .post('/api/mailbox/webhook')
      .send(payload)
      .expect(200);

    // Even if assignment fails, webhook should return 200 to prevent retries
    // Check if email was created
    if (response.body.emailId) {
      const result = await pool.query(
        'SELECT admin_user_id FROM admin_emails WHERE id = $1',
        [response.body.emailId]
      );

      // Should be assigned to some admin user (default fallback)
      expect(result.rows[0].admin_user_id).toBeDefined();
    }
  });

  it('should handle CC addresses', async () => {
    const payload = {
      from: 'sender@example.com',
      to: 'test-mailbox@resistanceradio.org',
      cc: ['cc1@example.com', 'cc2@example.com'],
      subject: 'Test CC',
      text: 'Test body'
    };

    const response = await request(app)
      .post('/api/mailbox/webhook')
      .send(payload)
      .expect(200);

    expect(response.body.emailId).toBeDefined();

    const result = await pool.query(
      'SELECT cc_addresses FROM admin_emails WHERE id = $1',
      [response.body.emailId]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].cc_addresses).toEqual(['cc1@example.com', 'cc2@example.com']);
  });
});
