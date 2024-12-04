import graphology from 'graphology';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

export class CharacterTracker {
  constructor() {
    this.characterNetworks = new Map();
  }

  async updateRelationships(storyId, event) {
    let network = await this.getCharacterNetwork(storyId);
    
    if (!network) {
      network = new graphology();
      this.characterNetworks.set(storyId, network);
    }

    if (event.characters) {
      for (const character of event.characters) {
        if (!network.hasNode(character.id)) {
          network.addNode(character.id, { 
            name: character.name,
            traits: character.traits || []
          });
        }
      }

      // Update relationships based on event
      if (event.interactions) {
        for (const interaction of event.interactions) {
          const { source, target, type, strength } = interaction;
          const edgeId = `${source}-${target}`;
          
          if (network.hasEdge(edgeId)) {
            network.updateEdgeAttribute(edgeId, 'strength', 
              (prev) => (prev + strength) / 2
            );
          } else {
            network.addEdge(source, target, {
              type,
              strength,
              timestamp: Date.now()
            });
          }
        }
      }
    }

    await this.persistCharacterNetwork(storyId);
    return network;
  }

  async getCharacterNetwork(storyId) {
    let network = this.characterNetworks.get(storyId);
    
    if (!network) {
      const saved = await redis.get(`characters:${storyId}`);
      if (saved) {
        network = graphology.from(JSON.parse(saved));
        this.characterNetworks.set(storyId, network);
      }
    }
    
    return network;
  }

  async persistCharacterNetwork(storyId) {
    const network = this.characterNetworks.get(storyId);
    if (network) {
      await redis.set(
        `characters:${storyId}`,
        JSON.stringify(network.toJSON())
      );
    }
  }
}