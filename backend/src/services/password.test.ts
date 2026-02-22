import { PasswordService, PasswordValidationResult } from './password';
import pool from '../db/connection';

// Mock the database pool
jest.mock('../db/connection', () => ({
  query: jest.fn(),
}));

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('validatePassword', () => {
    it('should accept a valid password with all requirements', () => {
      const result = passwordService.validatePassword('ValidPass123!');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = passwordService.validatePassword('Short1!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = passwordService.validatePassword('lowercase123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = passwordService.validatePassword('UPPERCASE123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without digit', () => {
      const result = passwordService.validatePassword('NoDigits!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one digit');
    });

    it('should reject password without special character', () => {
      const result = passwordService.validatePassword('NoSpecial123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    });

    it('should reject password that matches email address', () => {
      const email = 'test@example.com';
      const result = passwordService.validatePassword(email, email);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must not match your email address');
    });

    it('should reject password that matches email address (case insensitive)', () => {
      const email = 'test@example.com';
      const result = passwordService.validatePassword('TEST@EXAMPLE.COM', email);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must not match your email address');
    });

    it('should return multiple errors for password with multiple issues', () => {
      const result = passwordService.validatePassword('short');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one digit');
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    });

    it('should accept password with various special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      for (const char of specialChars) {
        const password = `Valid123${char}`;
        const result = passwordService.validatePassword(password);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });
  });

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2b$')).toBe(true); // bcrypt hash format
    });

    it('should use salt factor of 10 or higher', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      // Extract salt rounds from bcrypt hash (format: $2b$10$...)
      const saltRounds = parseInt(hash.split('$')[2]);
      
      expect(saltRounds).toBeGreaterThanOrEqual(10);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await passwordService.hashPassword(password);
      const hash2 = await passwordService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password against hash', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      const isValid = await passwordService.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password against hash', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      const isValid = await passwordService.verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword123!';
      const hash = await passwordService.hashPassword(password);
      
      const isValid = await passwordService.verifyPassword('testpassword123!', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateResetToken', () => {
    it('should generate a token with at least 64 characters', async () => {
      const result = await passwordService.generateResetToken();
      
      expect(result.token).toBeDefined();
      expect(result.token.length).toBeGreaterThanOrEqual(64);
    });

    it('should generate a token in hex format', async () => {
      const result = await passwordService.generateResetToken();
      
      // Hex string should only contain 0-9 and a-f
      expect(result.token).toMatch(/^[0-9a-f]+$/);
    });

    it('should hash the token before storage', async () => {
      const result = await passwordService.generateResetToken();
      
      expect(result.tokenHash).toBeDefined();
      expect(result.tokenHash).not.toBe(result.token);
      expect(result.tokenHash.startsWith('$2b$')).toBe(true); // bcrypt hash format
    });

    it('should set expiration to exactly 1 hour from now', async () => {
      const beforeGeneration = new Date();
      const result = await passwordService.generateResetToken();
      const afterGeneration = new Date();
      
      const expectedExpiry = new Date(beforeGeneration);
      expectedExpiry.setHours(expectedExpiry.getHours() + 1);
      
      // Allow 1 second tolerance for test execution time
      const timeDiff = Math.abs(result.expiresAt.getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });

    it('should generate unique tokens on each call', async () => {
      const result1 = await passwordService.generateResetToken();
      const result2 = await passwordService.generateResetToken();
      
      expect(result1.token).not.toBe(result2.token);
      expect(result1.tokenHash).not.toBe(result2.tokenHash);
    });

    it('should use bcrypt salt factor of 10 or higher for token hash', async () => {
      const result = await passwordService.generateResetToken();
      
      // Extract salt rounds from bcrypt hash (format: $2b$10$...)
      const saltRounds = parseInt(result.tokenHash.split('$')[2]);
      
      expect(saltRounds).toBeGreaterThanOrEqual(10);
    });
  });

  describe('verifyResetToken', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
    });

    it('should return null for non-existent token', async () => {
      // Mock empty result from database
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const fakeToken = 'a'.repeat(64);
      const userId = await passwordService.verifyResetToken(fakeToken);
      
      expect(userId).toBeNull();
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should return null for empty token', async () => {
      // Mock empty result from database
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const userId = await passwordService.verifyResetToken('');
      
      expect(userId).toBeNull();
    });

    it('should return null for invalid token format', async () => {
      // Mock empty result from database
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const userId = await passwordService.verifyResetToken('invalid-token');
      
      expect(userId).toBeNull();
    });

    it('should return user ID for valid token', async () => {
      // Generate a real token to test against
      const tokenResult = await passwordService.generateResetToken();
      
      // Mock database result with the token hash
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{
          id: 1,
          user_id: 42,
          token_hash: tokenResult.tokenHash,
          expires_at: tokenResult.expiresAt,
          used_at: null
        }]
      });

      const userId = await passwordService.verifyResetToken(tokenResult.token);
      
      expect(userId).toBe(42);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should return null when token does not match any hash', async () => {
      // Generate a token but mock a different hash in the database
      const tokenResult1 = await passwordService.generateResetToken();
      const tokenResult2 = await passwordService.generateResetToken();
      
      // Mock database with different token hash
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [{
          id: 1,
          user_id: 42,
          token_hash: tokenResult2.tokenHash,
          expires_at: tokenResult2.expiresAt,
          used_at: null
        }]
      });

      const userId = await passwordService.verifyResetToken(tokenResult1.token);
      
      expect(userId).toBeNull();
    });

    it('should query only unused and non-expired tokens', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      await passwordService.verifyResetToken('test-token');
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('used_at IS NULL'),
        []
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('expires_at > NOW()'),
        []
      );
    });
  });
});
