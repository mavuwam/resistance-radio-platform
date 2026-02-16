import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import path from 'path';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const MEDIA_BUCKET = process.env.AWS_S3_MEDIA_BUCKET || 'resistance-radio-media-dev-734110488556';
const CDN_URL = process.env.CDN_URL || 'https://dxbqjcig99tjb.cloudfront.net';

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Express.Multer.File,
  folder: 'audio' | 'images' | 'documents'
): Promise<{ key: string; url: string; cdnUrl: string }> {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${randomUUID()}${fileExtension}`;
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: MEDIA_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    CacheControl: 'public, max-age=31536000', // 1 year
    Metadata: {
      originalName: file.originalname,
      uploadedAt: new Date().toISOString()
    }
  });

  await s3Client.send(command);

  const url = `https://${MEDIA_BUCKET}.s3.amazonaws.com/${key}`;
  const cdnUrl = `${CDN_URL}/${key}`;

  return { key, url, cdnUrl };
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: MEDIA_BUCKET,
    Key: key
  });

  await s3Client.send(command);
}

/**
 * Generate signed URL for private content
 * Expires in 1 hour by default
 */
export async function getSignedS3Url(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: MEDIA_BUCKET,
    Key: key
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Get public CDN URL for a file
 */
export function getCDNUrl(key: string): string {
  return `${CDN_URL}/${key}`;
}

/**
 * Validate file type
 */
export function validateFileType(
  file: Express.Multer.File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.mimetype);
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(
  file: Express.Multer.File,
  maxSize: number
): boolean {
  return file.size <= maxSize;
}

/**
 * Audio file validation
 */
export const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac'
];

export const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Image file validation
 */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Document file validation
 */
export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
