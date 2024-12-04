import { StoryOrchestrator } from '../../src/core/StoryOrchestrator.js';
import { integrationConfig } from '../../src/config/integration.config.js';
import { logger } from '../../src/utils/logger.js';

export async function runConcurrentTest(port) {
  // Update config with test port
  const testConfig = {
    ...integrationConfig,
    serverPort: port
  };

  const orchestrator = new StoryOrchestrator(testConfig);
  const numStories = 1000;
  const stories = [];

  logger.info(`Starting concurrent test with ${numStories} stories`);

  // Create stories
  for (let i = 0; i < numStories; i++) {
    try {
      const story = await orchestrator.initializeStory({
        setting: 'Test World',
        characters: [{ id: `char_${i}`, name: `Character ${i}` }]
      });
      stories.push(story);
    } catch (error) {
      logger.error(`Failed to create story ${i}:`, error);
    }
  }

  // Generate concurrent events
  const eventPromises = stories.map(story => 
    orchestrator.generateNextSegment(story.storyId, {
      type: 'TEST_EVENT',
      data: { test: true }
    })
  );

  try {
    const results = await Promise.allSettled(eventPromises);
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    const testResults = {
      total: numStories,
      succeeded,
      failed,
      successRate: (succeeded / numStories) * 100
    };

    logger.info('Concurrent test results:', testResults);
    return testResults;
  } catch (error) {
    logger.error('Concurrent test error:', error);
    throw error;
  }
}