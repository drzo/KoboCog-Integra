import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Mock settings data
    const settings = {
      koboldAI: {
        apiUrl: 'https://lite.koboldai.net',
        model: 'GPT-Neo'
      },
      openCog: {
        atomSpaceUrl: 'http://localhost:5000'
      },
      system: {
        autoSave: true,
        debug: false
      }
    };
    res.json(settings);
  } catch (error) {
    logger.error('Failed to fetch settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', async (req, res) => {
  try {
    // Mock successful update
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to update settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;