import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit',
  points: 100, // Number of requests
  duration: 60, // Per minute
  blockDuration: 60 * 2 // Block for 2 minutes if exceeded
});

export async function rateLimiterMiddleware(req, res, next) {
  try {
    const key = req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    logger.warn(`Rate limit exceeded for IP ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: error.msBeforeNext / 1000
    });
  }
}