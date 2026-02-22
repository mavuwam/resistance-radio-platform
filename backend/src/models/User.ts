import bcrypt from 'bcrypt';
import pool from '../db/connection';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SALT_ROUNDS = 10;

export class UserModel {
  /**
   * Create a new user with hashed password
   */
  static async create(userData: CreateUserData): Promise<UserResponse> {
    const { email, password, name } = userData;
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, full_name as name, created_at, updated_at`,
      [email, passwordHash, name]
    );
    
    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, password_hash, full_name as name, role, created_at, updated_at 
       FROM users 
       WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      passwordHash: result.rows[0].password_hash,
      name: result.rows[0].name,
      role: result.rows[0].role,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserResponse | null> {
    const result = await pool.query(
      `SELECT id, email, full_name as name, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }

  /**
   * Verify password against stored hash
   */
  static async verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  /**
   * Check if email already exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM users WHERE email = $1`,
      [email]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: number, newPasswordHash: string): Promise<void> {
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [newPasswordHash, userId]
    );
  }

  /**
   * Find admin user by email
   */
  static async findAdminByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, password_hash, full_name as name, role, created_at, updated_at 
       FROM users 
       WHERE email = $1 AND role = 'admin'`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      passwordHash: result.rows[0].password_hash,
      name: result.rows[0].name,
      role: result.rows[0].role,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }
}
