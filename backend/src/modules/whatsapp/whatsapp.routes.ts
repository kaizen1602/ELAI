import { Router } from 'express';
import { whatsappController } from './whatsapp.controller';
import { authenticate } from '../auth/auth.middleware';
import { validateN8NWebhook, validateWhatsAppWebhook } from '../../middleware/webhook-auth.middleware';

const router = Router();

// Public routes (WhatsApp webhook with signature validation)
router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', validateWhatsAppWebhook, whatsappController.handleWebhook);

// N8N routes (with secret validation middleware)
router.post('/send', validateN8NWebhook, whatsappController.sendMessage);
router.post('/typing', validateN8NWebhook, whatsappController.sendTyping);
router.post('/conversation', validateN8NWebhook, whatsappController.createConversation);
router.put('/context', validateN8NWebhook, whatsappController.updateContext);
router.post('/validate-patient', validateN8NWebhook, whatsappController.validatePatient);
router.get('/conversations/:sessionId', validateN8NWebhook, whatsappController.getConversation);

// Authenticated routes
router.use(authenticate);

router.get('/conversations', whatsappController.getConversations);

export default router;
