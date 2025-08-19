import { Question, QuizAttempt } from '../types/Quiz';
import { StudyRecommendation } from '../types/User';

export interface LLMProvider {
  generateQuizQuestions(topic: string, count: number, effort?: 'speed' | 'balanced' | 'quality', factCheckingContext?: string): Promise<Question[]>;
  generateStudyRecommendations(quizAttempt: QuizAttempt, topic: string): Promise<StudyRecommendation[]>;
  generateQuestionExplanation(question: Question, topic: string): Promise<string>;
  generateSearchQueries(topic: string): Promise<string[]>;
}

export interface LLMConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}