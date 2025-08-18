import { Quiz, QuizAttempt, UserAnswer } from '@shared/types/Quiz';
import { UserProgress } from '@shared/types/User';
import { QuizModel, QuizAttemptModel } from '../models/QuizModel';
import { generateQuizId, generateAttemptId } from '../utils/idGenerator';

export class QuizService {
  async generateQuiz(topic: string): Promise<Quiz> {
    // Mock LLM integration - replace with actual LLM service
    const quiz: Quiz = {
      id: generateQuizId(),
      topic,
      questions: this.generateMockQuestions(topic),
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
    answers: Array<{ questionId: string; selectedAnswer: string }>
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
      timeTaken: 0 // TODO: Implement time tracking
    };

    const attemptModel = new QuizAttemptModel(attempt);
    await attemptModel.save();

    return attempt;
  }

  private generateMockQuestions(topic: string) {
    // Mock questions - replace with LLM generation
    return [
      {
        id: '1',
        question: `What is a key concept in ${topic}?`,
        options: [
          { id: 'a', text: 'Option A', value: 'a' },
          { id: 'b', text: 'Option B', value: 'b' },
          { id: 'c', text: 'Option C', value: 'c' },
          { id: 'd', text: 'Option D', value: 'd' }
        ],
        correctAnswer: 'a'
      }
    ];
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
}