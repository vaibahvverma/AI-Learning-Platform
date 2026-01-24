import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { DocumentModel } from '../models/Document.js';
import { Flashcard } from '../models/Flashcard.js';
import { Quiz } from '../models/Quiz.js';
import { ChatSession } from '../models/ChatSession.js';
import { extractTextFromPDF, deletePDFFile } from '../services/pdfService.js';
import path from 'path';

// Upload document
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        const { originalname, filename, size, mimetype, path: filePath } = req.file;

        // Extract PDF text and page count
        let pageCount = 0;
        let extractedText = '';
        try {
            const pdfContent = await extractTextFromPDF(filePath);
            pageCount = pdfContent.pageCount;
            extractedText = pdfContent.text;
        } catch (error) {
            console.error('Error extracting PDF content:', error);
        }

        // Create document record
        const document = await DocumentModel.create({
            userId: req.user._id,
            fileName: filename,
            originalName: originalname,
            filePath: filePath,
            fileSize: size,
            mimeType: mimetype,
            pageCount,
            extractedText
        });

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                document: {
                    id: document._id,
                    fileName: document.originalName,
                    fileSize: document.fileSize,
                    pageCount: document.pageCount,
                    uploadedAt: document.uploadedAt
                }
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document'
        });
    }
};

// Get all documents for user
export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const documents = await DocumentModel.find({ userId: req.user._id })
            .sort({ uploadedAt: -1 })
            .select('-extractedText');

        res.status(200).json({
            success: true,
            data: {
                documents: documents.map(doc => ({
                    id: doc._id,
                    fileName: doc.originalName,
                    fileSize: doc.fileSize,
                    pageCount: doc.pageCount,
                    summary: doc.summary,
                    uploadedAt: doc.uploadedAt
                }))
            }
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get documents'
        });
    }
};

// Get single document
export const getDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const document = await DocumentModel.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                document: {
                    id: document._id,
                    fileName: document.originalName,
                    fileSize: document.fileSize,
                    pageCount: document.pageCount,
                    summary: document.summary,
                    uploadedAt: document.uploadedAt
                }
            }
        });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document'
        });
    }
};

// Get document file (PDF)
export const getDocumentFile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const document = await DocumentModel.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }

        const absolutePath = path.isAbsolute(document.filePath)
            ? document.filePath
            : path.join(process.cwd(), document.filePath);

        res.sendFile(absolutePath);
    } catch (error) {
        console.error('Get document file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document file'
        });
    }
};

// Delete document
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const document = await DocumentModel.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }

        // Delete associated data
        await Promise.all([
            Flashcard.deleteMany({ documentId: document._id }),
            Quiz.deleteMany({ documentId: document._id }),
            ChatSession.deleteMany({ documentId: document._id }),
            deletePDFFile(document.filePath),
            document.deleteOne()
        ]);

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document'
        });
    }
};

// Get user statistics for dashboard
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const [documentCount, flashcardCount, quizCount, recentDocuments, recentQuizzes] = await Promise.all([
            DocumentModel.countDocuments({ userId: req.user._id }),
            Flashcard.countDocuments({ userId: req.user._id }),
            Quiz.countDocuments({ userId: req.user._id, isCompleted: true }),
            DocumentModel.find({ userId: req.user._id })
                .sort({ uploadedAt: -1 })
                .limit(5)
                .select('originalName uploadedAt'),
            Quiz.find({ userId: req.user._id, isCompleted: true })
                .sort({ completedAt: -1 })
                .limit(5)
                .select('title score totalQuestions completedAt')
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalDocuments: documentCount,
                    totalFlashcards: flashcardCount,
                    completedQuizzes: quizCount
                },
                recentActivity: {
                    documents: recentDocuments.map(doc => ({
                        id: doc._id,
                        name: doc.originalName,
                        date: doc.uploadedAt,
                        type: 'document'
                    })),
                    quizzes: recentQuizzes.map(quiz => ({
                        id: quiz._id,
                        name: quiz.title,
                        score: quiz.score,
                        total: quiz.totalQuestions,
                        date: quiz.completedAt,
                        type: 'quiz'
                    }))
                }
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user statistics'
        });
    }
};
