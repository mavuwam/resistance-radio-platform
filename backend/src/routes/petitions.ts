import { Router, Response } from 'express';
import { PetitionModel } from '../models/Petition';
import { SignatureModel } from '../models/Signature';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/petitions
 * Create a new petition (requires authentication)
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, goalSignatures } = req.body;
    const ownerId = req.user!.userId;

    // Validate required fields
    if (!title || !description || !goalSignatures) {
      return res.status(400).json({
        error: {
          message: 'Title, description, and goal signatures are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Validate title length
    if (title.length < 10 || title.length > 200) {
      return res.status(400).json({
        error: {
          message: 'Title must be between 10 and 200 characters',
          code: 'INVALID_TITLE_LENGTH'
        }
      });
    }

    // Validate description length
    if (description.length < 50) {
      return res.status(400).json({
        error: {
          message: 'Description must be at least 50 characters',
          code: 'INVALID_DESCRIPTION_LENGTH'
        }
      });
    }

    // Validate goal is positive integer
    const goal = parseInt(goalSignatures);
    if (isNaN(goal) || goal <= 0) {
      return res.status(400).json({
        error: {
          message: 'Goal signatures must be a positive number',
          code: 'INVALID_GOAL'
        }
      });
    }

    // Create petition
    const petition = await PetitionModel.create({
      title,
      description,
      goalSignatures: Number(goal),
      ownerId
    });

    res.status(201).json({ petition });
  } catch (error: any) {
    console.error('Create petition error:', error);
    
    // Handle database constraint violations
    if (error.code === '23514') {
      return res.status(400).json({
        error: {
          message: 'Validation error: ' + error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * GET /api/petitions
 * List petitions with optional filtering and sorting
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as 'recent' | 'signatures' | 'progress') || 'recent';
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await PetitionModel.list({
      search,
      sortBy,
      status: 'active',
      limit,
      offset
    });

    res.json(result);
  } catch (error) {
    console.error('List petitions error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * GET /api/petitions/:id
 * Get single petition details (no authentication required)
 */
router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const petition = await PetitionModel.findById(id);

    if (!petition) {
      return res.status(404).json({
        error: {
          message: 'Petition not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json({ petition });
  } catch (error) {
    console.error('Get petition error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * PUT /api/petitions/:id
 * Update petition (requires authentication and ownership)
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, goalSignatures } = req.body;
    const userId = req.user!.userId;

    // Check if petition exists and user is owner
    const existingPetition = await PetitionModel.findById(id);

    if (!existingPetition) {
      return res.status(404).json({
        error: {
          message: 'Petition not found',
          code: 'NOT_FOUND'
        }
      });
    }

    if (String(existingPetition.ownerId) !== String(userId)) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to edit this petition',
          code: 'FORBIDDEN'
        }
      });
    }

    // Validate fields if provided
    if (title !== undefined && (title.length < 10 || title.length > 200)) {
      return res.status(400).json({
        error: {
          message: 'Title must be between 10 and 200 characters',
          code: 'INVALID_TITLE_LENGTH'
        }
      });
    }

    if (description !== undefined && description.length < 50) {
      return res.status(400).json({
        error: {
          message: 'Description must be at least 50 characters',
          code: 'INVALID_DESCRIPTION_LENGTH'
        }
      });
    }

    if (goalSignatures !== undefined) {
      const goal = parseInt(goalSignatures);
      if (isNaN(goal) || goal <= 0) {
        return res.status(400).json({
          error: {
            message: 'Goal signatures must be a positive number',
            code: 'INVALID_GOAL'
          }
        });
      }
    }

    // Update petition
    const petition = await PetitionModel.update(id, {
      title,
      description,
      goalSignatures: goalSignatures ? parseInt(goalSignatures) : undefined
    });

    res.json({ petition });
  } catch (error: any) {
    console.error('Update petition error:', error);
    
    if (error.code === '23514') {
      return res.status(400).json({
        error: {
          message: 'Validation error: ' + error.message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * POST /api/petitions/:id/close
 * Close a petition (requires authentication and ownership)
 */
router.post('/:id/close', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if petition exists and user is owner
    const existingPetition = await PetitionModel.findById(id);

    if (!existingPetition) {
      return res.status(404).json({
        error: {
          message: 'Petition not found',
          code: 'NOT_FOUND'
        }
      });
    }

    if (String(existingPetition.ownerId) !== String(userId)) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to close this petition',
          code: 'FORBIDDEN'
        }
      });
    }

    // Close petition
    const petition = await PetitionModel.close(id);

    res.json({ petition });
  } catch (error) {
    console.error('Close petition error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});

export default router;

/**
 * POST /api/petitions/:id/sign
 * Sign a petition (requires authentication)
 */
router.post('/:id/sign', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if petition exists
    const petition = await PetitionModel.findById(id);

    if (!petition) {
      return res.status(404).json({
        error: {
          message: 'Petition not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Check if petition is closed
    if (petition.status === 'closed') {
      return res.status(400).json({
        error: {
          message: 'Cannot sign a closed petition',
          code: 'PETITION_CLOSED'
        }
      });
    }

    // Create signature (handles duplicates gracefully)
    const signature = await SignatureModel.create(String(id), String(userId));

    // Get updated signature count
    const newCount = await SignatureModel.getCount(id);

    res.status(201).json({
      signature: {
        id: signature.id,
        petitionId: signature.petitionId,
        userId: signature.userId,
        createdAt: signature.createdAt
      },
      newCount
    });
  } catch (error) {
    console.error('Sign petition error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * GET /api/petitions/:id/signatures
 * Get signatures for a petition
 */
router.get('/:id/signatures', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Check if petition exists
    const petition = await PetitionModel.findById(id);

    if (!petition) {
      return res.status(404).json({
        error: {
          message: 'Petition not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Get signatures
    const result = await SignatureModel.getByPetitionId(id, { limit, offset });

    // Return signatures without email addresses (privacy protection)
    const signatures = result.signatures.map(sig => ({
      id: sig.id,
      name: sig.userName,
      createdAt: sig.createdAt
    }));

    res.json({
      signatures,
      total: result.total
    });
  } catch (error) {
    console.error('Get signatures error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});
