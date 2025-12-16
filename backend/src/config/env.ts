import { z } from 'zod';
import { logger } from '../utils/logger';

// Environment validation schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // N8N Webhook
  N8N_WEBHOOK_SECRET: z.string().min(16, 'N8N_WEBHOOK_SECRET must be at least 16 characters'),

  // WhatsApp (optional for development)
  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),

  // OpenAI (optional for development)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Validate and export environment variables
function validateEnv(): EnvConfig {
  try {
    const parsed = envSchema.parse(process.env);
    logger.info('✓ Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`);
      logger.error(`✗ Environment validation failed:\n${missingVars.join('\n')}`);

      // In development, provide defaults for critical vars
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️  Using development defaults for missing variables');
        return {
          NODE_ENV: 'development',
          PORT: 3000,
          DATABASE_URL: process.env.DATABASE_URL || 'postgresql://elai_user:elai_password@localhost:5432/elai_db',
          REDIS_HOST: 'localhost',
          REDIS_PORT: 6379,
          REDIS_PASSWORD: undefined,
          JWT_SECRET: 'development-only-secret-32-characters-min',
          JWT_EXPIRES_IN: '7d',
          CORS_ORIGIN: 'http://localhost:5173',
          N8N_WEBHOOK_SECRET: 'dev-n8n-secret-16chars',
          WHATSAPP_API_URL: undefined,
          WHATSAPP_ACCESS_TOKEN: undefined,
          WHATSAPP_PHONE_NUMBER_ID: undefined,
          WHATSAPP_VERIFY_TOKEN: undefined,
          OPENAI_API_KEY: undefined,
          OPENAI_MODEL: 'gpt-4o-mini',
          RATE_LIMIT_WINDOW_MS: 900000,
          RATE_LIMIT_MAX_REQUESTS: 100,
          LOG_LEVEL: 'info',
        };
      }

      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();

// Helper to check if N8N secret is valid
export function validateN8NSecret(secret: string | undefined): boolean {
  if (!secret || !env.N8N_WEBHOOK_SECRET) {
    return false;
  }
  return secret === env.N8N_WEBHOOK_SECRET;
}

// Helper to check if WhatsApp is configured
export function isWhatsAppConfigured(): boolean {
  return !!(
    env.WHATSAPP_API_URL &&
    env.WHATSAPP_ACCESS_TOKEN &&
    env.WHATSAPP_PHONE_NUMBER_ID
  );
}

// Helper to check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  return !!env.OPENAI_API_KEY;
}
