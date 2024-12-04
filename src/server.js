import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import storyRoutes from './routes/storyRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import questRoutes from './routes/questRoutes.js';
import worldStateRoutes from './routes/worldStateRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const app = express();
const port = process.env.PORT || 3000;

// Security and optimization middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(rateLimiterMiddleware);

// API Routes
app.use('/api/stories', storyRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/world-state', worldStateRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      activeStories: 5,
      totalCharacters: 12,
      activeQuests: 8,
      eventsToday: 24,
      activityData: Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 100)
      }))
    };
    res.json(stats);
  } catch (error) {
    logger.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handling
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  logger.info('New client connected');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const result = await handleWebSocketMessage(data);
      ws.send(JSON.stringify(result));
    } catch (error) {
      logger.error('WebSocket message handling error:', error);
      ws.send(JSON.stringify({ error: 'Internal server error' }));
    }
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    logger.info('Client disconnected');
  });
});

export default server;