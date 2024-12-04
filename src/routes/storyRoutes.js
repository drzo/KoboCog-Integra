import express from 'express';
import { KoboldAIService } from '../services/KoboldAIService.js';
import { StoryStateManager } from '../core/StoryStateManager.js';
import { rateLimiterMiddleware } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const koboldService = new KoboldAIService({});
const storyManager = new StoryStateManager();

// Get all stories
router.get('/', async (req, res) => {
  try {
    const stories = await storyManager.listActiveStories();
    res.json(stories || []);
  } catch (error) {
    logger.error('Failed to fetch stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Get active stories
router.get('/active', async (req, res) => {
  try {
    const stories = await storyManager.listActiveStories();
    res.json(stories || []);
  } catch (error) {
    logger.error('Failed to fetch active stories:', error);
    res.status(500).json({ error: 'Failed to fetch active stories' });
  }
});

// Get story stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      activeStories: 0,
      totalCharacters: 0,
      activeQuests: 0,
      eventsToday: 0,
      activityData: generateMockActivityData(),
    };
    res.json(stats);
  } catch (error) {
    logger.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Create new story
router.post('/', rateLimiterMiddleware, async (req, res) => {
  try {
    const story = await storyManager.createStory(req.body);
    res.json(story);
  } catch (error) {
    logger.error('Failed to create story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Generate story content
router.post('/generate', rateLimiterMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    const story = await koboldService.createStory(prompt);
    res.json(story);
  } catch (error) {
    logger.error('Story generation error:', error);
    res.status(500).json({ error: 'Failed to generate story' });
  }
});

function generateMockActivityData() {
  const data = [];
  const now = Date.now();
  for (let i = 0; i < 24; i++) {
    data.push({
      time: new Date(now - (23 - i) * 3600000).toLocaleTimeString(),
      value: Math.floor(Math.random() * 100)
    });
  }
  return data;
}

export default router;