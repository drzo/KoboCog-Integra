import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

export class StoryStateManager {
  constructor() {
    this.activeStories = new Map();
  }

  async createStory(storyData) {
    const story = {
      id: storyData.id,
      title: storyData.title,
      currentState: 'ACTIVE',
      createdAt: Date.now(),
      lastUpdate: Date.now(),
      metadata: storyData.metadata || {}
    };

    await this.persistStory(story);
    this.activeStories.set(story.id, story);
    return story;
  }

  async getStory(storyId) {
    let story = this.activeStories.get(storyId);
    
    if (!story) {
      const saved = await redis.get(`story:${storyId}`);
      if (saved) {
        story = JSON.parse(saved);
        this.activeStories.set(storyId, story);
      }
    }
    
    return story;
  }

  async updateStory(storyId, updates) {
    const story = await this.getStory(storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    const updatedStory = {
      ...story,
      ...updates,
      lastUpdate: Date.now()
    };

    await this.persistStory(updatedStory);
    this.activeStories.set(storyId, updatedStory);
    return updatedStory;
  }

  async persistStory(story) {
    try {
      await redis.set(
        `story:${story.id}`,
        JSON.stringify(story)
      );
    } catch (error) {
      logger.error('Story persistence error:', error);
      throw error;
    }
  }

  async listActiveStories() {
    const keys = await redis.keys('story:*');
    const stories = await Promise.all(
      keys.map(async (key) => {
        const story = await redis.get(key);
        return JSON.parse(story);
      })
    );
    
    return stories.filter(story => story.currentState === 'ACTIVE');
  }
}