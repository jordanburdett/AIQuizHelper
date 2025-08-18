import { Quiz, QuizAttempt } from '../types/Quiz';
import { UserProgress, StudyRecommendation } from '../types/User';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateQuizRequest {
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  effort?: 'speed' | 'balanced' | 'quality';
}

export interface GenerateQuizResponse extends ApiResponse<Quiz> {}

export interface GetQuizResponse extends ApiResponse<Quiz> {}

export interface SubmitQuizRequest {
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
  }>;
  timeTaken?: number;
}

export interface SubmitQuizResponse extends ApiResponse<{
  attempt: QuizAttempt;
  recommendations: StudyRecommendation[];
}> {}

export interface GetQuizAttemptResponse extends ApiResponse<{
  attempt: QuizAttempt;
  recommendations: StudyRecommendation[];
}> {}

export interface GetProgressResponse extends ApiResponse<UserProgress[]> {}

export interface GetRecommendationsResponse extends ApiResponse<StudyRecommendation[]> {}

export interface GenerateRecommendationsResponse extends ApiResponse<StudyRecommendation[]> {}

export interface GetQuestionExplanationResponse extends ApiResponse<{ explanation: string }> {}

export interface GetConfigResponse extends ApiResponse<{
  currentProvider: string;
  availableProviders: Array<{
    id: string;
    name: string;
    model: string;
  }>;
  defaultProvider: string;
  showModelSelector: boolean;
}> {}

export interface SetProviderRequest {
  provider: string;
}

export interface SetProviderResponse extends ApiResponse<{ currentProvider: string }> {}