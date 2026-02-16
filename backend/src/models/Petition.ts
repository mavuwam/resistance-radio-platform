import { nanoid } from 'nanoid';
import pool from '../db/connection';

export interface Petition {
  id: string;
  title: string;
  description: string;
  goalSignatures: number;
  currentSignatures: number;
  ownerId: string;
  url: string;
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetitionData {
  title: string;
  description: string;
  goalSignatures: number;
  ownerId: string;
}

export interface UpdatePetitionData {
  title?: string;
  description?: string;
  goalSignatures?: number;
}

export class PetitionModel {
  /**
   * Generate a unique URL slug for a petition
   */
  private static generateUrl(title: string): string {
    // Convert to lowercase and replace spaces with hyphens
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80);
    
    // Add random suffix to ensure uniqueness
    const suffix = nanoid(8);
    return `${slug}-${suffix}`;
  }

  /**
   * Create a new petition
   */
  static async create(petitionData: CreatePetitionData): Promise<Petition> {
    const { title, description, goalSignatures, ownerId } = petitionData;
    const url = this.generateUrl(title);
    
    const result = await pool.query(
      `INSERT INTO petitions (title, description, goal_signatures, owner_id, url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, title, description, goal_signatures, owner_id, url, status, created_at, updated_at`,
      [title, description, goalSignatures, ownerId, url]
    );
    
    return {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      goalSignatures: result.rows[0].goal_signatures,
      currentSignatures: 0,
      ownerId: result.rows[0].owner_id,
      url: result.rows[0].url,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  /**
   * Find petition by ID with signature count
   */
  static async findById(id: string): Promise<Petition | null> {
    const result = await pool.query(
      `SELECT id, title, description, goal_signatures, current_signatures, 
              owner_id, url, status, created_at, updated_at
       FROM petition_signature_counts 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      goalSignatures: result.rows[0].goal_signatures,
      currentSignatures: result.rows[0].current_signatures,
      ownerId: result.rows[0].owner_id,
      url: result.rows[0].url,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  /**
   * Find petition by URL with signature count
   */
  static async findByUrl(url: string): Promise<Petition | null> {
    const result = await pool.query(
      `SELECT id, title, description, goal_signatures, current_signatures, 
              owner_id, url, status, created_at, updated_at
       FROM petition_signature_counts 
       WHERE url = $1`,
      [url]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      goalSignatures: result.rows[0].goal_signatures,
      currentSignatures: result.rows[0].current_signatures,
      ownerId: result.rows[0].owner_id,
      url: result.rows[0].url,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  /**
   * Update petition
   */
  static async update(id: string, updateData: UpdatePetitionData): Promise<Petition | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updateData.title);
    }

    if (updateData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updateData.description);
    }

    if (updateData.goalSignatures !== undefined) {
      fields.push(`goal_signatures = $${paramCount++}`);
      values.push(updateData.goalSignatures);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE petitions 
       SET ${fields.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, title, description, goal_signatures, owner_id, url, status, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Get current signature count
    const petition = await this.findById(id);
    return petition;
  }

  /**
   * Close a petition
   */
  static async close(id: string): Promise<Petition | null> {
    const result = await pool.query(
      `UPDATE petitions 
       SET status = 'closed' 
       WHERE id = $1 
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * List petitions with filters
   */
  static async list(options: {
    search?: string;
    sortBy?: 'recent' | 'signatures' | 'progress';
    status?: 'active' | 'closed';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ petitions: Petition[]; total: number }> {
    const {
      search,
      sortBy = 'recent',
      status = 'active',
      limit = 20,
      offset = 0
    } = options;

    let whereClause = 'WHERE status = $1';
    const values: any[] = [status];
    let paramCount = 2;

    if (search) {
      whereClause += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    let orderClause = '';
    switch (sortBy) {
      case 'recent':
        orderClause = 'ORDER BY created_at DESC';
        break;
      case 'signatures':
        orderClause = 'ORDER BY current_signatures DESC';
        break;
      case 'progress':
        orderClause = 'ORDER BY (CAST(current_signatures AS FLOAT) / goal_signatures) DESC';
        break;
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM petition_signature_counts ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Get petitions
    const result = await pool.query(
      `SELECT id, title, description, goal_signatures, current_signatures, 
              owner_id, url, status, created_at, updated_at
       FROM petition_signature_counts 
       ${whereClause} 
       ${orderClause} 
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    const petitions = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      goalSignatures: row.goal_signatures,
      currentSignatures: row.current_signatures,
      ownerId: row.owner_id,
      url: row.url,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { petitions, total };
  }
}
