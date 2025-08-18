export interface UserProfile {
  id: string;
  createdAt: Date;
  lastActive: Date;
}

export interface UserProgress {
  userId: string;
  topic: string;
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  lastQuizDate: Date;
  improvementTrend: number;
}

export interface StudyRecommendation {
  id?: string;
  userId?: string;
  topic: string;
  reason: string;
  resources: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt?: Date;
}