import { Quiz, QuizAttempt, UserAnswer } from '@shared/types/Quiz';
import { UserProgress, StudyRecommendation } from '@shared/types/User';
import { LLMProvider } from '@shared/interfaces/LLMProvider';
import { QuizHistoryItem, QuizHistorySummary } from '@shared/interfaces/ApiResponses';
import { QuizModel, QuizAttemptModel } from '../models/QuizModel';
import { generateQuizId, generateAttemptId } from '../utils/idGenerator';
import { GeminiService } from './GeminiService';
import { MockLLMService } from './MockLLMService';
import { config } from '../config/env';

export class QuizService {
  private llmProvider: LLMProvider;

  constructor(llmProvider?: LLMProvider) {
    this.llmProvider = llmProvider || this.createDefaultProvider();
  }

  private createDefaultProvider(): LLMProvider {
    switch (config.llm.provider) {
      case 'gemini':
        return new GeminiService();
      case 'mock':
      default:
        return new MockLLMService();
    }
  }

  async generateQuiz(topic: string, effort?: 'speed' | 'balanced' | 'quality'): Promise<Quiz> {
    const questions = await this.llmProvider.generateQuizQuestions(topic, 5, effort);
    
    const quiz: Quiz = {
      id: generateQuizId(),
      topic,
      questions,
      createdAt: new Date()
    };

    const quizModel = new QuizModel(quiz);
    await quizModel.save();
    
    return quiz;
  }

  async getQuiz(quizId: string): Promise<Quiz | null> {
    const quiz = await QuizModel.findOne({ id: quizId });
    return quiz?.toObject() || null;
  }

  async getQuizAttempt(attemptId: string): Promise<QuizAttempt | null> {
    const attempt = await QuizAttemptModel.findOne({ id: attemptId });
    return attempt?.toObject() || null;
  }

  async submitQuizAttempt(
    quizId: string, 
    answers: Array<{ questionId: string; selectedAnswer: string }>,
    timeTaken?: number
  ): Promise<QuizAttempt> {
    const quiz = await this.getQuiz(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const userAnswers = this.calculateAnswers(quiz, answers);
    const score = this.calculateScore(userAnswers);

    const attempt: QuizAttempt = {
      id: generateAttemptId(),
      quizId,
      answers: userAnswers,
      score,
      completedAt: new Date(),
      timeTaken: timeTaken || 0
    };

    const attemptModel = new QuizAttemptModel(attempt);
    await attemptModel.save();

    return attempt;
  }


  private calculateAnswers(quiz: Quiz, answers: Array<{ questionId: string; selectedAnswer: string }>): UserAnswer[] {
    return answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: question?.correctAnswer === answer.selectedAnswer || false
      };
    });
  }

  async getUserProgress(): Promise<UserProgress[]> {
    const quizzes = await QuizModel.find();
    const attempts = await QuizAttemptModel.find();

    const progressMap = new Map<string, {
      topic: string;
      scores: number[];
      dates: Date[];
    }>();

    for (const attempt of attempts) {
      const quiz = quizzes.find(q => q.id === attempt.quizId);
      if (!quiz) continue;

      const topic = quiz.topic;
      if (!progressMap.has(topic)) {
        progressMap.set(topic, {
          topic,
          scores: [],
          dates: []
        });
      }

      const topicData = progressMap.get(topic)!;
      topicData.scores.push(attempt.score);
      topicData.dates.push(attempt.completedAt);
    }

    const progressArray: UserProgress[] = [];
    for (const [topic, data] of progressMap) {
      const totalQuizzes = data.scores.length;
      const averageScore = Math.round(data.scores.reduce((sum, score) => sum + score, 0) / totalQuizzes);
      const bestScore = Math.max(...data.scores);
      const lastQuizDate = new Date(Math.max(...data.dates.map(d => d.getTime())));
      
      const improvementTrend = this.calculateImprovementTrend(data.scores);

      progressArray.push({
        userId: 'single-user', // Single user environment
        topic,
        totalQuizzes,
        averageScore,
        bestScore,
        lastQuizDate,
        improvementTrend
      });
    }

    return progressArray;
  }

  private calculateImprovementTrend(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    return Math.round(secondAvg - firstAvg);
  }

  private calculateScore(answers: UserAnswer[]): number {
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
  }

  async generateStudyRecommendations(attemptId: string): Promise<StudyRecommendation[]> {
    const attempt = await this.getQuizAttempt(attemptId);
    if (!attempt) {
      throw new Error('Quiz attempt not found');
    }

    const quiz = await this.getQuiz(attempt.quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return await this.llmProvider.generateStudyRecommendations(attempt, quiz.topic);
  }

  async getQuestionExplanation(quizId: string, questionId: string): Promise<{ explanation: string }> {
    const quiz = await this.getQuiz(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const explanation = await this.llmProvider.generateQuestionExplanation(question, quiz.topic);
    return { explanation };
  }

  async getQuizHistory(): Promise<QuizHistoryItem[]> {
    try {
      const quizzes = await QuizModel
        .find({})
        .select({ id: 1, topic: 1, createdAt: 1, questions: 1 })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();
      
      if (!quizzes || quizzes.length === 0) {
        return [];
      }
      
      const quizIds = quizzes.map(q => q.id);
      
      const attempts = await QuizAttemptModel
        .find({ quizId: { $in: quizIds } })
        .select({ id: 1, quizId: 1, score: 1, completedAt: 1, timeTaken: 1 })
        .sort({ completedAt: -1 })
        .exec();
      
      const attemptMap = new Map<string, any>();
      for (const attempt of attempts) {
        if (!attemptMap.has(attempt.quizId)) {
          attemptMap.set(attempt.quizId, attempt);
        }
      }
      
      const quizHistory: QuizHistoryItem[] = quizzes.map(quiz => {
        const quizSummary: QuizHistorySummary = {
          id: quiz.id,
          topic: quiz.topic,
          createdAt: quiz.createdAt,
          questionCount: quiz.questions?.length || 0
        };
        
        const attempt = attemptMap.get(quiz.id);
        
        if (attempt) {
          return {
            quiz: quizSummary,
            latestAttempt: {
              id: attempt.id,
              quizId: attempt.quizId,
              answers: [],
              score: attempt.score,
              completedAt: attempt.completedAt,
              timeTaken: attempt.timeTaken || 0
            }
          };
        }
        
        return { quiz: quizSummary };
      });
      
      return quizHistory;
    } catch (error) {
      console.error('Error in getQuizHistory:', error);
      return [];
    }
  }
}