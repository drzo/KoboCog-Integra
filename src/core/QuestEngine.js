import graphology from 'graphology';
import shortestPath from 'graphology-shortest-path';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

export class QuestEngine {
  constructor() {
    this.questGraphs = new Map();
  }

  async processEvent(storyId, event) {
    const questGraph = await this.getQuestGraph(storyId);
    
    if (event.questRelated) {
      // Update quest progress
      const { questId, action, outcome } = event.questRelated;
      
      const questNode = questGraph.getNodeAttributes(questId);
      if (questNode) {
        const newState = this.calculateQuestState(questNode, action, outcome);
        questGraph.setNodeAttributes(questId, {
          ...questNode,
          state: newState,
          lastUpdate: Date.now()
        });

        // Check for quest dependencies
        await this.updateDependentQuests(questGraph, questId);
      }
    }

    await this.persistQuestGraph(storyId);
    return questGraph;
  }

  calculateQuestState(questNode, action, outcome) {
    const currentProgress = questNode.progress || 0;
    const actionImpact = this.calculateActionImpact(action, outcome);
    
    return {
      progress: Math.min(100, currentProgress + actionImpact),
      status: this.determineQuestStatus(currentProgress + actionImpact),
      lastAction: {
        type: action,
        outcome,
        timestamp: Date.now()
      }
    };
  }

  calculateActionImpact(action, outcome) {
    // Define action weights and calculate impact
    const weights = {
      PROGRESS: 20,
      SETBACK: -10,
      COMPLETION: 100
    };

    return weights[outcome] || 0;
  }

  determineQuestStatus(progress) {
    if (progress >= 100) return 'COMPLETED';
    if (progress > 0) return 'IN_PROGRESS';
    return 'NOT_STARTED';
  }

  async updateDependentQuests(questGraph, questId) {
    const dependencies = questGraph.outNeighbors(questId);
    
    for (const depQuestId of dependencies) {
      const depQuest = questGraph.getNodeAttributes(depQuestId);
      const prerequisites = questGraph.inNeighbors(depQuestId);
      
      // Check if all prerequisites are met
      const prereqsMet = prerequisites.every(preId => {
        const preQuest = questGraph.getNodeAttributes(preId);
        return preQuest.state.status === 'COMPLETED';
      });

      if (prereqsMet && depQuest.state.status === 'LOCKED') {
        questGraph.setNodeAttributes(depQuestId, {
          ...depQuest,
          state: {
            ...depQuest.state,
            status: 'NOT_STARTED'
          }
        });
      }
    }
  }

  async getQuestGraph(storyId) {
    let questGraph = this.questGraphs.get(storyId);
    
    if (!questGraph) {
      const saved = await redis.get(`quests:${storyId}`);
      if (saved) {
        questGraph = graphology.from(JSON.parse(saved));
        this.questGraphs.set(storyId, questGraph);
      } else {
        questGraph = new graphology();
        this.questGraphs.set(storyId, questGraph);
      }
    }
    
    return questGraph;
  }

  async persistQuestGraph(storyId) {
    const questGraph = this.questGraphs.get(storyId);
    if (questGraph) {
      await redis.set(
        `quests:${storyId}`,
        JSON.stringify(questGraph.toJSON())
      );
    }
  }
}