import express, { Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import {
  uploadToS3,
  deleteFromS3,
  getSignedS3Url,
  validateFileType,
  validateFileSize,
  AUDIO_MIME_TYPES,
  MAX_AUDIO_SIZE,
  IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE
} from '../services/s3';
import logger from '../utils/logger';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AUDIO_SIZE // Maximum file size
  }
});

// Apply authentication to all routes
router.use(authMiddleware);
router.use(requireRole('content_manager', 'administrator'));

/**
 * POST /api/upload/audio - Upload audio file
 */
router.post('/audio', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: 'No file provided', code: 'NO_FILE' }
      });
    }

    // Validate file type
    if (!validateFileType(req.file, AUDIO_MIME_TYPES)) {
      return res.status(400).json({
        error: { message: 'Invalid file type. Only audio files are allowed.', code: 'INVALID_TYPE' }
      });
    }

    // Validate file size
    if (!validateFileSize(req.file, MAX_AUDIO_SIZE)) {
      return res.status(400).json({
        error: { message: `File too large. Maximum size is ${MAX_AUDIO_SIZE / 1024 / 1024}MB`, code: 'FILE_TOO_LARGE' }
      });
    }

    // Upload to S3
    const result = await uploadToS3(req.file, 'audio');

    logger.info(`Audio file uploaded: ${result.key} by user ${req.user?.userId}`);

    res.json({
      message: 'File uploaded successfully',
      file: {
        key: result.key,
        url: result.url,
        cdnUrl: result.cdnUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    logger.error('Error uploading audio file:', error);
    res.status(500).json({
      error: { message: 'Failed to upload file', code: 'UPLOAD_ERROR' }
    });
  }
});

/**
 * POST /api/upload/image - Upload image file
 */
router.post('/image', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: 'No file provided', code: 'NO_FILE' }
      });
    }

    // Validate file type
    if (!validateFileType(req.file, IMAGE_MIME_TYPES)) {
      return res.status(400).json({
        error: { message: 'Invalid file type. Only image files are allowed.', code: 'INVALID_TYPE' }
      });
    }

    // Validate file size
    if (!validateFileSize(req.file, MAX_IMAGE_SIZE)) {
      return res.status(400).json({
        error: { message: `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`, code: 'FILE_TOO_LARGE' }
      });
    }

    // Upload to S3
    const result = await uploadToS3(req.file, 'images');

    logger.info(`Image file uploaded: ${result.key} by user ${req.user?.userId}`);

    res.json({
      message: 'File uploaded successfully',
      file: {
        key: result.key,
        url: result.url,
        cdnUrl: result.cdnUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    logger.error('Error uploading image file:', error);
    res.status(500).json({
      error: { message: 'Failed to upload file', code: 'UPLOAD_ERROR' }
    });
  }
});

/**
 * POST /api/upload/document - Upload document file
 */
router.post('/document', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: 'No file provided', code: 'NO_FILE' }
      });
    }

    // Validate file type
    if (!validateFileType(req.file, DOCUMENT_MIME_TYPES)) {
      return res.status(400).json({
        error: { message: 'Invalid file type. Only document files are allowed.', code: 'INVALID_TYPE' }
      });
    }

    // Validate file size
    if (!validateFileSize(req.file, MAX_DOCUMENT_SIZE)) {
      return res.status(400).json({
        error: { message: `File too large. Maximum size is ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`, code: 'FILE_TOO_LARGE' }
      });
    }

    // Upload to S3
    const result = await uploadToS3(req.file, 'documents');

    logger.info(`Document file uploaded: ${result.key} by user ${req.user?.userId}`);

    res.json({
      message: 'File uploaded successfully',
      file: {
        key: result.key,
        url: result.url,
        cdnUrl: result.cdnUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    logger.error('Error uploading document file:', error);
    res.status(500).json({
      error: { message: 'Failed to upload file', code: 'UPLOAD_ERROR' }
    });
  }
});

/**
 * DELETE /api/upload/:key - Delete file from S3
 */
router.delete('/:folder/:filename', async (req: AuthRequest, res: Response) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;

    await deleteFromS3(key);

    logger.info(`File deleted: ${key} by user ${req.user?.userId}`);

    res.json({
      message: 'File deleted successfully',
      key
    });
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({
      error: { message: 'Failed to delete file', code: 'DELETE_ERROR' }
    });
  }
});

/**
 * GET /api/upload/signed-url/:folder/:filename - Get signed URL for private content
 */
router.get('/signed-url/:folder/:filename', async (req: Request, res: Response) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    const expiresIn = parseInt(req.query.expiresIn as string) || 3600;

    const signedUrl = await getSignedS3Url(key, expiresIn);

    res.json({
      signedUrl,
      expiresIn
    });
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    res.status(500).json({
      error: { message: 'Failed to generate signed URL', code: 'SIGNED_URL_ERROR' }
    });
  }
});

export default router;
