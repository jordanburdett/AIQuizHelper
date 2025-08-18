import { Question, QuizAttempt } from '../types/Quiz';

export interface StudyRecommendation {
  topic: string;
  reason: string;
  resources: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface LLMProvider {
  generateQuizQuestions(topic: string, count: number, effort?: 'speed' | 'balanced' | 'quality'): Promise<Question[]>;
  generateStudyRecommendations(quizAttempt: QuizAttempt, topic: string): Promise<StudyRecommendation[]>;
  generateQuestionExplanation(question: Question, topic: string): Promise<string>;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}