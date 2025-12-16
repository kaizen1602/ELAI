import { Router } from 'express';
import { citasController } from './citas.controller';
import { authenticate } from '../auth/auth.middleware';
import { validateN8NWebhook } from '../../middleware/webhook-auth.middleware';

const router = Router();

// N8N route (with secret validation middleware)
router.post('/create', validateN8NWebhook, citasController.createFromN8N);

// Authenticated routes
router.use(authenticate);

router.get('/', citasController.findAll);
router.get('/:id', citasController.findById);
router.post('/', citasController.create);
router.put('/:id', citasController.update);
router.post('/:id/cancel', citasController.cancel);
router.post('/:id/confirm', citasController.confirm);
router.post('/:id/complete', citasController.complete);
router.post('/:id/no-show', citasController.noShow);

export default router;
