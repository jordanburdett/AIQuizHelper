import mongoose, { Schema, Document } from 'mongoose';
import { Quiz, Question, QuizAttempt } from '@shared/types/Quiz';

interface QuizDocument extends Quiz, Document {}
interface QuizAttemptDocument extends QuizAttempt, Document {}

const questionSchema = new Schema<Question>({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    value: { type: String, required: true }
  }],
  correctAnswer: { type: String, required: true }
});

const quizSchema = new Schema<QuizDocument>({
  id: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
  userId: { type: String }
});

const quizAttemptSchema = new Schema<QuizAttemptDocument>({
  id: { type: String, required: true, unique: true },
  quizId: { type: String, required: true },
  answers: [{
    questionId: { type: String, required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  timeTaken: { type: Number, required: true }
});

export const QuizModel = mongoose.model<QuizDocument>('Quiz', quizSchema);
export const QuizAttemptModel = mongoose.model<QuizAttemptDocument>('QuizAttempt', quizAttemptSchema);