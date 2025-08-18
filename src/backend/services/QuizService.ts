import { Quiz, QuizAttempt, UserAnswer } from '@shared/types/Quiz';
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

  private calculateScore(answers: UserAnswer[]): number {
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
  }
}