import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { DocumentModel } from '../models/Document.js';
import { Quiz } from '../models/Quiz.js';
import { Flashcard } from '../models/Flashcard.js';

// Unified search across Documents, Quizzes, and Flashcards
export const searchAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const query = (req.query.q as string || '').trim();

        if (!query || query.length < 2) {
            res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
            return;
        }

        // Escape special regex characters to prevent injection
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'i');

        // Search all collections in parallel
        const [documents, quizzes, flashcards] = await Promise.all([
            DocumentModel.find({
                userId: req.user._id,
                $or: [
                    { originalName: regex },
                    { summary: regex }
                ]
            })
                .sort({ uploadedAt: -1 })
                .limit(5)
                .select('originalName summary uploadedAt'),

            Quiz.find({
                userId: req.user._id,
                title: regex
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('title score totalQuestions isCompleted createdAt'),

            Flashcard.find({
                userId: req.user._id,
                $or: [
                    { question: regex },
                    { answer: regex }
                ]
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('question answer documentId createdAt')
        ]);

        res.status(200).json({
            success: true,
            data: {
                documents: documents.map(doc => ({
                    id: doc._id,
                    title: doc.originalName,
                    subtitle: doc.summary
                        ? doc.summary.substring(0, 80) + (doc.summary.length > 80 ? '...' : '')
                        : 'No summary',
                    type: 'document' as const,
                    date: doc.uploadedAt
                })),
                quizzes: quizzes.map(quiz => ({
                    id: quiz._id,
                    title: quiz.title,
                    subtitle: quiz.isCompleted
                        ? `Score: ${quiz.score}/${quiz.totalQuestions}`
                        : 'Not completed',
                    type: 'quiz' as const,
                    date: quiz.createdAt
                })),
                flashcards: flashcards.map(fc => ({
                    id: fc.documentId,
                    title: fc.question.substring(0, 60) + (fc.question.length > 60 ? '...' : ''),
                    subtitle: fc.answer.substring(0, 80) + (fc.answer.length > 80 ? '...' : ''),
                    type: 'flashcard' as const,
                    date: fc.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
};
