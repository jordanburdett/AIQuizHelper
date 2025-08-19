import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-quiz-helper'
  },
  llm: {
    provider: process.env.LLM_PROVIDER || 'gemini'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'
  },
  wikipedia: {
    enabled: process.env.WIKIPEDIA_FACT_CHECK_ENABLED === 'true',
    maxArticles: parseInt(process.env.WIKIPEDIA_MAX_ARTICLES || '3'),
    contentLimit: parseInt(process.env.WIKIPEDIA_CONTENT_LIMIT || '1000')
  }
};