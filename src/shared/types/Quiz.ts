export interface Quiz {
  id: string;
  topic: string;
  questions: Question[];
  createdAt: Date;
  userId?: string;
}

export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  value: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  answers: UserAnswer[];
  score: number;
  completedAt: Date;
  timeTaken: number;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}