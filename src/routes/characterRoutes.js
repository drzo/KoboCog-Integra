import express from 'express';
import { CharacterTracker } from '../core/CharacterTracker.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const characterTracker = new CharacterTracker();

router.get('/', async (req, res) => {
  try {
    // Mock data for initial development
    const characters = [
      {
        id: '1',
        name: 'Hero',
        role: 'Protagonist',
        status: 'active',
        relationshipCount: 3
      },
      {
        id: '2',
        name: 'Mentor',
        role: 'Support',
        status: 'active',
        relationshipCount: 2
      }
    ];
    res.json(characters);
  } catch (error) {
    logger.error('Failed to fetch characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

export default router;