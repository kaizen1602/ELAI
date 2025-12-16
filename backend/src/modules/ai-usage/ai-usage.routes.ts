import { Router } from 'express';
import { aiUsageController } from './ai-usage.controller';
import { authenticate } from '../auth/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateN8NWebhook } from '../../middleware/webhook-auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// N8N routes (with secret validation middleware)
router.post('/log', validateN8NWebhook, aiUsageController.logUsage);
router.post('/can-use', validateN8NWebhook, aiUsageController.canUseAI);

// Authenticated routes
router.use(authenticate);

router.get('/summary', aiUsageController.getUsageSummary);
router.get('/limits', aiUsageController.checkLimits);
router.get('/stats/:entidadMedicaId', aiUsageController.getDetailedStats);

// Admin only
router.put(
  '/limits',
  authorize(UserRole.SUPERADMIN, UserRole.ADMIN_ENTIDAD),
  aiUsageController.updateLimits
);

export default router;
