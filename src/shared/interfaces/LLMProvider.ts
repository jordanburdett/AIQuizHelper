import { Question, QuizAttempt } from '../types/Quiz';

export interface StudyRecommendation {
  topic: string;
  reason: string;
  resources: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface LLMProvider {
  generateQuizQuestions(topic: string, count: number): Promise<Question[]>;
  generateStudyRecommendations(quizAttempt: QuizAttempt, topic: string): Promise<StudyRecommendation[]>;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}