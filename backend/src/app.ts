import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import middlewares
import { errorHandler } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { generalLimiter, authLimiter, webhookLimiter } from './middleware/rate-limit.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import entitiesRoutes from './modules/entities/entities.routes';
import patientsRoutes from './modules/patients/patients.routes';
import medicosRoutes from './modules/medicos/medicos.routes';
import especialidadesRoutes from './modules/especialidades/especialidades.routes';
import agendasRoutes from './modules/agendas/agendas.routes';
import slotsRoutes from './modules/slots/slots.routes';
import citasRoutes from './modules/citas/citas.routes';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes';
import aiUsageRoutes from './modules/ai-usage/ai-usage.routes';

import { logger } from './utils/logger';

const app: Application = express();

// ================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ================================

// Helmet - Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Custom logger middleware
app.use(loggerMiddleware);

// Rate limiting
app.use('/api/v1', generalLimiter);

// ================================
// HEALTH CHECK ROUTES
// ================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ELAI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ================================
// API ROUTES
// ================================

app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'ELAI API v1',
    documentation: '/api/v1/docs',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/entities', entitiesRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/medicos', medicosRoutes);
app.use('/api/v1/especialidades', especialidadesRoutes);
app.use('/api/v1/agendas', agendasRoutes);
app.use('/api/v1/slots', slotsRoutes);
app.use('/api/v1/citas', citasRoutes);
app.use('/api/v1/whatsapp', webhookLimiter, whatsappRoutes);
app.use('/api/v1/ai-usage', aiUsageRoutes);

// ================================
// 404 HANDLER
// ================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

// ================================
// ERROR HANDLER (Must be last)
// ================================

app.use(errorHandler);

export default app;
