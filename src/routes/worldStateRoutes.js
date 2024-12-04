import express from 'express';
import { WorldStateManager } from '../core/WorldStateManager.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const worldStateManager = new WorldStateManager();

router.get('/', async (req, res) => {
  try {
    // Mock data for initial development
    const worldState = {
      locations: [
        {
          id: '1',
          name: 'Ancient Temple',
          description: 'A mysterious temple hidden in the jungle',
          characters: ['1', '2']
        }
      ],
      items: [
        {
          id: '1',
          name: 'Golden Key',
          location: 'Ancient Temple',
          status: 'available'
        }
      ],
      events: [
        {
          id: '1',
          description: 'Hero discovered the temple entrance',
          timestamp: Date.now() - 3600000
        }
      ]
    };
    res.json(worldState);
  } catch (error) {
    logger.error('Failed to fetch world state:', error);
    res.status(500).json({ error: 'Failed to fetch world state' });
  }
});

export default router;