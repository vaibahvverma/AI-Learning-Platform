import { Router } from 'express';
import {
    getFlashcards,
    toggleFavorite,
    getFavorites,
    deleteFlashcards
} from '../controllers/flashcardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes are protected
router.use(authenticate);

router.get('/favorites', getFavorites);
router.get('/document/:documentId', getFlashcards);
router.patch('/:flashcardId/favorite', toggleFavorite);
router.delete('/document/:documentId', deleteFlashcards);

export default router;
