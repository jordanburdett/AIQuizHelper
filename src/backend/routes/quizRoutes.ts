import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';

const router = Router();
const quizController = new QuizController();

router.post('/generate', quizController.generateQuiz);
router.get('/:quizId', quizController.getQuiz);
router.post('/submit', quizController.submitQuiz);
router.get('/attempt/:attemptId', quizController.getQuizAttempt);

export { router as quizRoutes };