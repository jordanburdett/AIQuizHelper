import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/QuizService';
import { GenerateQuizRequest, SubmitQuizRequest } from '@shared/interfaces/ApiResponses';
import { config } from '../config/env';

export class QuizController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  generateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { topic, effort } = req.body as GenerateQuizRequest;
      
      if (!topic) {
        res.status(400).json({
          success: false,
          error: 'Topic is required'
        });
        return;
      }

      const quiz = await this.quizService.generateQuiz(topic, effort);
      
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
          recommendations: []
        }
      });
    } catch (error) {
      next(error);
    }
  };

  submitQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { quizId, answers, timeTaken } = req.body as SubmitQuizRequest;
      
      if (!quizId || !answers) {
        res.status(400).json({
          success: false,
          error: 'Quiz ID and answers are required'
        });
        return;
      }

      const attempt = await this.quizService.submitQuizAttempt(quizId, answers, timeTaken);
      
      res.json({
        success: true,
        data: {
          attempt,
          recommendations: []
        }
      });
    } catch (error) {
      next(error);
    }
  };

  generateRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { attemptId } = req.params;
      
      if (!attemptId) {
        res.status(400).json({
          success: false,
          error: 'Attempt ID is required'
        });
        return;
      }

      const recommendations = await this.quizService.generateStudyRecommendations(attemptId);
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      next(error);
    }
  };

  getQuestionExplanation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { quizId, questionId } = req.params;
      
      if (!quizId || !questionId) {
        res.status(400).json({
          success: false,
          error: 'Quiz ID and Question ID are required'
        });
        return;
      }

      const explanation = await this.quizService.getQuestionExplanation(quizId, questionId);
      
      res.json({
        success: true,
        data: explanation
      });
    } catch (error) {
      next(error);
    }
  };

  getConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const availableProviders = [];
      
      // Always include Gemini as default
      if (config.gemini.apiKey) {
        availableProviders.push({
          id: 'gemini',
          name: 'Gemini',
          model: 'gemini-2.5-flash-lite'
        });
      }
      
      if (config.openai.apiKey) {
        availableProviders.push({
          id: 'openai',
          name: 'OpenAI',
          model: 'gpt-5-nano'
        });
      }
      
      // Default to gemini if available, otherwise first available provider
      const defaultProvider = availableProviders.find(p => p.id === 'gemini') || availableProviders[0];
      
      res.json({
        success: true,
        data: {
          currentProvider: config.llm.provider,
          availableProviders,
          defaultProvider: defaultProvider?.id || 'gemini',
          showModelSelector: availableProviders.length > 1
        }
      });
    } catch (error) {
      next(error);
    }
  };

  setProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider } = req.body;
      
      if (!provider || !['gemini', 'openai'].includes(provider)) {
        res.status(400).json({
          success: false,
          error: 'Invalid provider. Must be "gemini" or "openai"'
        });
        return;
      }

      // Verify the provider has a valid API key
      if (provider === 'gemini' && !config.gemini.apiKey) {
        res.status(400).json({
          success: false,
          error: 'Gemini API key not configured'
        });
        return;
      }

      if (provider === 'openai' && !config.openai.apiKey) {
        res.status(400).json({
          success: false,
          error: 'OpenAI API key not configured'
        });
        return;
      }

      // Update the config (this is temporary, doesn't persist)
      config.llm.provider = provider;

      res.json({
        success: true,
        data: {
          currentProvider: provider
        }
      });
    } catch (error) {
      next(error);
    }
  };
}