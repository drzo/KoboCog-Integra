import express from 'express';
import { QuestEngine } from '../core/QuestEngine.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const questEngine = new QuestEngine();

router.get('/', async (req, res) => {
  try {
    // Mock data for initial development
    const quests = [
      {
        id: '1',
        title: 'The Ancient Artifact',
        description: 'Recover the lost artifact from the temple',
        status: 'active',
        progress: 60,
        objectives: [
          { id: '1', description: 'Find the temple', completed: true },
          { id: '2', description: 'Solve the puzzles', completed: true },
          { id: '3', description: 'Retrieve the artifact', completed: false }
        ]
      }
    ];
    res.json(quests);
  } catch (error) {
    logger.error('Failed to fetch quests:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

export default router;