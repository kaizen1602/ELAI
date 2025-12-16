import { Router } from 'express';
import { agendasController } from './agendas.controller';
import { authenticate } from '../auth/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/agendas
 * @desc Get all agendas
 */
router.get('/', agendasController.findAll);

/**
 * @route GET /api/v1/agendas/:id
 * @desc Get agenda by ID
 */
router.get('/:id', agendasController.findById);

/**
 * @route POST /api/v1/agendas
 * @desc Create new agenda
 */
router.post(
  '/',
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN_ENTIDAD),
  agendasController.create
);

/**
 * @route PUT /api/v1/agendas/:id
 * @desc Update agenda
 */
router.put(
  '/:id',
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN_ENTIDAD),
  agendasController.update
);

/**
 * @route DELETE /api/v1/agendas/:id
 * @desc Deactivate agenda
 */
router.delete(
  '/:id',
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN_ENTIDAD),
  agendasController.delete
);

/**
 * @route POST /api/v1/agendas/:id/activate
 * @desc Activate agenda
 */
router.post(
  '/:id/activate',
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN_ENTIDAD),
  agendasController.activate
);

/**
 * @route POST /api/v1/agendas/:id/generate-slots
 * @desc Generate slots for date range
 */
router.post(
  '/:id/generate-slots',
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN_ENTIDAD),
  agendasController.generateSlots
);

export default router;
