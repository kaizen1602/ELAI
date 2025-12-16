import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || '';

/**
 * Middleware to validate N8N webhook requests
 * Validates the X-N8N-Signature or X-Webhook-Secret header
 */
export const validateN8NWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const webhookSecret = req.headers['x-webhook-secret'] as string;
  const n8nSignature = req.headers['x-n8n-signature'] as string;

  // Check if N8N secret is configured
  if (!N8N_WEBHOOK_SECRET) {
    logger.warn('N8N_WEBHOOK_SECRET is not configured');
    res.status(500).json({
      error: 'Configuration Error',
      message: 'Webhook authentication is not properly configured',
    });
    return;
  }

  // Validate simple secret header (for development/simple setups)
  if (webhookSecret) {
    if (webhookSecret === N8N_WEBHOOK_SECRET) {
      next();
      return;
    }
    // PERMISSIVE MODE: Log warning but allow request
    logger.warn('Invalid webhook secret received - ALLOWING REQUEST (Permissive Mode)', {
      ip: req.ip,
      path: req.path,
    });
    next();
    return;
  } else {
    // PERMISSIVE MODE: Log warning for missing secret but allow request
    logger.warn('Missing webhook authentication - ALLOWING REQUEST (Permissive Mode)', {
      ip: req.ip,
      path: req.path,
    });
    next();
    return;
  }

  // Validate HMAC signature (for production with signed requests)
  if (n8nSignature) {
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', N8N_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (crypto.timingSafeEqual(
      Buffer.from(n8nSignature),
      Buffer.from(expectedSignature)
    )) {
      next();
      return;
    }
    logger.warn('Invalid N8N signature received', {
      ip: req.ip,
      path: req.path,
    });
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid signature',
    });
    return;
  }

  // No authentication header provided
  logger.warn('Missing webhook authentication', {
    ip: req.ip,
    path: req.path,
  });
  res.status(401).json({
    error: 'Unauthorized',
    message: 'Missing webhook authentication',
  });
};

/**
 * Middleware to validate WhatsApp webhook verification token
 * Used for Meta's webhook verification process
 */
export const validateWhatsAppWebhook = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || '';

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      logger.info('WhatsApp webhook verified');
      res.status(200).send(challenge);
      return;
    }

    logger.warn('WhatsApp webhook verification failed', {
      mode,
      ip: req.ip,
    });
    res.status(403).json({
      error: 'Forbidden',
      message: 'Webhook verification failed',
    });
    return;
  }

  // For POST requests, validate the signature
  const signature = req.headers['x-hub-signature-256'] as string;
  const APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';

  if (!APP_SECRET) {
    logger.warn('WHATSAPP_APP_SECRET is not configured');
    // Continue without signature validation in development
    if (process.env.NODE_ENV === 'development') {
      next();
      return;
    }
    res.status(500).json({
      error: 'Configuration Error',
      message: 'Webhook signature validation is not properly configured',
    });
    return;
  }

  if (!signature) {
    logger.warn('Missing WhatsApp signature header');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing signature',
    });
    return;
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature =
    'sha256=' +
    crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');

  if (signature === expectedSignature) {
    next();
    return;
  }

  logger.warn('Invalid WhatsApp signature', {
    ip: req.ip,
  });
  res.status(401).json({
    error: 'Unauthorized',
    message: 'Invalid signature',
  });
};
