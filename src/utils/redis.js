import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { logger } from './logger.js';

const isDev = process.env.NODE_ENV !== 'production';

// Use mock Redis in development
const redis = isDev 
  ? new RedisMock() 
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

export { redis };