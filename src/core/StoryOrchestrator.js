import { v4 as uuidv4 } from 'uuid';
import { KoboldAIService } from '../services/KoboldAIService.js';
import { OpenCogService } from '../services/OpenCogService.js';
import { EventOrchestrator } from './EventOrchestrator.js';
import { QuestEngine } from './QuestEngine.js';
import { logger } from '../utils/logger.js';

export class StoryOrchestrator {
  constructor(config) {
    this.koboldAI = new KoboldAIService(config.koboldAI);
    this.openCog = new OpenCogService(config.openCog);
    this.eventOrchestrator = new EventOrchestrator();
    this.questEngine = new QuestEngine();
  }

  async initializeStory(storyParams) {
    const storyId = uuidv4();
    
    try {
      // Initialize story context in KoboldAI
      await this.koboldAI.saveWorldInfo(storyId, {
        setting: storyParams.setting,
        characters: storyParams.characters,
        initialState: storyParams.initialState
      });

      // Create knowledge representation in OpenCog
      for (const character of storyParams.characters) {
        await this.openCog.createAtom('ConceptNode', `character:${character.id}`);
        await this.openCog.createAtom('PredicateNode', `traits:${character.id}`, {
          strength: 1.0,
          confidence: 0.8
        });
      }

      // Initialize quest structure if provided
      if (storyParams.quests) {
        for (const quest of storyParams.quests) {
          await this.questEngine.processEvent(storyId, {
            type: 'QUEST_INIT',
            questRelated: {
              questId: quest.id,
              action: 'CREATE',
              outcome: 'NOT_STARTED'
            }
          });
        }
      }

      return {
        storyId,
        status: 'initialized',
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Story initialization error:', error);
      throw error;
    }
  }

  async generateNextSegment(storyId, context) {
    try {
      // Get current world state
      const worldState = await this.eventOrchestrator.getWorldState(storyId);
      
      // Generate story continuation
      const generatedText = await this.koboldAI.generateStorySegment({
        ...context,
        worldState,
        temperature: 0.8
      });

      // Parse and validate the generated content
      const event = this.parseGeneratedContent(generatedText);
      await this.eventOrchestrator.processEvent(storyId, event);

      // Update knowledge in OpenCog
      await this.updateOpenCogKnowledge(storyId, event);

      return {
        segmentId: uuidv4(),
        content: generatedText,
        event,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('Segment generation error:', error);
      throw error;
    }
  }

  parseGeneratedContent(content) {
    // Extract structured event data from generated text
    // This is a simplified example - you'd want more sophisticated parsing
    return {
      type: 'STORY_PROGRESSION',
      timestamp: Date.now(),
      content,
      characters: this.extractCharacters(content),
      locations: this.extractLocations(content)
    };
  }

  extractCharacters(content) {
    // Implement character extraction logic
    // This would use NLP or pattern matching in a real implementation
    return [];
  }

  extractLocations(content) {
    // Implement location extraction logic
    return [];
  }

  async updateOpenCogKnowledge(storyId, event) {
    try {
      // Update character relationships
      if (event.characters) {
        for (const char of event.characters) {
          const charNode = `character:${char.id}`;
          const currentTV = await this.openCog.queryAtoms({
            type: 'ConceptNode',
            name: charNode
          });

          if (currentTV.length > 0) {
            await this.openCog.updateAtomTruthValue(
              currentTV[0].handle,
              {
                strength: 1.0,
                confidence: Math.min(currentTV[0].tv.confidence + 0.1, 1.0)
              }
            );
          }
        }
      }

      // Update world knowledge
      if (event.locations) {
        for (const location of event.locations) {
          await this.openCog.createAtom(
            'ConceptNode',
            `location:${location.id}`
          );
        }
      }
    } catch (error) {
      logger.error('OpenCog knowledge update error:', error);
      throw error;
    }
  }
}