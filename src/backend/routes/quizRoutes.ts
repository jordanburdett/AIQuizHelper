import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';

const router = Router();
const quizController = new QuizController();

router.post('/generate', quizController.generateQuiz);
router.post('/submit', quizController.submitQuiz);

export { router as quizRoutes };