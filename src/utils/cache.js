import DataLoader from 'dataloader';
import QuickLRU from 'quick-lru';
import { redis } from './redis.js';
import { logger } from './logger.js';
import { compress, decompress } from './compression.js';

const CACHE_SIZE = 1000;
const BATCH_SIZE = 100;

export class CacheManager {
  constructor() {
    this.memoryCache = new QuickLRU({ maxSize: CACHE_SIZE });
    
    this.storyLoader = new DataLoader(
      async (storyIds) => {
        const chunks = this.chunkArray(storyIds, BATCH_SIZE);
        const results = [];
        
        for (const chunk of chunks) {
          const keys = chunk.map(id => `story:${id}`);
          const chunkResults = await redis.mget(keys);
          results.push(...chunkResults.map(result => 
            result ? decompress(result) : null
          ));
        }
        
        return results;
      },
      { maxBatchSize: BATCH_SIZE, cache: true }
    );

    this.worldStateLoader = new DataLoader(
      async (storyIds) => {
        const chunks = this.chunkArray(storyIds, BATCH_SIZE);
        const results = [];
        
        for (const chunk of chunks) {
          const keys = chunk.map(id => `world:${id}`);
          const chunkResults = await redis.mget(keys);
          results.push(...chunkResults.map(result => 
            result ? decompress(result) : null
          ));
        }
        
        return results;
      },
      { maxBatchSize: BATCH_SIZE, cache: true }
    );
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async getStory(storyId) {
    try {
      // Check memory cache first
      const cached = this.memoryCache.get(`story:${storyId}`);
      if (cached) return cached;

      const story = await this.storyLoader.load(storyId);
      if (story) {
        this.memoryCache.set(`story:${storyId}`, story);
      }
      return story;
    } catch (error) {
      logger.error('Cache story fetch error:', error);
      return null;
    }
  }

  async getWorldState(storyId) {
    try {
      // Check memory cache first
      const cached = this.memoryCache.get(`world:${storyId}`);
      if (cached) return cached;

      const state = await this.worldStateLoader.load(storyId);
      if (state) {
        this.memoryCache.set(`world:${storyId}`, state);
      }
      return state;
    } catch (error) {
      logger.error('Cache world state fetch error:', error);
      return null;
    }
  }

  async setStory(storyId, data, ttl = 3600) {
    try {
      const compressed = compress(data);
      await redis.set(`story:${storyId}`, compressed, 'EX', ttl);
      this.memoryCache.set(`story:${storyId}`, data);
      this.storyLoader.clear(storyId);
    } catch (error) {
      logger.error('Cache story set error:', error);
    }
  }

  async setWorldState(storyId, data, ttl = 3600) {
    try {
      const compressed = compress(data);
      await redis.set(`world:${storyId}`, compressed, 'EX', ttl);
      this.memoryCache.set(`world:${storyId}`, data);
      this.worldStateLoader.clear(storyId);
    } catch (error) {
      logger.error('Cache world state set error:', error);
    }
  }

  async invalidate(storyId) {
    this.memoryCache.delete(`story:${storyId}`);
    this.memoryCache.delete(`world:${storyId}`);
    this.storyLoader.clear(storyId);
    this.worldStateLoader.clear(storyId);
  }
}