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
}

export interface GenerateQuizResponse extends ApiResponse<Quiz> {}

export interface SubmitQuizRequest {
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
  }>;
}

export interface SubmitQuizResponse extends ApiResponse<{
  attempt: QuizAttempt;
  recommendations: StudyRecommendation[];
}> {}

export interface GetProgressResponse extends ApiResponse<UserProgress[]> {}

export interface GetRecommendationsResponse extends ApiResponse<StudyRecommendation[]> {}