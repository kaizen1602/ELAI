import { Router } from 'express';
import { entitiesController } from './entities.controller';
import { authenticate } from '../auth/auth.middleware';
import { authorize, isSuperAdmin } from '../../middleware/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/entities
 * @desc Get all medical entities
 * @access Private
 */
router.get('/', entitiesController.findAll);

/**
 * @route GET /api/v1/entities/:id
 * @desc Get medical entity by ID
 * @access Private
 */
router.get('/:id', entitiesController.findById);

/**
 * @route GET /api/v1/entities/:id/statistics
 * @desc Get entity statistics
 * @access Private
 */
router.get('/:id/statistics', entitiesController.getStatistics);

/**
 * @route POST /api/v1/entities
 * @desc Create new medical entity
 * @access Private (SuperAdmin only)
 */
router.post('/', isSuperAdmin, entitiesController.create);

/**
 * @route PUT /api/v1/entities/:id
 * @desc Update medical entity
 * @access Private (SuperAdmin, Admin Entidad)
 */
router.put(
  '/:id',
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN_ENTIDAD),
  entitiesController.update
);

/**
 * @route DELETE /api/v1/entities/:id
 * @desc Deactivate medical entity
 * @access Private (SuperAdmin only)
 */
router.delete('/:id', isSuperAdmin, entitiesController.delete);

/**
 * @route POST /api/v1/entities/:id/activate
 * @desc Activate medical entity
 * @access Private (SuperAdmin only)
 */
router.post('/:id/activate', isSuperAdmin, entitiesController.activate);

export default router;
