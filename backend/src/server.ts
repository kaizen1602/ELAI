import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { redis, disconnectRedis } from './config/redis';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server: any;

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Test Redis connection
    await redis.ping();
    logger.info('✓ Redis connected successfully');

    // Start Express server
    server = app.listen(PORT, () => {
      logger.info(`
┌─────────────────────────────────────────────────┐
│                                                 │
│   🚀 ELAI Backend Server                        │
│                                                 │
│   Environment: ${NODE_ENV.padEnd(30)}     │
│   Port:        ${String(PORT).padEnd(30)}     │
│   URL:         http://localhost:${PORT}${' '.repeat(19)}│
│   API:         http://localhost:${PORT}/api/v1${' '.repeat(11)}│
│                                                 │
│   Status:      ✓ Running                        │
│                                                 │
└─────────────────────────────────────────────────┘
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('✓ HTTP server closed');

      // Close database connection
      await disconnectDatabase();

      // Close Redis connection
      await disconnectRedis();

      logger.info('✓ Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('✗ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();
