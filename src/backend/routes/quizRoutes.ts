import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';

const router = Router();
const quizController = new QuizController();

router.post('/generate', quizController.generateQuiz);
router.get('/:quizId', quizController.getQuiz);
router.post('/submit', quizController.submitQuiz);
router.get('/attempt/:attemptId', quizController.getQuizAttempt);
router.post('/attempt/:attemptId/recommendations', quizController.generateRecommendations);

export { router as quizRoutes };