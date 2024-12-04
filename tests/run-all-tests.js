import { createServer } from '../src/server.js';
import { runLoadTest } from './load/load-test.js';
import { runConcurrentTest } from './concurrent/concurrent-test.js';
import getPort from 'get-port';
import { logger } from '../src/utils/logger.js';

async function runAllTests() {
  try {
    // Get a random available port
    const port = await getPort();
    
    // Start the server
    const server = await createServer(port);
    logger.info(`Test server started on port ${port}`);

    // Run tests
    try {
      logger.info('Starting load tests...');
      await runLoadTest(port);
      
      logger.info('Starting concurrent tests...');
      await runConcurrentTest(port);
      
      logger.info('All tests completed successfully');
    } catch (error) {
      logger.error('Test execution failed:', error);
      process.exit(1);
    } finally {
      // Cleanup
      server.close();
      logger.info('Test server shut down');
    }
  } catch (error) {
    logger.error('Test setup failed:', error);
    process.exit(1);
  }
}

runAllTests();