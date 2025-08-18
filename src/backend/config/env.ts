import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aiquizhelper'
  },
  llm: {
    provider: process.env.LLM_PROVIDER || 'mock'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-5-nano'
  }
};