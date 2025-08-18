import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

router.get('/progress', userController.getProgress);
router.get('/recommendations', userController.getRecommendations);

export { router as userRoutes };