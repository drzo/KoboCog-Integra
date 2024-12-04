import natural from 'natural';
import { logger } from './logger.js';

const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

export class NLPProcessor {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    this.trainClassifier();
  }

  trainClassifier() {
    // Train for event types
    this.classifier.addDocument('character died in battle', 'CHARACTER_DEATH');
    this.classifier.addDocument('defeated in combat', 'CHARACTER_DEATH');
    this.classifier.addDocument('discovered new location', 'LOCATION_DISCOVERY');
    this.classifier.addDocument('found a new place', 'LOCATION_DISCOVERY');
    this.classifier.addDocument('completed the quest', 'QUEST_COMPLETION');
    this.classifier.addDocument('finished the mission', 'QUEST_COMPLETION');
    this.classifier.train();
  }

  extractEntities(text) {
    try {
      const tokens = tokenizer.tokenize(text);
      const entities = {
        characters: [],
        locations: [],
        items: []
      };

      // Simple named entity recognition
      tokens.forEach((token, index) => {
        if (token[0] === token[0].toUpperCase()) {
          if (index > 0 && tokens[index - 1].toLowerCase() === 'in') {
            entities.locations.push(token);
          } else {
            entities.characters.push(token);
          }
        }
      });

      return entities;
    } catch (error) {
      logger.error('Entity extraction error:', error);
      return null;
    }
  }

  classifyEventType(text) {
    try {
      return this.classifier.classify(text);
    } catch (error) {
      logger.error('Event classification error:', error);
      return 'UNKNOWN';
    }
  }

  analyzeRelationships(text) {
    try {
      const entities = this.extractEntities(text);
      const relationships = [];

      entities.characters.forEach((char1, i) => {
        entities.characters.slice(i + 1).forEach(char2 => {
          // Simple relationship strength based on character proximity
          const strength = 0.5;
          relationships.push({
            source: char1,
            target: char2,
            strength,
            type: 'INTERACTION'
          });
        });
      });

      return relationships;
    } catch (error) {
      logger.error('Relationship analysis error:', error);
      return [];
    }
  }
}