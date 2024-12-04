import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../utils/redis.js';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

export class KoboldAIService {
  constructor(config) {
    this.apiUrl = config.apiUrl || 'https://lite.koboldai.net';
    this.apiKey = config.apiKey;
    this.model = config.model || 'default';
    
    this.rateLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'kobold_ratelimit',
      points: 10,
      duration: 60
    });
  }

  async generateStorySegment(prompt, parameters = {}) {
    try {
      await this.rateLimiter.consume('story_generation');
      
      const response = await this.retryRequest(async () => {
        const res = await fetch(`${this.apiUrl}/api/v1/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
          },
          body: JSON.stringify({
            prompt,
            model: this.model,
            parameters: {
              max_length: parameters.maxLength || 500,
              temperature: parameters.temperature || 0.8,
              top_p: parameters.topP || 0.9,
              top_k: parameters.topK || 40,
              repetition_penalty: parameters.repetitionPenalty || 1.1,
              ...parameters
            }
          })
        });

        if (!response.ok) {
          throw new Error(`KoboldAI API error: ${response.statusText}`);
        }

        return response;
      });

      const data = await response.json();
      return data.results[0].text;
    } catch (error) {
      logger.error('Story generation error:', error);
      throw new Error('Failed to generate story segment');
    }
  }

  async retryRequest(requestFn) {
    let lastError;
    
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        if (attempt < RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        }
      }
    }
    
    throw lastError;
  }

  async createStory(prompt) {
    const storyPrompt = `[Genre: Mystery/Adventure]
[Setting: Ancient Temple]
[Style: Vivid descriptions, unexpected twists]

${prompt}`;

    try {
      const generatedText = await this.generateStorySegment(storyPrompt, {
        maxLength: 500,
        temperature: 0.8,
        topP: 0.9,
        repetitionPenalty: 1.1
      });

      return {
        content: generatedText,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Story creation error:', error);
      throw error;
    }
  }
}