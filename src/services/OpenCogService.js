import { logger } from '../utils/logger.js';

export class OpenCogService {
  constructor(config) {
    this.atomSpaceUrl = config.atomSpaceUrl;
    this.username = config.username;
    this.password = config.password;
  }

  async createAtom(type, name, tv = { strength: 1.0, confidence: 1.0 }) {
    try {
      const response = await fetch(`${this.atomSpaceUrl}/api/v1/atoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(
            `${this.username}:${this.password}`
          ).toString('base64')}`
        },
        body: JSON.stringify({
          type,
          name,
          truthValue: tv
        })
      });

      if (!response.ok) {
        throw new Error(`OpenCog API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('OpenCog atom creation error:', error);
      throw error;
    }
  }

  async queryAtoms(pattern) {
    try {
      const response = await fetch(
        `${this.atomSpaceUrl}/api/v1/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(
              `${this.username}:${this.password}`
            ).toString('base64')}`
          },
          body: JSON.stringify({ pattern })
        }
      );

      if (!response.ok) {
        throw new Error(`OpenCog query error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('OpenCog query error:', error);
      throw error;
    }
  }

  async updateAtomTruthValue(handle, tv) {
    try {
      const response = await fetch(
        `${this.atomSpaceUrl}/api/v1/atoms/${handle}/tv`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(
              `${this.username}:${this.password}`
            ).toString('base64')}`
          },
          body: JSON.stringify(tv)
        }
      );

      if (!response.ok) {
        throw new Error(`OpenCog TV update error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('OpenCog TV update error:', error);
      throw error;
    }
  }
}