import { Queue, Worker } from 'bullmq';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

export class QueueManager {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
  }

  createQueue(name, processor, options = {}) {
    const queue = new Queue(name, {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
      },
      ...options
    });

    const worker = new Worker(name, processor, {
      connection: redis,
      concurrency: options.concurrency || 10
    });

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed in queue ${name}`);
    });

    worker.on('failed', (job, error) => {
      logger.error(`Job ${job.id} failed in queue ${name}:`, error);
    });

    this.queues.set(name, queue);
    this.workers.set(name, worker);

    return queue;
  }

  async addJob(queueName, data, options = {}) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return queue.add(queueName, data, options);
  }

  async closeAll() {
    const closePromises = [];
    
    for (const [name, queue] of this.queues) {
      closePromises.push(queue.close());
      const worker = this.workers.get(name);
      if (worker) {
        closePromises.push(worker.close());
      }
    }

    await Promise.all(closePromises);
    this.queues.clear();
    this.workers.clear();
  }
}