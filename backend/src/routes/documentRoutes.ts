import { Router } from 'express';
import {
    uploadDocument,
    getDocuments,
    getDocument,
    getDocumentFile,
    deleteDocument,
    getUserStats
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// All routes are protected
router.use(authenticate);

router.get('/stats', getUserStats);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.get('/:id/file', getDocumentFile);
router.delete('/:id', deleteDocument);

export default router;
