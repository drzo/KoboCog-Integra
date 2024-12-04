import { logger } from '../utils/logger.js';

export class NarrativeValidator {
  constructor() {
    this.rules = new Map();
    this.initializeDefaultRules();
  }

  initializeDefaultRules() {
    this.addRule('temporalConsistency', (event, worldState) => {
      const eventTime = new Date(event.timestamp);
      const lastEventTime = worldState.lastEventTimestamp 
        ? new Date(worldState.lastEventTimestamp)
        : null;
      
      if (lastEventTime && eventTime < lastEventTime) {
        return {
          valid: false,
          reason: 'Temporal paradox detected: Event occurs before previous events'
        };
      }
      return { valid: true };
    });

    this.addRule('characterConsistency', (event, worldState) => {
      if (!event.characters) return { valid: true };
      
      for (const character of event.characters) {
        const existingChar = worldState.characters.get(character.id);
        if (existingChar && this.hasContradictingTraits(existingChar, character)) {
          return {
            valid: false,
            reason: `Character consistency violation for ${character.name}`
          };
        }
      }
      return { valid: true };
    });
  }

  addRule(name, validationFn) {
    this.rules.set(name, validationFn);
  }

  hasContradictingTraits(char1, char2) {
    const contradictions = [
      ['alive', 'dead'],
      ['young', 'old'],
      ['present', 'absent']
    ];

    return contradictions.some(([trait1, trait2]) => 
      (char1.traits.includes(trait1) && char2.traits.includes(trait2)) ||
      (char1.traits.includes(trait2) && char2.traits.includes(trait1))
    );
  }

  async validateEvent(event, worldState) {
    const validationResults = [];

    for (const [ruleName, validationFn] of this.rules) {
      try {
        const result = await validationFn(event, worldState);
        validationResults.push({
          rule: ruleName,
          ...result
        });
      } catch (error) {
        logger.error(`Validation error in rule ${ruleName}:`, error);
        validationResults.push({
          rule: ruleName,
          valid: false,
          reason: `Validation error: ${error.message}`
        });
      }
    }

    const isValid = validationResults.every(result => result.valid);
    return {
      valid: isValid,
      results: validationResults
    };
  }
}