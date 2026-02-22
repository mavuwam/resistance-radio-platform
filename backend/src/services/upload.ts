import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sharp from 'sharp';
import logger from '../utils/logger';

// Initialize S3 client with profile support
const s3ClientConfig: any = {
  region: process.env.AWS_REGION || 'us-east-1'
};

// Use environment credentials if available
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
}

const s3Client = new S3Client(s3ClientConfig);

const MEDIA_BUCKET = process.env.AWS_S3_MEDIA_BUCKET || 'resistance-radio-media-dev-734110488556';
const CDN_URL = process.env.CDN_URL || 'https://dxbqjcig99tjb.cloudfront.net';

// File type constants
export const AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'];
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

// Size limits
export const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadOptions {
  fileType: 'image' | 'document' | 'audio';
  generateThumbnail?: boolean;
  maxSize?: number;
}

export interface UploadResult {
  url: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  key: string;
}

/**
 * Upload service class for handling file uploads to S3
 */
export class UploadService {
  /**
   * Upload a file to S3 with optional thumbnail generation
   */
  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    // Validate file type
    if (!this.validateFileType(mimeType, options.fileType)) {
      throw new Error(`Invalid file type: ${mimeType}`);
    }

    // Validate file size
    const maxSize = options.maxSize || this.getMaxSize(options.fileType);
    if (!this.validateFileSize(fileBuffer.length, maxSize)) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Generate unique filename
    const fileExtension = path.extname(filename);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const folder = this.getFolderPath(options.fileType);
    const key = `${folder}/original/${uniqueFilename}`;

    // Upload original file with retry logic
    const url = await this.uploadToS3WithRetry(key, fileBuffer, mimeType);

    let thumbnailUrl: string | undefined;

    // Generate and upload thumbnail for images
    if (options.fileType === 'image' && options.generateThumbnail) {
      try {
        const thumbnailBuffer = await this.generateThumbnail(fileBuffer, 300, 300);
        const thumbnailKey = `${folder}/thumbnails/${uniqueFilename}`;
        thumbnailUrl = await this.uploadToS3WithRetry(thumbnailKey, thumbnailBuffer, mimeType);
      } catch (error) {
        logger.error('Thumbnail generation failed, using original image', { error, filename });
        thumbnailUrl = url; // Fallback to original
      }
    }

    return {
      url,
      thumbnailUrl,
      fileSize: fileBuffer.length,
      mimeType,
      key
    };
  }

  /**
   * Generate thumbnail from image buffer
   */
  async generateThumbnail(
    imageBuffer: Buffer,
    maxWidth: number,
    maxHeight: number
  ): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch (error) {
      logger.error('Sharp thumbnail generation failed', { error });
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: MEDIA_BUCKET,
        Key: key
      });
      await s3Client.send(command);
      logger.info('File deleted from S3', { key });
    } catch (error) {
      logger.error('Failed to delete file from S3', { error, key });
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Validate file type against allowed types
   */
  validateFileType(mimeType: string, fileType: 'image' | 'document' | 'audio'): boolean {
    const allowedTypes = this.getAllowedTypes(fileType);
    return allowedTypes.includes(mimeType);
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  /**
   * Upload to S3 with retry logic
   */
  private async uploadToS3WithRetry(
    key: string,
    buffer: Buffer,
    mimeType: string,
    retries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const command = new PutObjectCommand({
          Bucket: MEDIA_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          CacheControl: 'public, max-age=31536000'
        });

        await s3Client.send(command);
        const url = `${CDN_URL}/${key}`;
        logger.info('File uploaded to S3', { key, attempt });
        return url;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Upload attempt ${attempt} failed`, { error, key });
        
        if (attempt < retries) {
          // Exponential backoff
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    logger.error('All upload attempts failed', { error: lastError, key });
    throw new Error('File upload failed after multiple attempts');
  }

  /**
   * Get allowed MIME types for file type
   */
  private getAllowedTypes(fileType: 'image' | 'document' | 'audio'): string[] {
    switch (fileType) {
      case 'image':
        return IMAGE_MIME_TYPES;
      case 'document':
        return DOCUMENT_MIME_TYPES;
      case 'audio':
        return AUDIO_MIME_TYPES;
      default:
        return [];
    }
  }

  /**
   * Get max size for file type
   */
  private getMaxSize(fileType: 'image' | 'document' | 'audio'): number {
    switch (fileType) {
      case 'image':
        return MAX_IMAGE_SIZE;
      case 'document':
        return MAX_DOCUMENT_SIZE;
      case 'audio':
        return MAX_AUDIO_SIZE;
      default:
        return MAX_IMAGE_SIZE;
    }
  }

  /**
   * Get S3 folder path for file type
   */
  private getFolderPath(fileType: 'image' | 'document' | 'audio'): string {
    switch (fileType) {
      case 'image':
        return 'images';
      case 'document':
        return 'documents';
      case 'audio':
        return 'audio';
      default:
        return 'files';
    }
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const uploadService = new UploadService();
