import { Router } from 'express';
import {
    chatWithDocument,
    getChatHistory,
    generateSummary,
    explainConcept,
    generateFlashcards,
    generateQuiz
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// Chat routes
router.post('/chat/:documentId', chatWithDocument);
router.get('/chat/:documentId/history', getChatHistory);

// AI generation routes
router.post('/summary/:documentId', generateSummary);
router.post('/explain/:documentId', explainConcept);
router.post('/flashcards/:documentId', generateFlashcards);
router.post('/quiz/:documentId', generateQuiz);

export default router;
