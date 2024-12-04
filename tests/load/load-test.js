import autocannon from 'autocannon';
import { logger } from '../../src/utils/logger.js';

export async function runLoadTest(port) {
  return new Promise((resolve, reject) => {
    const test = autocannon({
      url: `http://localhost:${port}`,
      connections: 100,
      duration: 30,
      pipelining: 1,
      scenarios: [
        {
          name: 'Create Story',
          method: 'POST',
          path: '/api/integration/initialize',
          body: JSON.stringify({
            setting: 'fantasy',
            characters: [{ id: 'hero', name: 'Hero' }]
          }),
          weight: 1
        },
        {
          name: 'Process Event',
          method: 'POST',
          path: '/api/integration/STORY_ID/event',
          setupRequest: (request, context) => {
            request.path = request.path.replace('STORY_ID', context.storyId);
            return request;
          },
          body: JSON.stringify({
            type: 'STORY_PROGRESSION',
            timestamp: Date.now()
          }),
          weight: 5
        }
      ]
    });

    autocannon.track(test);

    test.on('done', (results) => {
      logger.info('Load test results:', {
        totalRequests: results.requests.total,
        throughput: results.throughput,
        latency: results.latency,
        errors: results.errors
      });
      resolve(results);
    });

    test.on('error', (error) => {
      logger.error('Load test error:', error);
      reject(error);
    });
  });
}