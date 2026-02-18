import { Router } from 'express';
import { searchAll } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Protected search route
router.use(authenticate);

router.get('/', searchAll);

export default router;
