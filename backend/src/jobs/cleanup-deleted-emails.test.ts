import pool from '../db/connection';
import { cleanupDeletedEmails } from './cleanup-deleted-emails';
import logger from '../utils/logger';

// Mock dependencies
jest.mock('../db/connection');
jest.mock('../utils/logger');

describe('cleanupDeletedEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete emails with status=deleted and deleted_at > 30 days ago', async () => {
    // Mock successful deletion
    const mockResult = { rowCount: 5 };
    (pool.query as jest.Mock).mockResolvedValue(mockResult);

    const deletedCount = await cleanupDeletedEmails();

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM admin_emails")
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE status = 'deleted'")
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("AND deleted_at < NOW() - INTERVAL '30 days'")
    );
    expect(deletedCount).toBe(5);
    expect(logger.info).toHaveBeenCalledWith(
      'Deleted emails cleanup job completed',
      { emailsDeleted: 5 }
    );
  });

  it('should handle zero deletions', async () => {
    // Mock no deletions
    const mockResult = { rowCount: 0 };
    (pool.query as jest.Mock).mockResolvedValue(mockResult);

    const deletedCount = await cleanupDeletedEmails();

    expect(deletedCount).toBe(0);
    expect(logger.info).toHaveBeenCalledWith(
      'Deleted emails cleanup job completed',
      { emailsDeleted: 0 }
    );
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    const mockError = new Error('Database connection failed');
    (pool.query as jest.Mock).mockRejectedValue(mockError);

    await expect(cleanupDeletedEmails()).rejects.toThrow('Database connection failed');
    
    expect(logger.error).toHaveBeenCalledWith(
      'Error cleaning up deleted emails',
      { error: mockError }
    );
  });

  it('should handle null rowCount', async () => {
    // Mock result with null rowCount
    const mockResult = { rowCount: null };
    (pool.query as jest.Mock).mockResolvedValue(mockResult);

    const deletedCount = await cleanupDeletedEmails();

    expect(deletedCount).toBe(0);
  });
});
