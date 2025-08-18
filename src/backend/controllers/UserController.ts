import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/QuizService';

export class UserController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  getProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const progress = await this.quizService.getUserProgress();
      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: []
      });
    } catch (error) {
      next(error);
    }
  };
}