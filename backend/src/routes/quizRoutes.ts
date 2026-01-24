import { Router } from 'express';
import {
    submitQuiz,
    getQuizResult,
    getQuizHistory,
    getPendingQuiz
} from '../controllers/quizController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes are protected
router.use(authenticate);

router.get('/history', getQuizHistory);
router.get('/:quizId', getPendingQuiz);
router.post('/:quizId/submit', submitQuiz);
router.get('/:quizId/result', getQuizResult);

export default router;
