import fastq from 'fastq';
import pLimit from 'p-limit';
import { NarrativeValidator } from './NarrativeValidator.js';
import { WorldStateManager } from './WorldStateManager.js';
import { logger } from '../utils/logger.js';

const CONCURRENCY_LIMIT = 50;
const EVENT_QUEUE_CONCURRENCY = 10;

export class EventOrchestrator {
  constructor() {
    this.validator = new NarrativeValidator();
    this.worldStateManager = new WorldStateManager();
    this.limit = pLimit(CONCURRENCY_LIMIT);
    this.eventQueue = fastq.promise(this.processQueuedEvent.bind(this), EVENT_QUEUE_CONCURRENCY);
  }

  async processQueuedEvent(task) {
    const { storyId, event } = task;
    return this.limit(() => this._processEvent(storyId, event));
  }

  async processEvent(storyId, event) {
    return this.eventQueue.push({ storyId, event });
  }

  async _processEvent(storyId, event) {
    try {
      const currentState = await this.worldStateManager.getWorldState(storyId);

      const validationResult = await this.validator.validateEvent(event, currentState);
      if (!validationResult.valid) {
        logger.warn('Event validation failed:', validationResult.results);
        throw new Error('Event validation failed: ' + 
          validationResult.results
            .filter(r => !r.valid)
            .map(r => r.reason)
            .join(', ')
        );
      }

      const newState = await this.worldStateManager.updateWorldState(storyId, event);

      if (this.shouldCreateSnapshot(event)) {
        await this.worldStateManager.createSnapshot(storyId);
      }

      return {
        success: true,
        storyId,
        eventId: event.id,
        worldStateVersion: newState.version,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Event processing error:', error);
      throw error;
    }
  }

  shouldCreateSnapshot(event) {
    const majorEventTypes = new Set([
      'CHAPTER_END',
      'MAJOR_DECISION',
      'CHARACTER_DEATH',
      'WORLD_CHANGING_EVENT'
    ]);
    
    return majorEventTypes.has(event.type);
  }

  async getEventHistory(storyId, filters = {}) {
    const state = await this.worldStateManager.getWorldState(storyId);
    let events = state.events;

    if (filters.startTime) {
      events = events.filter(e => e.timestamp >= filters.startTime);
    }
    if (filters.endTime) {
      events = events.filter(e => e.timestamp <= filters.endTime);
    }
    if (filters.type) {
      events = events.filter(e => e.type === filters.type);
    }
    if (filters.character) {
      events = events.filter(e => 
        e.characters?.some(c => c.id === filters.character)
      );
    }

    return events;
  }
}