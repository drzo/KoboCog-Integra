import { StoryOrchestrator } from './StoryOrchestrator.js';
import { WorldStateManager } from './WorldStateManager.js';
import { EventOrchestrator } from './EventOrchestrator.js';
import { logger } from '../utils/logger.js';

export class IntegrationManager {
  constructor(config) {
    this.storyOrchestrator = new StoryOrchestrator(config);
    this.worldStateManager = new WorldStateManager();
    this.eventOrchestrator = new EventOrchestrator();
    this.activeIntegrations = new Map();
  }

  async initializeIntegration(params) {
    try {
      const story = await this.storyOrchestrator.initializeStory(params);
      const worldState = await this.worldStateManager.createInitialState();
      
      this.activeIntegrations.set(story.storyId, {
        status: 'active',
        lastSync: Date.now(),
        koboldContext: params.initialContext || {},
        openCogContext: {}
      });

      return {
        storyId: story.storyId,
        worldState,
        status: 'integrated'
      };
    } catch (error) {
      logger.error('Integration initialization failed:', error);
      throw error;
    }
  }

  async synchronizeState(storyId) {
    const integration = this.activeIntegrations.get(storyId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    try {
      const worldState = await this.worldStateManager.getWorldState(storyId);
      const koboldState = await this.storyOrchestrator.koboldAI.loadWorldInfo(storyId);
      
      // Merge states and resolve conflicts
      const mergedState = this.mergeStates(worldState, koboldState);
      
      // Update both systems
      await this.storyOrchestrator.koboldAI.saveWorldInfo(storyId, mergedState);
      await this.worldStateManager.updateWorldState(storyId, {
        type: 'STATE_SYNC',
        timestamp: Date.now(),
        state: mergedState
      });

      integration.lastSync = Date.now();
      return mergedState;
    } catch (error) {
      logger.error('State synchronization failed:', error);
      throw error;
    }
  }

  mergeStates(worldState, koboldState) {
    return {
      ...worldState,
      characters: this.mergeCharacters(worldState.characters, koboldState.characters),
      locations: this.mergeLocations(worldState.locations, koboldState.locations),
      events: this.mergeEvents(worldState.events, koboldState.events)
    };
  }

  mergeCharacters(worldChars, koboldChars) {
    const merged = new Map(worldChars);
    
    koboldChars.forEach((char, id) => {
      if (merged.has(id)) {
        const existing = merged.get(id);
        merged.set(id, {
          ...existing,
          ...char,
          traits: [...new Set([...existing.traits, ...char.traits])]
        });
      } else {
        merged.set(id, char);
      }
    });

    return merged;
  }

  mergeLocations(worldLocs, koboldLocs) {
    const merged = new Map(worldLocs);
    
    koboldLocs.forEach((loc, id) => {
      if (merged.has(id)) {
        merged.set(id, {
          ...merged.get(id),
          ...loc,
          lastUpdate: Date.now()
        });
      } else {
        merged.set(id, loc);
      }
    });

    return merged;
  }

  mergeEvents(worldEvents, koboldEvents) {
    const allEvents = [...worldEvents, ...koboldEvents];
    const uniqueEvents = new Map();
    
    allEvents.forEach(event => {
      const key = `${event.type}-${event.timestamp}`;
      if (!uniqueEvents.has(key)) {
        uniqueEvents.set(key, event);
      }
    });

    return Array.from(uniqueEvents.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  async processIntegratedEvent(storyId, event) {
    try {
      // Process in KoboldAI
      const koboldResult = await this.storyOrchestrator.generateNextSegment(storyId, {
        event,
        context: this.activeIntegrations.get(storyId)?.koboldContext
      });

      // Process in OpenCog
      await this.storyOrchestrator.updateOpenCogKnowledge(storyId, event);

      // Update world state
      await this.eventOrchestrator.processEvent(storyId, {
        ...event,
        koboldResult
      });

      // Synchronize states
      await this.synchronizeState(storyId);

      return {
        success: true,
        storyId,
        event,
        koboldResult
      };
    } catch (error) {
      logger.error('Integrated event processing failed:', error);
      throw error;
    }
  }
}