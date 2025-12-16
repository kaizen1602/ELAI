import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

// Main Redis client
export const redis = new Redis(redisConfig);

// Pub/Sub Redis client (separate connection)
export const redisPub = new Redis(redisConfig);
export const redisSub = new Redis(redisConfig);

// Event handlers
redis.on('connect', () => {
  logger.info('✓ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('✗ Redis connection error:', error);
});

redis.on('ready', () => {
  logger.info('✓ Redis ready to accept commands');
});

// Graceful shutdown
export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.quit();
    await redisPub.quit();
    await redisSub.quit();
    logger.info('✓ Redis disconnected successfully');
  } catch (error) {
    logger.error('✗ Redis disconnection failed:', error);
  }
};

// Cache helper functions
export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  async flush(): Promise<void> {
    try {
      await redis.flushdb();
      logger.info('✓ Redis cache flushed');
    } catch (error) {
      logger.error('✗ Redis flush error:', error);
    }
  },
};

// Pub/Sub helper functions
export const pubSubService = {
  async publish(channel: string, message: any): Promise<void> {
    try {
      const serialized = JSON.stringify(message);
      await redisPub.publish(channel, serialized);
    } catch (error) {
      logger.error(`Pub/Sub publish error for channel ${channel}:`, error);
    }
  },

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      await redisSub.subscribe(channel);
      redisSub.on('message', (ch, message) => {
        if (ch === channel) {
          try {
            const parsed = JSON.parse(message);
            callback(parsed);
          } catch (error) {
            logger.error(`Pub/Sub message parse error:`, error);
          }
        }
      });
      logger.info(`✓ Subscribed to channel: ${channel}`);
    } catch (error) {
      logger.error(`Pub/Sub subscribe error for channel ${channel}:`, error);
    }
  },

  async unsubscribe(channel: string): Promise<void> {
    try {
      await redisSub.unsubscribe(channel);
      logger.info(`✓ Unsubscribed from channel: ${channel}`);
    } catch (error) {
      logger.error(`Pub/Sub unsubscribe error for channel ${channel}:`, error);
    }
  },
};
