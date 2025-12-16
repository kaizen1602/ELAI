import { Router } from 'express';
import { slotsController } from './slots.controller';
import { authenticate } from '../auth/auth.middleware';
import { validateN8NWebhook } from '../../middleware/webhook-auth.middleware';

const router = Router();

// N8N routes (with secret validation middleware)
router.post('/lock', validateN8NWebhook, slotsController.lockSlot);
router.post('/unlock', validateN8NWebhook, slotsController.unlockSlot);

// Authenticated routes

// N8N bot public access (protected by secret)
router.get('/available-bot', validateN8NWebhook, slotsController.getAvailableSlots);


router.get('/:id/bot', validateN8NWebhook, slotsController.findById);
router.use(authenticate);

router.get('/available', slotsController.getAvailableSlots);
router.get('/:id', slotsController.findById);
router.post('/', slotsController.create);
router.put('/:id', slotsController.update);
router.patch('/:id/block', slotsController.blockSlot);
router.patch('/:id/unblock', slotsController.unblockSlot);
router.delete('/:id', slotsController.delete);

export default router;
