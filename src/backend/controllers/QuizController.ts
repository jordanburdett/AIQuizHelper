import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/QuizService';
import { GenerateQuizRequest, SubmitQuizRequest } from '@shared/interfaces/ApiResponses';

export class QuizController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  generateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { topic } = req.body as GenerateQuizRequest;
      
      if (!topic) {
        res.status(400).json({
          success: false,
          error: 'Topic is required'
        });
        return;
      }

      const quiz = await this.quizService.generateQuiz(topic);
      
      res.json({
        success: true,
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  };

  getQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { quizId } = req.params;
      
      if (!quizId) {
        res.status(400).json({
          success: false,
          error: 'Quiz ID is required'
        });
        return;
      }

      const quiz = await this.quizService.getQuiz(quizId);
      
      if (!quiz) {
        res.status(404).json({
          success: false,
          error: 'Quiz not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: quiz
      });
    } catch (error) {
      next(error);
    }
  };

  getQuizAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { attemptId } = req.params;
      
      if (!attemptId) {
        res.status(400).json({
          success: false,
          error: 'Attempt ID is required'
        });
        return;
      }

      const attempt = await this.quizService.getQuizAttempt(attemptId);
      
      if (!attempt) {
        res.status(404).json({
          success: false,
          error: 'Quiz attempt not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: {
          attempt,
          recommendations: [] // TODO: Implement recommendations
        }
      });
    } catch (error) {
      next(error);
    }
  };

  submitQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { quizId, answers } = req.body as SubmitQuizRequest;
      
      if (!quizId || !answers) {
        res.status(400).json({
          success: false,
          error: 'Quiz ID and answers are required'
        });
        return;
      }

      const attempt = await this.quizService.submitQuizAttempt(quizId, answers);
      
      res.json({
        success: true,
        data: {
          attempt,
          recommendations: [] // TODO: Implement recommendations
        }
      });
    } catch (error) {
      next(error);
    }
  };
}