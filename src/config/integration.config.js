export const integrationConfig = {
  koboldAI: {
    apiUrl: process.env.KOBOLD_API_URL || 'http://localhost:5001',
    apiKey: process.env.KOBOLD_API_KEY,
    model: process.env.KOBOLD_MODEL || 'default'
  },
  openCog: {
    atomSpaceUrl: process.env.OPENCOG_URL || 'http://localhost:5000',
    username: process.env.OPENCOG_USERNAME,
    password: process.env.OPENCOG_PASSWORD
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
};