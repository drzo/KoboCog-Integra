import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

export class WorldStateManager {
  constructor() {
    this.worldStates = new Map();
    this.stateVersion = new Map();
  }

  async getWorldState(storyId) {
    let state = this.worldStates.get(storyId);
    
    if (!state) {
      const saved = await redis.get(`world:${storyId}`);
      if (saved) {
        state = JSON.parse(saved);
        this.worldStates.set(storyId, state);
        this.stateVersion.set(storyId, state.version);
      } else {
        state = this.createInitialState();
        this.worldStates.set(storyId, state);
        this.stateVersion.set(storyId, 0);
      }
    }
    
    return state;
  }

  createInitialState() {
    return {
      version: 0,
      characters: new Map(),
      locations: new Map(),
      items: new Map(),
      relationships: new Map(),
      events: [],
      lastEventTimestamp: null,
      variables: new Map()
    };
  }

  async updateWorldState(storyId, event) {
    const currentState = await this.getWorldState(storyId);
    const newState = this.applyEvent(currentState, event);
    
    newState.version = (this.stateVersion.get(storyId) || 0) + 1;
    this.stateVersion.set(storyId, newState.version);
    
    await this.persistWorldState(storyId, newState);
    return newState;
  }

  applyEvent(state, event) {
    const newState = { ...state };
    
    // Update characters
    if (event.characters) {
      event.characters.forEach(character => {
        const existing = newState.characters.get(character.id) || {};
        newState.characters.set(character.id, {
          ...existing,
          ...character,
          lastUpdate: event.timestamp
        });
      });
    }

    // Update locations
    if (event.locations) {
      event.locations.forEach(location => {
        const existing = newState.locations.get(location.id) || {};
        newState.locations.set(location.id, {
          ...existing,
          ...location,
          lastUpdate: event.timestamp
        });
      });
    }

    // Update items
    if (event.items) {
      event.items.forEach(item => {
        const existing = newState.items.get(item.id) || {};
        newState.items.set(item.id, {
          ...existing,
          ...item,
          lastUpdate: event.timestamp
        });
      });
    }

    // Add event to history
    newState.events.push({
      ...event,
      appliedAt: Date.now()
    });

    // Update last event timestamp
    newState.lastEventTimestamp = event.timestamp;

    return newState;
  }

  async persistWorldState(storyId, state) {
    try {
      await redis.set(
        `world:${storyId}`,
        JSON.stringify(state)
      );
      this.worldStates.set(storyId, state);
    } catch (error) {
      logger.error('Failed to persist world state:', error);
      throw error;
    }
  }

  async createSnapshot(storyId) {
    const state = await this.getWorldState(storyId);
    const snapshot = {
      ...state,
      snapshotId: crypto.randomUUID(),
      createdAt: Date.now()
    };

    await redis.set(
      `snapshot:${storyId}:${snapshot.snapshotId}`,
      JSON.stringify(snapshot)
    );

    return snapshot;
  }

  async loadSnapshot(storyId, snapshotId) {
    const snapshot = await redis.get(`snapshot:${storyId}:${snapshotId}`);
    if (!snapshot) {
      throw new Error('Snapshot not found');
    }

    const state = JSON.parse(snapshot);
    await this.persistWorldState(storyId, state);
    return state;
  }
}