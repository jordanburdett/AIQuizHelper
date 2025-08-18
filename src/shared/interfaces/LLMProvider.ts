import { Question } from '../types/Quiz';

export interface LLMProvider {
  generateQuizQuestions(topic: string, count: number): Promise<Question[]>;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}