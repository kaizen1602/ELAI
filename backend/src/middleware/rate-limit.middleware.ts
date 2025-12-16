import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window (increased for development)
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
});

// Auth endpoints rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    error: 'Too Many Login Attempts',
    message: 'Too many login attempts. Please try again after 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// WhatsApp webhook rate limiter (more permissive for incoming messages)
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  message: {
    error: 'Too Many Webhook Requests',
    message: 'Webhook rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// N8N integration rate limiter
export const n8nLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: 'Too Many N8N Requests',
    message: 'N8N integration rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for sensitive operations
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Too many attempts for this operation. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
